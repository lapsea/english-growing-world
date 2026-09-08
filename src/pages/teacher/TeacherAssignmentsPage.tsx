import { useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import type { NewAssignmentData } from '../../types'
import { Card, SectionTitle, Chip, Button, Modal, ProgressBar } from '../../components/ui'
import { Plus } from 'lucide-react'

export function TeacherAssignmentsPage() {
  const version = useRepoVersion()
  const [showCreate, setShowCreate] = useState(false)
  const { data: teacher } = useAsync(() => repo.getCurrentUser(), [])
  const { data: assignments } = useAsync(() => repo.getAssignments(teacher?.id ?? 'teacher-001'), [teacher?.id, version])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionTitle icon="📋" title="作业布置" sub="为学生布置练习或写作任务" />
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1" /> 布置新作业
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {(assignments ?? []).map((a, i) => (
          <AssignmentCard key={a.id} assignmentId={a.id} index={i} />
        ))}
        {(assignments ?? []).length === 0 && (
          <Card className="p-8 text-center font-bold text-ink/40 md:col-span-2">还没有布置作业，点击右上角按钮开始。</Card>
        )}
      </div>

      <CreateAssignmentModal open={showCreate} onClose={() => setShowCreate(false)} teacherId={teacher?.id ?? 'teacher-001'} />
    </div>
  )
}

function AssignmentCard({ assignmentId, index }: { assignmentId: string; index: number }) {
  const version = useRepoVersion()
  const { data: teacher } = useAsync(() => repo.getCurrentUser(), [])
  const { data: assignments } = useAsync(() => repo.getAssignments(teacher?.id ?? 'teacher-001'), [teacher?.id, version])
  const { data: stats } = useAsync(() => repo.getAssignmentStats(assignmentId), [version])
  const a = assignments?.find((x) => x.id === assignmentId)
  if (!a) return null
  const pct = stats ? Math.round((stats.done / Math.max(1, stats.total)) * 100) : 0

  return (
    <Card hover className={`p-5 space-y-3 reveal d${(index % 6) + 1}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-lg">{a.title}</h3>
          <p className="text-xs font-bold text-ink/50 mt-0.5">{a.description}</p>
        </div>
        <Chip bg={a.type === 'writing' ? 'lav text-white' : a.type === 'listening' ? 'ice' : 'brand'}>
          {a.type === 'practice' ? '单元练习' : a.type === 'writing' ? '写作任务' : '听力任务'}
        </Chip>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Chip bg="paper">{a.unitId.toUpperCase()}</Chip>
        <Chip bg="paper">{a.questionIds.length > 0 ? `${a.questionIds.length} 道题` : '写作提交'}</Chip>
        <Chip bg="paper">截止 {a.dueDate}</Chip>
        <Chip bg="paper">布置于 {a.createdAt?.slice(0, 10)}</Chip>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span>班级完成进度</span>
          <span>{stats ? `${stats.done}/${stats.total} 人` : ''}（{pct}%）</span>
        </div>
        <ProgressBar value={pct} color={pct >= 80 ? 'brand' : pct >= 40 ? 'blue' : 'coral'} height="h-3" />
      </div>
    </Card>
  )
}

function CreateAssignmentModal({ open, onClose, teacherId }: { open: boolean; onClose: () => void; teacherId: string }) {
  const version = useRepoVersion()
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const { data: questions } = useAsync(() => repo.getQuestions(), [])
  const { data: writingTasks } = useAsync(() => repo.getWritingTasks(), [])

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'practice' | 'writing' | 'listening'>('practice')
  const [unitId, setUnitId] = useState('u1')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('2026-09-20')
  const [picked, setPicked] = useState<string[]>([])

  const unitQuestions = useMemo(() => (questions ?? []).filter((q) => q.unitId === unitId), [questions, unitId])

  const toggle = (qid: string) => {
    setPicked((p) => (p.includes(qid) ? p.filter((x) => x !== qid) : [...p, qid]))
  }

  const submit = async () => {
    if (!title.trim()) {
      window.alert('请填写作业标题')
      return
    }
    if (type === 'practice' && picked.length === 0) {
      window.alert('请至少选择一道题目')
      return
    }
    const data: NewAssignmentData = {
      teacherId,
      classId: 'class-701',
      title: title.trim(),
      type,
      unitId,
      description: description.trim() || '按时完成，加油！',
      questionIds: type === 'practice' ? picked : [],
      writingTaskId: type === 'writing' ? writingTasks?.[0]?.id : undefined,
      dueDate,
    }
    await repo.createAssignment(data)
    void version
    onClose()
    setTitle('')
    setDescription('')
    setPicked([])
  }

  return (
    <Modal open={open} onClose={onClose} title="布置新作业" width="max-w-2xl">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1.5">作业标题 *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="field" placeholder="如：Unit 1 词汇小练" />
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">作业类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="field">
              <option value="practice">单元练习</option>
              <option value="writing">写作任务</option>
              <option value="listening">听力任务</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1.5">所属单元</label>
            <select value={unitId} onChange={(e) => { setUnitId(e.target.value); setPicked([]) }} className="field">
              {(units ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.kind === 'starter' ? 'Starter' : 'Unit'} {u.order} · {u.titleZh}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">截止日期</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">作业说明</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="field" placeholder="给学生的提示…" />
        </div>
        {type === 'practice' && (
          <div>
            <label className="block text-sm font-black mb-1.5">
              选择题目（已选 {picked.length} 道）<span className="text-coral">*</span>
            </label>
            <div className="rounded-2xl border-2 border-ink/20 bg-paper max-h-48 overflow-y-auto p-2 space-y-1">
              {unitQuestions.length === 0 && <p className="text-xs font-bold text-ink/40 p-2">该单元暂无题库题目，可先去题库管理新增。</p>}
              {unitQuestions.map((q) => (
                <label key={q.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={picked.includes(q.id)}
                    onChange={() => toggle(q.id)}
                    className="mt-1 accent-black w-4 h-4"
                  />
                  <span className="text-xs font-bold">
                    <span className="chip bg-lav text-white text-[10px] mr-1.5">{q.module === 'vocabulary' ? '词汇' : q.module === 'grammar' ? '语法' : q.module === 'listening' ? '听力' : '阅读'}</span>
                    {q.stem.slice(0, 60)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        {type === 'writing' && (
          <p className="text-xs font-bold text-ink/50 bg-paper rounded-xl p-3 border border-ink/15">
            写作作业将关联「{writingTasks?.[0]?.title ?? '写作任务'}」，学生在写作工坊提交后即可在批改中心看到。
          </p>
        )}
        <div className="flex gap-3 justify-end sticky bottom-0">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={submit}>确认布置</Button>
        </div>
      </div>
    </Modal>
  )
}
