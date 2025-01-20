// src/components/layout/Navbar.tsx
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

export function Navbar() {
  const navigate = useNavigate()
  const { user, organization, userRole, signOut } = useAuth()
  const supabase = useSupabaseClient<Database>()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/sign-in')
  }

  // Get user's initials for avatar
  const getInitials = () => {
    if (!user?.user_metadata?.full_name) return '?'
    return user.user_metadata.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold text-gray-900">
                AutoCRM
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {user && (
              <div className="flex items-center gap-4">
                {organization && (
                  <span className="text-sm text-gray-500">
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
                          {user.user_metadata.full_name}
                        </p>
                        <p className="text-xs leading-none text-gray-500">
                          {user.email}
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
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}