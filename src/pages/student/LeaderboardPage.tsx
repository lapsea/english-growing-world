import { useMemo } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { GAME_LABELS, MODULE_LABELS } from '../../types'
import { Card, SectionTitle, ProgressBar } from '../../components/ui'
import { Medal, Users, Trophy } from 'lucide-react'

const medalColor = (rank: number) => (rank === 0 ? 'bg-brand' : rank === 1 ? 'bg-ice' : rank === 2 ? 'bg-coral text-white' : 'bg-paper')

export default function LeaderboardPage() {
  const version = useRepoVersion()
  const { data: standings } = useAsync(() => repo.getGroupStandings('class-701'), [version])
  const { data: board } = useAsync(() => repo.getClassLeaderboard('class-701'), [version])
  const { data: progress } = useAsync(() => repo.getStudentProgress('stu-001'), [version])
  const { data: exams } = useAsync(() => repo.getExams(), [version])
  const { data: myGameResults } = useAsync(() => repo.getGameResults('stu-001'), [version])

  const myRank = useMemo(() => board?.findIndex((b) => b.studentId === 'stu-001') ?? -1, [board])
  const myPoints = board?.find((b) => b.studentId === 'stu-001')?.points ?? 0

  const gameBest = useMemo(() => {
    const m: Record<string, number> = {}
    ;(myGameResults ?? []).forEach((r) => {
      m[r.game] = Math.max(m[r.game] ?? 0, r.score)
    })
    return GAME_LABELS ? Object.entries(GAME_LABELS).map(([k, label]) => ({ key: k, label, best: m[k] ?? 0 })) : []
  }, [myGameResults])


  return (
    <div className="space-y-8">
      <div className="reveal bg-ink text-white rounded-[28px] border-[2.5px] border-ink shadow-hard p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-brand border-[2.5px] border-ink shadow-hard-xs flex items-center justify-center shrink-0">
          <Trophy className="w-10 h-10 text-ink" />
        </div>
        <div>
          <h1 className="text-3xl font-black">排行榜 · 小组与个人</h1>
          <p className="font-bold text-white/70 text-sm mt-1">
            积分来源：答题、作业、考试挑战、小游戏（每游戏每天前 3 局）。你的当前排名：第 <b className="text-brand">{myRank + 1 || '-'}</b> 名 · {myPoints} 分
          </p>
        </div>
      </div>

      <section>
        <SectionTitle icon="🚩" title="小组积分对抗" sub="两个小组的每周积分对决" />
        <div className="grid md:grid-cols-2 gap-5">
          {(standings ?? []).map((s, i) => (
            <Card key={s.group.id} hover className={`p-6 space-y-4 ${i === 0 ? 'border-brand' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl border-[2.5px] border-ink flex items-center justify-center font-black text-lg ${medalColor(s.rank - 1)}`}>
                    #{s.rank}
                  </div>
                  <div>
                    <div className="font-black text-xl">{s.group.name}</div>
                    <div className="text-xs font-bold text-ink/50 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {s.group.memberIds.length} 名成员 · {s.group.motto}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-coral">{s.totalPoints}</div>
                  <div className="text-xs font-bold text-ink/50">总积分</div>
                </div>
              </div>
              {standings && standings.length === 2 && (
                <ProgressBar
                  value={(s.totalPoints / Math.max(...standings.map((x) => x.totalPoints), 1)) * 100}
                  color={s.group.color}
                  height="h-3.5"
                />
              )}
              <p className="text-xs font-bold text-ink/40">
                {s.rank === 1 ? '👑 目前领先！' : `落后第 1 名 ${Math.max(...(standings ?? []).map((x) => x.totalPoints)) - s.totalPoints} 分`}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div>
          <SectionTitle icon="🏅" title="个人积分榜" sub="全班 6 名同学的积分排名" />
          <Card className="p-2">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="w-14">名次</th>
                  <th>同学</th>
                  <th>小组</th>
                  <th>积分</th>
                  <th>经验</th>
                </tr>
              </thead>
              <tbody>
                {(board ?? []).map((b, i) => (
                  <tr key={b.studentId} className={b.studentId === 'stu-001' ? 'bg-brand/25' : ''}>
                    <td>
                      <span className={`inline-flex w-8 h-8 rounded-full border-2 border-ink items-center justify-center font-black text-sm ${medalColor(i)}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="font-black">
                      {b.name}
                      {b.studentId === 'stu-001' && <span className="ml-1.5 text-[10px] bg-ink text-brand px-1.5 py-0.5 rounded-full align-middle">我</span>}
                    </td>
                    <td className="text-xs font-bold text-ink/60">{b.groupName}</td>
                    <td className="font-black text-coral">{b.points}</td>
                    <td className="font-bold text-ink/60">{b.exp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle icon="🎮" title="我的游戏最高分" sub="每个游戏的个人纪录" />
            <Card className="p-5 space-y-3">
              {gameBest.map((g) => (
                <div key={g.key} className="flex items-center justify-between">
                  <span className="font-bold text-sm">{g.label}</span>
                  <span className={`chip ${g.best > 0 ? 'bg-brand' : 'bg-paper'}`}>{g.best > 0 ? `${g.best} 分` : '未挑战'}</span>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <SectionTitle icon="⭐" title="我的能力数据" sub="等级与各模块掌握度" />
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between font-black">
                <span>Lv.{progress?.level} · {progress?.exp} EXP</span>
                <span className="text-xs font-bold text-ink/50">连续学习 {progress?.streakDays} 天</span>
              </div>
              {progress &&
                Object.entries(progress.moduleMastery).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{MODULE_LABELS[k as keyof typeof MODULE_LABELS]}</span>
                      <span>{Math.round(v * 100)}%</span>
                    </div>
                    <ProgressBar value={v * 100} color={v >= 0.6 ? 'brand' : v >= 0.35 ? 'blue' : 'coral'} height="h-2.5" />
                  </div>
                ))}
            </Card>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle icon="📝" title="考试挑战最好成绩" sub="全班同学在每场考试中的最高分" />
        <div className="grid md:grid-cols-2 gap-5">
          {(exams ?? []).map((e) => (
            <ExamBestCard key={e.id} examId={e.id} title={e.title} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ExamBestCard({ examId, title }: { examId: string; title: string }) {
  const { data: rows } = useAsync(() => repo.getExamLeaderboard(examId), [])
  return (
    <Card className="p-5 space-y-3">
      <div className="font-black flex items-center gap-2">
        <Medal className="w-5 h-5 text-coral" />
        {title}
      </div>
      {(rows ?? []).slice(0, 3).map((r, i) => (
        <div key={r.studentId} className="flex items-center justify-between text-sm font-bold">
          <span>
            <span className={`inline-flex w-6 h-6 rounded-full border-2 border-ink items-center justify-center text-xs font-black mr-2 ${medalColor(i)}`}>
              {i + 1}
            </span>
            {r.name}
          </span>
          <span className="font-black text-blue">{r.score} 分</span>
        </div>
      ))}
      {(rows ?? []).length === 0 && <p className="text-sm font-bold text-ink/40">还没有同学挑战过</p>}
    </Card>
  )
}
