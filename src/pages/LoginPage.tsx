import { useNavigate } from 'react-router-dom'
import { BookOpenText, GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, colorBG } from '../components/ui'
import type { Role } from '../types'

const ROLE_CARDS: { role: Role; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { role: 'teacher', label: '教师端', desc: '管理班级、布置作业、批改作文、查看学情与排行，兼校务管理', icon: <BookOpenText size={26} />, color: 'bg-lav' },
  { role: 'student', label: '学生端', desc: '学单词、练听力、读文章、写作文、刷挑战、玩小游戏', icon: <GraduationCap size={26} />, color: 'bg-brand' },
  { role: 'parent', label: '家长端', desc: '查看孩子学习概览、时长、成绩、薄弱点与每周报告', icon: <Users size={26} />, color: 'bg-ice' },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const enter = async (role: Role) => {
    const id = role === 'student' ? 'stu-001' : role === 'parent' ? 'parent-001' : 'teacher-001'
    await login(id)
    navigate(`/${role}`)
  }

  return (
    <div className="min-h-screen bg-paper dot-grid flex items-center justify-center p-10">
      <div className="w-full max-w-6xl">
        {/* —— 海报式标题区 —— */}
        <div className="bg-ink rounded-nbr-xl border-[3px] border-ink shadow-hard-lg p-10 md:p-14 relative overflow-hidden reveal d1">
          <div className="absolute right-[-40px] top-[-40px] w-56 h-56 rounded-[48px] bg-brand border-[3px] border-white/20 rotate-12" />
          <div className="absolute right-24 bottom-[-52px] w-40 h-40 rounded-[36px] bg-blue border-[3px] border-white/20 -rotate-6" />
          <div className="absolute left-10 bottom-6 w-24 h-24 rounded-[28px] bg-coral border-[3px] border-white/20 rotate-6 hidden md:block" />
          <div className="relative z-10">
            <div className="chip bg-brand mb-6">
              <Sparkles size={13} /> 教师 · 学生 · 家长 三端协同
            </div>
            <h1 className="font-display font-extrabold text-white text-6xl md:text-7xl leading-[1.02] tracking-tight">
              英语词句
              <span className="text-brand">生长世界</span>
            </h1>
            <p className="text-white/80 font-bold text-xl mt-4">人教版英语 · 七年级上册 · 教材同步学习平台</p>
            <p className="text-white/50 font-semibold text-sm mt-3 max-w-xl">
              Starter Units 1–3 + Unit 1–7 全覆盖：单元导学、单词库、听力电台、阅读世界、写作工坊、考试挑战、错题本与 5 个学习小游戏。
            </p>
          </div>
        </div>

        {/* —— 三个演示身份 —— */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {ROLE_CARDS.map((c, i) => (
            <Card key={c.role} hover className={`p-6 reveal d${i + 2} flex flex-col`}>
              <span className={`w-14 h-14 rounded-2xl border-[2.5px] border-ink ${c.color} flex items-center justify-center mb-4 ${colorBG.brand === c.color ? '' : 'text-ink'}`}>{c.icon}</span>
              <h3 className="text-xl font-extrabold">{c.label}</h3>
              <p className="text-sm font-semibold text-ink/55 mt-2 flex-1">{c.desc}</p>
              <button onClick={() => enter(c.role)} className="btn btn-primary btn-md mt-5 w-full">
                进入{c.label.split(' · ')[0]} <ArrowRight size={17} strokeWidth={3} />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
