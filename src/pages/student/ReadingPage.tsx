import { Link } from 'react-router-dom'
import { useState } from 'react'
import { BookOpen, Star, Clock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Tabs, EmptyState, DifficultyDots, colorBG } from '../../components/ui'
import type { ReadingArticle, ReadingRecord, Unit } from '../../types'

export function ReadingPage() {
  const [unitTab, setUnitTab] = useState('all')
  const [version, setVersion] = useState(0)
  const { data: articles } = useAsync<ReadingArticle[]>(() => repo.getReadingArticles(unitTab === 'all' ? {} : { unitId: unitTab }), [unitTab])
  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])
  const { data: records } = useAsync<Record<string, ReadingRecord>>(() => repo.getReadingRecords('stu-001'), [version])

  const unitOptions = [{ key: 'all', label: '全部单元' }, ...(units ?? []).map((u) => ({ key: u.id, label: `${u.kind === 'starter' ? 'S' : 'U'}${u.order} ${u.title}` }))]

  return (
    <div className="space-y-6">
      <SectionTitle title="阅读世界" sub="原创短文 · 读前导读 → 正文生词标记 → 段落理解 → 读后练习" />
      <Tabs items={unitOptions} value={unitTab} onChange={setUnitTab} />

      {(articles ?? []).length === 0 ? (
        <EmptyState icon="📚" text="该单元暂无阅读文章" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(articles ?? []).map((a, i) => (
            <ArticleCard key={a.id} a={a} i={i} record={records?.[a.id]} unitName={unitName(units, a.unitId)} onFavChange={() => setVersion((v) => v + 1)} />
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

function ArticleCard({ a, i, record, unitName, onFavChange }: { a: ReadingArticle; i: number; record?: ReadingRecord; unitName: string; onFavChange: () => void }) {
  const toggleFav = async () => {
    await repo.saveReadingProgress('stu-001', a.id, { favorite: !(record?.favorite ?? false) })
    onFavChange()
  }

  return (
    <Card hover className={`p-0 overflow-hidden reveal d${Math.min(8, i + 1)} flex flex-col`}>
      <div className={`${colorBG[a.difficulty === 1 ? 'brand' : a.difficulty === 2 ? 'ice' : 'lav']} border-b-[2.5px] border-ink px-5 py-4 flex items-center justify-between gap-3`}>
        <div className="min-w-0">
          <div className="text-lg font-extrabold truncate">{a.titleZh}</div>
          <div className="text-xs font-bold text-ink/60 truncate">{a.title}</div>
        </div>
        <span className="chip !text-[11px] bg-white shrink-0">{a.genre}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3">
        <p className="text-xs font-semibold text-ink/60 leading-relaxed line-clamp-3">{a.guide}</p>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-ink/50">
          <span className="chip !text-[10px] bg-paper">📍 {unitName}</span>
          <span className="chip !text-[10px] bg-paper">
            <Clock size={10} /> {a.wordCount} 词
          </span>
          <DifficultyDots level={a.difficulty} />
          {record?.finished && <span className="chip !text-[10px] bg-brand">✓ 已读完</span>}
          {record && !record.finished && record.lastParagraph > 0 && <span className="chip !text-[10px] bg-ice">读到第 {record.lastParagraph + 1} 段</span>}
        </div>
        <div className="mt-auto flex items-center gap-2.5">
          <Link to={`/student/reading/${a.id}`} className="btn btn-primary btn-md flex-1">
            <BookOpen size={15} /> {record?.finished ? '重新阅读' : record?.lastParagraph ? '继续阅读' : '开始阅读'}
          </Link>
          <button
            onClick={toggleFav}
            className={`w-11 h-11 shrink-0 rounded-2xl border-[2.5px] border-ink flex items-center justify-center hover:-translate-y-0.5 transition-transform ${record?.favorite ? 'bg-coral text-white' : 'bg-white'}`}
          >
            <Star size={17} strokeWidth={2.8} fill={record?.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </Card>
  )
}
