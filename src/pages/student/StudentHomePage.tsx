import { Link } from 'react-router-dom'
import { Flame, Zap, Clock, ClipboardList, XCircle, Medal, Play, BookOpen, Headphones, BookMarked, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, StatCard, ProgressBar, Button, EmptyState, colorBG } from '../../components/ui'
import type { AssignmentWithStatus, Unit, WrongItem, LeaderboardEntry, ListeningProgram, ReadingArticle, StudentProgress } from '../../types'

export function StudentHomePage() {
  const { user } = useAuth()
  const sid = user?.id ?? 'stu-001'
  const { data: progress } = useAsync<StudentProgress>(() => repo.getStudentProgress(sid), [sid])
  const { data: assignments } = useAsync<AssignmentWithStatus[]>(() => repo.getAssignments(sid), [sid])
  const { data: wrongs } = useAsync<WrongItem[]>(() => repo.getWrongItems(sid, { status: 'active' }), [sid])
  const { data: board } = useAsync<LeaderboardEntry[]>(() => repo.getClassLeaderboard('class-701'), [sid])
  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])
  const { data: programs } = useAsync<ListeningProgram[]>(() => repo.getListeningPrograms(), [])
  const { data: articles } = useAsync<ReadingArticle[]>(() => repo.getReadingArticles(), [])

  if (!progress || !units) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>

  const pending = (assignments ?? []).filter((a) => a.status === 'pending')
  const myRank = (board ?? []).findIndex((b) => b.studentId === sid) + 1
  const expInLevel = progress.exp % 500
  const inProgressUnit = units.find((u) => (progress.unitCompletion[u.id] ?? 0) > 0 && (progress.unitCompletion[u.id] ?? 0) < 100) ?? units[3]
  const lastProgram = (programs ?? [])[1]
  const lastArticle = (articles ?? [])[0]
  const maxMinutes = Math.max(...progress.dailyMinutes.map((d) => d.minutes), 30)

  return (
    <div className="space-y-9">
      {/* —— 欢迎横幅 —— */}
      <div className="bg-ink text-white rounded-nbr-lg border-[3px] border-ink shadow-hard p-8 flex items-center justify-between gap-8 flex-wrap reveal">
        <div>
          <div className="chip bg-brand text-ink mb-3">{new Date().getMonth() + 1} 月 {new Date().getDate()} 日 · 今天也要一起变强</div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
            {user?.name}，继续你的
            <span className="text-brand">词句生长</span>之旅！
          </h1>
          <p className="text-white/60 font-semibold mt-3">当前等级 Lv.{progress.level} · 再积累 {500 - expInLevel} EXP 升级</p>
          <div className="mt-4 max-w-md">
            <div className="h-4 bg-white/15 rounded-full border-2 border-white/30 overflow-hidden">
              <div className="h-full bg-brand border-r-2 border-ink" style={{ width: `${(expInLevel / 500) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/student/units/${inProgressUnit.id}`} className="btn btn-primary btn-lg">
            <Play size={18} strokeWidth={3} /> 继续学习 {inProgressUnit.title}
          </Link>
        </div>
      </div>

      {/* —— 数据卡 —— */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="reveal d1"><StatCard icon={<Flame size={24} strokeWidth={2.5} />} label="连续学习" value={`${progress.streakDays} 天`} color="coral" sub="别断了，冲 15 天！" /></div>
        <div className="reveal d2"><StatCard icon={<Zap size={24} strokeWidth={2.5} />} label="经验值" value={`${progress.exp} EXP`} color="brand" sub={`Lv.${progress.level} · 距升级 ${500 - expInLevel}`} /></div>
        <div className="reveal d3"><StatCard icon={<Clock size={24} strokeWidth={2.5} />} label="本周学习" value={`${progress.weekMinutes} 分钟`} color="blue" sub={`今天 ${progress.todayMinutes} 分钟`} /></div>
        <div className="reveal d4"><StatCard icon={<Medal size={24} strokeWidth={2.5} />} label="小组排名" value={myRank > 0 ? `第 ${myRank} 名` : '—'} color="lav" sub={board?.[0]?.groupName ? `${board[0].groupName}领跑` : ''} /></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* —— 左列：今日任务 + 最近七天 —— */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="p-7 reveal d1">
            <SectionTitle title="今日任务" icon={<ClipboardList size={17} strokeWidth={2.8} />} sub="完成作业和小练习，积累 EXP 和小组积分" />
            {pending.length === 0 ? (
              <EmptyState icon="🎉" text="太棒了，所有作业都完成啦！去单词库或小游戏里加练一轮吧。" action={<Button to="/student/games" size="sm" variant="secondary">去小游戏</Button>} />
            ) : (
              <div className="space-y-3">
                {pending.map((a) => (
                  <Link key={a.id} to={`/student/assignment/${a.id}`} className="block">
                    <Card hover className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={`w-11 h-11 shrink-0 rounded-2xl border-[2.5px] border-ink flex items-center justify-center font-extrabold ${a.type === 'writing' ? 'bg-lav' : a.type === 'listening' ? 'bg-ice' : 'bg-brand'}`}>
                          {a.type === 'writing' ? '✍️' : a.type === 'listening' ? '🎧' : '📝'}
                        </span>
                        <div className="min-w-0">
                          <div className="font-extrabold truncate">{a.title}</div>
                          <div className="text-xs font-semibold text-ink/50 mt-0.5 truncate">{a.teacherName} 发布 · 截止 {a.dueDate}</div>
                        </div>
                      </div>
                      <span className="chip bg-coral text-white shrink-0">待完成</span>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-7 reveal d2">
            <SectionTitle title="最近七天学习趋势" icon={<Clock size={17} strokeWidth={2.8} />} sub={`本周合计 ${progress.weekMinutes} 分钟`} />
            <div className="flex items-end gap-3 h-40">
              {progress.dailyMinutes.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-extrabold">{d.minutes}</span>
                  <div
                    className={`w-full rounded-t-xl border-[2.5px] border-ink border-b-0 transition-all duration-500 ${i === progress.dailyMinutes.length - 1 ? 'bg-coral' : 'bg-brand'}`}
                    style={{ height: `${Math.max(6, (d.minutes / maxMinutes) * 110)}px` }}
                  />
                  <span className="text-[10px] font-bold text-ink/50">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* —— 右列 —— */}
        <div className="space-y-8">
          <Card className="p-6 reveal d3">
            <SectionTitle title="最近错题" icon={<XCircle size={17} strokeWidth={2.8} />} right={<Link to="/student/wrong-book" className="text-sm font-bold text-blue hover:underline">全部 →</Link>} />
            {(wrongs ?? []).slice(0, 3).map((w) => (
              <div key={w.key} className="rounded-2xl border-[2.5px] border-ink bg-paper p-3.5 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="chip !text-[10px] bg-coral text-white">{w.kind}</span>
                  <span className="text-[11px] font-bold text-ink/45">错 {w.wrongTimes} 次</span>
                </div>
                <p className="text-sm font-bold line-clamp-2">{w.question}</p>
                <p className="text-xs font-semibold text-ink/55 mt-1">正确答案：{w.correctAnswer}</p>
              </div>
            ))}
            {(wrongs ?? []).length === 0 && <p className="text-sm font-bold text-ink/40">暂无未掌握错题，继续保持！</p>}
          </Card>

          <Card className="p-6 reveal d4">
            <SectionTitle title="快捷入口" icon={<Zap size={17} strokeWidth={2.8} />} />
            <div className="space-y-3">
              <Link to={`/student/units/${inProgressUnit.id}`} className="block">
                <Card hover className={`p-4 flex items-center gap-3 ${colorBG.brand}`}>
                  <BookOpen size={20} strokeWidth={2.6} /> <b className="flex-1">单元学习 · {inProgressUnit.title}</b>
                  <ArrowRight size={16} strokeWidth={3} />
                </Card>
              </Link>
              {lastProgram && (
                <Link to={`/student/listening/${lastProgram.id}`} className="block">
                  <Card hover className="p-4 flex items-center gap-3 bg-ice">
                    <Headphones size={20} strokeWidth={2.6} /> <b className="flex-1">继续听 · {lastProgram.titleZh}</b>
                    <ArrowRight size={16} strokeWidth={3} />
                  </Card>
                </Link>
              )}
              {lastArticle && (
                <Link to={`/student/reading/${lastArticle.id}`} className="block">
                  <Card hover className="p-4 flex items-center gap-3 bg-lav text-white">
                    <BookMarked size={20} strokeWidth={2.6} /> <b className="flex-1">去阅读 · {lastArticle.titleZh}</b>
                    <ArrowRight size={16} strokeWidth={3} />
                  </Card>
                </Link>
              )}
            </div>
          </Card>

          <Card className="p-6 reveal d5">
            <SectionTitle title="我的掌握度" icon={<Medal size={17} strokeWidth={2.8} />} />
            <div className="space-y-3.5">
              <ProgressBar label="📚 词汇" value={progress.moduleMastery.vocabulary} color="brand" />
              <ProgressBar label="🧩 语法" value={progress.moduleMastery.grammar} color="blue" />
              <ProgressBar label="🎧 听力" value={progress.moduleMastery.listening} color="ice" />
              <ProgressBar label="📖 阅读" value={progress.moduleMastery.reading} color="lav" />
              <ProgressBar label="✍️ 写作" value={progress.moduleMastery.writing} color="coral" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
