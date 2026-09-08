import { useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import type { Question, QuestionModule, QuestionType } from '../../types'
import { Card, SectionTitle, Chip, Button, Modal, EmptyState } from '../../components/ui'
import { Trash2, Plus, Search } from 'lucide-react'

const MODULE_ZH: Record<QuestionModule, string> = { vocabulary: '词汇', grammar: '语法', listening: '听力', reading: '阅读' }
const TYPE_ZH: Record<QuestionType, string> = { choice: '选择题', fill: '填空题', judge: '判断题' }

export function TeacherBankPage() {
  const version = useRepoVersion()
  const [unitId, setUnitId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const { data: questions } = useAsync(
    () => repo.getQuestions({ unitId: unitId || undefined, keyword: keyword.trim() || undefined }),
    [unitId, keyword, version]
  )

  const unitTitle = useMemo(() => {
    const m = new Map<string, string>()
    ;(units ?? []).forEach((u) => m.set(u.id, `${u.kind === 'starter' ? 'Starter' : 'Unit'} ${u.order}`))
    return m
  }, [units])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionTitle icon="🗃️" title="题库管理" sub="练习题、单元测验题统一管理" />
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> 新增题目
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="field max-w-[200px]">
          <option value="">全部单元</option>
          {(units ?? []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.kind === 'starter' ? 'Starter' : 'Unit'} {u.order} · {u.titleZh}
            </option>
          ))}
        </select>
        <div className="relative max-w-xs flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索题干关键词…" className="field pl-9" />
        </div>
        <Chip bg="brand">{questions?.length ?? 0} 道题</Chip>
      </div>

      {(questions ?? []).length === 0 ? (
        <EmptyState icon="🗃️" text="没有匹配的题目，换个筛选条件试试。" />
      ) : (
        <div className="space-y-3">
          {(questions ?? []).map((q) => (
            <Card key={q.id} className="p-4 flex items-start gap-4">
              <div className="flex flex-col gap-1.5 shrink-0">
                <Chip bg="lav text-white text-xs">{MODULE_ZH[q.module]}</Chip>
                <Chip bg="paper text-xs">{TYPE_ZH[q.type]}</Chip>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm whitespace-pre-line">{q.stem}</p>
                {q.audioLine && <p className="text-xs font-bold text-blue mt-1">🔊 听力材料：{q.audioLine}</p>}
                {q.options && <p className="text-xs font-bold text-ink/50 mt-1">选项：{q.options.join(' | ')}</p>}
                <p className="text-xs font-bold mt-1.5">
                  <span className="text-blue">答案：{q.answer}</span>
                  <span className="text-ink/40 ml-3">解析：{q.explain}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Chip bg="paper text-xs">{unitTitle.get(q.unitId) ?? q.unitId}</Chip>
                <button
                  onClick={async () => {
                    if (window.confirm(`确定删除题目「${q.stem.slice(0, 20)}…」吗？`)) await repo.deleteQuestion(q.id)
                  }}
                  className="text-coral hover:scale-110 transition-transform"
                  title="删除题目"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddQuestionModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

function AddQuestionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const version = useRepoVersion()
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const [module, setModule] = useState<QuestionModule>('vocabulary')
  const [type, setType] = useState<QuestionType>('choice')
  const [unitId, setUnitId] = useState('u1')
  const [stem, setStem] = useState('')
  const [options, setOptions] = useState('A. \nB. \nC. \nD. ')
  const [answer, setAnswer] = useState('')
  const [explain, setExplain] = useState('')
  const [audioLine, setAudioLine] = useState('')

  const submit = async () => {
    if (!stem.trim() || !answer.trim()) {
      window.alert('题干和答案不能为空')
      return
    }
    const q: Question = {
      id: `q-t-${Date.now()}`,
      type,
      module,
      unitId,
      stem: stem.trim(),
      options: type === 'choice' ? options.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
      answer: answer.trim(),
      explain: explain.trim() || '（老师未填写解析）',
      audioLine: audioLine.trim() || undefined,
    }
    await repo.addQuestion(q)
    void version
    onClose()
    setStem('')
    setAnswer('')
    setExplain('')
    setAudioLine('')
  }

  return (
    <Modal open={open} onClose={onClose} title="新增题目" width="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1.5">模块</label>
            <select value={module} onChange={(e) => setModule(e.target.value as QuestionModule)} className="field">
              {(Object.keys(MODULE_ZH) as QuestionModule[]).map((m) => (
                <option key={m} value={m}>{MODULE_ZH[m]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">题型</label>
            <select value={type} onChange={(e) => setType(e.target.value as QuestionType)} className="field">
              {(Object.keys(TYPE_ZH) as QuestionType[]).map((t) => (
                <option key={t} value={t}>{TYPE_ZH[t]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">所属单元</label>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="field">
            {(units ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.kind === 'starter' ? 'Starter' : 'Unit'} {u.order} · {u.titleZh}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">题干 *</label>
          <textarea value={stem} onChange={(e) => setStem(e.target.value)} className="field min-h-[70px]" placeholder="输入题目内容…" />
        </div>
        {type === 'choice' && (
          <div>
            <label className="block text-sm font-black mb-1.5">选项（每行一个）</label>
            <textarea value={options} onChange={(e) => setOptions(e.target.value)} className="field min-h-[90px]" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1.5">正确答案 *</label>
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="field" placeholder="选择题填完整选项文本" />
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">听力材料（可选）</label>
            <input value={audioLine} onChange={(e) => setAudioLine(e.target.value)} className="field" placeholder="听力原句，可播放" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">解析</label>
          <input value={explain} onChange={(e) => setExplain(e.target.value)} className="field" />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={submit}>保存题目</Button>
        </div>
      </div>
    </Modal>
  )
}
