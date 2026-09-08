import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { speech } from '../../services/audio'
import { GAME_LABELS, type GameKey, type GameResult } from '../../types'
import { Button, Card, Modal, ProgressBar } from '../../components/ui'
import type { GameProps } from '../../games/types'
import { MatchGame } from '../../games/MatchGame'
import { SpellingGame } from '../../games/SpellingGame'
import { ListenGame } from '../../games/ListenGame'
import { SentenceGame } from '../../games/SentenceGame'
import { GrammarGame } from '../../games/GrammarGame'

const GAME_KEYS: GameKey[] = ['match', 'spelling', 'listen', 'sentence', 'grammar']

const RULES: Record<GameKey, string> = {
  match: '翻开卡片，把 8 组英文单词和中文释义两两配对，越快越准分越高。',
  spelling: '根据中文释义和音标拼写单词，共 8 轮，最多 3 次提示，错 2 次会揭示答案。',
  listen: '听发音，从 4 个选项中选出你听到的单词或句子，共 10 题，每题最多重听 3 次。',
  sentence: '把打乱的单词卡片按正确语序点选排列，一共 5 句。',
  grammar: '点击句子中语法错误的单词并选择正确改法；注意有的句子没有错误。',
}

export default function GamePlayPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const version = useRepoVersion()
  const [round, setRound] = useState(0)
  const [result, setResult] = useState<GameResult | null>(null)

  const game = GAME_KEYS.find((g) => g === gameId)
  const { data: todayCount } = useAsync(
    () => (game ? repo.getTodayPlayCount('stu-001', game) : Promise.resolve(0)),
    [game, version, round]
  )

  if (!game) {
    return (
      <Card className="p-10 text-center space-y-4">
        <p className="font-black text-xl">未找到这个游戏</p>
        <Button variant="primary" to="/student/games">返回游戏厅</Button>
      </Card>
    )
  }

  const handleFinish: GameProps['onFinish'] = async (payload) => {
    speech.stop()
    const r = await repo.submitGameResult('stu-001', { game, ...payload })
    setResult(r)
  }

  const gameProps: GameProps = {
    onFinish: handleFinish,
    onQuit: () => navigate('/student/games'),
  }

  const renderGame = () => {
    const key = `${game}-${round}`
    switch (game) {
      case 'match':
        return <MatchGame key={key} {...gameProps} />
      case 'spelling':
        return <SpellingGame key={key} {...gameProps} />
      case 'listen':
        return <ListenGame key={key} {...gameProps} />
      case 'sentence':
        return <SentenceGame key={key} {...gameProps} />
      case 'grammar':
        return <GrammarGame key={key} {...gameProps} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/student/games')}>
            ← 返回游戏厅
          </Button>
          <h1 className="text-2xl font-black">{GAME_LABELS[game]}</h1>
        </div>
        <span className={`chip ${((todayCount ?? 0) < 3 ? 'bg-brand' : 'bg-paper')}`}>
          {game && `今日第 ${(todayCount ?? 0) + 1} 局 · 前 3 局计小组积分`}
        </span>
      </div>

      <Card className="p-4 bg-paper">
        <p className="text-sm font-bold text-ink/70">
          <b className="text-ink">玩法：</b>
          {RULES[game]}
        </p>
      </Card>

      {renderGame()}

      <Modal open={result !== null} onClose={() => setResult(null)} title="本局成绩" width="max-w-lg">
        {result && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-6xl font-black text-blue">{result.score}</div>
              <div className="font-bold text-ink/50">最终得分</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border-2 border-ink bg-brand p-3 text-center">
                <div className="text-2xl font-black">{result.accuracy}%</div>
                <div className="text-xs font-bold">正确率</div>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-ice p-3 text-center">
                <div className="text-2xl font-black">{Math.floor(result.durationSec / 60)}m{result.durationSec % 60}s</div>
                <div className="text-xs font-bold">用时</div>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-lav/60 p-3 text-center">
                <div className="text-2xl font-black">×{result.combo}</div>
                <div className="text-xs font-bold">最高连击</div>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-ink text-white p-4 text-center">
              {result.pointsGained > 0 ? (
                <>
                  <div className="text-3xl font-black text-brand">+{result.pointsGained} 小组积分</div>
                  <div className="text-xs font-bold text-white/70 mt-1">今日第 {(todayCount ?? 1)} 局，计入小组积分（前 3 局有效）</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-black text-white/80">本局未计积分</div>
                  <div className="text-xs font-bold text-white/50 mt-1">每个游戏每天只有前 3 局计入小组积分，明天再来！</div>
                </>
              )}
            </div>
            {result.wrongs.length > 0 && (
              <div>
                <ProgressBar value={100} color="coral" height="h-2" />
                <p className="font-black mt-2 mb-1.5">本局错了 {result.wrongs.length} 题（已收入错题本）</p>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {result.wrongs.map((w, i) => (
                    <li key={i} className="text-xs font-bold bg-paper rounded-xl border border-ink/20 px-3 py-2">
                      <span className="text-coral">✗</span> {w.question} —— 正确：<b>{w.correctAnswer}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setResult(null)
                  setRound((r) => r + 1)
                  window.scrollTo({ top: 0 })
                }}
              >
                再来一局
              </Button>
              <Button variant="dark" className="flex-1" onClick={() => navigate('/student/games')}>
                返回游戏厅
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
