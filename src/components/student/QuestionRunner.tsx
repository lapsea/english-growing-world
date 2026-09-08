import { useEffect, useMemo, useRef, useState } from 'react'
import { Volume2, Turtle, Check, ChevronRight, Timer } from 'lucide-react'
import type { AnswerSource, Question } from '../../types'
import { repo } from '../../services/repo'
import { speech } from '../../services/audio'
import { Button, Card, ProgressBar } from '../ui'
import { useAuth } from '../../context/AuthContext'

interface Props {
  title: string
  questions: Question[]
  source: AnswerSource
  mode: 'practice' | 'exam'
  durationMin?: number
  onFinish?: (details: { questionId: string; yourAnswer: string; correct: boolean }[]) => void
  onQuit?: () => void
}

/** 通用答题器：practice 模式即时判分反馈；exam 模式先作答全部题目最后统一交卷 */
export function QuestionRunner({ title, questions, source, mode, durationMin, onFinish, onQuit }: Props) {
  const { user } = useAuth()
  const studentId = user?.id ?? 'stu-001'
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<{ correct: boolean; explain: string } | null>(null)
  const [fillInput, setFillInput] = useState('')
  const [details, setDetails] = useState<{ questionId: string; yourAnswer: string; correct: boolean }[]>([])
  const [confirming, setConfirming] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState((durationMin ?? 0) * 60)
  const inputRef = useRef<HTMLInputElement>(null)

  const q = questions[idx]
  const answeredCount = mode === 'practice' ? details.length : Object.keys(answers).length

  // 考试倒计时
  useEffect(() => {
    if (mode !== 'exam') return
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [mode])

  useEffect(() => {
    if (mode === 'exam' && secondsLeft === 0 && !confirming) {
      doSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [secondsLeft])

  const resetFill = () => {
    setFillInput('')
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const answerPractice = async (val: string) => {
    if (!q || feedback) return
    setAnswers((a) => ({ ...a, [q.id]: val }))
    const fb = await repo.submitAnswer({ studentId, question: q, yourAnswer: val, source })
    setFeedback(fb)
    setDetails((d) => [...d, { questionId: q.id, yourAnswer: val, correct: fb.correct }])
  }

  const next = () => {
    setFeedback(null)
    resetFill()
    if (idx + 1 >= questions.length) {
      if (mode === 'exam') setConfirming(true)
      else onFinish?.(details)
    } else {
      setIdx(idx + 1)
    }
  }

  const answerExam = (val: string) => {
    if (!q) return
    setAnswers((a) => ({ ...a, [q.id]: val }))
  }

  const doSubmit = () => {
    const rows = questions.map((qq) => {
      const your = answers[qq.id] ?? ''
      const norm = (s: string) => s.trim().toLowerCase().replace(/[.?!。？！]+$/, '')
      return { questionId: qq.id, yourAnswer: your, correct: norm(your) === norm(qq.answer) }
    })
    setConfirming(false)
    onFinish?.(rows)
  }

  if (!q) return null
  const timeLow = mode === 'exam' && secondsLeft < 60

  return (
    <div className="max-w-4xl mx-auto">
      {/* —— 顶部信息条 —— */}
      <Card className="p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={onQuit} className="btn btn-secondary btn-sm">
            退出
          </button>
          <h2 className="font-extrabold text-lg">{title}</h2>
          <span className="chip">{source === 'exam' ? '考试挑战' : source === 'unit-test' ? '单元测验' : '练习'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-ink/60">
            第 {idx + 1} / {questions.length} 题 · 已答 {answeredCount}
          </span>
          {mode === 'exam' && (
            <span className={`chip ${timeLow ? 'bg-coral text-white animate-pulse' : 'bg-brand'}`}>
              <Timer size={13} /> {mmss}
            </span>
          )}
        </div>
      </Card>
      <ProgressBar value={((idx + 1) / questions.length) * 100} color="blue" height="h-3" />

      {/* —— 题目卡 —— */}
      <Card className="p-8 mt-5">
        <div className="flex items-start gap-3 mb-6">
          <span className="chip bg-lav shrink-0">{q.module === 'vocabulary' ? '词汇' : q.module === 'grammar' ? '语法' : q.module === 'listening' ? '听力' : '阅读'}</span>
          <div className="flex-1">
            <p className="font-bold text-lg leading-relaxed whitespace-pre-line">{q.stem}</p>
            {q.audioLine && (
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => speech.speak(q.audioLine!, { rate: 1 })} className="btn btn-dark btn-sm">
                  <Volume2 size={15} /> 正常速度播放
                </button>
                <button onClick={() => speech.speak(q.audioLine!, { rate: 0.55 })} className="btn btn-secondary btn-sm">
                  <Turtle size={15} /> 慢速播放
                </button>
              </div>
            )}
          </div>
        </div>

        {q.type === 'choice' && (
          <div className="grid gap-3">
            {q.options?.map((opt) => {
              const picked = mode === 'practice' ? answers[q.id] === opt : answers[q.id] === opt
              const showRight = mode === 'practice' && feedback && opt === q.answer
              const showWrong = mode === 'practice' && feedback && picked && !feedback.correct
              const pickedPlain = mode === 'exam' && picked
              return (
                <button
                  key={opt}
                  onClick={() => (mode === 'practice' ? answerPractice(opt) : answerExam(opt))}
                  className={`text-left px-5 py-3.5 rounded-2xl border-[2.5px] border-ink font-bold transition-all flex items-center justify-between gap-3 ${
                    showRight ? 'bg-brand shadow-hard-xs' : showWrong ? 'bg-coral text-white' : pickedPlain ? 'bg-ice' : 'bg-white hover:-translate-y-0.5 hover:shadow-hard-xs'
                  }`}
                >
                  <span>{opt}</span>
                  {showRight && <Check size={18} strokeWidth={3.5} />}
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'fill' && (
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              value={mode === 'practice' ? fillInput : answers[q.id] ?? ''}
              onChange={(e) => (mode === 'practice' ? setFillInput(e.target.value) : answerExam(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && mode === 'practice' && fillInput.trim()) answerPractice(fillInput)
              }}
              placeholder="输入你的答案…"
              className="field max-w-md"
              autoFocus
            />
            {mode === 'practice' && (
              <Button onClick={() => fillInput.trim() && answerPractice(fillInput)} disabled={!!feedback}>
                提交答案
              </Button>
            )}
          </div>
        )}

        {/* —— practice 反馈 —— */}
        {mode === 'practice' && feedback && (
          <div className={`mt-6 rounded-2xl border-[2.5px] border-ink p-5 pop ${feedback.correct ? 'bg-brand/30' : 'bg-coral/20'}`}>
            <div className="font-extrabold text-lg flex items-center gap-2">
              {feedback.correct ? '✅ 回答正确！' : `❌ 答错了，正确答案：${q.answer}`}
            </div>
            <p className="font-semibold text-sm mt-2 text-ink/80">解析：{feedback.explain}</p>
            {q.audioLine && (
              <button onClick={() => speech.speak(q.audioLine!, { rate: 0.9 })} className="btn btn-secondary btn-sm mt-3">
                <Volume2 size={14} /> 再听一遍原句
              </button>
            )}
          </div>
        )}

        <div className="mt-7 flex justify-end gap-3">
          {mode === 'practice' ? (
            <Button onClick={next} disabled={!feedback} size="lg">
              {idx + 1 >= questions.length ? '完成练习' : '下一题'} <ChevronRight size={18} strokeWidth={3} />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (idx + 1 >= questions.length) setConfirming(true)
                else {
                  setIdx(idx + 1)
                  resetFill()
                }
              }}
              size="lg"
            >
              {idx + 1 >= questions.length ? '去交卷' : '下一题'} <ChevronRight size={18} strokeWidth={3} />
            </Button>
          )}
        </div>
      </Card>

      {/* —— 考试交卷确认 —— */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setConfirming(false)} />
          <Card className="relative pop p-8 max-w-md w-full">
            <h3 className="text-2xl font-extrabold mb-3">确认交卷？</h3>
            <p className="font-semibold text-ink/70">
              共 {questions.length} 题，已作答 <b className="text-blue">{Object.keys(answers).length}</b> 题
              {Object.keys(answers).length < questions.length && <span className="text-coral">（有 {questions.length - Object.keys(answers).length} 题未作答，未答题按错误计）</span>}。
            </p>
            {secondsLeft > 0 && mode === 'exam' && <p className="font-semibold text-ink/70 mt-2">剩余时间 {mmss}，交卷后立即自动判分。</p>}
            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                继续答题
              </Button>
              <Button variant="dark" onClick={doSubmit}>
                确认交卷
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
