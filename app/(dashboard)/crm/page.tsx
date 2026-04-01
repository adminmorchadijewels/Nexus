import { ComingSoon } from '@/components/nexus/ComingSoon'
import { Users } from 'lucide-react'

export default function CRMPage() {
  return (
    <ComingSoon
      title="Sales CRM"
      description="Track leads, manage deals, and nurture customer relationships — all in one place."
      icon={<Users className="w-9 h-9" />}
      color="#6366F1"
    />
  )
}
