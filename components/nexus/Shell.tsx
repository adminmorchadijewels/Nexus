'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="page-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
