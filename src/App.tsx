// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Home } from './pages/Home'
import { SignUp } from './pages/auth/SignUp'
import { SignIn } from './pages/auth/SignIn'
import { VerifyEmail } from './pages/auth/VerifyEmail'
import { CreateOrganization } from './pages/auth/CreateOrganization'
import { JoinOrganization } from './pages/auth/JoinOrganization'
import { SelectOrganization } from './pages/auth/SelectOrganization'
import { PrivateRoute } from './components/auth/PrivateRoute'
import type { Database } from './types/database'
import { InviteMembers } from './pages/auth/InviteMembers'
import { Navbar } from './components/layout/Navbar'
import { AuthCallback } from './pages/auth/AuthCallback'
import { Dashboard } from './pages/dashboard/Dashboard'
import { useEffect } from 'react'
import { Toaster } from "./components/ui/toaster"
import { Teams } from './pages/teams/Teams'
import { AcceptInvite } from './pages/auth/AcceptInvite'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ResetPassword } from './pages/auth/ResetPassword'
import { InvitationSignUp } from './pages/auth/InvitationSignUp'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage // Explicitly set storage
  }
})

// Create a wrapper component to use the useLocation hook
function AppContent() {
  const location = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAuthPage = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/callback',
    '/auth/create-org',
    '/auth/invite-members'
  ].includes(location.pathname)
  
  const isDashboardRoute = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/tickets') ||
    location.pathname.startsWith('/teams') ||
    location.pathname.startsWith('/users') ||
    location.pathname.startsWith('/reports') ||
    location.pathname.startsWith('/settings')

  // Redirect authenticated users to dashboard if they try to access the root path
  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard', { replace: true })
    } else if (!user && location.pathname !== '/' && !isAuthPage) {
      navigate('/auth/sign-in', { replace: true })
    }
  }, [user, location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && !isDashboardRoute && <Navbar />}
      <main className={!isDashboardRoute ? "p-4" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/accept-invite" element={<AcceptInvite />} />
          <Route path="/auth/invitation-signup" element={<InvitationSignUp />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route 
            path="/auth/create-org" 
            element={
              <PrivateRoute>
                <CreateOrganization />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/auth/join" 
            element={
              <PrivateRoute>
                <JoinOrganization />
              </PrivateRoute>
            }
          />
          <Route 
            path="/auth/select-org" 
            element={
              <PrivateRoute>
                <SelectOrganization />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/auth/invite-members" 
            element={
              <PrivateRoute>
                <InviteMembers />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Teams />
                </DashboardLayout>
              </PrivateRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to="/auth/sign-in" replace />
            }
          />
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={null}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </SessionContextProvider>
  )
}

export default App