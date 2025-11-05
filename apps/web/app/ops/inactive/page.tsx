'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UserX, ArrowLeft, Mail } from 'lucide-react'

export default function InactiveAccountPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-muted rounded-full">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Account Deactivated
          </CardTitle>
          <CardDescription className="text-center">
            Your account is currently inactive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your account has been deactivated and you cannot access the operations platform at this time.
              This may be due to:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Employment status change</li>
              <li>Security policy requirements</li>
              <li>Extended period of inactivity</li>
              <li>Administrative decision</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Need to reactivate your account?</h3>
            <p className="text-sm text-muted-foreground">
              Please contact your system administrator or HR department to discuss reactivating your account. 
              You'll need to provide your employee ID and reason for reactivation.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push('/')}
            className="w-full"
            variant="default"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Main Site
          </Button>
          <Button
            onClick={() => window.location.href = 'mailto:hr@jtaylorhorseboxes.com?subject=Account Reactivation Request'}
            className="w-full"
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact HR Department
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}