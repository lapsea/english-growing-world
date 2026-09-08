import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Repeat, Turtle, Volume2, Eye, EyeOff, Check, ChevronRight, RotateCcw } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { speech } from '../../services/audio'
import { Card, Button, ProgressBar, SectionTitle, DifficultyDots } from '../../components/ui'
import type { ListeningProgram, ListeningQuiz } from '../../types'

export function ListeningPlayerPage() {
  const { programId } = useParams()
  const navigate = useNavigate()
  const { data: program } = useAsync<ListeningProgram | undefined>(() => repo.getListeningProgram(programId!), [programId])

  const [lineIdx, setLineIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [loop, setLoop] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const [quizDone, setQuizDone] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)
  const [quizResults, setQuizResults] = useState<boolean[]>([])
  const startedRef = useRef(false)

  // 继续播放：读取上次进度
  useEffect(() => {
    if (!program || startedRef.current) return
    startedRef.current = true
    repo.getListeningRecord('stu-001', program.id).then((r) => {
      if (r?.lastLine) {
        setLineIdx(Math.min(r.lastLine, program.lines.length - 1))
        setQuizDone(Object.fromEntries((program.quiz ?? []).filter((q) => q.lineIndex < r.lastLine).map((q) => [q.lineIndex, true])) as Record<number, boolean>)
      }
    })
  }, [program])

  useEffect(() => () => speech.stop(), [])

  const quizFor = (idx: number): ListeningQuiz | undefined => program?.quiz.find((q) => q.lineIndex === idx)

  const playLine = (idx: number, r: number = rate) => {
    if (!program) return
    const line = program.lines[idx]
    if (!line) return
    setPlaying(true)
    speech.speak(line.en, {
      rate: r,
      onEnd: () => {
        if (!loop) setPlaying(false)
        repo.saveListeningProgress('stu-001', program.id, { lastLine: idx })
      },
    })
  }

  const finish = async (results: boolean[]) => {
    if (!program) return
    const score = Math.round((results.filter(Boolean).length / Math.max(1, program.quiz.length)) * 100)
    const rec = await repo.getListeningRecord('stu-001', program.id)
    await repo.saveListeningProgress('stu-001', program.id, {
      finished: true,
      bestScore: Math.max(score, rec?.bestScore ?? 0),
      plays: (rec?.plays ?? 0) + 1,
    })
    await repo.addStudyMinutes('stu-001', program.durationMin)
    await repo.adjustModuleMastery('stu-001', 'listening', score >= 80 ? 3 : score >= 60 ? 1.5 : 0.5)
    setFinished(true)
    setShowScript(true)
  }

  const onQuizAnswered = (correct: boolean) => {
    if (!program) return
    setQuizResults((r) => [...r, correct])
    setQuizDone((m) => ({ ...m, [lineIdx]: true }))
  }

  const nextLine = () => {
    if (!program) return
    if (lineIdx + 1 >= program.lines.length) {
      finish(quizResults)
    } else {
      setLineIdx(lineIdx + 1)
      setPlaying(false)
    }
  }

  if (!program) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>
  const line = program.lines[lineIdx]
  const pendingQuiz = quizFor(lineIdx) && !quizDone[lineIdx] ? quizFor(lineIdx) : undefined
  const isLast = lineIdx + 1 >= program.lines.length
  const progressPct = ((lineIdx + 1) / program.lines.length) * 100

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* —— 顶栏 —— */}
      <Card className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/student/listening')}>
            返回
          </Button>
          <div>
            <h2 className="font-extrabold text-lg leading-tight">{program.titleZh}</h2>
            <div className="text-xs font-bold text-ink/45">{program.title} · 第 {lineIdx + 1} / {program.lines.length} 句</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <DifficultyDots level={program.difficulty} />
          <Button size="sm" variant={loop ? 'dark' : 'secondary'} onClick={() => setLoop(!loop)}>
            <Repeat size={14} /> 单句循环{loop ? '开' : '关'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowScript(!showScript)}>
            {showScript ? <EyeOff size={14} /> : <Eye size={14} />} {showScript ? '隐藏原文' : '原文/解析'}
          </Button>
        </div>
      </Card>
      <ProgressBar value={progressPct} color="blue" height="h-3" />

      {/* —— 听前关键词 —— */}
      <Card className="p-5">
        <div className="text-xs font-extrabold text-ink/45 mb-2.5">🎧 听前关键词（点一下跟读预热）</div>
        <div className="flex flex-wrap gap-2">
          {program.keywords.map((k) => (
            <button key={k.en} onClick={() => speech.speak(k.en, { rate: 0.95 })} className="chip bg-brand hover:-translate-y-0.5 transition-transform">
              <Volume2 size={12} /> {k.en} <span className="text-ink/50 font-semibold">{k.zh}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* —— 播放器主体 —— */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-[28px] bg-ink text-brand border-[3px] border-ink flex items-center justify-center text-4xl mb-5">
            {playing ? '🔊' : '🎙'}
          </div>
          {!showScript ? (
            <p className="text-ink/45 font-bold text-sm mb-2">正在播放第 {lineIdx + 1} 句（原文已隐藏，听后可查看）</p>
          ) : (
            <p className="text-2xl font-extrabold mb-1">{line.en}</p>
          )}
          {showScript && <p className="font-semibold text-ink/55">{line.zh}</p>}
          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            <Button size="lg" onClick={() => (playing ? (speech.stop(), setPlaying(false)) : playLine(lineIdx))}>
              {playing ? <Pause size={18} /> : <Play size={18} />} {playing ? '停止' : '播放本句'}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => { const nr = rate === 1 ? 0.55 : 1; setRate(nr); if (playing) playLine(lineIdx, nr) }}>
              <Turtle size={16} /> {rate === 1 ? '慢速模式' : '正常速度'}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => playLine(lineIdx)}>
              <RotateCcw size={16} /> 重听
            </Button>
          </div>
          <div className="flex justify-between items-center mt-8">
            <Button variant="secondary" size="sm" onClick={() => setLineIdx(Math.max(0, lineIdx - 1))} disabled={lineIdx === 0}>
              上一句
            </Button>
            <span className="text-xs font-extrabold text-ink/40">播放速度 {rate === 1 ? '1.0×' : '0.55×'}</span>
            {pendingQuiz ? (
              <span className="chip bg-coral text-white">先完成本句听力题 ↓</span>
            ) : (
              <Button size="sm" onClick={nextLine}>
                {isLast ? '完成收听' : '下一句'} <ChevronRight size={14} strokeWidth={3} />
              </Button>
            )}
          </div>
        </Card>

        {/* —— 听中答题 —— */}
        <div className="space-y-5">
          {pendingQuiz ? (
            <InlineQuiz quiz={pendingQuiz} onAnswered={onQuizAnswered} />
          ) : (
            <Card className="p-6 text-center">
              <div className="text-4xl mb-2">🧠</div>
              <p className="font-bold text-sm text-ink/60">{program.quiz.filter((q) => quizDone[q.lineIndex]).length} / {program.quiz.length} 道听力题已完成</p>
              <p className="text-xs font-semibold text-ink/40 mt-1">播放到关键句时会自动弹出听选题</p>
            </Card>
          )}
        </div>
      </div>

      {/* —— 听后原文和解析 —— */}
      {showScript && (
        <Card className="p-7 reveal">
          <SectionTitle title="原文与解析" sub="逐句对照，跟读模仿效果最好" />
          <div className="space-y-3">
            {program.lines.map((l, i) => (
              <div key={i} className={`rounded-2xl border-[2.5px] p-4 flex gap-3 items-start ${i === lineIdx ? 'bg-brand/30 border-ink' : 'bg-paper border-ink/15'}`}>
                <button onClick={() => { setLineIdx(i); playLine(i) }} className="w-8 h-8 shrink-0 rounded-lg border-2 border-ink bg-white flex items-center justify-center hover:bg-brand">
                  <Volume2 size={14} />
                </button>
                <div className="min-w-0">
                  {l.speaker && <span className="chip !text-[10px] bg-lav mr-1.5">{l.speaker}</span>}
                  <span className="font-extrabold">{l.en}</span>
                  <div className="text-xs font-semibold text-ink/55 mt-0.5">{l.zh}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* —— 完成弹层 —— */}
      {finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setFinished(false)} />
          <Card className="relative pop p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-2xl font-extrabold">收听完成！</h3>
            <p className="font-bold text-ink/60 mt-2">
              听力题正确率 {Math.round((quizResults.filter(Boolean).length / Math.max(1, program.quiz.length)) * 100)}%，已计入听力掌握度
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setFinished(false); setLineIdx(0); setShowScript(false) }}>
                再听一遍
              </Button>
              <Button onClick={() => navigate('/student/listening')}>返回节目单</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function InlineQuiz({ quiz, onAnswered }: { quiz: ListeningQuiz; onAnswered: (correct: boolean) => void }) {
  const [val, setVal] = useState('')
  const [result, setResult] = useState<boolean | null>(null)
  const norm = (s: string) => s.trim().toLowerCase().replace(/[.?！。？]+$/, '')

  const submitChoice = (opt: string) => {
    if (result !== null) return
    const ok = norm(opt) === norm(quiz.answer)
    setResult(ok)
    onAnswered(ok)
  }
  const submitFill = () => {
    if (result !== null || !val.trim()) return
    const ok = norm(val) === norm(quiz.answer)
    setResult(ok)
    onAnswered(ok)
  }

  return (
    <Card className="p-6 pop">
      <div className="chip bg-coral text-white mb-3">🎧 听中选择 / 填空</div>
      <p className="font-extrabold mb-4">{quiz.question}</p>
      {quiz.type === 'choice' ? (
        <div className="space-y-2.5">
          {quiz.options?.map((opt) => {
            const right = result !== null && norm(opt) === norm(quiz.answer)
            const wrongPick = result === false && norm(opt) === norm(val)
            return (
              <button
                key={opt}
                onClick={() => submitChoice(opt)}
                className={`w-full text-left px-4 py-2.5 rounded-xl border-[2.5px] border-ink font-bold text-sm transition ${right ? 'bg-brand' : wrongPick ? 'bg-coral text-white' : 'bg-white hover:-translate-y-0.5'}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitFill()} className="field" placeholder="填入你听到的词" autoFocus />
          <Button onClick={submitFill} disabled={result !== null}>
            确定
          </Button>
        </div>
      )}
      {result !== null && (
        <div className={`mt-4 rounded-xl border-[2.5px] border-ink p-3.5 ${result ? 'bg-brand/30' : 'bg-coral/20'}`}>
          <div className="font-extrabold text-sm flex items-center gap-1.5">
            {result ? <Check size={15} strokeWidth={3.5} /> : null} {result ? '答对了！' : `正确答案：${quiz.answer}`}
          </div>
          <p className="text-xs font-semibold text-ink/70 mt-1">{quiz.explain}</p>
        </div>
      )}
    </Card>
  )
}
