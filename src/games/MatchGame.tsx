import { useEffect, useMemo, useRef, useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { repo } from '../services/repo'
import { speech } from '../services/audio'
import type { WordWithState } from '../types'
import type { GameProps } from './types'
import { pickRandom } from './types'
import { Card, Button, ProgressBar } from '../components/ui'

interface CardItem {
  key: string
  wordId: string
  label: string
  kind: 'en' | 'zh'
}

/** 单词消消乐：4×4 英文-中文配对 */
export function MatchGame({ onFinish }: GameProps) {
  const { data: words } = useAsync<WordWithState[]>(() => repo.getWords(), [])
  const [deck, setDeck] = useState<CardItem[] | null>(null)
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [wrongPairs, setWrongPairs] = useState(0)
  const [comparisons, setComparisons] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [wrongs, setWrongs] = useState<{ question: string; yourAnswer: string; correctAnswer: string }[]>([])
  const startRef = useRef<number | null>(null)
  const lockRef = useRef(false)

  useEffect(() => {
    if (!words || deck) return
    const picked = pickRandom(
      words.filter((w) => w.en.length <= 12),
      8
    )
    if (picked.length < 8) return
    const cards: CardItem[] = picked.flatMap((w) => [
      { key: `${w.id}-en`, wordId: w.id, label: w.en, kind: 'en' as const },
      { key: `${w.id}-zh`, wordId: w.id, label: w.zh, kind: 'zh' as const },
    ])
    setDeck(pickRandom(cards, cards.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words])

  const wordById = useMemo(() => {
    const m = new Map<string, WordWithState>()
    ;(words ?? []).forEach((w) => m.set(w.id, w))
    return m
  }, [words])

  const clickCard = (card: CardItem) => {
    if (lockRef.current || flipped.includes(card.key) || matched.includes(card.wordId)) return
    if (startRef.current === null) startRef.current = Date.now()
    const next = [...flipped, card.key]
    setFlipped(next)
    if (next.length < 2) return
    lockRef.current = true
    const [a, b] = next.map((k) => deck!.find((c) => c.key === k)!)
    const isMatch = a.wordId === b.wordId && a.kind !== b.kind
    setComparisons((c) => c + 1)
    if (isMatch) {
      setCombo((cb) => {
        const nc = cb + 1
        setMaxCombo((m) => Math.max(m, nc))
        return nc
      })
      const nm = [...matched, a.wordId]
      setMatched(nm)
      setFlipped([])
      lockRef.current = false
      speech.speak(wordById.get(a.wordId)?.en ?? '', { rate: 1.05 })
      if (nm.length === 8) {
        const durationSec = Math.round((Date.now() - (startRef.current ?? Date.now())) / 1000)
        const acc = Math.round((8 / Math.max(1, comparisons + 1)) * 100)
        const score = Math.max(100, 1000 - durationSec * 3 - wrongPairs * 25 + Math.max(combo + 1, maxCombo) * 20)
        setTimeout(() => onFinish({ score, accuracy: acc, durationSec, combo: maxCombo, wrongs }), 600)
      }
    } else {
      setCombo(0)
      setWrongPairs((n) => n + 1)
      const en = a.kind === 'en' ? a : b.kind === 'en' ? b : null
      const w = en ? wordById.get(en.wordId) : undefined
      if (en && w) {
        setWrongs((ws) => [
          ...ws,
          {
            question: `配对：${en.label}（${w.phonetic}）`,
            yourAnswer: (en === a ? b : a).label,
            correctAnswer: w.zh,
          },
        ])
      }
      setTimeout(() => {
        setFlipped([])
        lockRef.current = false
      }, 750)
    }
  }

  if (!deck) return <div className="font-bold text-ink/40 py-20 text-center">正在准备卡片…</div>
  const progressPct = (matched.length / 8) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2.5 flex-wrap">
          <span className="chip bg-brand">配对 {matched.length}/8</span>
          <span className="chip bg-coral text-white">错配 {wrongPairs}</span>
          <span className="chip bg-ice">连击 ×{combo}</span>
          <span className="chip">用时 {startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0}s</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => speech.stop()}>
          静音
        </Button>
      </Card>
      <ProgressBar value={progressPct} color="brand" height="h-3" />
      <div className="grid grid-cols-4 gap-3.5">
        {deck.map((c) => {
          const isUp = flipped.includes(c.key) || matched.includes(c.wordId)
          const isMatched = matched.includes(c.wordId)
          return (
            <button
              key={c.key}
              onClick={() => clickCard(c)}
              className={`aspect-[4/3] rounded-2xl border-[2.5px] border-ink font-extrabold flex items-center justify-center p-2 text-center transition-all duration-150 ${
                isMatched ? 'bg-brand shadow-hard-xs scale-[0.97]' : isUp ? 'bg-ice shadow-hard-xs' : 'bg-ink text-brand hover:-translate-y-1 hover:shadow-hard-xs'
              }`}
              style={{ fontSize: c.label.length > 10 ? '13px' : c.label.length > 6 ? '15px' : '18px' }}
            >
              {isUp ? c.label : c.kind === 'en' ? 'ABC' : '中'}
            </button>
          )
        })}
      </div>
      <p className="text-center text-xs font-bold text-ink/40">点击两张卡片：英文 ↔ 中文 释义配对成功会自动朗读单词</p>
    </div>
  )
}
