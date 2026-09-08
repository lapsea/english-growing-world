import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { X } from 'lucide-react'
import type { UnitColor } from '../types'

// ---------- 颜色映射（Tailwind 需要字面量类名） ----------
export const colorBG: Record<UnitColor, string> = {
  brand: 'bg-brand',
  blue: 'bg-blue',
  coral: 'bg-coral',
  lav: 'bg-lav',
  ice: 'bg-ice',
}
export const colorText: Record<UnitColor, string> = {
  brand: 'text-brand',
  blue: 'text-blue',
  coral: 'text-coral',
  lav: 'text-lav',
  ice: 'text-ice',
}
export const colorShadow: Record<UnitColor, string> = {
  brand: 'shadow-hard',
  blue: 'shadow-hard-blue',
  coral: 'shadow-hard-coral',
  lav: 'shadow-hard-lav',
  ice: 'shadow-hard-ice',
}

// ---------- Button ----------
type BtnVariant = 'primary' | 'secondary' | 'dark' | 'coral'
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  to?: string
}
const btnVariantCls: Record<BtnVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  dark: 'btn-dark',
  coral: 'btn-coral',
}
export function Button({ variant = 'primary', size = 'md', to, className = '', children, ...rest }: BtnProps) {
  const cls = `btn ${btnVariantCls[variant]} btn-${size} ${className}`
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

// ---------- Card ----------
export function Card({ children, className = '', hover = false, onClick }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`nbr-flat ${hover ? 'nbr-hover cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}

// ---------- Chip ----------
const CHIP_COLORS = ['brand', 'ink', 'paper', 'card', 'blue', 'coral', 'lav', 'ice']
export function Chip({ children, active = false, className = '', onClick, bg }: { children: ReactNode; active?: boolean; className?: string; onClick?: () => void; bg?: string }) {
  const bgCls = bg
    ?.split(/\s+/)
    .map((t) => (CHIP_COLORS.includes(t) ? `bg-${t}` : t))
    .join(' ')
  return (
    <button
      onClick={onClick}
      className={`chip ${bgCls ?? (active ? 'chip-active' : 'bg-white')} ${onClick ? 'hover:-translate-y-0.5 transition-transform' : 'cursor-default'} ${className}`}
    >
      {children}
    </button>
  )
}

// ---------- SectionTitle ----------
export function SectionTitle({ title, sub, right, icon }: { title: string; sub?: string; right?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5 leading-tight">
          {icon && <span className={`inline-flex w-9 h-9 items-center justify-center rounded-xl border-[2.5px] border-ink ${colorBG.brand}`}>{icon}</span>}
          <span className="marker px-1">{title}</span>
        </h2>
        {sub && <p className="text-sm font-semibold text-ink/60 mt-1.5">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

// ---------- ProgressBar ----------
export function ProgressBar({ value, color = 'brand', height = 'h-4', label }: { value: number; color?: UnitColor; height?: string; label?: string }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-paper border-[2.5px] border-ink rounded-full overflow-hidden`}>
        <div className={`h-full ${colorBG[color]} border-r-[2.5px] border-ink transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

// ---------- StatCard ----------
export function StatCard({ icon, label, value, color = 'brand', sub, className = '' }: { icon: ReactNode; label: string; value: ReactNode; color?: UnitColor; sub?: string; className?: string }) {
  return (
    <Card hover className={`p-5 flex items-center gap-4 ${className}`}>
      <span className={`shrink-0 w-13 h-13 w-[52px] h-[52px] rounded-2xl border-[2.5px] border-ink flex items-center justify-center ${colorBG[color]}`}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-bold text-ink/55 tracking-wide">{label}</div>
        <div className="text-2xl font-extrabold leading-tight truncate">{value}</div>
        {sub && <div className="text-xs font-semibold text-ink/50 mt-0.5">{sub}</div>}
      </div>
    </Card>
  )
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, children, wide = false, width }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; width?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className={`relative nbr pop w-full ${width ?? (wide ? 'max-w-3xl' : 'max-w-xl')} max-h-[86vh] overflow-y-auto p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-white flex items-center justify-center hover:bg-coral hover:text-white transition-colors" aria-label="关闭">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ---------- Tabs ----------
export function Tabs<T extends string>({ items, value, onChange }: { items: { key: T; label: string; count?: number }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`px-4 py-2 rounded-full border-[2.5px] border-ink text-sm font-bold transition-all ${value === it.key ? 'bg-ink text-brand shadow-hard-xs' : 'bg-white hover:-translate-y-0.5'}`}
        >
          {it.label}
          {it.count !== undefined && <span className={`ml-1.5 ${value === it.key ? 'text-white/80' : 'text-ink/50'}`}>{it.count}</span>}
        </button>
      ))}
    </div>
  )
}

// ---------- EmptyState ----------
export function EmptyState({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl border-[2.5px] border-ink bg-paper flex items-center justify-center text-3xl">{icon}</div>
      <p className="font-bold text-ink/50">{text}</p>
      {action}
    </div>
  )
}

// ---------- Avatar ----------
export function Avatar({ emoji, size = 'md', color = 'brand' }: { emoji: string; size?: 'sm' | 'md' | 'lg'; color?: UnitColor }) {
  const sizeCls = size === 'sm' ? 'w-9 h-9 text-lg' : size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-11 h-11 text-xl'
  return <span className={`inline-flex items-center justify-center rounded-2xl border-[2.5px] border-ink ${colorBG[color]} ${sizeCls} shrink-0`}>{emoji}</span>
}

// ---------- DifficultyDots ----------
export function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" title={`难度 ${level}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-ink ${i <= level ? 'bg-coral' : 'bg-white'}`} />
      ))}
    </span>
  )
}

// ---------- TypeTag ----------
export function TypeTag({ text, color = 'blue' }: { text: string; color?: UnitColor }) {
  return <span className={`chip !py-0.5 ${colorBG[color]} !text-[11px]`}>{text}</span>
}
