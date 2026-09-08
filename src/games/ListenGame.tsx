import { useEffect, useMemo, useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { repo } from '../services/repo'
import { speech } from '../services/audio'
import type { WordWithState, ListeningProgram } from '../types'
import type { GameProps } from './types'
import { pickRandom, shuffle } from './types'
import { Card, Button, ProgressBar } from '../components/ui'

interface Round {
  answer: string
  promptZh: string
  options: string[]
  kind: 'word' | 'sentence'
}

const ROUNDS = 10

/** 听音寻词：听发音选出正确的单词或句子 */
export function ListenGame({ onFinish }: GameProps) {
  const { data: words } = useAsync<WordWithState[]>(() => repo.getWords(), [])
  const { data: programs } = useAsync<ListeningProgram[]>(() => repo.getListeningPrograms(), [])
  const [rounds, setRounds] = useState<Round[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [plays, setPlays] = useState(1)
  const [wrongs, setWrongs] = useState<{ question: string; yourAnswer: string; correctAnswer: string }[]>([])
  const startRef = useMemo(() => Date.now(), [])

  useEffect(() => {
    if (!words || !programs || rounds) return
    const wordPool = words.filter((w) => /^[a-z][a-z'-]*$/.test(w.en))
    const wordTargets = pickRandom(wordPool, 6)
    const wordRounds: Round[] = wordTargets.map((t) => {
      const distract = shuffle(wordPool.filter((w) => w.id !== t.id)).slice(0, 3)
      return {
        answer: t.en,
        promptZh: t.zh,
        options: shuffle([t.en, ...distract.map((d) => d.en)]),
        kind: 'word',
      }
    })
    const linePool = programs.flatMap((p) => p.lines.map((l) => ({ line: l.en, zh: l.zh })))
    const usable = linePool.filter((l) => l.line.split(' ').length >= 3 && l.line.split(' ').length <= 9)
    const sentenceTargets = pickRandom(usable, Math.min(4, usable.length))
    const sentenceRounds: Round[] = sentenceTargets.map((t) => {
      const distract = shuffle(usable.filter((l) => l.line !== t.line)).slice(0, 3)
      return {
        answer: t.line,
        promptZh: t.zh,
        options: shuffle([t.line, ...distract.map((d) => d.line)]),
        kind: 'sentence',
      }
    })
    setRounds(shuffle([...wordRounds, ...sentenceRounds]))
  }, [words, programs, rounds])

  const round = rounds?.[idx]

  useEffect(() => {
    if (round && picked === null) {
      speech.speak(round.answer, { rate: 0.9 })
      setPlays(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, rounds])

  if (!rounds || !round) return <div className="font-bold text-ink/40 py-20 text-center">正在准备听力…</div>

  const answer = (opt: string) => {
    if (picked !== null) return
    setPicked(opt)
    if (opt === round.answer) {
      setCorrect((c) => c + 1)
      setCombo((cb) => {
        const nc = cb + 1
        setMaxCombo((m) => Math.max(m, nc))
        return nc
      })
    } else {
      setCombo(0)
      setWrongs((ws) => [
        ...ws,
        { question: `听音辨句：${round.promptZh}`, yourAnswer: opt, correctAnswer: round.answer },
      ])
    }
    setTimeout(() => {
      setPicked(null)
      setIdx((i) => i + 1)
    }, 1400)
  }

  if (idx >= rounds.length) {
    const durationSec = Math.round((Date.now() - startRef) / 1000)
    const score = correct * 90 + maxCombo * 30
    return (
      <div className="max-w-xl mx-auto text-center py-10">
        <Card className="p-10 space-y-4">
          <div className="text-6xl">🎧</div>
          <h3 className="text-2xl font-black">听力闯关完成！</h3>
          <p className="font-bold text-ink/60">答对 {correct}/{ROUNDS} · 最高连击 ×{maxCombo}</p>
          <Button variant="primary" onClick={() => onFinish({ score, accuracy: Math.round((correct / ROUNDS) * 100), durationSec, combo: maxCombo, wrongs })}>
            查看成绩
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2.5 flex-wrap">
          <span className="chip bg-brand">第 {idx + 1}/{ROUNDS} 题</span>
          <span className="chip bg-ice">连击 ×{combo}</span>
          <span className="chip">{round.kind === 'word' ? '🔊 听单词' : '🔊 听句子'}</span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={plays >= 3 || picked !== null}
          onClick={() => {
            speech.speak(round.answer, { rate: 0.9 })
            setPlays((p) => p + 1)
          }}
        >
          重听（{3 - plays} 次剩余）
        </Button>
      </Card>
      <ProgressBar value={(idx / ROUNDS) * 100} color="brand" height="h-3" />

      <Card className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <button
            onClick={() => speech.speak(round.answer, { rate: 0.9 })}
            className="inline-flex items-center gap-3 bg-ink text-brand text-2xl font-black px-10 py-5 rounded-2xl border-[2.5px] border-ink shadow-hard hover:-translate-y-1 hover:shadow-hard-lg transition-all"
          >
            ▶ 播放发音
          </button>
          <div className="text-xs font-bold text-ink/40">提示含义：{round.promptZh}</div>
        </div>
        <div className="grid gap-3">
          {round.options.map((opt) => {
            let cls = 'bg-white hover:-translate-y-1 hover:shadow-hard-md'
            if (picked !== null) {
              if (opt === round.answer) cls = 'bg-brand shadow-hard-xs'
              else if (opt === picked) cls = 'bg-coral text-white shadow-hard-xs'
              else cls = 'bg-paper text-ink/30'
            }
            return (
              <button
                key={opt}
                onClick={() => answer(opt)}
                disabled={picked !== null}
                className={`text-left px-5 py-3.5 rounded-2xl border-[2.5px] border-ink font-bold text-lg transition-all ${cls}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
