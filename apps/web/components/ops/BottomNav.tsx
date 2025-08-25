"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Users,
  MoreVertical,
  Package,
  FileText,
  Database,
  BarChart3,
  Settings
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/ops",
    icon: LayoutDashboard,
  },
  {
    title: "Pipeline",
    href: "/ops/pipeline",
    icon: TrendingUp,
  },
  {
    title: "Builds",
    href: "/ops/builds",
    icon: Wrench,
  },
  {
    title: "Customers",
    href: "/ops/customers",
    icon: Users,
  },
]

const moreNavItems = [
  {
    title: "Inventory",
    href: "/ops/inventory",
    icon: Package,
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

export default function BottomNav() {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full gap-1
                transition-colors
                ${isActive 
                  ? 'text-primary border-t-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          )
        })}
        
        {/* More Dropdown */}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full gap-1
                transition-colors
                ${moreNavItems.some(item => pathname === item.href)
                  ? 'text-primary border-t-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <MoreVertical className="h-5 w-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 mb-2"
            sideOffset={5}
          >
            {moreNavItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <div key={item.href}>
                  {index === moreNavItems.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2
                        ${isActive ? 'bg-accent' : ''}
                      `}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}