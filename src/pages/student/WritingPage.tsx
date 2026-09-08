import { Link } from 'react-router-dom'
import { PenTool } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, EmptyState, colorBG } from '../../components/ui'
import type { WritingTask, Unit } from '../../types'

export function WritingPage() {
  const { data: tasks } = useAsync<WritingTask[]>(() => repo.getWritingTasks(), [])
  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])

  return (
    <div className="space-y-6">
      <SectionTitle title="写作工坊" sub="写作案例 + 学生写作流程：提纲 → 草稿 → 提交 → 老师评分批注" />
      {(tasks ?? []).length === 0 ? (
        <EmptyState icon="✍️" text="暂无写作任务" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(tasks ?? []).map((t, i) => {
            const u = units?.find((x) => x.id === t.unitId)
            return (
              <Link key={t.id} to={`/student/writing/${t.id}`} className={`reveal d${i + 1}`}>
                <Card hover className="p-0 overflow-hidden">
                  <div className={`${colorBG[i === 0 ? 'coral' : 'blue']} border-b-[2.5px] border-ink px-5 py-4 flex items-center justify-between`}>
                    <div className="font-extrabold text-lg">✍️ {t.title}</div>
                    <span className="chip bg-white !text-[11px] shrink-0">{u ? `U${u.order} ${u.title}` : ''}</span>
                  </div>
                  <div className="p-5">
                    <p className="font-semibold text-sm text-ink/70 leading-relaxed line-clamp-2">{t.prompt}</p>
                    <div className="mt-4 flex items-center gap-2 flex-wrap text-[11px] font-bold text-ink/50">
                      <span className="chip !text-[10px] bg-paper">📋 {t.requirements.length} 条要求</span>
                      <span className="chip !text-[10px] bg-paper">💡 {t.patterns.length} 个句型</span>
                      <span className="chip !text-[10px] bg-paper">📦 {t.structure.length} 步结构</span>
                      <span className="chip !text-[10px] bg-paper">范文 {t.sample.score} 分</span>
                    </div>
                    <div className="mt-4 btn btn-primary btn-md w-full">
                      <PenTool size={15} /> 进入写作工坊
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
