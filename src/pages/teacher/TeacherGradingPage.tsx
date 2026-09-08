import { useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import type { WritingSubmission } from '../../types'
import { Card, SectionTitle, Chip, Button, Modal, EmptyState, ProgressBar } from '../../components/ui'
import { PenTool } from 'lucide-react'

export function TeacherGradingPage() {
  const version = useRepoVersion()
  const [onlyPending, setOnlyPending] = useState(true)
  const [grading, setGrading] = useState<WritingSubmission | null>(null)
  const { data: submissions } = useAsync(() => repo.getWritingSubmissions(), [version])

  const list = useMemo(() => {
    const arr = [...(submissions ?? [])].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    return onlyPending ? arr.filter((s) => !s.graded) : arr
  }, [submissions, onlyPending])

  const gradedCount = (submissions ?? []).filter((s) => s.graded).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionTitle icon="🖊️" title="作文批改" sub="查看学生提交的写作并给出分数与评语" />
        <div className="flex gap-2.5">
          <Chip bg={onlyPending ? 'ink text-white' : 'paper'}>待批改 {(submissions ?? []).length - gradedCount} 篇</Chip>
          <button onClick={() => setOnlyPending(!onlyPending)} className="btn btn-secondary btn-sm">
            {onlyPending ? '显示全部提交' : '只看待批改'}
          </button>
        </div>
      </div>

      <Card className="p-4 bg-paper">
        <div className="flex items-center gap-4">
          <PenTool className="w-5 h-5 text-coral" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>批改进度</span>
              <span>{gradedCount}/{submissions?.length ?? 0} 篇已完成</span>
            </div>
            <ProgressBar value={((submissions ?? []).length ? (gradedCount / (submissions ?? []).length) * 100 : 0)} color="brand" height="h-3" />
          </div>
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState icon="🎉" text="全部批改完成！没有待处理的作文提交。" />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {list.map((s) => (
            <Card key={s.id} hover className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-lg">{s.studentName}</span>
                {s.graded ? <Chip bg="brand">已批改 · {s.score} 分</Chip> : <Chip bg="coral text-white">待批改</Chip>}
              </div>
              <div className="text-xs font-bold text-ink/50">
                {s.taskTitle} · 提交于 {s.submittedAt.slice(0, 16).replace('T', ' ')} · {s.content.split(/\s+/).length} 词
              </div>
              <div className="rounded-2xl border-2 border-ink/15 bg-paper p-3 max-h-28 overflow-y-auto">
                <p className="text-sm font-semibold whitespace-pre-line">{s.content}</p>
              </div>
              {s.graded && <p className="text-xs font-bold text-ink/60">评语：{s.comment}</p>}
              <Button
                variant={s.graded ? 'secondary' : 'primary'}
                onClick={() => setGrading(s)}
                className="w-full"
              >
                {s.graded ? '重新批改' : '开始批改'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <GradeModal
        submission={grading}
        onClose={() => setGrading(null)}
        onSaved={() => {
          setGrading(null)
        }}
      />
    </div>
  )
}

function GradeModal({ submission, onClose, onSaved }: { submission: WritingSubmission | null; onClose: () => void; onSaved: () => void }) {
  return (
    <Modal open={submission !== null} onClose={onClose} title={`批改：${submission?.studentName ?? ''}`} width="max-w-2xl">
      {submission && (
        <GradeForm key={submission.id} submission={submission} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  )
}

function GradeForm({ submission, onClose, onSaved }: { submission: WritingSubmission; onClose: () => void; onSaved: () => void }) {
  const [score, setScore] = useState<number>(80)
  const [comment, setComment] = useState('')
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-ink/15 bg-paper p-4 max-h-52 overflow-y-auto">
        <div className="text-xs font-black text-ink/40 mb-2">学生原文（{submission.content.split(/\s+/).length} 词）</div>
        <p className="text-sm font-semibold whitespace-pre-line">{submission.content}</p>
      </div>
      <div>
        <label className="block text-sm font-black mb-1.5">
          分数：<span className="text-blue text-lg">{score}</span> / 100
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-black"
        />
        <div className="flex justify-between text-[10px] font-bold text-ink/40 mt-0.5">
          <span>0 需重写</span>
          <span>60 及格</span>
          <span>85 优秀</span>
          <span>100</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-black mb-1.5">评语 *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="field min-h-[90px]"
          placeholder="肯定优点 + 指出问题 + 鼓励建议…"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {['句子通顺，注意三单形式！', '结构清晰，多用一些连接词会更好。', '书写认真，注意名词复数！', '进步很大，继续保持！'].map((c) => (
            <button key={c} onClick={() => setComment(c)} className="chip bg-ice text-xs hover:-translate-y-0.5 transition-transform">
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button
          variant="primary"
          onClick={async () => {
            if (!comment.trim()) {
              window.alert('请填写评语')
              return
            }
            await repo.gradeWriting(submission.id, score, comment.trim())
            onSaved()
          }}
        >
          提交批改
        </Button>
      </div>
    </div>
  )
}
