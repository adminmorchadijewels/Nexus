import { ComingSoon } from '@/components/nexus/ComingSoon'
import { RefreshCw } from 'lucide-react'

export default function SubscriptionsPage() {
  return (
    <ComingSoon
      title="Subscriptions"
      description="Track all recurring subscriptions, monitor spending, and get renewal alerts."
      icon={<RefreshCw className="w-9 h-9" />}
      color="#EC4899"
    />
  )
}
