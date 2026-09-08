import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { QuestionRunner } from '../../components/student/QuestionRunner'
import { Card, Button, ProgressBar } from '../../components/ui'
import type { ExamChallenge, ExamRecord, Question, QuestionModule } from '../../types'

const MODULE_NAME: Record<QuestionModule, string> = { vocabulary: '词汇', grammar: '语法', listening: '听力', reading: '阅读' }

export function ExamTakePage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { data: exam } = useAsync<ExamChallenge | undefined>(() => repo.getExam(examId!), [examId])
  const [record, setRecord] = useState<ExamRecord | null>(null)

  if (!exam) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>

  if (record) {
    const pct = (record.score / record.total) * 100
    const grade = pct >= 90 ? '优秀！继续保持 🏆' : pct >= 75 ? '不错哦，稳扎稳打 💪' : pct >= 60 ? '过关！错题要趁热复习 🔥' : '别灰心，错题就是提分点 🌱'
    const wrongRows = record.details.filter((d) => !d.correct)
    const qOf = (id: string) => exam.questions.find((q) => q.id === id)

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-10 text-center pop">
          <div className="text-6xl mb-3">{pct >= 75 ? '🎉' : '📋'}</div>
          <h2 className="text-3xl font-extrabold">交卷成功！</h2>
          <div className="text-6xl font-display font-extrabold mt-4">
            {record.score}
            <span className="text-2xl text-ink/40">/{record.total}</span>
          </div>
          <p className="font-bold text-ink/60 mt-2">{grade}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            {(['vocabulary', 'grammar', 'listening', 'reading'] as QuestionModule[]).map((m) => (
              <div key={m} className="rounded-2xl border-[2.5px] border-ink bg-paper py-3.5">
                <div className="text-xs font-extrabold text-ink/45">{MODULE_NAME[m]}得分</div>
                <div className="text-2xl font-extrabold mt-0.5">{record.moduleScores[m]}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-7">
            <Button variant="secondary" onClick={() => navigate('/student/exam')}>
              返回挑战列表
            </Button>
            <Button onClick={() => navigate('/student/wrong-book')}>去错题本复习（{wrongRows.length} 题）</Button>
          </div>
        </Card>

        {wrongRows.length > 0 && (
          <Card className="p-7">
            <h3 className="text-xl font-extrabold mb-4">错题解析</h3>
            <div className="space-y-4">
              {wrongRows.map((d) => {
                const q = qOf(d.questionId)
                if (!q) return null
                return (
                  <div key={d.questionId} className="rounded-2xl border-[2.5px] border-ink bg-coral/10 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="chip !text-[10px] bg-coral text-white">{MODULE_NAME[q.module]}</span>
                      <span className="chip !text-[10px] bg-white">{q.type === 'fill' ? '填空' : '选择'}</span>
                    </div>
                    <p className="font-bold text-sm whitespace-pre-line">{q.stem}</p>
                    <p className="text-sm font-semibold mt-2">
                      <span className="text-coral">我的答案：{d.yourAnswer || '（未作答）'}</span>
                      <span className="ml-4 text-blue">正确答案：{q.answer}</span>
                    </p>
                    <p className="text-xs font-semibold text-ink/60 mt-1.5 bg-white rounded-lg border-2 border-ink/10 px-3 py-2">解析：{q.explain}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    )
  }

  const submit = async (rows: { questionId: string; yourAnswer: string; correct: boolean }[]) => {
    const rec = await repo.submitExam('stu-001', exam, rows)
    setRecord(rec)
    window.scrollTo(0, 0)
  }

  return (
    <div>
      <QuestionRunner title={exam.title} questions={exam.questions as Question[]} source="exam" mode="exam" durationMin={exam.durationMin} onFinish={submit} onQuit={() => navigate('/student/exam')} />
      <div className="max-w-4xl mx-auto mt-3">
        <ProgressBar value={0} color="coral" height="h-2" />
      </div>
    </div>
  )
}
