import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import type { Question } from '../../types'
import { Button, Card, Chip, EmptyState, SectionTitle } from '../../components/ui'
import { QuestionRunner } from '../../components/student/QuestionRunner'
import { PenLine, ListChecks, CalendarDays } from 'lucide-react'

export default function AssignmentTakePage() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const version = useRepoVersion()
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(null)

  const { data: assignments } = useAsync(() => repo.getAssignments('stu-001'), [version])
  const { data: allQuestions } = useAsync(() => repo.getQuestions(), [])
  const assignment = useMemo(() => assignments?.find((a) => a.id === assignmentId), [assignments, assignmentId])

  const questions = useMemo<Question[]>(() => {
    if (!assignment || !allQuestions) return []
    return assignment.questionIds.map((qid) => allQuestions.find((q) => q.id === qid)).filter((q): q is Question => Boolean(q))
  }, [assignment, allQuestions])

  if (!assignment) {
    return (
      <EmptyState
        icon="📭"
        text="找不到这份作业，可能已被删除或链接不正确。"
        action={<Button variant="primary" onClick={() => navigate('/student')}>返回学习首页</Button>}
      />
    )
  }

  if (assignment.status === 'done') {
    return (
      <Card className="p-10 text-center space-y-4 max-w-xl mx-auto">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-black">这份作业已完成</h2>
        <p className="font-bold text-ink/50">
          提交时间：{assignment.submittedAt?.slice(0, 16).replace('T', ' ')}
          {assignment.score !== undefined && <> · 得分 <b className="text-blue">{assignment.score}</b></>}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate('/student')}>返回首页</Button>
          <Button variant="secondary" onClick={() => setStarted(true)}>再做一遍练习</Button>
        </div>
      </Card>
    )
  }

  if (assignment.type === 'writing') {
    return (
      <div className="space-y-6">
        <Card className="p-8 space-y-4 max-w-2xl mx-auto text-center">
          <div className="text-6xl">✍️</div>
          <h2 className="text-2xl font-black">{assignment.title}</h2>
          <p className="font-bold text-ink/60">{assignment.description}</p>
          <div className="flex justify-center gap-2.5 flex-wrap">
            <Chip bg="brand">写作任务</Chip>
            <Chip bg="paper">
              <CalendarDays className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              截止 {assignment.dueDate}
            </Chip>
            <Chip bg="paper">布置老师：{assignment.teacherName}</Chip>
          </div>
          <p className="text-sm font-bold text-ink/50">请前往写作工坊，找到对应题目完成提纲、草稿并提交。</p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" to={`/student/writing/${assignment.writingTaskId ?? 'wt2'}`}>
              <PenLine className="w-4 h-4 mr-1" /> 去写作工坊
            </Button>
            <Button variant="secondary" onClick={() => navigate('/student')}>稍后再写</Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-8 space-y-4 text-center">
          <div className="text-6xl">📋</div>
          <h2 className="text-2xl font-black">{assignment.title}</h2>
          <p className="font-bold text-ink/60">{assignment.description}</p>
          <div className="flex justify-center gap-2.5 flex-wrap">
            <Chip bg="brand">共 {questions.length} 题</Chip>
            <Chip bg="paper">单元：{assignment.unitId.toUpperCase()}</Chip>
            <Chip bg="paper">截止 {assignment.dueDate}</Chip>
          </div>
          <p className="text-xs font-bold text-ink/40">每答一题即时判分，答错的题会自动进入错题本。完成后请点击"完成作业"。</p>
          <Button variant="primary" size="lg" onClick={() => setStarted(true)} disabled={questions.length === 0}>
            <ListChecks className="w-5 h-5 mr-1.5" /> 开始作答
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon="📋" title={assignment.title} sub={`老师：${assignment.teacherName} · 截止 ${assignment.dueDate}`} />
      {finished ? (
        <Card className="p-10 text-center space-y-4 max-w-xl mx-auto pop">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black">作业已提交完成！</h2>
          <p className="font-bold text-ink/60">
            共 {summary?.total} 题，答对 <b className="text-blue">{summary?.correct}</b> 题 · 得分{' '}
            <b className="text-blue">{Math.round(((summary?.correct ?? 0) / Math.max(1, summary?.total ?? 1)) * 100)}</b>
          </p>
          <p className="text-xs font-bold text-ink/40">答错的题已自动收入错题本，记得去复习。</p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/student')}>返回学习首页</Button>
            <Button variant="secondary" to="/student/wrong-book">去错题本</Button>
          </div>
        </Card>
      ) : (
        <QuestionRunner
          title="作业练习"
          questions={questions}
          source="practice"
          mode="practice"
          onQuit={() => navigate('/student')}
          onFinish={async (rows) => {
            const correct = rows.filter((r) => r.correct).length
            setSummary({ correct, total: rows.length })
            const score = Math.round((correct / Math.max(1, rows.length)) * 100)
            await repo.markAssignmentDone(assignment.id, 'stu-001', score)
            setFinished(true)
          }}
        />
      )}
    </div>
  )
}
