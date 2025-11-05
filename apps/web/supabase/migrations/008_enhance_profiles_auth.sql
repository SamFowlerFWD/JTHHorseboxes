-- =====================================================
-- Migration: Enhance profiles table for authentication
-- Purpose: Add missing fields required by the /ops authentication system
-- =====================================================

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Update existing profiles to ensure they have valid roles
UPDATE profiles 
SET role = 'viewer' 
WHERE role IS NULL OR role = 'user' OR role = 'customer';

-- Create audit log table for login attempts
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_log_email ON auth_audit_log(email);
CREATE INDEX idx_auth_audit_log_created_at ON auth_audit_log(created_at DESC);

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(
  p_email VARCHAR,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_attempts INTEGER;
BEGIN
  -- Get user ID and current attempts
  SELECT p.id, p.failed_login_attempts 
  INTO v_user_id, v_attempts
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = LOWER(p_email);
  
  IF v_user_id IS NOT NULL THEN
    -- Increment failed attempts
    v_attempts := COALESCE(v_attempts, 0) + 1;
    
    -- Lock account after 5 failed attempts (15 minutes)
    IF v_attempts >= 5 THEN
      UPDATE profiles 
      SET 
        failed_login_attempts = v_attempts,
        locked_until = NOW() + INTERVAL '15 minutes'
      WHERE id = v_user_id;
    ELSE
      UPDATE profiles 
      SET failed_login_attempts = v_attempts
      WHERE id = v_user_id;
    END IF;
  END IF;
  
  -- Log the failed attempt
  INSERT INTO auth_audit_log (
    event_type,
    user_id,
    email,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    'login_failed',
    v_user_id,
    p_email,
    p_ip_address,
    p_user_agent,
    false,
    CASE 
      WHEN v_attempts >= 5 THEN 'Account locked due to too many failed attempts'
      ELSE 'Invalid credentials'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle successful login
CREATE OR REPLACE FUNCTION handle_user_login(
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Reset failed attempts and update last login
  UPDATE profiles 
  SET 
    failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW(),
    last_activity_at = NOW()
  WHERE id = p_user_id;
  
  -- Log successful login
  INSERT INTO auth_audit_log (
    event_type,
    user_id,
    ip_address,
    user_agent,
    success
  ) VALUES (
    'login_success',
    p_user_id,
    p_ip_address,
    p_user_agent,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked_until TIMESTAMPTZ;
BEGIN
  SELECT locked_until INTO v_locked_until
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN v_locked_until IS NOT NULL AND v_locked_until > NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- RLS policies for auth_audit_log
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin can view all audit logs" ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update profiles RLS policies for authentication
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    -- Users cannot change their own role or active status
    id = auth.uid() AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update last_activity_at on any authenticated request
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_activity_at = NOW()
  WHERE id = auth.uid()
  AND last_activity_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Triggers for activity tracking would be added to relevant tables
-- For now, the application should call this manually or use middleware

-- Insert initial admin user (update email/id as needed)
-- This should be run separately after creating the user in Supabase Auth
/*
INSERT INTO profiles (id, email, full_name, role, department, is_active)
VALUES (
  'YOUR-ADMIN-USER-ID',
  'admin@jtaylorhorseboxes.com',
  'System Administrator',
  'admin',
  'IT',
  true
) ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  department = 'IT',
  is_active = true;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'User profiles with authentication and authorization information';
COMMENT ON TABLE auth_audit_log IS 'Audit log for authentication events and security monitoring';
COMMENT ON FUNCTION handle_failed_login IS 'Handles failed login attempts and account locking';
COMMENT ON FUNCTION handle_user_login IS 'Handles successful login and resets failed attempts';
COMMENT ON FUNCTION is_account_locked IS 'Checks if a user account is currently locked';