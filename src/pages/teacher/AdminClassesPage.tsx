import { useMemo } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Chip, ProgressBar, Avatar } from '../../components/ui'
import { School, Users, Trophy } from 'lucide-react'

export function AdminClassesPage() {
  const version = useRepoVersion()
  const { data: cls } = useAsync(() => repo.getClass(), [version])
  const { data: groups } = useAsync(() => repo.getGroups(), [version])
  const { data: students } = useAsync(() => repo.getStudents(), [version])
  const { data: teachers } = useAsync(() => repo.getAllUsers().then((us) => us.filter((u) => u.role === 'teacher')), [version])
  const { data: board } = useAsync(() => repo.getClassLeaderboard('class-701'), [version])
  const { data: standings } = useAsync(() => repo.getGroupStandings('class-701'), [version])
  const { data: records } = useAsync(() => repo.getExamRecordsForClass(), [version])

  const progresses = useAsync(
    async () => Promise.all((students ?? []).map((s) => repo.getStudentProgress(s.id))),
    [students, version]
  ).data

  const classAvgMinutes = useMemo(() => {
    if (!progresses || progresses.length === 0) return 0
    return Math.round(progresses.reduce((s, p) => s + p.weekMinutes, 0) / progresses.length)
  }, [progresses])

  const totalGamePlays = useMemo(
    () => progresses?.reduce((s, p) => s + (p.badges.filter((b) => b.got).length), 0) ?? 0,
    [progresses]
  )

  return (
    <div className="space-y-6">
      <SectionTitle icon="🏫" title="班级数据" sub="班级、小组与学生的整体情况" />

      <div className="grid md:grid-cols-3 gap-5">
        <Card hover className="p-6 space-y-3 reveal d1">
          <div className="w-12 h-12 rounded-2xl border-[2.5px] border-ink bg-brand flex items-center justify-center">
            <School className="w-6 h-6 text-ink" />
          </div>
          <div className="font-black text-xl">{cls?.name}</div>
          <div className="flex flex-wrap gap-1.5">
            <Chip bg="paper">{cls?.grade}</Chip>
            <Chip bg="paper">学生 {cls?.studentIds.length ?? 0} 人</Chip>
            <Chip bg="paper">小组 {groups?.length ?? 0} 个</Chip>
          </div>
          <p className="text-xs font-bold text-ink/50">带班老师：{teachers?.map((t) => t.name).join('、') || '—'}</p>
        </Card>

        <Card hover className="p-6 space-y-3 reveal d2">
          <div className="w-12 h-12 rounded-2xl border-[2.5px] border-ink bg-ice flex items-center justify-center">
            <Users className="w-6 h-6 text-ink" />
          </div>
          <div className="font-black text-xl">平均每周学习</div>
          <div className="text-3xl font-black text-blue">{classAvgMinutes} 分钟</div>
          <p className="text-xs font-bold text-ink/50">基于 {students?.length ?? 0} 名学生的本周学习时长均值</p>
        </Card>

        <Card hover className="p-6 space-y-3 reveal d3">
          <div className="w-12 h-12 rounded-2xl border-[2.5px] border-ink bg-coral flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="font-black text-xl">考试参与</div>
          <div className="text-3xl font-black text-coral">{records?.length ?? 0} 人次</div>
          <p className="text-xs font-bold text-ink/50">全班累计完成考试挑战人次 · 徽章获得 {totalGamePlays} 枚</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section>
          <SectionTitle icon="🚩" title="小组数据" sub="两个学习小组的积分与成员" />
          <div className="space-y-4">
            {(standings ?? []).map((s) => (
              <Card key={s.group.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-lg">
                    第 {s.rank} 名 · {s.group.name}
                  </span>
                  <span className="font-black text-coral text-xl">{s.totalPoints} 分</span>
                </div>
                <ProgressBar value={(s.totalPoints / Math.max(1, Math.max(...(standings ?? []).map((x) => x.totalPoints)))) * 100} color={s.group.color} height="h-3" />
                <div className="flex flex-wrap gap-2">
                  {(students ?? [])
                    .filter((st) => s.group.memberIds.includes(st.id))
                    .map((m) => (
                      <span key={m.id} className="chip bg-paper text-xs">
                        <Avatar emoji={m.avatar} size="sm" color="ice" />
                        {m.name}
                      </span>
                    ))}
                </div>
                <p className="text-[11px] font-bold text-ink/40">基础积分 {s.group.points} · 口号「{s.group.motto}」</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon="🏅" title="学生积分排行" sub="全班个人积分榜" />
          <Card className="p-2">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="w-14">名次</th>
                  <th>学生</th>
                  <th>小组</th>
                  <th>积分</th>
                  <th>等级</th>
                </tr>
              </thead>
              <tbody>
                {(board ?? []).map((b, i) => (
                  <tr key={b.studentId}>
                    <td className="font-black">{i + 1}</td>
                    <td className="font-bold">{b.name}</td>
                    <td className="text-xs font-bold text-ink/60">{b.groupName}</td>
                    <td className="font-black text-coral">{b.points}</td>
                    <td>
                      <Chip bg="brand text-xs">Lv.{Math.floor(b.exp / 500) + 1}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      </div>

      <section>
        <SectionTitle icon="📈" title="学生学习明细" sub="每个学生的核心数据" />
        <Card className="p-2 overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>学生</th>
                <th>连续天数</th>
                <th>经验</th>
                <th>本周时长</th>
                <th>作业完成率</th>
                <th>词汇掌握</th>
              </tr>
            </thead>
            <tbody>
              {(students ?? []).map((s, i) => {
                const p = progresses?.[i]
                const assignRate = p && p.assignmentTotal ? Math.round((p.assignmentDone / p.assignmentTotal) * 100) : 0
                return (
                  <tr key={s.id}>
                    <td className="font-black flex items-center gap-2">
                      <Avatar emoji={s.avatar} size="sm" color="brand" />
                      {s.name}
                    </td>
                    <td className="font-bold">{p?.streakDays ?? '—'} 天</td>
                    <td className="font-bold">{p?.exp ?? '—'}</td>
                    <td className="font-bold">{p?.weekMinutes ?? '—'} 分</td>
                    <td>
                      <span className={`chip text-xs ${assignRate >= 80 ? 'bg-brand' : assignRate >= 50 ? 'bg-ice' : 'bg-coral text-white'}`}>{assignRate}%</span>
                    </td>
                    <td className="font-bold">{p ? `${Math.round(p.moduleMastery.vocabulary * 100)}%` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  )
}
