import { Card } from '../../components/ui/card'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Timer
} from 'lucide-react'
import { cn } from '../../lib/utils'

const stats = [
  {
    name: 'Open Tickets',
    value: '12',
    icon: Ticket,
    change: '+2.1%',
    changeType: 'increase'
  },
  {
    name: 'Pending',
    value: '4',
    icon: Clock,
    change: '-3.2%',
    changeType: 'decrease'
  },
  {
    name: 'Resolved',
    value: '89%',
    icon: CheckCircle,
    change: '+4.1%',
    changeType: 'increase'
  },
  {
    name: 'SLA Breaches',
    value: '2',
    icon: AlertCircle,
    change: '+2.1%',
    changeType: 'increase'
  },
  {
    name: 'Avg Response Time',
    value: '1.2h',
    icon: Timer,
    change: '-0.3h',
    changeType: 'decrease'
  },
  {
    name: 'Active Agents',
    value: '8',
    icon: Users,
    change: '0',
    changeType: 'neutral'
  },
]

export function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your support operations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.name} className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={cn(
                        "ml-2 flex items-baseline text-sm font-semibold",
                        {
                          'text-green-600': stat.changeType === 'increase',
                          'text-red-600': stat.changeType === 'decrease',
                          'text-gray-500': stat.changeType === 'neutral'
                        }
                      )}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add more dashboard sections here */}
      </div>
    </DashboardLayout>
  )
} 