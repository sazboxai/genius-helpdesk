// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { 
  TicketIcon, 
  BrainCircuitIcon, 
  UsersIcon, 
  SparklesIcon,
  BarChartIcon,
  RocketIcon,
  ArrowRightIcon 
} from 'lucide-react'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              AutoCRM
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              AI-powered customer relationship management
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                onClick={() => navigate('/auth/sign-up')}
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Get started
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth/sign-in')}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Sign in <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    name: 'AI-Powered Ticketing',
    description: 'Automatically categorize and route tickets to the right team members. Let AI handle common queries while your team focuses on complex issues.',
    icon: TicketIcon,
  },
  {
    name: 'Smart Knowledge Base',
    description: 'Self-learning knowledge base that evolves with your support needs. AI suggests updates based on common customer queries.',
    icon: BrainCircuitIcon,
  },
  {
    name: 'Team Collaboration',
    description: 'Real-time collaboration tools with AI-assisted workflows. Share insights and solve problems faster as a team.',
    icon: UsersIcon,
  },
  {
    name: 'Automated Insights',
    description: 'Get actionable insights from customer interactions. Identify trends and improve your support strategy with AI-powered analytics.',
    icon: BarChartIcon,
  },
  {
    name: 'Customer Self-Service',
    description: 'Empower customers with an intelligent self-service portal. AI suggests relevant solutions before tickets are created.',
    icon: RocketIcon,
  },
  {
    name: 'Smart Suggestions',
    description: 'AI-powered response suggestions help agents respond faster and more accurately to customer inquiries.',
    icon: SparklesIcon,
  },
]

const stats = [
  { name: 'Active Users', value: '50K+' },
  { name: 'Tickets Resolved', value: '1M+' },
  { name: 'Response Time', value: '< 5min' },
  { name: 'Customer Satisfaction', value: '98%' },
]