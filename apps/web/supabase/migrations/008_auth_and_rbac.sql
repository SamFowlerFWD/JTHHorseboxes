-- Authentication and Role-Based Access Control Migration
-- This migration sets up comprehensive authentication, RBAC, and audit logging for GDPR compliance

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'viewer');

-- Create enum for audit event types
CREATE TYPE audit_event_type AS ENUM (
  'login',
  'logout',
  'password_change',
  'role_change',
  'data_access',
  'data_modification',
  'data_deletion',
  'permission_change',
  'failed_login',
  'session_timeout',
  'mfa_enabled',
  'mfa_disabled'
);

-- Update profiles table with enhanced security features
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
  ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS ip_whitelist TEXT[],
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_retention_consent BOOLEAN DEFAULT false;

-- Convert role column to use the enum
ALTER TABLE profiles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'viewer';

-- Create audit_logs table for GDPR compliance and security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  event_type audit_event_type NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- GDPR fields
  personal_data_accessed BOOLEAN DEFAULT false,
  data_categories TEXT[],
  legal_basis TEXT,
  purpose TEXT,
  
  -- Indexing for performance
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_created_at (created_at DESC),
  INDEX idx_audit_logs_event_type (event_type),
  INDEX idx_audit_logs_resource (resource_type, resource_id),
  INDEX idx_audit_logs_personal_data (personal_data_accessed) WHERE personal_data_accessed = true
);

-- Create sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  device_fingerprint TEXT,
  
  INDEX idx_user_sessions_user_id (user_id),
  INDEX idx_user_sessions_active (is_active, expires_at) WHERE is_active = true,
  INDEX idx_user_sessions_expires (expires_at)
);

-- Create permissions table for granular access control
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  
  UNIQUE(role, resource, action)
);

-- Create data_access_requests table for GDPR compliance
CREATE TABLE IF NOT EXISTS data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  requester_email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'portability', 'deletion', 'rectification')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  details JSONB DEFAULT '{}',
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  response_data JSONB,
  notes TEXT,
  
  INDEX idx_data_requests_status (status) WHERE status = 'pending'
);

-- Insert default permissions for roles
INSERT INTO permissions (role, resource, action, conditions) VALUES
  -- Admin permissions (full access)
  ('admin', 'ops/*', 'read', '{}'),
  ('admin', 'ops/*', 'write', '{}'),
  ('admin', 'ops/*', 'delete', '{}'),
  ('admin', 'users', 'manage', '{}'),
  ('admin', 'audit_logs', 'read', '{}'),
  ('admin', 'settings', 'manage', '{}'),
  
  -- Staff permissions (operational access)
  ('staff', 'ops/dashboard', 'read', '{}'),
  ('staff', 'ops/pipeline', 'read', '{}'),
  ('staff', 'ops/pipeline', 'write', '{}'),
  ('staff', 'ops/builds', 'read', '{}'),
  ('staff', 'ops/builds', 'write', '{}'),
  ('staff', 'ops/inventory', 'read', '{}'),
  ('staff', 'ops/inventory', 'write', '{"limit": "own_department"}'),
  ('staff', 'ops/customers', 'read', '{}'),
  ('staff', 'ops/customers', 'write', '{"limit": "assigned"}'),
  ('staff', 'ops/quotes', 'read', '{}'),
  ('staff', 'ops/quotes', 'write', '{}'),
  ('staff', 'ops/knowledge', 'read', '{}'),
  ('staff', 'ops/reports', 'read', '{"limit": "own_department"}'),
  
  -- Viewer permissions (read-only access)
  ('viewer', 'ops/dashboard', 'read', '{}'),
  ('viewer', 'ops/pipeline', 'read', '{"limit": "summary"}'),
  ('viewer', 'ops/builds', 'read', '{"limit": "status"}'),
  ('viewer', 'ops/inventory', 'read', '{"limit": "summary"}'),
  ('viewer', 'ops/customers', 'read', '{"limit": "non_pii"}'),
  ('viewer', 'ops/quotes', 'read', '{"limit": "summary"}'),
  ('viewer', 'ops/reports', 'read', '{"limit": "public"}')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_event_type audit_event_type,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_personal_data BOOLEAN DEFAULT false,
  p_data_categories TEXT[] DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get user email for audit log
  SELECT email INTO v_user_email FROM profiles WHERE id = p_user_id;
  
  INSERT INTO audit_logs (
    user_id,
    user_email,
    event_type,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    personal_data_accessed,
    data_categories,
    success,
    error_message
  ) VALUES (
    p_user_id,
    v_user_email,
    p_event_type,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_personal_data,
    p_data_categories,
    p_success,
    p_error_message
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role user_role;
  v_has_permission BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id AND is_active = true;
  
  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check for exact permission match
  SELECT EXISTS (
    SELECT 1 FROM permissions 
    WHERE role = v_user_role 
    AND resource = p_resource 
    AND action = p_action
  ) INTO v_has_permission;
  
  IF v_has_permission THEN
    RETURN true;
  END IF;
  
  -- Check for wildcard permissions
  SELECT EXISTS (
    SELECT 1 FROM permissions 
    WHERE role = v_user_role 
    AND (
      resource = 'ops/*' OR
      resource = split_part(p_resource, '/', 1) || '/*'
    )
    AND action = p_action
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle login tracking
CREATE OR REPLACE FUNCTION handle_user_login(
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    last_login = NOW(),
    login_count = login_count + 1,
    failed_login_attempts = 0,
    locked_until = NULL
  WHERE id = p_user_id;
  
  -- Log successful login
  PERFORM log_audit_event(
    p_user_id,
    'login'::audit_event_type,
    'User logged in',
    'auth',
    p_user_id::TEXT,
    jsonb_build_object('timestamp', NOW()),
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_attempts INTEGER;
BEGIN
  -- Get user ID and current attempts
  SELECT id, failed_login_attempts INTO v_user_id, v_attempts
  FROM profiles WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Increment failed attempts
    UPDATE profiles 
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = v_user_id;
    
    -- Lock account after 5 failed attempts
    IF v_attempts >= 4 THEN
      UPDATE profiles 
      SET locked_until = NOW() + INTERVAL '30 minutes'
      WHERE id = v_user_id;
    END IF;
    
    -- Log failed login
    PERFORM log_audit_event(
      v_user_id,
      'failed_login'::audit_event_type,
      'Failed login attempt',
      'auth',
      v_user_id::TEXT,
      jsonb_build_object('email', p_email, 'attempts', v_attempts + 1),
      p_ip_address,
      p_user_agent,
      false,
      NULL,
      false,
      'Invalid credentials'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = false, 
      revoked_at = NOW(), 
      revoked_reason = 'Session expired'
  WHERE is_active = true AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Create RLS policies for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all sessions" ON user_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create RLS policies for data_access_requests
ALTER TABLE data_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own data requests" ON data_access_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own data requests" ON data_access_requests
  FOR SELECT
  USING (user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage data requests" ON data_access_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_data_access_requests_updated_at
  BEFORE UPDATE ON data_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create scheduled job to clean up expired sessions (if pg_cron is available)
-- This would need to be set up separately in production
-- SELECT cron.schedule('cleanup-sessions', '*/15 * * * *', 'SELECT cleanup_expired_sessions();');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_locked ON profiles(locked_until) WHERE locked_until IS NOT NULL;

-- Grant necessary permissions
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON permissions TO authenticated;
GRANT ALL ON data_access_requests TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for GDPR compliance and security monitoring';
COMMENT ON TABLE user_sessions IS 'Active user sessions with enhanced tracking and security features';
COMMENT ON TABLE permissions IS 'Granular role-based access control permissions';
COMMENT ON TABLE data_access_requests IS 'GDPR data subject requests tracking';
COMMENT ON FUNCTION log_audit_event IS 'Central function for logging all audit events with GDPR compliance';
COMMENT ON FUNCTION check_user_permission IS 'Check if a user has permission to perform an action on a resource';
COMMENT ON FUNCTION handle_user_login IS 'Track successful user logins and update session information';
COMMENT ON FUNCTION handle_failed_login IS 'Track failed login attempts and implement account lockout';