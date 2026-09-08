import { Link } from 'react-router-dom'
import { Play, Headphones, Star, Clock } from 'lucide-react'
import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Tabs, EmptyState, DifficultyDots, colorBG } from '../../components/ui'
import type { ListeningProgram, ListeningRecord, Unit } from '../../types'

const TYPE_LABEL: Record<string, { text: string; cls: string }> = {
  words: { text: '单词', cls: 'bg-brand' },
  sentences: { text: '短句', cls: 'bg-ice' },
  dialogue: { text: '情景对话', cls: 'bg-lav' },
}

export function ListeningPage() {
  const [tab, setTab] = useState<'all' | 'words' | 'sentences' | 'dialogue'>('all')
  const { data: programs } = useAsync<ListeningProgram[]>(() => repo.getListeningPrograms(tab === 'all' ? {} : { type: tab }), [tab])
  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])

  return (
    <div className="space-y-6">
      <SectionTitle title="听力电台" sub="按单元与主题组织：听前关键词 → 听中答题 → 听后原文解析" right={<Tabs items={[{ key: 'all', label: '全部' }, { key: 'words', label: '单词' }, { key: 'sentences', label: '短句' }, { key: 'dialogue', label: '对话' }]} value={tab} onChange={setTab} />} />

      {(programs ?? []).length === 0 ? (
        <EmptyState icon="🎧" text="该类型暂无节目" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(programs ?? []).map((p, i) => (
            <ProgramCard key={p.id} p={p} i={i} unitName={unitName(units, p.unitId)} />
          ))}
        </div>
      )}
    </div>
  )
}

function unitName(units: Unit[] | undefined, id: string): string {
  const u = units?.find((x) => x.id === id)
  return u ? `${u.kind === 'starter' ? 'Starter' : 'Unit'} ${u.order} · ${u.title}` : id
}

function ProgramCard({ p, i, unitName }: { p: ListeningProgram; i: number; unitName: string }) {
  const { data: record, reload } = useAsync<ListeningRecord | undefined>(() => repo.getListeningRecord('stu-001', p.id), [p.id])
  const t = TYPE_LABEL[p.type]
  const toggleFav = async () => {
    await repo.saveListeningProgress('stu-001', p.id, { favorite: !(record?.favorite ?? false) })
    reload()
  }

  return (
    <Card hover className={`p-0 overflow-hidden reveal d${Math.min(8, i + 1)} flex flex-col`}>
      <div className={`${colorBG[p.difficulty === 1 ? 'brand' : p.difficulty === 2 ? 'ice' : 'lav']} border-b-[2.5px] border-ink px-5 py-4 flex items-center justify-between gap-3`}>
        <div className="min-w-0">
          <div className="text-lg font-extrabold truncate">{p.titleZh}</div>
          <div className="text-xs font-bold text-ink/60 truncate">{p.title}</div>
        </div>
        <span className={`chip !text-[11px] shrink-0 ${t.cls}`}>{t.text}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-ink/50">
          <span className="chip !text-[10px] bg-paper">📍 {unitName}</span>
          <span className="chip !text-[10px] bg-paper">🏷 {p.theme}</span>
          <span className="chip !text-[10px] bg-paper">
            <Clock size={10} /> 约 {p.durationMin} 分钟
          </span>
          <DifficultyDots level={p.difficulty} />
        </div>
        <div className="text-xs font-semibold text-ink/55 leading-relaxed">
          关键词：{p.keywords.slice(0, 4).map((k) => k.en).join(' · ')}
        </div>
        <div className="mt-auto flex items-center gap-2.5">
          <Link to={`/student/listening/${p.id}`} className="btn btn-primary btn-md flex-1">
            {record?.lastLine ? <Play size={15} /> : <Headphones size={15} />} {record?.lastLine ? `继续播放（第 ${record.lastLine + 1} 句）` : '开始收听'}
          </Link>
          <button
            onClick={toggleFav}
            className={`w-11 h-11 shrink-0 rounded-2xl border-[2.5px] border-ink flex items-center justify-center hover:-translate-y-0.5 transition-transform ${record?.favorite ? 'bg-coral text-white' : 'bg-white'}`}
            title="收藏节目"
          >
            <Star size={17} strokeWidth={2.8} fill={record?.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        {record?.bestScore != null && (
          <div className="text-xs font-extrabold text-ink/45">
            已练 {record.plays} 次 · 最高正确率 {record.bestScore}%
          </div>
        )}
      </div>
    </Card>
  )
}
