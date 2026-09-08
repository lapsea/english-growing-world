import { useMemo } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { MODULE_LABELS, GAME_LABELS, type GameKey, type StudentProgress } from '../../types'
import { Card, SectionTitle, ProgressBar, Chip, Avatar } from '../../components/ui'
import { Medal, Flame, TrendingUp, Users } from 'lucide-react'

/** 班级学情（ranking=true 时为周挑战和排行榜视图） */
export function TeacherAnalyticsPage({ ranking = false }: { ranking?: boolean }) {
  const version = useRepoVersion()
  const { data: students } = useAsync(() => repo.getStudents(), [version])
  const { data: standings } = useAsync(() => repo.getGroupStandings('class-701'), [version])
  const { data: board } = useAsync(() => repo.getClassLeaderboard('class-701'), [version])
  const { data: wrongs } = useAsync(() => repo.getWrongItems('stu-001'), [version])
  const { data: records } = useAsync(() => repo.getExamRecordsForClass(), [version])

  const progresses = useAsync(
    async () => Promise.all((students ?? []).map((s) => repo.getStudentProgress(s.id))),
    [students, version]
  ).data

  const classStats = useMemo(() => {
    if (!progresses || progresses.length === 0) return null
    const avg = (f: (p: StudentProgress) => number) => progresses.reduce((s, p) => s + f(p), 0) / progresses.length
    return {
      streak: Math.round(avg((p) => p.streakDays)),
      weekMin: Math.round(avg((p) => p.weekMinutes)),
      level: Math.round(avg((p) => p.level)),
      assignRate: Math.round(avg((p) => (p.assignmentTotal ? (p.assignmentDone / p.assignmentTotal) * 100 : 0))),
    }
  }, [progresses])

  const moduleAvg = useMemo(() => {
    if (!progresses || progresses.length === 0) return null
    const keys = Object.keys(MODULE_LABELS) as (keyof typeof MODULE_LABELS)[]
    const out = {} as Record<string, number>
    keys.forEach((k) => {
      out[k] = progresses.reduce((s, p) => s + (p.moduleMastery[k] ?? 0), 0) / progresses.length
    })
    return out
  }, [progresses])

  const highFreqWrong = useMemo(() => {
    const m = new Map<string, number>()
    ;(wrongs ?? []).forEach((w) => m.set(w.question, Math.max(m.get(w.question) ?? 0, w.wrongTimes)))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [wrongs])

  const gameParticipation = useAsync(async () => {
    const keys: GameKey[] = ['match', 'spelling', 'listen', 'sentence', 'grammar']
    const out: Record<string, number> = {}
    for (const k of keys) {
      let total = 0
      for (const s of students ?? []) {
        total += (await repo.getGameResults(s.id, k)).length
      }
      out[k] = total
    }
    return out
  }, [students, version]).data

  if (ranking) {
    return (
      <div className="space-y-6">
        <SectionTitle icon="🏅" title="周挑战和排行榜" sub="小组积分对抗与个人积分榜（数据实时计算）" />

        <div className="grid md:grid-cols-2 gap-5">
          {(standings ?? []).map((s, i) => (
            <Card key={s.group.id} hover className={`p-6 space-y-3 reveal d${i + 1}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl border-[2.5px] border-ink flex items-center justify-center font-black ${i === 0 ? 'bg-brand' : 'bg-ice'}`}>
                    #{s.rank}
                  </div>
                  <div>
                    <div className="font-black text-xl">{s.group.name}</div>
                    <div className="text-xs font-bold text-ink/40">{s.group.motto}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-coral">{s.totalPoints}</div>
                  <div className="text-xs font-bold text-ink/40">总积分</div>
                </div>
              </div>
              <ProgressBar value={(s.totalPoints / Math.max(1, Math.max(...(standings ?? []).map((x) => x.totalPoints)))) * 100} color={s.group.color} height="h-3.5" />
              <div className="flex flex-wrap gap-2 pt-1">
                {(students ?? []).filter((st) => s.group.memberIds.includes(st.id)).map((m) => {
                  const entry = board?.find((b) => b.studentId === m.id)
                  return (
                    <span key={m.id} className="chip bg-paper text-xs">
                      <Avatar emoji={m.avatar} size="sm" color="ice" />
                      {m.name} · {entry?.points ?? 0} 分
                    </span>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>

        <section>
          <SectionTitle icon="🥇" title="个人积分榜" sub="全部学生按积分排序" />
          <Card className="p-2">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="w-16">名次</th>
                  <th>学生</th>
                  <th>小组</th>
                  <th>本周积分</th>
                  <th>经验值</th>
                </tr>
              </thead>
              <tbody>
                {(board ?? []).map((b, i) => (
                  <tr key={b.studentId}>
                    <td>
                      <span className={`inline-flex w-8 h-8 rounded-full border-2 border-ink items-center justify-center font-black text-sm ${i === 0 ? 'bg-brand' : i === 1 ? 'bg-ice' : i === 2 ? 'bg-coral text-white' : 'bg-paper'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="font-black">{b.name}</td>
                    <td className="text-xs font-bold text-ink/60">{b.groupName}</td>
                    <td className="font-black text-coral">{b.points}</td>
                    <td className="font-bold text-ink/60">{b.exp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <Card className="p-5 bg-paper space-y-2">
          <div className="font-black flex items-center gap-2">
            <Flame className="w-4 h-4 text-coral" /> 积分规则
          </div>
          <p className="text-sm font-bold text-ink/60">
            答对 +10/题 · 答错 +2/题 · 作业完成 +30/份 · 考试挑战 +考试得分 · 小游戏 每游戏每天前 3 局（5–50 分/局）。
            小组积分 = 基础分 + 组员积分之和。
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon="📊" title="班级学情" sub="701 班整体学习情况一屏掌握" />

      {classStats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { icon: Flame, label: '平均连续学习天数', value: `${classStats.streak} 天`, bg: 'bg-brand' },
            { icon: TrendingUp, label: '平均本周时长', value: `${classStats.weekMin} 分钟`, bg: 'bg-ice' },
            { icon: Medal, label: '平均经验等级', value: `Lv.${classStats.level}`, bg: 'bg-lav/60' },
            { icon: Users, label: '平均作业完成率', value: `${classStats.assignRate}%`, bg: 'bg-coral text-white' },
          ].map((s, i) => (
            <Card key={s.label} hover className={`p-5 reveal d${i + 1}`}>
              <div className={`w-11 h-11 rounded-xl border-2 border-ink ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-ink" />
              </div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs font-bold text-ink/50 mt-1">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section>
          <SectionTitle icon="🧩" title="各模块平均掌握度" sub="全班在五大模块上的表现" />
          <Card className="p-5 space-y-3.5">
            {moduleAvg &&
              (Object.keys(moduleAvg) as string[]).map((k) => (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{MODULE_LABELS[k as keyof typeof MODULE_LABELS]}</span>
                    <span>{Math.round(moduleAvg[k] * 100)}%</span>
                  </div>
                  <ProgressBar value={moduleAvg[k] * 100} color={moduleAvg[k] >= 0.5 ? 'brand' : moduleAvg[k] >= 0.3 ? 'blue' : 'coral'} height="h-3" />
                </div>
              ))}
          </Card>
        </section>

        <section>
          <SectionTitle icon="🎯" title="班级高频错题 TOP6" sub="来自学生错题本的高频错误" />
          <Card className="p-5 space-y-2.5">
            {highFreqWrong.map(([q, times], i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={`shrink-0 w-6 h-6 rounded-lg border-2 border-ink flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-coral text-white' : 'bg-paper'}`}>
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-ink/80 flex-1">{q.length > 42 ? q.slice(0, 42) + '…' : q}</span>
                <Chip bg="ink text-white text-xs">错 {times} 次</Chip>
              </div>
            ))}
            {highFreqWrong.length === 0 && <p className="text-sm font-bold text-ink/40">暂无错题数据</p>}
          </Card>
        </section>
      </div>

      <section>
        <SectionTitle icon="🎮" title="小游戏参与热度" sub="各游戏全班累计完成局数" />
        <Card className="p-5 grid md:grid-cols-5 gap-4">
          {(Object.keys(GAME_LABELS) as GameKey[]).map((g) => (
            <div key={g} className="rounded-2xl border-2 border-ink bg-paper p-4 text-center space-y-1.5">
              <div className="text-2xl font-black text-coral">{gameParticipation?.[g] ?? 0}</div>
              <div className="text-xs font-bold">{GAME_LABELS[g]}</div>
              <div className="text-[10px] font-bold text-ink/40">累计局数</div>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <SectionTitle icon="📋" title="学生明细" sub="每个学生的核心学习指标" />
        <Card className="p-2">
          <table className="tbl">
            <thead>
              <tr>
                <th>学生</th>
                <th>等级</th>
                <th>连续天数</th>
                <th>本周时长</th>
                <th>作业完成</th>
                <th>考试均分</th>
              </tr>
            </thead>
            <tbody>
              {(students ?? []).map((s) => (
                <StudentRow key={s.id} studentId={s.id} name={s.name} />
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  )
}

function StudentRow({ studentId, name }: { studentId: string; name: string }) {
  const { data: p } = useAsync(() => repo.getStudentProgress(studentId), [])
  const { data: exams } = useAsync(() => repo.getExamHistory(studentId), [])
  const examAvg = exams && exams.length ? Math.round(exams.reduce((s, e) => s + e.score, 0) / exams.length) : 0
  return (
    <tr>
      <td className="font-black">{name}</td>
      <td>
        <Chip bg="brand text-xs">Lv.{p?.level ?? '—'}</Chip>
      </td>
      <td className="font-bold">{p?.streakDays ?? '—'} 天</td>
      <td className="font-bold">{p?.weekMinutes ?? '—'} 分</td>
      <td className="font-bold">
        {p ? `${p.assignmentDone}/${p.assignmentTotal}` : '—'}
      </td>
      <td className={`font-black ${examAvg >= 80 ? 'text-blue' : examAvg > 0 ? 'text-coral' : 'text-ink/30'}`}>
        {examAvg > 0 ? `${examAvg} 分` : '未参加'}
      </td>
    </tr>
  )
}
