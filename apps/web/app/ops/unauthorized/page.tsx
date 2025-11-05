'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX, ArrowLeft, Mail } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Access Denied
          </CardTitle>
          <CardDescription className="text-center">
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your current role does not have the necessary permissions to view this page. 
              This incident has been logged for security purposes.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">What you can do:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Contact your administrator to request access</li>
              <li>Verify you're using the correct account</li>
              <li>Return to a page you have access to</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push('/ops')}
            className="w-full"
            variant="default"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
          <Button
            onClick={() => window.location.href = 'mailto:admin@jtaylorhorseboxes.com?subject=Access Request'}
            className="w-full"
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Request Access
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}