import { useEffect, useMemo, useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { repo } from '../services/repo'
import { speech } from '../services/audio'
import type { GrammarDetectItem } from '../types'
import type { GameProps } from './types'
import { pickRandom, shuffle } from './types'
import { Card, Button, ProgressBar } from '../components/ui'

const ROUNDS = 5

/** 语法侦探：找出句中错误单词并选择正确改法 */
export function GrammarGame({ onFinish }: GameProps) {
  const { data: content } = useAsync(() => repo.getGameContent(), [])
  const [items, setItems] = useState<GrammarDetectItem[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'find' | 'fix' | 'done'>('find')
  const [clicked, setClicked] = useState<number | null>(null)
  const [findOk, setFindOk] = useState(false)
  const [fixOptions, setFixOptions] = useState<string[]>([])
  const [fixPicked, setFixPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [wrongs, setWrongs] = useState<{ question: string; yourAnswer: string; correctAnswer: string }[]>([])
  const [roundScore, setRoundScore] = useState(0)
  const startRef = useMemo(() => Date.now(), [])

  useEffect(() => {
    if (!content || items) return
    setItems(pickRandom(content.grammarItems, ROUNDS))
  }, [content, items])

  if (!items) return <div className="font-bold text-ink/40 py-20 text-center">正在准备案件…</div>

  const item = items[Math.min(idx, items.length - 1)]
  const tokens = item.sentence.split(' ')

  const resetRoundState = () => {
    setPhase('find')
    setClicked(null)
    setFindOk(false)
    setFixOptions([])
    setFixPicked(null)
    setRoundScore(0)
  }

  const clickToken = (i: number) => {
    if (phase !== 'find' || clicked !== null) return
    setClicked(i)
    if (item.wrongIndex === -1) {
      // 正确做法：判定句子没有错误
      finishRound(true, 100, '没有错误（正确判断）', item.corrected)
      return
    }
    if (i === item.wrongIndex) {
      setFindOk(true)
      setFixOptions(shuffle([item.fix, ...item.options]))
      setTimeout(() => setPhase('fix'), 500)
    } else {
      setTimeout(() => {
        finishRound(false, 0, tokens[i], item.fix, `错误词是第 ${item.wrongIndex + 1} 个单词 "${tokens[item.wrongIndex]}"`)
      }, 700)
    }
  }

  const claimNoError = () => {
    if (phase !== 'find' || clicked !== null) return
    setClicked(-1)
    if (item.wrongIndex === -1) {
      finishRound(true, 100, '没有错误（正确判断）', item.corrected)
    } else {
      setTimeout(() => {
        finishRound(false, 0, '（认为没有错误）', item.fix, `其实第 ${item.wrongIndex + 1} 个单词 "${tokens[item.wrongIndex]}" 用错了`)
      }, 700)
    }
  }

  const pickFix = (opt: string) => {
    if (phase !== 'fix' || fixPicked !== null) return
    setFixPicked(opt)
    const ok = opt === item.fix
    setTimeout(() => {
      finishRound(ok, ok ? 100 : 40, ok ? item.fix : opt, item.fix, ok ? undefined : `正确改法是 "${item.fix}"`)
    }, 700)
  }

  const finishRound = (ok: boolean, pts: number, yourAnswer: string, correctAnswer: string, extra?: string) => {
    if (ok) {
      setCorrect((c) => c + 1)
      setCombo((cb) => {
        const nc = cb + 1
        setMaxCombo((m) => Math.max(m, nc))
        return nc
      })
    } else {
      setCombo(0)
      setWrongs((ws) => [...ws, { question: `语法纠错：${item.sentence}`, yourAnswer, correctAnswer: `${correctAnswer} → ${item.corrected}` }])
    }
    setRoundScore(pts)
    setPhase('done')
    void extra
  }

  const nextRound = () => {
    if (idx + 1 >= items.length) {
      const durationSec = Math.round((Date.now() - startRef) / 1000)
      const score = correct * 130 + maxCombo * 25
      onFinish({ score, accuracy: Math.round((correct / ROUNDS) * 100), durationSec, combo: maxCombo, wrongs })
    } else {
      setIdx((i) => i + 1)
      resetRoundState()
    }
  }

  const done = phase === 'done'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2.5 flex-wrap">
          <span className="chip bg-brand">案件 {Math.min(idx + 1, ROUNDS)}/{ROUNDS}</span>
          <span className="chip bg-ice">连击 ×{combo}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => speech.speak(item.corrected, { rate: 0.9 })}>
          🔊 听正确版
        </Button>
      </Card>
      <ProgressBar value={(idx / ROUNDS) * 100} color="brand" height="h-3" />

      <Card className="p-8 space-y-5">
        <div className="text-sm font-bold text-ink/40 text-center">
          🔍 每句话最多藏一处语法错误，也可能完全没有错误
        </div>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {tokens.map((t, i) => {
            let cls = 'bg-white hover:-translate-y-1 hover:shadow-hard-md'
            if (done && item.wrongIndex === i) cls = 'bg-coral text-white'
            else if (done && clicked === i) cls = 'bg-brand'
            else if (clicked === i) cls = findOk ? 'bg-ice' : 'bg-coral text-white'
            return (
              <button
                key={`${t}-${i}`}
                onClick={() => clickToken(i)}
                disabled={phase !== 'find' || clicked !== null}
                className={`px-4 py-2.5 rounded-xl border-[2px] border-ink font-extrabold text-xl transition-all disabled:cursor-default ${cls}`}
              >
                {t}
              </button>
            )
          })}
        </div>

        {phase === 'find' && clicked === null && (
          <div className="text-center">
            <Button variant="dark" onClick={claimNoError}>
              我判断：这句没有错误！
            </Button>
          </div>
        )}

        {phase === 'fix' && (
          <div className="rounded-2xl bg-ice/50 border-[2px] border-ink p-4 space-y-3">
            <div className="font-black">
              找到了！「{tokens[item.wrongIndex]}」用错了，正确的应该是：
            </div>
            <div className="flex flex-wrap gap-2.5">
              {fixOptions.map((opt) => {
                let cls = 'bg-white hover:-translate-y-0.5'
                if (fixPicked !== null) {
                  if (opt === item.fix) cls = 'bg-brand'
                  else if (opt === fixPicked) cls = 'bg-coral text-white'
                  else cls = 'bg-paper text-ink/30'
                }
                return (
                  <button
                    key={opt}
                    onClick={() => pickFix(opt)}
                    disabled={fixPicked !== null}
                    className={`px-5 py-2 rounded-xl border-[2px] border-ink font-bold text-lg transition-all ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {done && (
          <div className="space-y-3">
            <div className={`rounded-2xl border-[2.5px] border-ink p-4 font-black text-center ${roundScore >= 100 ? 'bg-brand' : 'bg-coral/15 text-coral'}`}>
              {roundScore >= 100 ? `✓ 破案成功！+${roundScore} 分` : roundScore > 0 ? '找对了一半，改错了 +40 分' : '这案子查错了…'}
            </div>
            <div className="rounded-2xl bg-ink text-white p-4 space-y-2">
              <div className="text-brand font-black">侦探笔记</div>
              <div className="font-bold">修改后：{item.corrected}</div>
              <div className="text-sm text-white/80 font-bold">{item.explain}</div>
            </div>
            <div className="text-center">
              <Button variant="primary" onClick={nextRound}>
                {idx + 1 >= items.length ? '查看成绩' : '下一案'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
