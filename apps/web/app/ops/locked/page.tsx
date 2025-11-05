'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowLeft, Mail, Clock } from 'lucide-react'

export default function AccountLockedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Account Temporarily Locked
          </CardTitle>
          <CardDescription className="text-center">
            Too many failed login attempts detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Security Protection Active
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your account has been temporarily locked for 30 minutes due to multiple failed login attempts.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Why was my account locked?</h3>
            <p className="text-sm text-muted-foreground">
              This is a security measure to protect your account from unauthorized access attempts. 
              After 5 consecutive failed login attempts, accounts are automatically locked.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">What should I do?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Wait 30 minutes before trying again</li>
              <li>Ensure you're using the correct password</li>
              <li>Check that Caps Lock is off</li>
              <li>Contact IT support if you need immediate access</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push('/ops/login')}
            className="w-full"
            variant="default"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Login
          </Button>
          <Button
            onClick={() => window.location.href = 'mailto:support@jtaylorhorseboxes.com?subject=Account Locked - Urgent'}
            className="w-full"
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact IT Support
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}