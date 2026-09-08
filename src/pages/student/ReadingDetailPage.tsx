import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Star, Volume2, ChevronRight, Check, RotateCcw } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { speech } from '../../services/audio'
import { Card, Button, ProgressBar, SectionTitle } from '../../components/ui'
import type { ReadingArticle, ReadingExercise, ReadingRecord } from '../../types'

export function ReadingDetailPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const { data: article } = useAsync<ReadingArticle | undefined>(() => repo.getReadingArticle(articleId!), [articleId])
  const { data: record } = useAsync<ReadingRecord | undefined>(() => repo.getReadingRecords('stu-001').then((m) => m[articleId!]), [articleId])

  const [paraIdx, setParaIdx] = useState(0)
  const [showZh, setShowZh] = useState<Record<number, boolean>>({})
  const [favWord, setFavWord] = useState<string[]>([])
  const [phase, setPhase] = useState<'read' | 'exercise'>('read')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [graded, setGraded] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!record) return
    setParaIdx(record.lastParagraph ?? 0)
    setFavWord((f) => (f.length ? f : []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.articleId])

  const glossaryMap = useMemo(() => {
    const m = new Map<string, string>()
    article?.glossary.forEach((g) => m.set(g.word.toLowerCase().replace(/[^a-z']/g, ''), g.zh))
    return m
  }, [article])

  if (!article) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>

  const saveProgress = async (patch: Partial<ReadingRecord>) => {
    await repo.saveReadingProgress('stu-001', article.id, patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  const toggleFav = async () => {
    await saveProgress({ favorite: !(record?.favorite ?? false) })
  }

  const finishReading = async () => {
    await saveProgress({ finished: true, lastParagraph: article.paragraphs.length - 1 })
    await repo.addStudyMinutes('stu-001', 5)
    setPhase('exercise')
  }

  const grade = async () => {
    // 阅读练习逐题记录（错题自动进错题本）
    for (let i = 0; i < article.exercises.length; i++) {
      const ex = article.exercises[i]
      const picked = answers[i]
      const correct = picked === ex.answer
      const q: import('../../types').Question = {
        id: `read-${article.id}-${i}`,
        type: 'choice',
        module: 'reading',
        unitId: article.unitId,
        stem: `【阅读 · ${article.titleZh}】${ex.q}`,
        options: ex.options,
        answer: ex.options[ex.answer],
        explain: ex.explain,
      }
      await repo.submitAnswer({ studentId: 'stu-001', question: q, yourAnswer: picked == null ? '未作答' : ex.options[picked], source: 'practice' })
    }
    setGraded(true)
    const score = article.exercises.filter((ex, i) => answers[i] === ex.answer).length
    await repo.saveReadingProgress('stu-001', article.id, { bestScore: Math.round((score / article.exercises.length) * 100) })
    await repo.adjustModuleMastery('stu-001', 'reading', score >= 3 ? 2.5 : 1)
  }

  const renderTokens = (text: string) =>
    text.split(/(\s+)/).map((tok, i) => {
      const clean = tok.toLowerCase().replace(/[^a-z']/g, '')
      const zh = glossaryMap.get(clean)
      if (!zh || !/[a-zA-Z]/.test(tok)) return <span key={i}>{tok}</span>
      const faved = favWord.includes(tok)
      return (
        <span
          key={i}
          title={`${tok} · ${zh}（点击收藏生词）`}
          onClick={() => !faved && setFavWord((f) => [...f, tok])}
          className={`underline decoration-wavy decoration-2 underline-offset-4 cursor-pointer ${faved ? 'bg-coral/25 decoration-coral' : 'decoration-blue hover:bg-brand/40'}`}
        >
          {tok}
        </span>
      )
    })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* —— 顶栏 —— */}
      <Card className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/student/reading')}>
            返回
          </Button>
          <div>
            <h2 className="font-extrabold text-lg leading-tight">{article.titleZh}</h2>
            <div className="text-xs font-bold text-ink/45">
              {article.title} · {article.genre} · {article.wordCount} 词
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {saved && <span className="chip bg-brand">✓ 进度已保存</span>}
          <Button size="sm" variant={record?.favorite ? 'coral' : 'secondary'} onClick={toggleFav}>
            <Star size={14} fill={record?.favorite ? 'currentColor' : 'none'} /> {record?.favorite ? '已收藏' : '收藏文章'}
          </Button>
        </div>
      </Card>

      {phase === 'read' ? (
        <>
          {/* —— 读前导读 —— */}
          <Card className="p-6 bg-ice/40 reveal">
            <div className="chip bg-white mb-2">📖 读前导读</div>
            <p className="font-semibold leading-relaxed">{article.guide}</p>
            <div className="mt-3 text-xs font-bold text-ink/50">生词表：{article.glossary.map((g) => `${g.word}（${g.zh}）`).join('、')}</div>
          </Card>

          <ProgressBar value={((paraIdx + 1) / article.paragraphs.length) * 100} color="lav" height="h-3" />

          {/* —— 正文段落 —— */}
          {article.paragraphs.map((p, i) => (
            <Card key={i} className={`p-6 reveal d${Math.min(8, i + 1)} ${i === paraIdx ? 'ring-4 ring-brand/70' : 'opacity-90'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="chip !text-[10px] bg-lav mb-2">第 {i + 1} 段</span>
                  <p className="font-semibold text-[17px] leading-[1.9]">{renderTokens(p.en)}</p>
                  {showZh[i] && <p className="mt-3 pt-3 border-t-2 border-dashed border-ink/20 font-semibold text-ink/60 leading-relaxed text-sm">{p.zh}</p>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => speech.speak(p.en, { rate: 0.95 })} className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-white flex items-center justify-center hover:bg-brand" title="朗读本段">
                    <Volume2 size={15} />
                  </button>
                  <button onClick={() => setShowZh((m) => ({ ...m, [i]: !m[i] }))} className={`w-9 h-9 rounded-xl border-[2.5px] border-ink text-xs font-extrabold flex items-center justify-center hover:-translate-y-0.5 ${showZh[i] ? 'bg-brand' : 'bg-white'}`} title="段落理解（中文）">
                    译
                  </button>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => { setParaIdx(Math.max(0, paraIdx - 1)); saveProgress({ lastParagraph: Math.max(0, paraIdx - 1) }) }} disabled={paraIdx === 0}>
              上一段
            </Button>
            <span className="text-xs font-extrabold text-ink/40">点击波浪线生词可收藏 · 共收藏 {favWord.length} 词</span>
            {paraIdx + 1 < article.paragraphs.length ? (
              <Button onClick={() => { const n = paraIdx + 1; setParaIdx(n); saveProgress({ lastParagraph: n }) }}>
                下一段 <ChevronRight size={16} strokeWidth={3} />
              </Button>
            ) : (
              <Button onClick={finishReading}>
                读完了，去做练习 <ChevronRight size={16} strokeWidth={3} />
              </Button>
            )}
          </div>
        </>
      ) : (
        /* —— 读后练习 —— */
        <div className="space-y-6">
          <Card className="p-7">
            <SectionTitle title="阅读后练习" sub="4 道理解题：细节 · 推理 · 词义猜测 · 主旨" right={graded ? <Button variant="secondary" size="sm" onClick={() => { setGraded(false); setAnswers({}) }}><RotateCcw size={14} /> 重做</Button> : undefined} />
            <div className="space-y-6">
              {article.exercises.map((ex: ReadingExercise, i) => (
                <div key={i}>
                  <p className="font-extrabold mb-3">
                    {i + 1}. {ex.q}
                  </p>
                  <div className="grid md:grid-cols-2 gap-2.5">
                    {ex.options.map((opt, oi) => {
                      const picked = answers[i] === oi
                      const right = graded && oi === ex.answer
                      const wrong = graded && picked && oi !== ex.answer
                      return (
                        <button
                          key={oi}
                          onClick={() => !graded && setAnswers((a) => ({ ...a, [i]: oi }))}
                          className={`text-left px-4 py-2.5 rounded-xl border-[2.5px] border-ink font-bold text-sm transition ${right ? 'bg-brand' : wrong ? 'bg-coral text-white' : picked ? 'bg-ice' : 'bg-white hover:-translate-y-0.5'}`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt} {right && <Check size={14} className="inline" strokeWidth={3.5} />}
                        </button>
                      )
                    })}
                  </div>
                  {graded && (
                    <p className="mt-2.5 text-sm font-semibold text-ink/65 bg-paper rounded-xl border-2 border-ink/15 px-3.5 py-2">
                      解析：{ex.explain}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {!graded ? (
              <div className="mt-7 flex justify-end">
                <Button size="lg" onClick={grade} disabled={Object.keys(answers).length < article.exercises.length}>
                  {Object.keys(answers).length < article.exercises.length ? `还剩 ${article.exercises.length - Object.keys(answers).length} 题` : '提交答案'}
                </Button>
              </div>
            ) : (
              <div className="mt-7 flex items-center justify-between gap-4 flex-wrap">
                <p className="font-extrabold">
                  答对 {article.exercises.filter((ex, i) => answers[i] === ex.answer).length} / {article.exercises.length} 题，错题已进入错题本
                </p>
                <Button onClick={() => navigate('/student/reading')}>返回阅读世界</Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
