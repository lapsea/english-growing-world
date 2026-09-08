import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Boxes,
  Headphones,
  BookMarked,
  PenTool,
  Trophy,
  XCircle,
  TrendingUp,
  Gamepad2,
  Medal,
  FileText,
  LayoutDashboard,
  Users,
  Database,
  ClipboardList,
  PenLine,
  BarChart3,
  Link2,
  School,
  Repeat,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Role } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Avatar } from '../ui'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const NAV: Record<Role, NavGroup[]> = {
  student: [
    {
      items: [
        { to: '/student', label: '学习首页', icon: <Home size={19} strokeWidth={2.6} /> },
        { to: '/student/units', label: '单元学习', icon: <BookOpen size={19} strokeWidth={2.6} /> },
        { to: '/student/words', label: '单词库', icon: <Boxes size={19} strokeWidth={2.6} /> },
        { to: '/student/listening', label: '听力电台', icon: <Headphones size={19} strokeWidth={2.6} /> },
        { to: '/student/reading', label: '阅读世界', icon: <BookMarked size={19} strokeWidth={2.6} /> },
        { to: '/student/writing', label: '写作工坊', icon: <PenTool size={19} strokeWidth={2.6} /> },
        { to: '/student/exam', label: '考试挑战', icon: <Trophy size={19} strokeWidth={2.6} /> },
        { to: '/student/wrong-book', label: '错题本', icon: <XCircle size={19} strokeWidth={2.6} /> },
        { to: '/student/progress', label: '学习进度', icon: <TrendingUp size={19} strokeWidth={2.6} /> },
        { to: '/student/games', label: '学习小游戏', icon: <Gamepad2 size={19} strokeWidth={2.6} /> },
        { to: '/student/leaderboard', label: '小组排名', icon: <Medal size={19} strokeWidth={2.6} /> },
      ],
    },
  ],
  parent: [
    {
      items: [
        { to: '/parent', label: '学习概览', icon: <Home size={19} strokeWidth={2.6} /> },
        { to: '/parent/report', label: '每周学习报告', icon: <FileText size={19} strokeWidth={2.6} /> },
      ],
    },
  ],
  teacher: [
    {
      items: [
        { to: '/teacher', label: '教师工作台', icon: <LayoutDashboard size={19} strokeWidth={2.6} /> },
        { to: '/teacher/students', label: '班级和学生', icon: <Users size={19} strokeWidth={2.6} /> },
        { to: '/teacher/groups', label: '学习小组管理', icon: <Boxes size={19} strokeWidth={2.6} /> },
        { to: '/teacher/content', label: '教学内容管理', icon: <BookOpen size={19} strokeWidth={2.6} /> },
        { to: '/teacher/bank', label: '题库管理', icon: <Database size={19} strokeWidth={2.6} /> },
        { to: '/teacher/assignments', label: '作业布置', icon: <ClipboardList size={19} strokeWidth={2.6} /> },
        { to: '/teacher/grading', label: '作文批改', icon: <PenLine size={19} strokeWidth={2.6} /> },
        { to: '/teacher/exams', label: '考试挑战管理', icon: <Trophy size={19} strokeWidth={2.6} /> },
        { to: '/teacher/analytics', label: '班级学情', icon: <BarChart3 size={19} strokeWidth={2.6} /> },
        { to: '/teacher/ranking', label: '周挑战和排行榜', icon: <Medal size={19} strokeWidth={2.6} /> },
      ],
    },
    {
      label: '校务管理',
      items: [
        { to: '/teacher/school', label: '校务概览', icon: <LayoutDashboard size={19} strokeWidth={2.6} /> },
        { to: '/teacher/school/users', label: '用户与角色', icon: <Users size={19} strokeWidth={2.6} /> },
        { to: '/teacher/school/bindings', label: '家长绑定关系', icon: <Link2 size={19} strokeWidth={2.6} /> },
        { to: '/teacher/school/content', label: '教材与单元管理', icon: <BookOpen size={19} strokeWidth={2.6} /> },
        { to: '/teacher/school/classes', label: '班级数据', icon: <School size={19} strokeWidth={2.6} /> },
        { to: '/teacher/school/data', label: '业务数据浏览器', icon: <Database size={19} strokeWidth={2.6} /> },
      ],
    },
  ],
}

export function RoleLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center font-bold text-ink/50">加载中…</div>
  if (!user) return <Navigate to="/login" replace />

  const role = user.role
  const groups = NAV[role]
  const nav = groups.flatMap((g) => g.items)
  const prefix = `/${role}`
  // 角色与路由不匹配时回到该角色首页
  if (!location.pathname.startsWith(prefix)) {
    return <Navigate to={prefix} replace />
  }

  // 最长路径优先匹配，避免 /teacher/school 抢走子页高亮
  const current = [...nav]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.to === prefix ? location.pathname === n.to : location.pathname.startsWith(n.to)))
  const roleLabel: Record<Role, string> = { student: '学生端', parent: '家长端', teacher: '教师端' }

  return (
    <div className="min-h-screen flex bg-paper">
      {/* —— 侧边栏 —— */}
      <aside className="w-[220px] shrink-0 bg-ink text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-brand border-[2.5px] border-white flex items-center justify-center font-display font-extrabold text-ink text-xl rotate-[-4deg]">E</span>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-[15px] leading-tight">英语词句</div>
              <div className="font-display font-extrabold text-[15px] leading-tight text-brand">生长世界</div>
            </div>
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            {roleLabel[role]} · 人教版七上
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
          {groups.map((group, gi) => (
            <div key={group.label ?? gi} className={gi > 0 ? 'pt-3 mt-2 border-t-2 border-white/10' : ''}>
              {group.label && (
                <div className="px-3.5 pb-1.5 text-[11px] font-extrabold tracking-widest text-white/40">{group.label}</div>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  // 有子路径的导航项只在精确匹配时高亮
                  const end = item.to === prefix || nav.some((o) => o.to !== item.to && o.to.startsWith(`${item.to}/`))
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={end}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                          isActive ? 'bg-brand text-ink shadow-[2px_2px_0_0_rgba(255,255,255,0.25)] translate-x-0.5' : 'text-white/75 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t-2 border-white/10">
          <NavLink to="/login" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold text-white/75 hover:text-brand hover:bg-white/10 transition-all">
            <Repeat size={19} strokeWidth={2.6} />
            切换身份
          </NavLink>
          <div className="flex items-center gap-2.5 px-3.5 pt-2">
            <Avatar emoji={user.avatar} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{user.name}</div>
              <div className="text-[11px] text-white/50 font-semibold">{roleLabel[role]}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* —— 主区域 —— */}
      <div className="flex-1 ml-[220px] flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-sm border-b-[2.5px] border-ink">
          <div className="px-8 h-[68px] flex items-center justify-between gap-4">
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full bg-brand border-2 border-ink inline-block`} />
              {current?.label ?? roleLabel[role]}
            </h1>
            <TopbarExtras role={role} />
          </div>
        </header>
        <main className="flex-1 p-8 dot-grid" style={{ backgroundSize: '30px 30px' }}>
          <div className="max-w-[1560px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function TopbarExtras({ role }: { role: Role }) {
  const { user } = useAuth()
  const { data: progress } = useAsync(() => repo.getStudentProgress(role === 'student' ? (user?.id ?? 'stu-001') : 'stu-001'), [role, user?.id])
  if (role === 'student' && progress) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="chip bg-coral text-white !border-ink">🔥 连续 {progress.streakDays} 天</span>
        <span className="chip bg-brand">Lv.{progress.level} · {progress.exp} EXP</span>
        <span className="chip bg-ice">⏱ 本周 {progress.weekMinutes} 分钟</span>
      </div>
    )
  }
  return null
}
