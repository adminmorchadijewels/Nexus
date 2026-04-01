import { CreditCard, Users, FileText, RefreshCw } from 'lucide-react'

export interface NexusTool {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
  isActive: boolean
  comingSoon?: boolean
}

export const NEXUS_TOOLS: NexusTool[] = [
  {
    id: 'cc-manager',
    label: 'Credit Cards',
    description: 'Manage cards, statements, payments & milestones',
    icon: CreditCard,
    href: '/cc-manager',
    color: '#0D9488',
    isActive: true,
  },
  {
    id: 'crm',
    label: 'Sales CRM',
    description: 'Track leads, deals and customer relationships',
    icon: Users,
    href: '/crm',
    color: '#6366F1',
    isActive: false,
    comingSoon: true,
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Store and organise business documents',
    icon: FileText,
    href: '/documents',
    color: '#F59E0B',
    isActive: false,
    comingSoon: true,
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    description: 'Track recurring subscriptions and spending',
    icon: RefreshCw,
    href: '/subscriptions',
    color: '#EC4899',
    isActive: false,
    comingSoon: true,
  },
]
