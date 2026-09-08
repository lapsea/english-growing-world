import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Trophy, Clock, Flame } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { GAME_LABELS, type GameKey } from '../../types'
import { Card, SectionTitle } from '../../components/ui'

const GAMES: { key: GameKey; desc: string; rules: string[]; bg: string; emoji: string }[] = [
  {
    key: 'match',
    desc: '4×4 卡片翻翻乐，英文和中文快速配对',
    rules: ['8 组英文↔中文卡片', '翻错会计入错配次数', '连击越多分数越高'],
    bg: 'bg-brand',
    emoji: '🧩',
  },
  {
    key: 'spelling',
    desc: '看中文释义和音标，限时拼出英文单词',
    rules: ['8 轮拼写挑战', '最多 3 次字母提示', '错 2 次自动揭示答案并进错题本'],
    bg: 'bg-blue text-white',
    emoji: '⌨️',
  },
  {
    key: 'listen',
    desc: '听发音选出正确的单词或句子',
    rules: ['10 道听辨题（单词+句子）', '每题最多重听 3 次', '凭耳朵不要靠蒙！'],
    bg: 'bg-coral text-white',
    emoji: '🎧',
  },
  {
    key: 'sentence',
    desc: '把打乱的单词卡片排成正确的英语句子',
    rules: ['5 个句子工厂订单', '点卡片组句、点回去撤销', '提交后朗读正确句子'],
    bg: 'bg-lav text-white',
    emoji: '🏭',
  },
  {
    key: 'grammar',
    desc: '化身侦探，找出句中语法错误并改正',
    rules: ['5 个语法案件', '点击错误单词再选正确改法', '小心：有的句子根本没有错误'],
    bg: 'bg-ink text-white',
    emoji: '🕵️',
  },
]

export default function GamesPage() {
  const { data: results } = useAsync(() => repo.getGameResults('stu-001'), [])
  const { data: counts } = useAsync(async () => {
    const keys: GameKey[] = ['match', 'spelling', 'listen', 'sentence', 'grammar']
    const list = await Promise.all(keys.map((k) => repo.getTodayPlayCount('stu-001', k)))
    return Object.fromEntries(keys.map((k, i) => [k, list[i]])) as Record<GameKey, number>
  }, [])

  const bestByGame = useMemo(() => {
    const m = {} as Record<GameKey, number>
    ;(results ?? []).forEach((r) => {
      m[r.game] = Math.max(m[r.game] ?? 0, r.score)
    })
    return m
  }, [results])

  const recent = useMemo(() => [...(results ?? [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [results])

  return (
    <div className="space-y-8">
      <div className="reveal bg-ink text-white rounded-[28px] border-[2.5px] border-ink shadow-hard p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-brand border-[2.5px] border-ink shadow-hard-xs flex items-center justify-center text-4xl shrink-0">
          <Gamepad2 className="w-10 h-10 text-ink" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black">游戏厅 · 边玩边涨积分</h1>
          <p className="font-bold text-white/70 text-sm">
            每个小游戏每天<b className="text-brand">前 3 局</b>会计入小组积分，之后随便玩但不重复计分。错题自动进入错题本。
          </p>
        </div>
      </div>

      <section>
        <SectionTitle icon="🎮" title="选择一个游戏开始" sub="5 个小游戏，全部可以完整玩一局" />
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {GAMES.map((g, i) => {
            const today = counts?.[g.key] ?? 0
            return (
              <Card key={g.key} hover className={`p-0 overflow-hidden reveal d${(i % 6) + 1}`}>
                <Link to={`/student/games/${g.key}`} className="block">
                  <div className={`${g.bg} px-6 py-5 border-b-[2.5px] border-ink flex items-center justify-between`}>
                    <span className="text-3xl">{g.emoji}</span>
                    <span className="font-black text-lg">{GAME_LABELS[g.key]}</span>
                    {today > 0 && (
                      <span className="text-xs font-black bg-ink text-brand px-2.5 py-1 rounded-full">
                        今日 {Math.min(today, 3)}/3 局{today > 3 ? '(已满)' : ''}
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="font-bold text-sm">{g.desc}</p>
                    <ul className="space-y-1.5">
                      {g.rules.map((r) => (
                        <li key={r} className="text-xs font-bold text-ink/60 flex gap-2">
                          <span className="text-brand">▸</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-1">
                      <span className="chip bg-paper">
                        <Trophy className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                        最高 {bestByGame[g.key] ?? 0} 分
                      </span>
                      <span className="btn btn-primary btn-sm pointer-events-none">开始游戏</span>
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
          <Card className="p-6 flex flex-col justify-center items-center text-center gap-3 bg-paper border-dashed">
            <Flame className="w-8 h-8 text-coral" />
            <p className="font-black">积分怎么算？</p>
            <p className="text-xs font-bold text-ink/60 leading-relaxed">
              成绩越好积分越多（5–50 分/局）。<br />
              小组积分 = 组员积分之和，<br />
              去<Link to="/student/leaderboard" className="text-blue underline">小组排名</Link>看看战况！
            </p>
          </Card>
        </div>
      </section>

      <section>
        <SectionTitle icon="🕹️" title="最近游戏记录" sub="最近 6 局成绩" />
        <Card className="p-2">
          {recent.length === 0 ? (
            <p className="p-6 text-center font-bold text-ink/40">还没有玩过任何游戏，快去开一局！</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>游戏</th>
                  <th>得分</th>
                  <th>正确率</th>
                  <th>用时</th>
                  <th>小组积分</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{r.date.slice(5, 16).replace('T', ' ')}</td>
                    <td className="font-black">{GAME_LABELS[r.game]}</td>
                    <td className="font-black text-blue">{r.score}</td>
                    <td>{r.accuracy}%</td>
                    <td>
                      <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      {Math.floor(r.durationSec / 60)}m{r.durationSec % 60}s
                    </td>
                    <td>
                      {r.pointsGained > 0 ? <span className="text-coral font-black">+{r.pointsGained}</span> : <span className="text-ink/30">不计分</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>
    </div>
  )
}
