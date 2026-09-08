import { useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { MODULE_LABELS } from '../../types'
import type { NewExamData, Question } from '../../types'
import { Card, SectionTitle, Chip, Button, Modal, ProgressBar } from '../../components/ui'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

const MODULE_TAG: Record<Question['module'], string> = {
  vocabulary: '词汇',
  grammar: '语法',
  listening: '听力',
  reading: '阅读',
}

export function TeacherExamsPage() {
  const version = useRepoVersion()
  const [showCreate, setShowCreate] = useState(false)
  const { data: exams } = useAsync(() => repo.getExams(), [version])
  const { data: records } = useAsync(() => repo.getExamRecordsForClass(), [version])
  const { data: students } = useAsync(() => repo.getStudents(), [])

  const moduleAvg = useMemo(() => {
    if (!records || records.length === 0) return null
    const keys = ['vocabulary', 'grammar', 'listening', 'reading'] as const
    const out = {} as Record<(typeof keys)[number], number>
    keys.forEach((k) => {
      out[k] = records.reduce((s, r) => s + (r.moduleScores[k] ?? 0), 0) / records.length
    })
    return out
  }, [records])

  const togglePublish = async (examId: string, current: boolean) => {
    await repo.setExamPublished(examId, !current)
  }

  const removeExam = async (examId: string, title: string) => {
    if (!window.confirm(`确定删除考试「${title}」吗？学生已有的考试成绩记录也会一并删除。`)) return
    await repo.deleteExam(examId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionTitle icon="🏆" title="考试挑战管理" sub="新增/删除考试，发布/隐藏，查看全班成绩与模块得分" />
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1" /> 新增考试
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {(exams ?? []).map((e, i) => {
          const examRecords = (records ?? []).filter((r) => r.examId === e.id)
          const avg = examRecords.length ? Math.round(examRecords.reduce((s, r) => s + r.score, 0) / examRecords.length) : 0
          const best = examRecords.reduce((m, r) => Math.max(m, r.score), 0)
          const participated = new Set(examRecords.map((r) => r.studentId)).size
          return (
            <Card key={e.id} hover className={`p-6 space-y-4 reveal d${Math.min(8, i + 1)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-xl">{e.title}</h3>
                  <p className="text-xs font-bold text-ink/50 mt-1">{e.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublish(e.id, e.published)}
                    className={`btn btn-sm ${e.published ? 'btn-dark' : 'btn-primary'}`}
                    title={e.published ? '点击隐藏' : '点击发布'}
                  >
                    {e.published ? <><Eye className="w-3.5 h-3.5 mr-1" /> 已发布</> : <><EyeOff className="w-3.5 h-3.5 mr-1" /> 未发布</>}
                  </button>
                  <button
                    onClick={() => removeExam(e.id, e.title)}
                    className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-white flex items-center justify-center hover:bg-coral hover:text-white transition-colors"
                    title="删除考试"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Chip bg="brand">{e.unitIds.length} 个单元范围</Chip>
                <Chip bg="paper">{e.durationMin} 分钟</Chip>
                <Chip bg="paper">满分 {e.totalScore}</Chip>
                <Chip bg="paper">{e.questions.length} 道题</Chip>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border-2 border-ink bg-ice p-3 text-center">
                  <div className="text-xl font-black">{participated}/{students?.length ?? 0}</div>
                  <div className="text-[10px] font-bold">参与人数</div>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-brand p-3 text-center">
                  <div className="text-xl font-black">{avg}</div>
                  <div className="text-[10px] font-bold">班级均分</div>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-lav/60 p-3 text-center">
                  <div className="text-xl font-black">{best}</div>
                  <div className="text-[10px] font-bold">最高分</div>
                </div>
              </div>
              {examRecords.length > 0 && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  <div className="text-xs font-black text-ink/40">成绩明细</div>
                  {examRecords
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs font-bold border-b border-ink/10 py-1.5">
                        <span>{students?.find((s) => s.id === r.studentId)?.name ?? r.studentId}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-ink/40">{r.date.slice(0, 10)}</span>
                          <span className="text-blue">{r.score}/{r.total}</span>
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {moduleAvg && (
        <section>
          <SectionTitle icon="📊" title="全班考试模块均分" sub="四次考试成绩的模块维度平均" />
          <Card className="p-5 grid md:grid-cols-4 gap-5">
            {(Object.keys(MODULE_LABELS) as (keyof typeof MODULE_LABELS)[])
              .filter((k) => k !== 'writing')
              .map((k) => (
                <div key={k} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{MODULE_LABELS[k]}</span>
                    <span>{moduleAvg[k as keyof typeof moduleAvg]?.toFixed(1) ?? '—'} 分</span>
                  </div>
                  <ProgressBar value={((moduleAvg[k as keyof typeof moduleAvg] ?? 0) / 25) * 100} color={k === 'listening' ? 'blue' : 'brand'} height="h-3" />
                </div>
              ))}
          </Card>
        </section>
      )}

      <CreateExamModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

function CreateExamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const { data: questions } = useAsync(() => repo.getQuestions(), [])

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [durationMin, setDurationMin] = useState(40)
  const [filterUnit, setFilterUnit] = useState('all')
  const [picked, setPicked] = useState<Question[]>([])

  const filtered = useMemo(() => (questions ?? []).filter((q) => filterUnit === 'all' || q.unitId === filterUnit), [questions, filterUnit])
  const coveredUnits = useMemo(() => [...new Set(picked.map((q) => q.unitId))], [picked])

  const unitLabel = (id: string) => {
    const u = units?.find((x) => x.id === id)
    if (!u) return id
    return `${u.kind === 'starter' ? 'Starter' : 'Unit'} ${u.order}`
  }

  const toggle = (q: Question) => {
    setPicked((p) => (p.some((x) => x.id === q.id) ? p.filter((x) => x.id !== q.id) : [...p, q]))
  }

  const reset = () => {
    setTitle('')
    setSubtitle('')
    setDurationMin(40)
    setFilterUnit('all')
    setPicked([])
  }

  const submit = async () => {
    if (!title.trim()) {
      window.alert('请填写考试标题')
      return
    }
    if (picked.length === 0) {
      window.alert('请至少选择一道题目')
      return
    }
    const data: NewExamData = {
      title: title.trim(),
      subtitle: subtitle.trim() || '挑战自己，冲冲冲！',
      unitIds: coveredUnits,
      durationMin,
      questions: picked,
    }
    await repo.createExam(data)
    onClose()
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} title="新增考试" width="max-w-2xl">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1.5">考试标题 *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="field" placeholder="如：Unit 4–5 阶段挑战" />
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">考试时长（分钟）</label>
            <input
              type="number"
              min={5}
              max={120}
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(5, Math.min(120, Number(e.target.value) || 40)))}
              className="field"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">副标题</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="field" placeholder="给学生的鼓励语，如：期中加油站！" />
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">
            选择题目（已选 {picked.length} 道）<span className="text-coral">*</span>
          </label>
          <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="field mb-2">
            <option value="all">全部单元</option>
            {(units ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.kind === 'starter' ? 'Starter' : 'Unit'} {u.order} · {u.titleZh}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border-2 border-ink/20 bg-paper max-h-56 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 && <p className="text-xs font-bold text-ink/40 p-2">该单元暂无题库题目，可先去题库管理新增。</p>}
            {filtered.map((q) => (
              <label key={q.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer">
                <input type="checkbox" checked={picked.some((x) => x.id === q.id)} onChange={() => toggle(q)} className="mt-1 accent-black w-4 h-4" />
                <span className="text-xs font-bold">
                  <span className="chip bg-lav text-white text-[10px] mr-1.5">{MODULE_TAG[q.module]}</span>
                  <span className="chip bg-paper text-[10px] mr-1.5">{unitLabel(q.unitId)}</span>
                  {q.stem.slice(0, 60)}
                </span>
              </label>
            ))}
          </div>
          {picked.length > 0 && (
            <p className="text-xs font-bold text-ink/50 mt-2">
              考试范围将根据所选题目自动统计：{coveredUnits.map(unitLabel).join('、')}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-end sticky bottom-0">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={submit}>创建考试</Button>
        </div>
      </div>
    </Modal>
  )
}
