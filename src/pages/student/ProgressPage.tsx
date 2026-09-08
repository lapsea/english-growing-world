import { Award, TrendingUp, ClipboardCheck, FileText, Star, Flame } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, ProgressBar, EmptyState } from '../../components/ui'
import type { StudentProgress, ExamRecord, WrongItem, Unit } from '../../types'

const MODULE_ROWS: { key: keyof StudentProgress['moduleMastery']; label: string; icon: string; color: 'brand' | 'blue' | 'ice' | 'lav' | 'coral' }[] = [
  { key: 'vocabulary', label: '词汇', icon: '📚', color: 'brand' },
  { key: 'grammar', label: '语法', icon: '🧩', color: 'blue' },
  { key: 'listening', label: '听力', icon: '🎧', color: 'ice' },
  { key: 'reading', label: '阅读', icon: '📖', color: 'lav' },
  { key: 'writing', label: '写作', icon: '✍️', color: 'coral' },
]

export function ProgressPage() {
  const { data: progress } = useAsync<StudentProgress>(() => repo.getStudentProgress('stu-001'), [])
  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])
  const { data: exams } = useAsync<ExamRecord[]>(() => repo.getExamHistory('stu-001'), [])
  const { data: wrongs } = useAsync<WrongItem[]>(() => repo.getWrongItems('stu-001', {}), [])

  if (!progress || !units) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>
  const maxMin = Math.max(...progress.dailyMinutes.map((d) => d.minutes), 30)
  const topWrong = [...(wrongs ?? [])].sort((a, b) => b.wrongTimes - a.wrongTimes).slice(0, 5)

  return (
    <div className="space-y-8">
      <SectionTitle title="学习进度" sub="单元完成率 · 模块掌握度 · 七天趋势 · 作业与考试 · 徽章墙" />

      {/* —— 单元完成率 —— */}
      <Card className="p-7 reveal d1">
        <SectionTitle title="单元完成率" icon={<TrendingUp size={17} strokeWidth={2.8} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
          {units.map((u) => (
            <div key={u.id}>
              <ProgressBar label={`${u.kind === 'starter' ? 'S' : 'U'}${u.order} ${u.title} ${u.titleZh}`} value={progress.unitCompletion[u.id] ?? 0} color={(progress.unitCompletion[u.id] ?? 0) >= 100 ? 'brand' : 'blue'} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* —— 模块掌握度 —— */}
          <Card className="p-7 reveal d2">
            <SectionTitle title="知识模块掌握度" sub="练习、测验、听力、阅读表现实时更新" />
            <div className="space-y-4">
              {MODULE_ROWS.map((m) => (
                <div key={m.key}>
                  <ProgressBar label={`${m.icon} ${m.label}`} value={progress.moduleMastery[m.key]} color={m.color} height="h-5" />
                </div>
              ))}
            </div>
          </Card>

          {/* —— 作业完成率 + 考试成绩 —— */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 reveal d3">
              <SectionTitle title="作业完成率" icon={<ClipboardCheck size={17} strokeWidth={2.8} />} />
              <div className="text-4xl font-display font-extrabold mb-2">
                {progress.assignmentTotal > 0 ? Math.round((progress.assignmentDone / progress.assignmentTotal) * 100) : 100}%
              </div>
              <ProgressBar value={progress.assignmentTotal > 0 ? (progress.assignmentDone / progress.assignmentTotal) * 100 : 100} color="lav" />
              <p className="text-sm font-bold text-ink/50 mt-3">
                {progress.assignmentDone} / {progress.assignmentTotal} 份作业已完成
              </p>
            </Card>
            <Card className="p-6 reveal d4">
              <SectionTitle title="考试成绩" icon={<FileText size={17} strokeWidth={2.8} />} />
              {(exams ?? []).length === 0 ? (
                <p className="text-sm font-bold text-ink/40">暂无考试记录</p>
              ) : (
                <div className="space-y-2.5">
                  {(exams ?? []).slice(0, 4).map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-xl border-2 border-ink/15 bg-paper px-3.5 py-2">
                      <span className="text-sm font-bold truncate">{e.examTitle}</span>
                      <span className="font-extrabold shrink-0 ml-2">
                        {e.score}
                        <span className="text-xs text-ink/40">/{e.total}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* —— 右列：七天趋势 + 高频错题 + 徽章 —— */}
        <div className="space-y-8">
          <Card className="p-6 reveal d2">
            <SectionTitle title="最近七天" icon={<Flame size={17} strokeWidth={2.8} />} sub={`合计 ${progress.weekMinutes} 分钟`} />
            <div className="flex items-end gap-2 h-28">
              {progress.dailyMinutes.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full rounded-lg border-2 border-ink border-b-0 ${i === 6 ? 'bg-coral' : 'bg-brand'}`} style={{ height: `${Math.max(5, (d.minutes / maxMin) * 80)}px` }} />
                  <span className="text-[9px] font-bold text-ink/45">{d.date.slice(8)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 reveal d3">
            <SectionTitle title="高频错题" />
            {topWrong.length === 0 ? (
              <p className="text-sm font-bold text-ink/40">暂无错题，厉害！</p>
            ) : (
              <div className="space-y-2">
                {topWrong.map((w) => (
                  <div key={w.key} className="flex items-center gap-2.5 rounded-xl border-2 border-ink/15 bg-paper px-3 py-2">
                    <span className="w-6 h-6 shrink-0 rounded-md bg-coral text-white border-2 border-ink flex items-center justify-center text-[11px] font-extrabold">{w.wrongTimes}</span>
                    <span className="text-xs font-bold truncate flex-1">{w.question}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 reveal d4">
            <SectionTitle title="徽章墙" icon={<Award size={17} strokeWidth={2.8} />} />
            <div className="grid grid-cols-3 gap-3">
              {progress.badges.map((b) => (
                <div key={b.id} className={`rounded-2xl border-[2.5px] border-ink p-3 text-center ${b.got ? 'bg-brand' : 'bg-paper opacity-45'}`} title={b.desc}>
                  <div className="text-2xl">{b.icon}</div>
                  <div className="text-[11px] font-extrabold mt-1 leading-tight">{b.name}</div>
                  <div className={`text-[9px] font-bold mt-0.5 ${b.got ? 'text-ink/60' : 'text-ink/40'}`}>{b.got ? '已获得' : '未解锁'}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 reveal d5">
            <SectionTitle title="学习亮点" icon={<Star size={17} strokeWidth={2.8} />} />
            <ul className="text-sm font-semibold space-y-2 text-ink/70">
              <li>🔥 连续学习 <b>{progress.streakDays}</b> 天，全组最稳</li>
              <li>⭐ 累计 <b>{progress.exp}</b> EXP，等级 Lv.{progress.level}</li>
              <li>🎧 本周听力练习 <b>{progress.moduleMastery.listening}</b>% 掌握度</li>
            </ul>
          </Card>
        </div>
      </div>

      {(wrongs ?? []).length === 0 && <EmptyState icon="🎉" text="保持下去，错题本空空如也！" />}
    </div>
  )
}
