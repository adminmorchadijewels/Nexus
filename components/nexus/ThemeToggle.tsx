'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('nexus-theme')
    const dark = saved !== 'light'
    setIsDark(dark)
    document.body.classList.toggle('light', !dark)
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.body.classList.toggle('light', !next)
    localStorage.setItem('nexus-theme', next ? 'dark' : 'light')
  }

  return (
    <motion.button
      onClick={toggle}
      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-white/10 transition-colors"
      whileTap={{ scale: 0.9 }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  )
}
