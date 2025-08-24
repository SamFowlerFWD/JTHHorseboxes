"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  TrendingUp,
  FileText,
  Settings,
  Database,
  MessageSquare,
  BarChart3,
  Menu,
  X
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/ops",
    icon: LayoutDashboard,
  },
  {
    title: "Sales Pipeline",
    href: "/ops/pipeline",
    icon: TrendingUp,
  },
  {
    title: "Production",
    href: "/ops/builds",
    icon: Wrench,
  },
  {
    title: "Inventory",
    href: "/ops/inventory",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/ops/customers",
    icon: Users,
  },
  {
    title: "Quotes",
    href: "/ops/quotes",
    icon: FileText,
  },
  {
    title: "Knowledge Base",
    href: "/ops/knowledge",
    icon: Database,
  },
  {
    title: "Reports",
    href: "/ops/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/ops/settings",
    icon: Settings,
  },
]

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold">JTH Operations</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 border-r bg-white lg:bg-muted/30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <h2 className="text-lg font-bold">JTH Operations</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">SW</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Steven Warner</p>
                <p className="text-xs text-muted-foreground">Workshop Manager</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-0 pt-16 lg:pt-0">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}