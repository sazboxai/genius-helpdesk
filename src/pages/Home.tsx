// src/pages/Home.tsx
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
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 pt-16 pb-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Customer Support
              <span className="block text-blue-600">Powered by Intelligence</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Transform your customer support with AI-powered insights. Automate responses, 
              predict customer needs, and deliver exceptional experiences at scale.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                size="lg" 
                className="rounded-full bg-blue-600 hover:bg-blue-700"
              >
                Get Started Free
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-slate-900"
              >
                Book a Demo <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mx-auto mt-20 grid max-w-screen-xl grid-cols-2 gap-8 rounded-2xl bg-white/50 p-8 backdrop-blur-sm shadow-lg sm:grid-cols-4 sm:p-12">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <dt className="text-3xl font-bold text-blue-600 sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm text-slate-600">
                  {stat.name}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for world-class support
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Our AI-powered platform helps you deliver faster, smarter support
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div 
                  key={feature.name} 
                  className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {feature.name}
                  </h3>
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl bg-blue-600 px-8 py-12 text-center shadow-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your customer support?
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Join thousands of companies delivering exceptional support experiences
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                size="lg" 
                className="rounded-full bg-white text-blue-600 hover:bg-blue-50"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
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