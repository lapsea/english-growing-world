import { Link } from 'react-router-dom'
import { Users, Database, BookOpen, School, Link2, ShieldCheck } from 'lucide-react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, Chip, SectionTitle, Avatar } from '../../components/ui'

export function AdminHomePage() {
  const version = useRepoVersion()
  const { data: users } = useAsync(() => repo.getAllUsers(), [version])
  const { data: bindings } = useAsync(() => repo.getBindings(), [version])
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const { data: words } = useAsync(() => repo.getWords(), [])
  const { data: cls } = useAsync(() => repo.getClass(), [])
  const { data: groups } = useAsync(() => repo.getGroups(), [])

  const counts = {
    student: (users ?? []).filter((u) => u.role === 'student').length,
    parent: (users ?? []).filter((u) => u.role === 'parent').length,
    teacher: (users ?? []).filter((u) => u.role === 'teacher').length,
  }

  const entries = [
    { to: '/teacher/school/users', icon: Users, title: '用户管理', desc: `${users?.length ?? 0} 个账号 · 启用/停用`, bg: 'bg-brand' },
    { to: '/teacher/school/bindings', icon: Link2, title: '家长绑定关系', desc: `${bindings?.length ?? 0} 条绑定记录`, bg: 'bg-ice' },
    { to: '/teacher/school/content', icon: BookOpen, title: '教材与单元管理', desc: `${units?.length ?? 0} 个单元 · ${words?.length ?? 0} 个单词`, bg: 'bg-lav/60' },
    { to: '/teacher/school/classes', icon: School, title: '班级数据', desc: `${cls?.name ?? ''} · ${groups?.length ?? 0} 个小组`, bg: 'bg-coral text-white' },
    { to: '/teacher/school/data', icon: Database, title: '业务数据浏览器', desc: '浏览全部业务数据集合', bg: 'bg-ink text-white' },
  ]

  return (
    <div className="space-y-8">
      <div className="reveal bg-ink text-white rounded-[28px] border-[2.5px] border-ink shadow-hard p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-brand border-[2.5px] border-ink shadow-hard-xs flex items-center justify-center shrink-0">
          <ShieldCheck className="w-10 h-10 text-ink" />
        </div>
        <div>
          <h1 className="text-3xl font-black">校务管理</h1>
          <p className="font-bold text-white/70 text-sm mt-1">
            英语词句生长世界 · 共 {users?.length ?? 0} 个账号、{units?.length ?? 0} 个教材单元、{words?.length ?? 0} 个单词
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: '学生账号', value: counts.student, bg: 'bg-brand' },
          { label: '家长账号', value: counts.parent, bg: 'bg-ice' },
          { label: '教师账号', value: counts.teacher, bg: 'bg-lav/60' },
          { label: '绑定关系', value: bindings?.length ?? 0, bg: 'bg-coral text-white' },
        ].map((s, i) => (
          <Card key={s.label} className={`p-5 reveal d${i + 1}`}>
            <div className={`inline-block px-4 py-1 rounded-full border-2 border-ink font-black text-xl mb-2 ${s.bg}`}>{s.value}</div>
            <div className="text-xs font-bold text-ink/50">{s.label}</div>
          </Card>
        ))}
      </div>

      <section>
        <SectionTitle icon="🗂️" title="管理入口" sub="进入各管理模块" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {entries.map((e, i) => (
            <Link key={e.to} to={e.to}>
              <Card hover className={`p-6 space-y-3 reveal d${i + 1}`}>
                <div className={`w-12 h-12 rounded-2xl border-[2.5px] border-ink ${e.bg} flex items-center justify-center`}>
                  <e.icon className={`w-6 h-6 ${e.bg.includes('text-white') ? 'text-white' : 'text-ink'}`} />
                </div>
                <div className="font-black text-lg">{e.title}</div>
                <div className="text-xs font-bold text-ink/50">{e.desc}</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle icon="📋" title="账号速览" sub="全部账号" />
        <Card className="p-2">
          <table className="tbl">
            <thead>
              <tr>
                <th>账号</th>
                <th>姓名</th>
                <th>角色</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="font-mono text-xs">{u.id}</td>
                  <td className="font-bold flex items-center gap-2">
                    <Avatar emoji={u.avatar} size="sm" color="ice" />
                    {u.name}
                  </td>
                  <td>
                    <Chip bg={u.role === 'student' ? 'brand' : u.role === 'parent' ? 'ice' : 'lav text-white'}>
                      {{ student: '学生', parent: '家长', teacher: '教师' }[u.role]}
                    </Chip>
                  </td>
                  <td>{u.active ? <span className="chip bg-paper text-xs">正常</span> : <span className="chip bg-coral text-white text-xs">已停用</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  )
}
