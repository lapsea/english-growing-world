import { useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { MODULE_LABELS, type User } from '../../types'
import { Card, SectionTitle, ProgressBar, Avatar, Chip, Modal } from '../../components/ui'
import { Search } from 'lucide-react'

export function TeacherStudentsPage() {
  const version = useRepoVersion()
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<User | null>(null)
  const { data: students } = useAsync(() => repo.getStudents(), [version])
  const { data: groups } = useAsync(() => repo.getGroups(), [])
  const { data: submissions } = useAsync(() => repo.getWritingSubmissions(), [version])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return (students ?? []).filter((s) => !kw || s.name.toLowerCase().includes(kw) || s.id.includes(kw))
  }, [students, keyword])

  const groupName = (gid?: string) => groups?.find((g) => g.id === gid)?.name ?? '—'

  return (
    <div className="space-y-6">
      <SectionTitle icon="👥" title="班级和学生列表" sub="701 班 · 点击学生查看学习详情" />

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索学生姓名…"
            className="field pl-9"
          />
        </div>
        <Chip bg="brand">共 {filtered.length} 名学生</Chip>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((s, i) => (
          <Card key={s.id} hover className={`p-5 space-y-3 reveal d${(i % 6) + 1}`} onClick={() => setSelected(s)}>
            <div className="flex items-center gap-3">
              <Avatar emoji={s.avatar} size="md" color="brand" />
              <div className="flex-1">
                <div className="font-black text-lg">{s.name}</div>
                <div className="text-xs font-bold text-ink/40">{groupName(s.groupId)} · {s.id}</div>
              </div>
              {!s.active && <Chip bg="coral text-white">停用</Chip>}
            </div>
            <StudentMiniProgress studentId={s.id} />
          </Card>
        ))}
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={`${selected?.name ?? ''} 的学习详情`} width="max-w-2xl">
        {selected && <StudentDetail studentId={selected.id} submissions={submissions ?? []} />}
      </Modal>
    </div>
  )
}

function StudentMiniProgress({ studentId }: { studentId: string }) {
  const { data: p } = useAsync(() => repo.getStudentProgress(studentId), [])
  if (!p) return null
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span>连续 {p.streakDays} 天 · Lv.{p.level}</span>
        <span className="text-ink/40">本周 {p.weekMinutes} 分钟</span>
      </div>
      <ProgressBar value={Math.min(100, p.weekMinutes)} color={p.weekMinutes >= 60 ? 'brand' : p.weekMinutes >= 25 ? 'blue' : 'coral'} height="h-2" />
    </div>
  )
}

function StudentDetail({ studentId, submissions }: { studentId: string; submissions: { id: string; studentId: string; taskTitle: string; score: number; graded: boolean }[] }) {
  const { data: p } = useAsync(() => repo.getStudentProgress(studentId), [])
  const { data: wrongs } = useAsync(() => repo.getWrongItems(studentId), [])
  const { data: exams } = useAsync(() => repo.getExamHistory(studentId), [])

  return (
    <div className="space-y-5">
      {p && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '连续天数', value: `${p.streakDays} 天`, bg: 'bg-brand' },
            { label: '经验等级', value: `Lv.${p.level}`, bg: 'bg-ice' },
            { label: '本周时长', value: `${p.weekMinutes} 分`, bg: 'bg-lav/60' },
            { label: '作业完成', value: `${p.assignmentDone}/${p.assignmentTotal}`, bg: 'bg-coral text-white' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border-2 border-ink p-3 text-center ${s.bg}`}>
              <div className="text-lg font-black">{s.value}</div>
              <div className="text-[10px] font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <div>
        <div className="font-black mb-2">模块掌握度</div>
        {p &&
          (Object.keys(MODULE_LABELS) as (keyof typeof MODULE_LABELS)[]).map((k) => (
            <div key={k} className="space-y-1 mb-2">
              <div className="flex justify-between text-xs font-bold">
                <span>{MODULE_LABELS[k]}</span>
                <span>{Math.round((p.moduleMastery[k] ?? 0) * 100)}%</span>
              </div>
              <ProgressBar value={(p.moduleMastery[k] ?? 0) * 100} color={k === 'writing' ? 'lav' : 'brand'} height="h-2" />
            </div>
          ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-black mb-2">最近考试</div>
          {(exams ?? []).slice(-3).reverse().map((e) => (
            <div key={e.id} className="flex justify-between text-sm font-bold border-b border-ink/10 py-1.5">
              <span className="text-ink/70">{e.examTitle}</span>
              <span className="text-blue">{e.score}/{e.total}</span>
            </div>
          ))}
          {(exams ?? []).length === 0 && <p className="text-xs font-bold text-ink/40">暂无</p>}
        </div>
        <div>
          <div className="font-black mb-2">待巩固错题</div>
          {(wrongs ?? []).filter((w) => w.status === 'active').slice(0, 3).map((w) => (
            <div key={w.key} className="text-xs font-bold text-ink/70 border-b border-ink/10 py-1.5 truncate">
              {w.question}
            </div>
          ))}
          {(wrongs ?? []).filter((w) => w.status === 'active').length === 0 && <p className="text-xs font-bold text-ink/40">暂无</p>}
        </div>
      </div>
      <div>
        <div className="font-black mb-2">作文提交</div>
        {submissions.filter((s) => s.studentId === studentId).map((s) => (
          <div key={s.id} className="flex justify-between text-sm font-bold border-b border-ink/10 py-1.5">
            <span className="text-ink/70">{s.taskTitle}</span>
            <span>{s.graded ? `${s.score} 分` : '待批改'}</span>
          </div>
        ))}
        {submissions.filter((s) => s.studentId === studentId).length === 0 && <p className="text-xs font-bold text-ink/40">暂无</p>}
      </div>
    </div>
  )
}
