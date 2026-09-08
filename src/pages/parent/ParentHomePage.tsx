import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Baby, Clock, BookOpen, ClipboardList, TrendingUp, MessageCircle, Flame, Target } from 'lucide-react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { MODULE_LABELS } from '../../types'
import { Card, SectionTitle, ProgressBar, Avatar, Chip } from '../../components/ui'

export function ParentHomePage() {
  const version = useRepoVersion()
  const { data: user } = useAsync(() => repo.getCurrentUser(), [])
  const childId = user?.childIds?.[0] ?? 'stu-001'
  const { data: child } = useAsync(() => repo.getAllUsers().then((us) => us.find((u) => u.id === childId)), [childId])
  const { data: progress } = useAsync(() => repo.getStudentProgress(childId), [childId, version])
  const { data: assignments } = useAsync(() => repo.getAssignments(childId), [childId, version])
  const { data: exams } = useAsync(() => repo.getExamHistory(childId), [childId, version])
  const { data: wrongs } = useAsync(() => repo.getWrongItems(childId), [childId, version])
  const { data: comments } = useAsync(() => repo.getTeacherComments(childId), [childId, version])
  const { data: units } = useAsync(() => repo.getUnits(), [])

  const activeWrongs = (wrongs ?? []).filter((w) => w.status === 'active')
  const topWrongs = useMemo(() => {
    const m = new Map<string, number>()
    ;(wrongs ?? []).forEach((w) => m.set(w.question, Math.max(m.get(w.question) ?? 0, w.wrongTimes)))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [wrongs])

  const weakestModule = useMemo(() => {
    if (!progress) return null
    const entries = Object.entries(progress.moduleMastery) as [keyof typeof MODULE_LABELS, number][]
    return entries.sort((a, b) => a[1] - b[1])[0]
  }, [progress])

  return (
    <div className="space-y-8">
      {/* 孩子概览横幅 */}
      <div className="reveal bg-ink text-white rounded-[28px] border-[2.5px] border-ink shadow-hard p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-brand border-[2.5px] border-ink shadow-hard-xs flex items-center justify-center text-3xl font-black text-ink shrink-0">
          {child?.avatar}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Baby className="w-8 h-8 text-brand" />
            {child?.name} 的学习概览
          </h1>
          <p className="font-bold text-white/70 text-sm mt-1">
            连续学习 <b className="text-brand">{progress?.streakDays}</b> 天 · Lv.{progress?.level}（{progress?.exp} EXP） ·
            本周学习 <b className="text-brand">{progress?.weekMinutes}</b> 分钟
          </p>
        </div>
        <Link to="/parent/report" className="btn btn-primary shrink-0">查看每周报告 →</Link>
      </div>

      {/* 四个统计卡 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { icon: Clock, label: '本周学习时长', value: `${progress?.weekMinutes ?? 0} 分钟`, bg: 'bg-brand' },
          { icon: ClipboardList, label: '作业完成', value: `${progress?.assignmentDone ?? 0}/${progress?.assignmentTotal ?? 0} 份`, bg: 'bg-ice' },
          { icon: TrendingUp, label: '最近测验成绩', value: exams && exams.length > 0 ? `${exams[exams.length - 1].score}/${exams[exams.length - 1].total}` : '暂无', bg: 'bg-lav/60' },
          { icon: Target, label: '待巩固错题', value: `${activeWrongs.length} 道`, bg: 'bg-coral text-white' },
        ].map((s, i) => (
          <Card key={s.label} hover className={`p-5 reveal d${i + 1}`}>
            <div className={`w-11 h-11 rounded-xl border-2 border-ink ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-ink" />
            </div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-bold text-ink/50 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* 单元进度 */}
        <section>
          <SectionTitle icon="📚" title="单元学习进度" sub="按教材单元查看完成度" />
          <Card className="p-5 space-y-3.5">
            {units?.slice(0, 10).map((u) => (
              <div key={u.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>
                    {u.kind === 'starter' ? 'Starter ' : 'Unit '}
                    {u.order} · {u.titleZh}
                  </span>
                  <span>{Math.round((progress?.unitCompletion[u.id] ?? 0) * 100)}%</span>
                </div>
                <ProgressBar value={(progress?.unitCompletion[u.id] ?? 0) * 100} color={u.color} height="h-2.5" />
              </div>
            ))}
          </Card>
        </section>

        {/* 作业完成情况 + 考试成绩 */}
        <div className="space-y-6">
          <section>
            <SectionTitle icon="📝" title="作业完成情况" sub="老师布置的作业与提交状态" />
            <Card className="p-2">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>作业</th>
                    <th>类型</th>
                    <th>截止</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {(assignments ?? []).map((a) => (
                    <tr key={a.id}>
                      <td className="font-black">{a.title}</td>
                      <td className="text-xs">{a.type === 'practice' ? '练习' : a.type === 'writing' ? '写作' : '听力'}</td>
                      <td className="text-xs whitespace-nowrap">{a.dueDate}</td>
                      <td>
                        {a.status === 'done' ? (
                          <span className="chip bg-brand text-xs">已完成{a.score !== undefined ? ` · ${a.score}分` : ''}</span>
                        ) : (
                          <span className="chip bg-coral text-white text-xs">待完成</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(assignments ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 font-bold text-ink/40">暂无作业</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <SectionTitle icon="🎯" title="测验和考试成绩" sub="历次考试挑战得分记录" />
            <Card className="p-5 space-y-3">
              {(exams ?? []).length === 0 && <p className="font-bold text-ink/40 text-sm">还没有参加考试挑战</p>}
              {(exams ?? []).slice(-4).reverse().map((e) => {
                const pct = Math.round((e.score / Math.max(1, e.total)) * 100)
                return (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{e.examTitle}</span>
                        <span>{e.date.slice(0, 10)}</span>
                      </div>
                      <ProgressBar value={pct} color={pct >= 80 ? 'brand' : pct >= 60 ? 'blue' : 'coral'} height="h-2.5" />
                    </div>
                    <span className="font-black text-lg whitespace-nowrap">{e.score}/{e.total}</span>
                  </div>
                )
              })}
            </Card>
          </section>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* 薄弱知识点 */}
        <section>
          <SectionTitle icon="🩹" title="薄弱知识点" sub="掌握度最低的模块与高频错题" />
          <Card className="p-5 space-y-4">
            {weakestModule && (
              <div className="rounded-2xl border-2 border-ink bg-coral/15 p-4">
                <div className="font-black flex items-center gap-2">
                  <Flame className="w-4 h-4 text-coral" />
                  最需要加强：{MODULE_LABELS[weakestModule[0]]}
                </div>
                <p className="text-xs font-bold text-ink/60 mt-1">当前掌握度 {Math.round(weakestModule[1] * 100)}%，建议每天安排 10 分钟专项练习。</p>
              </div>
            )}
            {topWrongs.map(([q, times], i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className="chip bg-ink text-white text-xs shrink-0 mt-0.5">错 {times} 次</span>
                <span className="font-bold text-ink/80">{q.length > 46 ? q.slice(0, 46) + '…' : q}</span>
              </div>
            ))}
            {topWrongs.length === 0 && <p className="text-sm font-bold text-ink/40">暂无错题记录，继续加油！</p>}
          </Card>
        </section>

        {/* 高频错词 + 老师评语 */}
        <div className="space-y-6">
          <section>
            <SectionTitle icon="🔤" title="高频错词" sub="来自小游戏和练习的单词错误" />
            <Card className="p-5 flex flex-wrap gap-2.5">
              {activeWrongs.filter((w) => w.kind.includes('拼写') || w.kind.includes('配对') || w.kind.includes('听音')).slice(0, 8).map((w) => (
                <Chip key={w.key} bg="paper">{w.correctAnswer} <span className="text-coral">×{w.wrongTimes}</span></Chip>
              ))}
              {activeWrongs.filter((w) => w.kind.includes('拼写') || w.kind.includes('配对') || w.kind.includes('听音')).length === 0 && (
                <p className="text-sm font-bold text-ink/40">暂无高频错词</p>
              )}
            </Card>
          </section>

          <section>
            <SectionTitle icon="💬" title="老师评语" sub="来自 林晚晴 老师" />
            <div className="space-y-3">
              {(comments ?? []).map((c) => (
                <Card key={c.id} className="p-4 flex gap-3">
                  <Avatar emoji={c.teacherName.slice(0, 1)} color="lav" />
                  <div>
                    <div className="text-xs font-bold text-ink/50 mb-1">
                      {c.teacherName} · {c.date.slice(0, 10)}
                    </div>
                    <p className="font-bold text-sm">{c.text}</p>
                  </div>
                </Card>
              ))}
              {(comments ?? []).length === 0 && <Card className="p-5"><p className="font-bold text-ink/40 text-sm">暂无老师评语</p></Card>}
            </div>
          </section>
        </div>
      </div>

      <p className="text-center text-xs font-bold text-ink/30 flex items-center justify-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" />
        每周报告可点击右上角按钮查看
      </p>
    </div>
  )
}
