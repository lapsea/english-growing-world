import { Link } from 'react-router-dom'
import { ArrowLeft, Printer, Sparkles } from 'lucide-react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { MODULE_LABELS } from '../../types'
import { Card, Chip, ProgressBar, Avatar, EmptyState } from '../../components/ui'

export function ParentReportPage() {
  const version = useRepoVersion()
  const { data: user } = useAsync(() => repo.getCurrentUser(), [])
  const childId = user?.childIds?.[0] ?? 'stu-001'
  const { data: child } = useAsync(() => repo.getAllUsers().then((us) => us.find((u) => u.id === childId)), [childId])
  const { data: report } = useAsync(() => repo.getParentReport(childId), [childId, version])

  if (!report) {
    return <EmptyState icon="📊" text="报告生成中，请稍候刷新重试。" />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/parent" className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" /> 返回概览
        </Link>
        <Chip bg="paper">
          <Printer className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          报告自动生成
        </Chip>
      </div>

      {/* 报告头 */}
      <div className="reveal bg-ink text-white rounded-[28px] border-[2.5px] border-ink shadow-hard p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar emoji={child?.avatar ?? '👦'} size="lg" color="brand" />
            <div>
              <h1 className="text-3xl font-black">每周学习报告</h1>
              <p className="font-bold text-white/70 text-sm mt-1">
                {child?.name} · {report.weekLabel} · 生成于 {report.generatedAt.slice(0, 10)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-brand">{report.totalMinutes}</div>
            <div className="text-xs font-bold text-white/60">本周总学习分钟数</div>
          </div>
        </div>
      </div>

      {/* 三个总览数字 */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: '学习活跃天数', value: `${report.daysActive} 天`, bg: 'bg-brand' },
          { label: '完成任务数', value: `${report.finishedTasks} 个`, bg: 'bg-ice' },
          { label: '考试参与', value: `${report.examScores.length} 场`, bg: 'bg-lav/60' },
        ].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <div className={`inline-block px-4 py-1.5 rounded-full border-2 border-ink font-black text-xl ${s.bg}`}>{s.value}</div>
            <div className="text-xs font-bold text-ink/50 mt-2">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* 单元进度 */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-black flex items-center gap-2">📖 单元学习进度</h2>
        {report.unitSummary.map((u) => (
          <div key={u.unitId} className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>{u.unitTitle}</span>
              <span>{u.completion}%</span>
            </div>
            <ProgressBar value={u.completion} color={u.completion >= 60 ? 'brand' : u.completion >= 30 ? 'blue' : 'coral'} height="h-2.5" />
          </div>
        ))}
      </Card>

      {/* 强弱项 */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-black">💪 学得最好的模块</h2>
          <div className="inline-block px-5 py-2 rounded-2xl border-[2.5px] border-ink bg-brand font-black text-2xl shadow-hard-xs">
            {MODULE_LABELS[report.strongest]}
          </div>
          <p className="text-sm font-bold text-ink/60">继续保持这个模块的学习节奏！</p>
        </Card>
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-black">🎯 需要巩固的模块</h2>
          <div className="inline-block px-5 py-2 rounded-2xl border-[2.5px] border-ink bg-coral text-white font-black text-2xl shadow-hard-xs">
            {MODULE_LABELS[report.weakest]}
          </div>
          <p className="text-sm font-bold text-ink/60">建议本周每天安排 10 分钟专项练习，错题本配合复习。</p>
        </Card>
      </div>

      {/* 高频错词 + 考试成绩 */}
      <div className="grid md:grid-cols-2 gap-5 items-start">
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-black">🔤 本周高频错词</h2>
          {report.topWrongWords.length === 0 && <p className="text-sm font-bold text-ink/40">本周没有记录到错误，太棒了！</p>}
          <div className="flex flex-wrap gap-2">
            {report.topWrongWords.map((w, i) => (
              <Chip key={i} bg="paper">
                {w.question.length > 18 ? w.question.slice(0, 18) + '…' : w.question}
                <span className="text-coral"> ×{w.times}</span>
              </Chip>
            ))}
          </div>
        </Card>
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-black">📝 测验和考试</h2>
          {report.examScores.length === 0 && <p className="text-sm font-bold text-ink/40">本周暂无考试记录</p>}
          {report.examScores.map((e, i) => (
            <div key={i} className="flex items-center justify-between border-b border-ink/10 pb-2 last:border-0">
              <div>
                <div className="font-black text-sm">{e.title}</div>
                <div className="text-xs font-bold text-ink/40">{e.date.slice(0, 10)}</div>
              </div>
              <span className="font-black text-blue">{e.score}/{e.total}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* 老师总结 */}
      <Card className="p-6 space-y-3 bg-paper">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-coral" />
          本周总结与建议
        </h2>
        <p className="font-bold leading-relaxed">{report.summaryText}</p>
        <div className="rounded-2xl border-2 border-dashed border-ink/40 bg-white p-4">
          <div className="text-xs font-black text-ink/40 mb-1">给家长的建议</div>
          <p className="font-bold text-sm">{report.suggestion}</p>
        </div>
      </Card>
    </div>
  )
}
