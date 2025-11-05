import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import BottomNav from "@/components/ops/BottomNav"
import { LogoutButton } from "@/components/ops/LogoutButton"
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  TrendingUp,
  FileText,
  Settings,
  Database,
  BarChart3,
  Shield,
  LogOut
} from "lucide-react"

// Define navigation items with role requirements
const navItems = [
  {
    title: "Dashboard",
    href: "/ops",
    icon: LayoutDashboard,
    roles: ['admin', 'staff', 'viewer']
  },
  {
    title: "Sales Pipeline",
    href: "/ops/pipeline",
    icon: TrendingUp,
    roles: ['admin', 'staff']
  },
  {
    title: "Production",
    href: "/ops/builds",
    icon: Wrench,
    roles: ['admin', 'staff']
  },
  {
    title: "Inventory",
    href: "/ops/inventory",
    icon: Package,
    roles: ['admin', 'staff']
  },
  {
    title: "Customers",
    href: "/ops/customers",
    icon: Users,
    roles: ['admin', 'staff']
  },
  {
    title: "Quotes",
    href: "/ops/quotes",
    icon: FileText,
    roles: ['admin', 'staff']
  },
  {
    title: "Knowledge Base",
    href: "/ops/knowledge",
    icon: Database,
    roles: ['admin', 'staff', 'viewer']
  },
  {
    title: "Reports",
    href: "/ops/reports",
    icon: BarChart3,
    roles: ['admin', 'staff', 'viewer']
  },
  {
    title: "Settings",
    href: "/ops/settings",
    icon: Settings,
    roles: ['admin']
  },
]

// Role badge colors
const roleBadgeColors = {
  admin: 'bg-red-500/10 text-red-600 dark:text-red-400',
  staff: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  viewer: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
}

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // If no user, render simple layout without sidebar (for login/public pages)
  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, email, department, is_active')
    .eq('id', user.id)
    .single()

  // If no profile or inactive, render simple layout (redirect will be handled by middleware or page)
  if (!profile || !profile.is_active) {
    return <div className="min-h-screen bg-background">{children}</div>
  }
  
  // Filter navigation items based on user role
  const userNavItems = navItems.filter(item => 
    item.roles.includes(profile.role)
  )
  
  // Get initials for avatar
  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : profile.email?.substring(0, 2).toUpperCase() || 'U'
  
  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-64 border-r bg-muted/30">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">JTH Operations</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {userNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.full_name || profile.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColors[profile.role as keyof typeof roleBadgeColors]}`}>
                      {profile.role}
                    </span>
                    {profile.department && (
                      <span className="text-xs text-muted-foreground truncate">
                        {profile.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <div className="h-full">
          {/* Security Context Provider */}
          <div className="hidden" data-user-role={profile.role} data-user-id={user.id} />
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  )
}