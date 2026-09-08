import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import type { Question, UnitQuiz } from '../../types'
import { QuestionRunner } from '../../components/student/QuestionRunner'
import { Card, Button } from '../../components/ui'

export function UnitQuizPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { data: quiz } = useAsync<UnitQuiz>(() => repo.getUnitQuiz(unitId!), [unitId])
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [result])

  if (!quiz) return <div className="font-bold text-ink/40 py-20 text-center">正在组卷…</div>

  if (result) {
    const pass = result.correct / result.total >= 0.6
    return (
      <div className="max-w-xl mx-auto">
        <Card className="p-10 text-center pop">
          <div className="text-6xl mb-4">{pass ? '🎉' : '💪'}</div>
          <h2 className="text-3xl font-extrabold">测验完成！</h2>
          <p className="font-bold text-ink/60 mt-2">
            答对 {result.correct} / {result.total} 题，正确率 {Math.round((result.correct / result.total) * 100)}%
          </p>
          <p className="text-sm font-semibold text-ink/50 mt-2">错题已自动加入错题本，EXP 已发放。连续两次复习答对即可标记「已掌握」。</p>
          <div className="flex justify-center gap-3 mt-7">
            <Button variant="secondary" onClick={() => navigate(`/student/units/${unitId}`)}>
              返回单元
            </Button>
            <Button onClick={() => navigate('/student/wrong-book')}>去错题本复习</Button>
          </div>
        </Card>
      </div>
    )
  }

  const submit = async (rows: { questionId: string; yourAnswer: string; correct: boolean }[]) => {
    // practice 模式下每题已实时提交过，这里只统计
    const correct = rows.filter((r) => r.correct).length
    setResult({ correct, total: rows.length })
  }

  return <QuestionRunner title={quiz.title} questions={quiz.questions as Question[]} source="unit-test" mode="practice" onFinish={submit} onQuit={() => navigate(-1)} />
}
