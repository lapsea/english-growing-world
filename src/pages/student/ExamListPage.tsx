import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Timer, ListChecks, Medal } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Modal, Button, EmptyState, colorBG } from '../../components/ui'
import type { ExamChallenge, ExamRecord } from '../../types'

export function ExamListPage() {
  const navigate = useNavigate()
  const [choosing, setChoosing] = useState<ExamChallenge | null>(null)
  const { data: exams } = useAsync<ExamChallenge[]>(() => repo.getExams(), [])
  const { data: history } = useAsync<ExamRecord[]>(() => repo.getExamHistory('stu-001'), [])
  const { data: boards } = useAsync<Record<string, { studentId: string; name: string; score: number; date: string }[]>>(async () => {
    const ids = (await repo.getExams()).map((e) => e.id)
    const rows = await Promise.all(ids.map((id) => repo.getExamLeaderboard(id)))
    return Object.fromEntries(ids.map((id, i) => [id, rows[i]]))
  }, [])

  const bestOf = (examId: string) => (history ?? []).filter((h) => h.examId === examId).reduce((m, h) => Math.max(m, h.score), -1)

  return (
    <div className="space-y-8">
      <SectionTitle title="考试挑战" sub="限时综合测试 · 客观题自动判分 · 模块得分 + 错题解析 · 与单元测验、老师作业分开计分" />

      {/* —— 挑战卡片 —— */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(exams ?? []).filter((e) => e.published).map((e, i) => {
          const best = bestOf(e.id)
          return (
            <Card key={e.id} hover className={`p-0 overflow-hidden reveal d${i + 1}`}>
              <div className={`${colorBG[i === 0 ? 'coral' : 'blue']} border-b-[2.5px] border-ink px-6 py-5 flex items-start justify-between gap-4`}>
                <div>
                  <div className="text-2xl font-extrabold leading-tight">{e.title}</div>
                  <div className="text-xs font-bold text-ink/60 mt-1">{e.subtitle}</div>
                </div>
                <span className="text-5xl shrink-0">{i === 0 ? '⚔️' : '🏆'}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-ink/55 mb-4">
                  <span className="chip !text-[10px] bg-paper">
                    <ListChecks size={10} /> {e.questions.length} 题
                  </span>
                  <span className="chip !text-[10px] bg-paper">
                    <Timer size={10} /> {e.durationMin} 分钟
                  </span>
                  <span className="chip !text-[10px] bg-paper">满分 {e.totalScore}</span>
                  {best >= 0 && <span className="chip !text-[10px] bg-brand">我的最高 {best}</span>}
                </div>
                <Button className="w-full" size="lg" onClick={() => setChoosing(e)}>
                  <Trophy size={17} /> {best >= 0 ? '再次挑战' : '开始挑战'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* —— 历史成绩 —— */}
        <Card className="p-7 reveal d2">
          <SectionTitle title="我的历史成绩" icon={<ListChecks size={17} strokeWidth={2.8} />} />
          {(history ?? []).length === 0 ? (
            <EmptyState icon="📄" text="还没有考试记录，先来一场挑战吧" />
          ) : (
            <div className="space-y-3">
              {(history ?? []).map((h) => (
                <div key={h.id} className="rounded-2xl border-[2.5px] border-ink bg-paper p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm truncate">{h.examTitle}</div>
                    <div className="text-xs font-semibold text-ink/50 mt-0.5">
                      {h.date} · 词汇 {h.moduleScores.vocabulary} / 语法 {h.moduleScores.grammar} / 听力 {h.moduleScores.listening} / 阅读 {h.moduleScores.reading}
                    </div>
                  </div>
                  <div className={`text-2xl font-display font-extrabold shrink-0 ${h.score >= 90 ? 'text-blue' : h.score >= 75 ? 'text-ink' : 'text-coral'}`}>
                    {h.score}
                    <span className="text-sm text-ink/40">/{h.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* —— 最高分排行榜 —— */}
        <Card className="p-7 reveal d3">
          <SectionTitle title="最高分排行榜" icon={<Medal size={17} strokeWidth={2.8} />} sub="每场挑战取班级内最高分" />
          {(exams ?? []).filter((e) => e.published).map((e) => {
            const rows = boards?.[e.id] ?? []
            return (
              <div key={e.id} className="mb-5 last:mb-0">
                <div className="text-sm font-extrabold mb-2">{e.title}</div>
                {rows.length === 0 ? (
                  <p className="text-xs font-bold text-ink/40">虚位以待——还没有人完成这场挑战</p>
                ) : (
                  <div className="space-y-1.5">
                    {rows.slice(0, 3).map((r, ri) => (
                      <div key={r.studentId} className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-paper px-3.5 py-2">
                        <span className={`w-6 h-6 rounded-md border-2 border-ink flex items-center justify-center text-xs font-extrabold ${ri === 0 ? 'bg-brand' : 'bg-white'}`}>{ri + 1}</span>
                        <span className="font-bold text-sm flex-1">{r.name}</span>
                        <span className="font-extrabold">{r.score} 分</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </Card>
      </div>

      {/* —— 开始确认 —— */}
      <Modal open={!!choosing} onClose={() => setChoosing(null)} title="开始考试挑战？">
        {choosing && (
          <div>
            <p className="font-semibold text-ink/70">
              《{choosing.title}》共 {choosing.questions.length} 题，限时 <b className="text-coral">{choosing.durationMin} 分钟</b>，倒计时结束将自动交卷。客观题自动判分，成绩计入历史与排行榜。
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setChoosing(null)}>
                再准备一下
              </Button>
              <Button variant="dark" onClick={() => navigate(`/student/exam/${choosing.id}`)}>
                开始答题
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
