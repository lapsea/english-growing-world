import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Lock, Unlock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, ProgressBar, colorBG, colorText } from '../../components/ui'
import type { Unit, StudentProgress, Word } from '../../types'

const KIND_LABEL: Record<string, string> = { starter: 'Starter Unit', unit: 'Unit' }

export function UnitsPage() {
  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])
  const { data: progress } = useAsync<StudentProgress>(() => repo.getStudentProgress('stu-001'), [])

  if (!units || !progress) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>
  const starters = units.filter((u) => u.kind === 'starter')
  const mains = units.filter((u) => u.kind === 'unit')

  const renderGrid = (list: Unit[], offset: number) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {list.map((u, i) => {
        const done = progress.unitCompletion[u.id] ?? 0
        return (
          <Link key={u.id} to={`/student/units/${u.id}`} className={`reveal d${Math.min(8, (i + offset) % 8 + 1)}`}>
            <Card hover className="p-0 overflow-hidden h-full flex flex-col">
              <div className={`${colorBG[u.color]} border-b-[2.5px] border-ink p-5 flex items-start justify-between gap-3`}>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60">{KIND_LABEL[u.kind]} {u.kind === 'unit' ? u.order : u.order}</div>
                  <div className="text-2xl font-extrabold leading-tight mt-0.5">{u.title}</div>
                  <div className="font-bold text-sm mt-0.5 text-ink/70">{u.titleZh} · 教材 p.{u.page}</div>
                </div>
                <span className="w-12 h-12 shrink-0 rounded-2xl bg-white border-[2.5px] border-ink flex items-center justify-center font-display font-extrabold text-xl rotate-3">
                  {u.kind === 'starter' ? 'S' : u.order}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <p className="font-bold text-sm text-blue leading-snug">❓ {u.bigQuestion}</p>
                {u.bigIdea && <p className="text-xs font-bold text-ink/50">💡 {u.bigIdea}</p>}
                <div className="mt-auto space-y-2">
                  <ProgressBar value={done} color={done >= 100 ? 'brand' : 'blue'} height="h-3" />
                  <div className="flex items-center justify-between text-xs font-bold text-ink/50">
                    <span>{done >= 100 ? '🎉 已完成本单元' : `完成度 ${done}%`}</span>
                    <span className="flex items-center gap-1 text-blue">进入学习 <ArrowRight size={13} strokeWidth={3} /></span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-10">
      <div>
        <SectionTitle title="Starter Units · 起始单元" sub="小升初衔接：打招呼、学习用品、农场动物" />
        {renderGrid(starters, 1)}
      </div>
      <div>
        <SectionTitle title="正式单元 Unit 1–7" sub="按教材顺序学习：导学 → 单词 → 语法 → 听读写作 → 测验" />
        {renderGrid(mains, 2)}
      </div>
    </div>
  )
}

export function UnitDetailPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { data: unit } = useAsync<Unit | undefined>(() => repo.getUnitDetail(unitId!), [unitId])
  const { data: progress } = useAsync<StudentProgress>(() => repo.getStudentProgress('stu-001'), [])
  const { data: unitWords } = useAsync<Word[]>(() => repo.getWords({ unitId }), [unitId])

  if (!unit) return <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>
  const done = progress?.unitCompletion[unit.id] ?? 0

  return (
    <div className="space-y-8">
      {/* —— 单元头 —— */}
      <div className={`${colorBG[unit.color]} rounded-nbr-lg border-[3px] border-ink shadow-hard p-8 flex items-start justify-between gap-6 flex-wrap reveal`}>
        <div>
          <div className="chip bg-white mb-3">{unit.kind === 'starter' ? 'Starter Unit' : 'Unit'} {unit.order} · 教材 p.{unit.page}</div>
          <h1 className="font-display text-5xl font-extrabold leading-none">{unit.title}</h1>
          <p className="text-xl font-extrabold mt-2 text-ink/70">{unit.titleZh}</p>
          <p className="font-bold mt-4 text-lg">❓ {unit.bigQuestion}</p>
          {unit.bigIdea && <p className="font-bold mt-1 text-ink/60">💡 {unit.bigIdea}</p>}
        </div>
        <div className="bg-white rounded-2xl border-[2.5px] border-ink p-5 min-w-[240px]">
          <div className="text-xs font-extrabold text-ink/50 mb-1">单元完成度</div>
          <div className="text-4xl font-display font-extrabold">{done}%</div>
          <ProgressBar value={done} color="coral" height="h-3" />
          <div className="text-xs font-bold text-ink/50 mt-3">🔊 语音：{unit.pronunciation}</div>
          <div className="text-xs font-bold text-ink/50 mt-1">🎯 主题语境：{unit.themeContext}</div>
        </div>
      </div>

      {/* —— 单元导学 —— */}
      <Card className="p-7 reveal d1">
        <SectionTitle title="单元导学 · 学习目标" sub="学完本单元，你将能够：" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {unit.goals.map((g, i) => (
            <div key={i} className="flex gap-3 items-start rounded-2xl border-[2.5px] border-ink bg-paper p-4">
              <span className={`w-7 h-7 shrink-0 rounded-lg border-2 border-ink flex items-center justify-center font-extrabold text-sm ${colorBG[unit.color]}`}>{i + 1}</span>
              <p className="font-semibold text-sm leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* —— 核心单词 —— */}
        <Card className="p-7 reveal d2">
          <SectionTitle title="核心单词" sub={`${unitWords?.length ?? 0} 个词 · 去单词库筛选学习`} right={<button onClick={() => navigate(`/student/words?unit=${unit.id}`)} className="btn btn-secondary btn-sm">去单词库</button>} />
          <div className="flex flex-wrap gap-2">
            {(unitWords ?? []).slice(0, 18).map((w) => (
              <span key={w.id} className="chip bg-paper">
                {w.en} <span className="text-ink/40">{w.zh}</span>
              </span>
            ))}
          </div>
        </Card>

        {/* —— 重点短语 —— */}
        <Card className="p-7 reveal d3">
          <SectionTitle title="重点短语" sub="本单元常用搭配" />
          <div className="space-y-2.5">
            {unit.phrases.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border-[2.5px] border-ink bg-paper px-4 py-2.5">
                <span className="font-extrabold">{p.en}</span>
                <span className="font-semibold text-sm text-ink/60">{p.zh}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* —— 语法知识 —— */}
      <Card className="p-7 reveal d4">
        <SectionTitle title={unit.grammar.title} sub="语法知识精讲" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {unit.grammar.points.map((pt) => (
            <div key={pt.name} className="rounded-2xl border-[2.5px] border-ink overflow-hidden">
              <div className="bg-ink text-white px-4 py-3 font-extrabold">{pt.name}</div>
              <div className="p-4 bg-white">
                <p className="font-semibold text-sm leading-relaxed text-ink/80">{pt.explain}</p>
                <div className="mt-3 space-y-2">
                  {pt.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl bg-paper border-2 border-ink/15 px-3.5 py-2">
                      <div className={`font-extrabold text-sm ${colorText[unit.color]}`}>{ex.en}</div>
                      <div className="text-xs font-semibold text-ink/55">{ex.zh}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* —— 本单元任务 —— */}
      <Card className="p-7 reveal d5">
        <SectionTitle title="本单元学习任务" sub="听力、阅读、写作任务与单元测验（跳转到各能力中心）" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <TaskLink color="ice" icon="🎧" label="听力任务" count={unit.listeningIds.length} to={unit.listeningIds[0] ? `/student/listening/${unit.listeningIds[0]}` : '/student/listening'} empty={unit.listeningIds.length === 0} emptyText="本单元暂无听力节目" />
          <TaskLink color="lav" icon="📖" label="阅读任务" count={unit.readingIds.length} to={unit.readingIds[0] ? `/student/reading/${unit.readingIds[0]}` : '/student/reading'} empty={unit.readingIds.length === 0} emptyText="本单元暂无阅读文章" />
          <TaskLink color="coral" icon="✍️" label="写作任务" count={unit.writingTaskIds.length} to={unit.writingTaskIds[0] ? `/student/writing/${unit.writingTaskIds[0]}` : '/student/writing'} empty={unit.writingTaskIds.length === 0} emptyText="本单元暂无写作任务" />
          <QuizLink unitId={unit.id} unitTitle={unit.title} />
        </div>
      </Card>
    </div>
  )
}

function TaskLink({ color, icon, label, count, to, empty, emptyText }: { color: string; icon: string; label: string; count: number; to: string; empty: boolean; emptyText: string }) {
  const bg: Record<string, string> = { ice: 'bg-ice', lav: 'bg-lav', coral: 'bg-coral', brand: 'bg-brand' }
  return (
    <Link to={to} className="block">
      <Card hover className="p-5 h-full">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="font-extrabold">{label}</div>
        <div className="text-xs font-semibold text-ink/50 mt-1">{empty ? emptyText : `${count} 个任务，点击直达`}</div>
        <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full border-2 border-ink ${bg[color]} ${empty ? 'opacity-50' : ''}`}>
          {empty ? <Lock size={12} /> : <Unlock size={12} />} {empty ? '去能力中心' : '开始'}
        </div>
      </Card>
    </Link>
  )
}

function QuizLink({ unitId, unitTitle }: { unitId: string; unitTitle: string }) {
  return (
    <Link to={`/student/quiz/${unitId}`} className="block">
      <Card hover className="p-5 h-full">
        <div className="text-3xl mb-2">🏆</div>
        <div className="font-extrabold">单元测验</div>
        <div className="text-xs font-semibold text-ink/50 mt-1">{unitTitle} 综合检测 6 题</div>
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full border-2 border-ink bg-brand">⚡ 开始测验</div>
      </Card>
    </Link>
  )
}
