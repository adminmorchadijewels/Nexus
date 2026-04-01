import { ComingSoon } from '@/components/nexus/ComingSoon'
import { FileText } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documents"
      description="Store, organise and retrieve business documents with powerful search and tagging."
      icon={<FileText className="w-9 h-9" />}
      color="#F59E0B"
    />
  )
}
