'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ComingSoonProps {
  title: string
  description: string
  icon: ReactNode
  color: string
}

export function ComingSoon({ title, description, icon, color }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm mb-6">{description}</p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: `${color}20`, color }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
          Coming Soon
        </div>
      </motion.div>
    </div>
  )
}
