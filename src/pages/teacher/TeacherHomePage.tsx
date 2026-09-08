import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, PenTool, Trophy, BookOpen, Plus } from 'lucide-react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { MODULE_LABELS } from '../../types'
import { Card, SectionTitle, ProgressBar, Chip, Avatar } from '../../components/ui'

export function TeacherHomePage() {
  const version = useRepoVersion()
  const { data: teacher } = useAsync(() => repo.getCurrentUser(), [])
  const { data: students } = useAsync(() => repo.getStudents(), [version])
  const { data: assignments } = useAsync(() => repo.getAssignments(teacher?.id ?? 'teacher-001'), [teacher?.id, version])
  const { data: standings } = useAsync(() => repo.getGroupStandings('class-701'), [version])
  const { data: submissions } = useAsync(() => repo.getWritingSubmissions(), [version])
  const { data: records } = useAsync(() => repo.getExamRecordsForClass(), [version])

  const pendingGrading = useMemo(() => (submissions ?? []).filter((s) => !s.graded), [submissions])
  const avgExam = useMemo(() => {
    if (!records || records.length === 0) return 0
    return Math.round(records.reduce((s, r) => s + (r.score / Math.max(1, r.total)) * 100, 0) / records.length)
  }, [records])

  const stats = [
    { icon: Users, label: '班级学生', value: `${students?.length ?? 0} 人`, bg: 'bg-brand', to: '/teacher/students' },
    { icon: ClipboardList, label: '已布置作业', value: `${assignments?.length ?? 0} 份`, bg: 'bg-ice', to: '/teacher/assignments' },
    { icon: PenTool, label: '待批改作文', value: `${pendingGrading.length} 篇`, bg: 'bg-coral text-white', to: '/teacher/grading' },
    { icon: Trophy, label: '班级考试均分', value: `${avgExam} 分`, bg: 'bg-lav/60', to: '/teacher/exams' },
  ]

  return (
    <div className="space-y-8">
      <div className="reveal bg-ink text-white rounded-[28px] border-[2.5px] border-ink shadow-hard p-8 flex items-center gap-6">
        <Avatar emoji={teacher?.avatar ?? '👩‍🏫'} size="lg" color="brand" />
        <div className="flex-1">
          <h1 className="text-3xl font-black">{teacher?.name} 老师，欢迎回来！</h1>
          <p className="font-bold text-white/70 text-sm mt-1">
            {teacher?.teacherTitle ?? '英语教师'} · 七年级 701 班 · 今天也要和积木小队、闪电小队一起加油！
          </p>
        </div>
        <Link to="/teacher/assignments" className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4 mr-1" /> 布置新作业
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Link key={s.label} to={s.to}>
            <Card hover className={`p-5 reveal d${i + 1}`}>
              <div className={`w-11 h-11 rounded-xl border-2 border-ink ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-ink" />
              </div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs font-bold text-ink/50 mt-1">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section>
          <SectionTitle icon="📋" title="我布置的作业" sub="完成情况实时统计" />
          <Card className="p-2">
            <table className="tbl">
              <thead>
                <tr>
                  <th>作业</th>
                  <th>类型</th>
                  <th>截止</th>
                  <th>完成</th>
                </tr>
              </thead>
              <tbody>
                {(assignments ?? []).map((a) => (
                  <tr key={a.id}>
                    <td className="font-black">{a.title}</td>
                    <td className="text-xs">{a.type === 'practice' ? '练习' : a.type === 'writing' ? '写作' : '听力'}</td>
                    <td className="text-xs whitespace-nowrap">{a.dueDate}</td>
                    <td>
                      <AssignmentDoneChip id={a.id} />
                    </td>
                  </tr>
                ))}
                {(assignments ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 font-bold text-ink/40">还没有布置作业</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </section>

        <div className="space-y-6">
          <section>
            <SectionTitle icon="🚩" title="小组战况" sub="周挑战积分对比" />
            <div className="grid grid-cols-2 gap-4">
              {(standings ?? []).map((s) => (
                <Card key={s.group.id} className="p-4 text-center space-y-2">
                  <div className="font-black">{s.group.name}</div>
                  <div className="text-3xl font-black text-coral">{s.totalPoints}</div>
                  <div className="text-xs font-bold text-ink/40">小组积分 · 第 {s.rank} 名</div>
                  <ProgressBar value={(s.totalPoints / Math.max(1, Math.max(...(standings ?? []).map((x) => x.totalPoints)))) * 100} color={s.group.color} height="h-2.5" />
                </Card>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle icon="🧩" title="班级能力雷达" sub="各模块平均掌握度" />
            <Card className="p-5 space-y-3">
              <ClassModuleBars />
            </Card>
          </section>
        </div>
      </div>

      <section>
        <SectionTitle icon="🖊️" title="最新提交的作文" sub="点击进入批改" />
        <div className="grid md:grid-cols-3 gap-4">
          {(submissions ?? []).slice(0, 3).map((s) => (
            <Link key={s.id} to="/teacher/grading">
              <Card hover className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black">{s.studentName}</span>
                  {s.graded ? <Chip bg="brand">已批 {s.score}分</Chip> : <Chip bg="coral text-white">待批改</Chip>}
                </div>
                <p className="text-xs font-bold text-ink/60">{s.taskTitle}</p>
                <p className="text-xs text-ink/50 line-clamp-2">{s.content.slice(0, 60)}…</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-xs font-bold text-ink/30 flex items-center justify-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" />
        英语词句生长世界 · 人教版七年级上册
      </p>
    </div>
  )
}

function AssignmentDoneChip({ id }: { id: string }) {
  const { data } = useAsync(() => repo.getAssignmentStats(id), [])
  if (!data) return <span className="text-xs font-bold text-ink/30">…</span>
  const pct = Math.round((data.done / Math.max(1, data.total)) * 100)
  return (
    <span className={`chip text-xs ${pct >= 80 ? 'bg-brand' : pct >= 40 ? 'bg-ice' : 'bg-coral text-white'}`}>
      {data.done}/{data.total}
    </span>
  )
}

function ClassModuleBars() {
  const { data: students } = useAsync(() => repo.getStudents(), [])
  const { data: progresses } = useAsync(async () => {
    const list = await Promise.all((students ?? []).map((s) => repo.getStudentProgress(s.id)))
    return list
  }, [students])

  if (!progresses || progresses.length === 0) return null
  const keys = ['vocabulary', 'grammar', 'listening', 'reading', 'writing'] as const
  return (
    <>
      {keys.map((k) => {
        const avg = progresses.reduce((s, p) => s + (p.moduleMastery[k] ?? 0), 0) / progresses.length
        return (
          <div key={k} className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>{MODULE_LABELS[k]}</span>
              <span>{Math.round(avg * 100)}%</span>
            </div>
            <ProgressBar value={avg * 100} color={avg >= 0.5 ? 'brand' : avg >= 0.3 ? 'blue' : 'coral'} height="h-2.5" />
          </div>
        )
      })}
    </>
  )
}
