'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function OpsLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const redirect = searchParams.get('redirect') || '/ops'
  const urlMessage = searchParams.get('message')

  useEffect(() => {
    if (urlMessage) {
      setMessage(urlMessage)
    }
  }, [urlMessage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    // Basic client-side validation
    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (signInError) {
        // Track failed attempts
        setAttempts(prev => prev + 1)
        
        if (attempts >= 4) {
          setError('Too many failed attempts. Your account may be locked. Please contact an administrator.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError(`Invalid email or password. ${5 - attempts - 1} attempts remaining.`)
        } else {
          setError(signInError.message)
        }
        
        // Log failed attempt
        await supabase.rpc('handle_failed_login', {
          p_email: email.toLowerCase().trim(),
          p_ip_address: null, // Will be captured server-side
          p_user_agent: navigator.userAgent
        }).then(() => {}, console.error)
        
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_active, locked_until, full_name')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          setError('Unable to retrieve user profile. Please contact an administrator.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Check if account is locked
        if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
          const lockTime = new Date(profile.locked_until).toLocaleTimeString()
          setError(`Account is locked until ${lockTime}. Please try again later or contact an administrator.`)
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Check if account is active
        if (!profile.is_active) {
          setError('Your account has been deactivated. Please contact an administrator.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Check if user has permission to access ops
        const allowedRoles = ['admin', 'staff', 'viewer']
        if (!allowedRoles.includes(profile.role)) {
          setError('You do not have permission to access the operations platform.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Log successful login
        await supabase.rpc('handle_user_login', {
          p_user_id: data.user.id,
          p_ip_address: null, // Will be captured server-side
          p_user_agent: navigator.userAgent
        }).then(() => {}, console.error)

        // Set remember me preference
        if (rememberMe) {
          localStorage.setItem('jth_remember_email', email)
        } else {
          localStorage.removeItem('jth_remember_email')
        }

        // Redirect to intended page or ops dashboard
        router.push(redirect)
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('jth_remember_email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            JTH Operations Platform
          </CardTitle>
          <CardDescription className="text-center">
            Secure access for staff and administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Message Display */}
            {message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@jtaylorhorseboxes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/ops/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign In Securely
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-xs text-muted-foreground">
            <p>Protected by enterprise-grade security</p>
            <p>Session expires after 30 minutes of inactivity</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Need help? Contact{' '}
            <a 
              href="mailto:support@jtaylorhorseboxes.com" 
              className="text-primary hover:underline"
            >
              IT Support
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}