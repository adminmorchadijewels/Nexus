'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  LayoutDashboard,
  BanknoteIcon,
  Trophy,
  Users2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { NEXUS_TOOLS } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const CC_NAV_ITEMS = [
  { label: 'Dashboard', href: '/cc-manager', icon: LayoutDashboard },
  { label: 'Cards', href: '/cc-manager/cards', icon: CreditCard },
  { label: 'Statements', href: '/cc-manager/statements', icon: BanknoteIcon },
  { label: 'Milestones', href: '/cc-manager/milestones', icon: Trophy },
  { label: 'Families', href: '/cc-manager/families', icon: Users2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeTool = NEXUS_TOOLS.find((t) => pathname.startsWith(t.href))

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-300"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
              style={{ background: 'rgba(10,22,40,0.98)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <SidebarContent
                pathname={pathname}
                activeTool={activeTool}
                collapsed={false}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0"
        style={{
          background: 'rgba(10,22,40,0.95)',
          borderRight: '0.5px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <SidebarContent
          pathname={pathname}
          activeTool={activeTool}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
        />
      </motion.aside>
    </>
  )
}

interface SidebarContentProps {
  pathname: string
  activeTool: (typeof NEXUS_TOOLS)[0] | undefined
  collapsed: boolean
  onCollapse?: () => void
  onClose?: () => void
}

function SidebarContent({ pathname, activeTool, collapsed, onCollapse, onClose }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">Nexus</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xs">N</span>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        )}
        {onCollapse && !collapsed && (
          <button
            onClick={onCollapse}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        {onCollapse && collapsed && (
          <button
            onClick={onCollapse}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors mx-auto"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Tool switcher */}
      <div className="px-2 mb-2 flex-shrink-0">
        {!collapsed && (
          <p className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-2">Tools</p>
        )}
        <div className="space-y-0.5">
          {NEXUS_TOOLS.map((tool) => {
            const Icon = tool.icon
            const isActive = pathname.startsWith(tool.href)
            return (
              <Link
                key={tool.id}
                href={tool.isActive ? tool.href : '#'}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-sm group relative',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                  !tool.isActive && 'opacity-60 cursor-default'
                )}
                style={isActive ? { background: `${tool.color}20`, color: tool.color } : undefined}
                title={collapsed ? tool.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium truncate">{tool.label}</span>
                )}
                {!collapsed && tool.comingSoon && (
                  <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-md">
                    Soon
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-white/5 mb-2" />

      {/* Tool-specific nav */}
      {activeTool?.id === 'cc-manager' && (
        <div className="px-2 flex-1 overflow-y-auto scrollbar-thin">
          {!collapsed && (
            <p className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-2">
              Credit Cards
            </p>
          )}
          <div className="space-y-0.5">
            {CC_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/cc-manager'
                  ? pathname === '/cc-manager'
                  : pathname.startsWith(item.href)
              return (
                <motion.div key={item.href} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-sm',
                      isActive
                        ? 'bg-teal-600/20 text-teal-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/5 flex items-center justify-between flex-shrink-0">
        <ThemeToggle />
        {!collapsed && (
          <span className="text-xs text-slate-600">v0.1.0</span>
        )}
      </div>
    </div>
  )
}
