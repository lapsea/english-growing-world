import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Save, Send, ListChecks, Lightbulb, Quote, BookCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, Button, SectionTitle, ProgressBar } from '../../components/ui'
import type { WritingSubmission, WritingTask } from '../../types'

export function WritingDetailPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { data: task } = useAsync<WritingTask | undefined>(() => repo.getWritingTask(taskId!), [taskId])

  const [outline, setOutline] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [savedTip, setSavedTip] = useState('')
  const [submission, setSubmission] = useState<WritingSubmission | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSample, setShowSample] = useState(false)

  useEffect(() => {
    if (!task) return
    repo.getWritingDraft('stu-001', task.id).then((d) => {
      if (d) {
        setOutline(d.outline.length ? d.outline : task.structure.map(() => ''))
        setContent(d.content)
      } else {
        setOutline(task.structure.map(() => ''))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  if (!task) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const reqMet = wordCount >= 50

  const flash = (msg: string) => {
    setSavedTip(msg)
    setTimeout(() => setSavedTip(''), 1600)
  }

  const saveDraft = async () => {
    await repo.saveWritingDraft('stu-001', task.id, { outline, content })
    flash('✓ 草稿已保存，下次进入自动恢复')
  }

  const submit = async () => {
    setSubmitting(true)
    await repo.saveWritingDraft('stu-001', task.id, { outline, content })
    const sub = await repo.submitWriting('stu-001', task.id, content)
    setSubmission(sub)
    setSubmitting(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* —— 顶栏 —— */}
      <Card className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/student/writing')}>
            返回
          </Button>
          <div>
            <h2 className="font-extrabold text-lg leading-tight">✍️ {task.title}</h2>
            <div className="text-xs font-bold text-ink/45">写作工坊 · 提纲与草稿自动保存到本地</div>
          </div>
        </div>
        {savedTip && <span className="chip bg-brand">{savedTip}</span>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* —— 左：任务说明 —— */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 reveal d1">
            <SectionTitle title="题目与要求" />
            <p className="font-semibold text-sm leading-relaxed text-ink/75">{task.prompt}</p>
            <div className="mt-4 space-y-2">
              {task.requirements.map((r, i) => (
                <div key={i} className="flex gap-2.5 items-start rounded-xl bg-paper border-2 border-ink/15 px-3.5 py-2">
                  <ListChecks size={15} className="mt-0.5 shrink-0 text-blue" strokeWidth={2.8} />
                  <span className="text-sm font-bold">{r}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 reveal d2">
            <SectionTitle title="结构拆解" />
            <div className="space-y-3">
              {task.structure.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-lg border-2 border-ink bg-brand flex items-center justify-center font-extrabold text-sm">{i + 1}</span>
                  <div>
                    <div className="font-extrabold text-sm">{s.step}</div>
                    <div className="text-xs font-semibold text-ink/55 mt-0.5 leading-relaxed">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 reveal d3">
            <SectionTitle title="常用句型" />
            <div className="space-y-2">
              {task.patterns.map((p, i) => (
                <div key={i} className="rounded-xl border-[2.5px] border-ink bg-ice/40 px-3.5 py-2">
                  <div className="font-extrabold text-sm flex items-start gap-1.5">
                    <Quote size={12} className="mt-1 shrink-0" /> {p.pattern}
                  </div>
                  <div className="text-xs font-semibold text-ink/55">{p.zh}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-xs font-extrabold text-ink/45 mb-2">重点词汇</div>
              <div className="flex flex-wrap gap-1.5">
                {task.usefulWords.map((w) => (
                  <span key={w.en} className="chip bg-brand !text-[11px]">
                    {w.en} <span className="font-semibold text-ink/50">{w.zh}</span>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* —— 右：写作区 —— */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="p-6 reveal d2">
            <SectionTitle title="① 列写作提纲" sub="按结构拆解填关键词，写作时更有条理" />
            <div className="space-y-2.5">
              {task.structure.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-ink/45 w-24 shrink-0 truncate">{s.step}</span>
                  <input
                    value={outline[i] ?? ''}
                    onChange={(e) => setOutline((o) => o.map((x, xi) => (xi === i ? e.target.value : x)))}
                    placeholder="用几个关键词概括这一段…"
                    className="field !py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 reveal d3">
            <SectionTitle
              title="② 写作草稿"
              right={
                <div className="flex items-center gap-2.5">
                  <span className={`chip ${reqMet ? 'bg-brand' : 'bg-white'}`}>{wordCount} 词</span>
                  <Button size="sm" variant="secondary" onClick={saveDraft}>
                    <Save size={14} /> 保存草稿
                  </Button>
                </div>
              }
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作…（记得句首大写、句末标点）"
              rows={10}
              className="field !rounded-2xl leading-[1.9] resize-y"
            />
            <ProgressBar value={Math.min(100, (wordCount / 60) * 100)} color={reqMet ? 'brand' : 'coral'} height="h-2.5" />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowSample(true)}>
                <BookCheck size={15} /> 看范文
              </Button>
              <Button onClick={submit} disabled={submitting || wordCount < 10}>
                <Send size={15} /> {submitting ? '提交中…' : '提交作文'}
              </Button>
            </div>
            {wordCount < 10 && <p className="text-xs font-bold text-ink/40 mt-2 text-right">至少写 10 个词才能提交哦</p>}
          </Card>

          {submission && (
            <Card className="p-6 bg-brand/20 pop">
              <SectionTitle title="🎯 老师评分与批注" sub="老师批改后会在家长端展示评语" />
              <div className="flex items-center gap-6 flex-wrap">
                <div className="w-24 h-24 rounded-3xl bg-white border-[3px] border-ink shadow-hard flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-extrabold leading-none">{submission.score}</span>
                  <span className="text-[10px] font-extrabold text-ink/45 mt-1">评分</span>
                </div>
                <p className="flex-1 font-semibold text-sm leading-relaxed bg-white rounded-2xl border-[2.5px] border-ink p-4 min-w-[240px]">
                  <Lightbulb size={14} className="inline mr-1 text-blue" />
                  {submission.comment}
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="secondary" size="sm" onClick={() => setSubmission(null)}>
                  修改后重新提交
                </Button>
                <Button size="sm" to="/student/wrong-book">
                  顺便看看错题本
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* —— 范文弹窗 —— */}
      {showSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowSample(false)} />
          <Card className="relative pop p-7 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold mb-1">范文 · {task.sample.score} 分</h3>
            <div className="space-y-3 mt-4">
              {task.sample.text.map((t, i) => (
                <p key={i} className="font-semibold leading-[1.9] bg-paper rounded-xl border-2 border-ink/15 px-4 py-3">
                  {t}
                </p>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border-[2.5px] border-ink bg-brand/30 p-4">
              <div className="text-xs font-extrabold text-ink/45 mb-1">老师点评</div>
              <p className="font-semibold text-sm leading-relaxed">{task.sample.comment}</p>
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="dark" onClick={() => setShowSample(false)}>
                我记住了，继续写
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
