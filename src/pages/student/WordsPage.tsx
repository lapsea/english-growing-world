import { useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Search, Star, Volume2, Turtle, Check } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { speech } from '../../services/audio'
import { Card, SectionTitle, Tabs, EmptyState, Button, Modal } from '../../components/ui'
import type { Unit, WordWithState, MasteryStatus } from '../../types'

const MASTERY_TABS = [
  { key: 'all', label: '全部' },
  { key: 'unlearned', label: '未学' },
  { key: 'learning', label: '学习中' },
  { key: 'mastered', label: '已掌握' },
  { key: 'fav', label: '⭐ 收藏' },
] as const

const MASTERY_BADGE: Record<MasteryStatus, { text: string; cls: string }> = {
  unlearned: { text: '未学', cls: 'bg-white' },
  learning: { text: '学习中', cls: 'bg-ice' },
  mastered: { text: '已掌握', cls: 'bg-brand' },
}

export function WordsPage() {
  const [params, setParams] = useSearchParams()
  const unitId = params.get('unit') ?? ''
  const [keyword, setKeyword] = useState('')
  const [pos, setPos] = useState('')
  const [masteryTab, setMasteryTab] = useState<(typeof MASTERY_TABS)[number]['key']>('all')
  const [detail, setDetail] = useState<WordWithState | null>(null)
  const [version, setVersion] = useState(0)

  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])
  const { data: words, loading } = useAsync<WordWithState[]>(
    () =>
      repo.getWords({
        unitId: unitId || undefined,
        keyword: keyword || undefined,
        pos: pos || undefined,
        mastery: masteryTab === 'unlearned' || masteryTab === 'learning' || masteryTab === 'mastered' ? masteryTab : undefined,
        favorite: masteryTab === 'fav' || undefined,
      }),
    [unitId, keyword, pos, masteryTab, version]
  )

  const posOptions = useMemo(() => {
    const set = new Set((words ?? []).map((w) => w.pos))
    return Array.from(set).sort()
  }, [words])

  const toggleFav = async (w: WordWithState) => {
    await repo.toggleFavoriteWord(w.id)
    setDetail((d) => (d && d.id === w.id ? { ...d, favorite: !d.favorite } : d))
    setVersion((v) => v + 1)
  }

  const setMastery = async (w: WordWithState, status: MasteryStatus) => {
    await repo.setWordMastery(w.id, status)
    setDetail((d) => (d && d.id === w.id ? { ...d, mastery: status } : d))
    setVersion((v) => v + 1)
  }

  const unitName = (id: string) => {
    const u = units?.find((x) => x.id === id)
    return u ? `${u.kind === 'starter' ? 'S' : 'U'}${u.order} ${u.title}` : id
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="单词库" sub="人教版七上全部核心词汇 · 支持搜索、筛选、发音与掌握度管理" />

      {/* —— 筛选区 —— */}
      <Card className="p-5 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" strokeWidth={2.6} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索单词或中文释义…"
              className="field pl-11"
            />
          </div>
          <select value={unitId} onChange={(e) => setParams(e.target.value ? { unit: e.target.value } : {})} className="field max-w-[240px]">
            <option value="">全部单元</option>
            {(units ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.kind === 'starter' ? 'Starter' : 'Unit'} {u.order} · {u.title}
              </option>
            ))}
          </select>
          <select value={pos} onChange={(e) => setPos(e.target.value)} className="field max-w-[150px]">
            <option value="">全部词性</option>
            {posOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <Tabs items={MASTERY_TABS.map((t) => ({ key: t.key, label: t.label }))} value={masteryTab} onChange={setMasteryTab} />
      </Card>

      {/* —— 单词网格 —— */}
      {loading ? (
        <div className="font-bold text-ink/40 py-20 text-center">加载中…</div>
      ) : (words ?? []).length === 0 ? (
        <EmptyState icon="🔍" text="没有符合条件的单词，换个筛选试试" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(words ?? []).map((w, i) => (
            <Card key={w.id} hover onClick={() => setDetail(w)} className={`p-5 reveal d${Math.min(8, (i % 8) + 1)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-extrabold">{w.en}</span>
                    <span className="text-xs font-bold text-ink/40">{w.pos}</span>
                    <span className={`chip !text-[10px] ${MASTERY_BADGE[w.mastery].cls}`}>{MASTERY_BADGE[w.mastery].text}</span>
                  </div>
                  <div className="text-sm font-bold text-blue mt-0.5">{w.phonetic}</div>
                  <div className="font-bold text-ink/80 mt-1">{w.zh}</div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); speech.speak(w.en, { rate: 1 }) }}
                    className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-brand flex items-center justify-center hover:-translate-y-0.5 transition-transform"
                    title="朗读单词"
                  >
                    <Volume2 size={16} strokeWidth={2.8} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFav(w) }}
                    className={`w-9 h-9 rounded-xl border-[2.5px] border-ink flex items-center justify-center transition-transform hover:-translate-y-0.5 ${w.favorite ? 'bg-coral text-white' : 'bg-white'}`}
                    title="收藏"
                  >
                    <Star size={16} strokeWidth={2.8} fill={w.favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs font-bold text-ink/40">📍 {unitName(w.unitId)}</div>
            </Card>
          ))}
        </div>
      )}

      {/* —— 单词详情弹窗 —— */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.en ?? ''}>
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-extrabold">{detail.en}</div>
                <div className="font-bold text-blue">{detail.phonetic} <span className="text-ink/40 font-bold">{detail.pos}</span></div>
                <div className="text-xl font-extrabold mt-1">{detail.zh}</div>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={() => speech.speak(detail.en, { rate: 1 })} className="btn btn-primary btn-sm">
                  <Volume2 size={14} /> 正常
                </button>
                <button onClick={() => speech.speak(detail.en, { rate: 0.5 })} className="btn btn-secondary btn-sm">
                  <Turtle size={14} /> 慢速
                </button>
              </div>
            </div>
            <div className="rounded-2xl border-[2.5px] border-ink bg-paper p-4">
              <div className="text-xs font-extrabold text-ink/45 mb-1.5">例句</div>
              <p className="font-extrabold">{detail.exampleEn}</p>
              <p className="font-semibold text-sm text-ink/60 mt-1">{detail.exampleZh}</p>
              <button onClick={() => speech.speak(detail.exampleEn, { rate: 0.95 })} className="btn btn-secondary btn-sm mt-3">
                <Volume2 size={14} /> 朗读例句
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold mr-1">掌握状态：</span>
              {(['unlearned', 'learning', 'mastered'] as MasteryStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setMastery(detail, s)}
                  className={`chip ${detail.mastery === s ? 'chip-active' : ''}`}
                >
                  {detail.mastery === s && <Check size={12} strokeWidth={3.5} />}
                  {MASTERY_BADGE[s].text}
                </button>
              ))}
              <Button size="sm" variant={detail.favorite ? 'coral' : 'secondary'} className="ml-auto" onClick={() => toggleFav(detail)}>
                <Star size={13} fill={detail.favorite ? 'currentColor' : 'none'} /> {detail.favorite ? '已收藏' : '收藏'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
