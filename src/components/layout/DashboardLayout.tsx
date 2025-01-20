import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings,
  ChevronDown,
  Home,
  GitFork,
  FileText
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementRef<any>
  children?: { name: string; href: string }[]
}

const sidebarItems: SidebarItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Teams', href: '/teams', icon: Users },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users,
    children: [
      { name: 'All Users', href: '/users' },
      { name: 'Invitations', href: '/users/invites' },
    ]
  },
  { name: 'Routing', href: '/routing', icon: GitFork },
  { 
    name: 'Tickets', 
    href: '/tickets', 
    icon: Ticket,
    children: [
      { name: 'All Tickets', href: '/tickets' },
      { name: 'Open', href: '/tickets/open' },
      { name: 'Pending', href: '/tickets/pending' },
      { name: 'Closed', href: '/tickets/closed' },
    ]
  },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const headerNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, organization, userRole, signOut } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/sign-in')
  }

  const getInitials = () => {
    if (!user?.user_metadata?.full_name) return '?'
    return user.user_metadata.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-900">
                AutoCRM
              </span>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-1 justify-center">
              {headerNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "inline-flex items-center px-4 text-sm font-medium border-b-2",
                    location.pathname === item.href
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              {organization && (
                <span className="text-sm text-gray-500 mr-4">
                  {organization.name}
                </span>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full bg-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {getInitials()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.full_name}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {organization && (
                    <>
                      <DropdownMenuItem className="text-xs text-gray-500">
                        Role: {userRole}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => navigate('/auth/select-org')}
                  >
                    Switch Organization
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="px-2 py-4">
            {sidebarItems.map((item) => (
              <div key={item.name}>
                <div
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                    location.pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => item.children && toggleExpand(item.name)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                  {item.children && (
                    <ChevronDown 
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform",
                        expandedItems.includes(item.name) && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
                {item.children && expandedItems.includes(item.name) && (
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                          location.pathname === child.href
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 