import { useEffect, useMemo, useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { repo } from '../services/repo'
import { speech } from '../services/audio'
import type { GameProps } from './types'
import { pickRandom, shuffle } from './types'
import { Card, Button, ProgressBar } from '../components/ui'

const ROUNDS = 5

function shuffledTokens(sentence: string): string[] {
  const tokens = sentence.split(' ')
  let out = shuffle(tokens)
  let guard = 0
  while (out.join(' ') === sentence && guard++ < 10) out = shuffle(tokens)
  return out
}

/** 句子工厂：把打乱的单词卡片点选排列成正确句子 */
export function SentenceGame({ onFinish }: GameProps) {
  const { data: content } = useAsync(() => repo.getGameContent(), [])
  const [sentences, setSentences] = useState<string[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [bank, setBank] = useState<string[]>([])
  const [line, setLine] = useState<string[]>([])
  const [result, setResult] = useState<'none' | 'ok' | 'bad'>('none')
  const [correct, setCorrect] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [wrongs, setWrongs] = useState<{ question: string; yourAnswer: string; correctAnswer: string }[]>([])
  const startRef = useMemo(() => Date.now(), [])

  useEffect(() => {
    if (!content || sentences) return
    setSentences(pickRandom(content.scrambleSentences, ROUNDS))
  }, [content, sentences])

  useEffect(() => {
    if (sentences && idx < sentences.length) {
      setBank(shuffledTokens(sentences[idx]))
      setLine([])
      setResult('none')
    }
  }, [sentences, idx])

  if (!sentences) return <div className="font-bold text-ink/40 py-20 text-center">正在准备句子…</div>

  const sentence = sentences[Math.min(idx, sentences.length - 1)]

  const pick = (t: string) => {
    if (result !== 'none') return
    setBank((b) => b.filter((x, i) => !(x === t && i === b.indexOf(t))))
    setLine((l) => [...l, t])
  }

  const giveBack = (i: number) => {
    if (result !== 'none') return
    setBank((b) => [...b, line[i]])
    setLine((l) => l.filter((_, j) => j !== i))
  }

  const submit = () => {
    const guess = line.join(' ')
    const ok = guess === sentence
    setResult(ok ? 'ok' : 'bad')
    if (ok) {
      speech.speak(sentence, { rate: 0.95 })
      setCorrect((c) => c + 1)
      setCombo((cb) => {
        const nc = cb + 1
        setMaxCombo((m) => Math.max(m, nc))
        return nc
      })
    } else {
      setCombo(0)
      setWrongs((ws) => [...ws, { question: `连词成句（中文序）：${sentence}`, yourAnswer: guess, correctAnswer: sentence }])
    }
    setTimeout(() => {
      if (idx + 1 >= sentences.length) {
        const durationSec = Math.round((Date.now() - startRef) / 1000)
        const score = correct * 110 + maxCombo * 25
        onFinish({ score, accuracy: Math.round((correct / ROUNDS) * 100), durationSec, combo: maxCombo, wrongs })
      } else {
        setIdx((i) => i + 1)
      }
    }, ok ? 1100 : 2200)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2.5 flex-wrap">
          <span className="chip bg-brand">第 {Math.min(idx + 1, ROUNDS)}/{ROUNDS} 句</span>
          <span className="chip bg-ice">连击 ×{combo}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => speech.speak(sentence, { rate: 0.6 })}>
          🔊 听正确读音提示
        </Button>
      </Card>
      <ProgressBar value={(idx / ROUNDS) * 100} color="brand" height="h-3" />

      <Card className="p-8 space-y-5">
        <div className="text-sm font-bold text-ink/40 text-center">按正确语序点击下方单词卡片，组成完整句子</div>
        <div
          className={`min-h-[92px] rounded-2xl border-[2.5px] border-dashed border-ink/30 bg-paper p-4 flex flex-wrap gap-2.5 items-start ${
            result === 'ok' ? 'border-blue bg-ice/40' : result === 'bad' ? 'border-coral bg-coral/10' : ''
          }`}
        >
          {line.length === 0 && <span className="text-ink/30 font-bold">点击单词开始组句…</span>}
          {line.map((t, i) => (
            <button
              key={`${t}-${i}`}
              onClick={() => giveBack(i)}
              className={`px-4 py-2 rounded-xl border-[2px] border-ink font-extrabold text-lg transition-all ${
                result === 'none' ? 'bg-brand shadow-hard-xs hover:-translate-y-0.5 cursor-pointer' : result === 'ok' ? 'bg-brand' : 'bg-white text-ink/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 min-h-[52px]">
          {bank.map((t, i) => (
            <button
              key={`${t}-${i}`}
              onClick={() => pick(t)}
              disabled={result !== 'none'}
              className="px-4 py-2 rounded-xl border-[2px] border-ink bg-white font-extrabold text-lg shadow-hard-xs hover:-translate-y-0.5 transition-all disabled:opacity-40"
            >
              {t}
            </button>
          ))}
        </div>
        {result === 'bad' && (
          <div className="rounded-2xl bg-ink text-white p-4">
            <div className="text-brand font-black mb-1">正确句子：</div>
            <div className="font-bold">{sentence}</div>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={submit} disabled={result !== 'none' || line.length === 0}>
            提交句子
          </Button>
          {result === 'none' && line.length > 0 && (
            <Button variant="secondary" onClick={() => { setBank(shuffledTokens(sentence)); setLine([]) }}>
              全部重排
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
