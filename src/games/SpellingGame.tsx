import { useEffect, useMemo, useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { repo } from '../services/repo'
import { speech } from '../services/audio'
import type { WordWithState } from '../types'
import type { GameProps } from './types'
import { pickRandom, shuffle } from './types'
import { Card, Button, ProgressBar } from '../components/ui'

const ROUNDS = 8

/** 拼写冲刺：看中文释义和音标，拼写英文单词 */
export function SpellingGame({ onFinish }: GameProps) {
  const { data: words } = useAsync<WordWithState[]>(() => repo.getWords(), [])
  const [rounds, setRounds] = useState<WordWithState[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [hints, setHints] = useState<string[]>([])
  const [hintsLeft, setHintsLeft] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [wrongRounds, setWrongRounds] = useState(0)
  const [wrongs, setWrongs] = useState<{ question: string; yourAnswer: string; correctAnswer: string }[]>([])
  const [feedback, setFeedback] = useState<'none' | 'ok' | 'bad'>('none')
  const [failTries, setFailTries] = useState(0)
  const startRef = useMemo(() => Date.now(), [])

  useEffect(() => {
    if (!words || rounds) return
    const pool = words.filter((w) => /^[a-z][a-z'-]*$/.test(w.en) && w.en.length >= 3 && w.en.length <= 12)
    setRounds(pickRandom(pool, ROUNDS))
  }, [words, rounds])

  if (!rounds) return <div className="font-bold text-ink/40 py-20 text-center">正在准备题目…</div>
  const word = rounds[idx]

  const nextRound = () => {
    setFeedback('none')
    setInput('')
    setHints([])
    setFailTries(0)
    setIdx((i) => i + 1)
  }

  const submit = () => {
    const guess = input.trim().toLowerCase()
    if (!guess || feedback !== 'none') return
    if (guess === word.en.toLowerCase()) {
      speech.speak(word.en, { rate: 1 })
      setCorrect((c) => c + 1)
      setCombo((cb) => {
        const nc = cb + 1
        setMaxCombo((m) => Math.max(m, nc))
        return nc
      })
      setFeedback('ok')
      setTimeout(nextRound, 800)
    } else {
      setFailTries((t) => {
        const nt = t + 1
        if (nt >= 2) {
          setCombo(0)
          setWrongRounds((n) => n + 1)
          setWrongs((ws) => [
            ...ws,
            { question: `拼写：${word.zh}（${word.phonetic}）`, yourAnswer: guess, correctAnswer: word.en },
          ])
          setInput(word.en)
          setFeedback('bad')
          setTimeout(nextRound, 1600)
        } else {
          setFeedback('bad')
          setTimeout(() => setFeedback('none'), 900)
        }
        return nt
      })
    }
  }

  const useHint = () => {
    if (hintsLeft <= 0 || feedback !== 'none') return
    const nextPos = hints.length
    if (nextPos >= word.en.length) return
    setHints((h) => [...h, word.en[nextPos]])
    setHintsLeft((n) => n - 1)
    setInput(word.en.slice(0, nextPos + 1))
  }

  const finishGame = () => {
    const durationSec = Math.round((Date.now() - startRef) / 1000)
    const score = correct * 110 + Math.max(0, maxCombo) * 25 - wrongRounds * 20
    const accuracy = Math.round((correct / ROUNDS) * 100)
    onFinish({ score, accuracy, durationSec, combo: maxCombo, wrongs })
  }

  if (idx >= rounds.length) {
    return (
      <div className="max-w-xl mx-auto text-center py-10">
        <Card className="p-10 space-y-4">
          <div className="text-6xl">🏁</div>
          <h3 className="text-2xl font-black">拼写完成！</h3>
          <p className="font-bold text-ink/60">答对 {correct}/{ROUNDS} · 最高连击 ×{maxCombo}</p>
          <Button variant="primary" onClick={finishGame}>查看成绩</Button>
        </Card>
      </div>
    )
  }

  const masked = word.en
    .split('')
    .map((ch, i) => (hints[i] ? ch : ch === ' ' || ch === '-' ? ch : '_'))
    .join(' ')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2.5 flex-wrap">
          <span className="chip bg-brand">第 {idx + 1}/{ROUNDS} 轮</span>
          <span className="chip bg-ice">提示机会 {hintsLeft}</span>
          <span className="chip bg-lav text-white">连击 ×{combo}</span>
        </div>
        <Button size="sm" variant="coral" onClick={() => speech.speak(word.en, { rate: 0.6 })}>
          🔊 慢速发音
        </Button>
      </Card>
      <ProgressBar value={((idx + (feedback === 'ok' ? 1 : 0)) / ROUNDS) * 100} color="brand" height="h-3" />

      <Card className="p-8 text-center space-y-5">
        <div className="text-sm font-bold text-ink/40">中文释义 + 音标 → 拼写英文单词</div>
        <div className="text-4xl font-black">{word.zh}</div>
        <div className="font-mono text-2xl font-bold tracking-[0.35em] text-blue">{masked}</div>
        <div className="text-xs font-bold text-ink/40">共 {word.en.length} 个字母</div>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          disabled={feedback !== 'none'}
          placeholder="输入英文单词后回车"
          className={`field text-2xl text-center font-black tracking-widest ${feedback === 'bad' ? 'text-coral' : feedback === 'ok' ? 'text-blue' : ''}`}
        />
        {feedback === 'bad' && failTries >= 2 && (
          <div className="text-coral font-black">正确答案：{word.en} —— 已自动加入错题本</div>
        )}
        {feedback === 'ok' && <div className="text-blue font-black">✓ 拼写正确！</div>}
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={submit} disabled={feedback !== 'none'}>提交</Button>
          <Button variant="secondary" onClick={useHint}>提示一个字母（剩 {hintsLeft}）</Button>
        </div>
      </Card>
      {wrongs.length > 0 && (
        <p className="text-center text-xs font-bold text-coral">本轮已错 {wrongRounds} 词，将写入错题本</p>
      )}
    </div>
  )
}
