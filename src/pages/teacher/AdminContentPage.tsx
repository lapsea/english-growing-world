import { useMemo, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Chip, DifficultyDots } from '../../components/ui'

type TabKey = 'units' | 'words' | 'listening' | 'reading'

export function AdminContentPage() {
  const [tab, setTab] = useState<TabKey>('units')
  const [unitFilter, setUnitFilter] = useState('')
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const { data: words } = useAsync(() => repo.getWords({ unitId: unitFilter || undefined }), [unitFilter])
  const { data: listening } = useAsync(() => repo.getListeningPrograms({ unitId: unitFilter || undefined }), [unitFilter])
  const { data: reading } = useAsync(() => repo.getReadingArticles({ unitId: unitFilter || undefined }), [unitFilter])

  const tabs = [
    { key: 'units', label: `教材单元 (${units?.length ?? 0})` },
    { key: 'words', label: `词汇 (${words?.length ?? 0})` },
    { key: 'listening', label: `听力 (${listening?.length ?? 0})` },
    { key: 'reading', label: `阅读 (${reading?.length ?? 0})` },
  ] as { key: TabKey; label: string }[]

  const unitLabel = useMemo(
    () => (u: { kind: 'starter' | 'unit'; order: number; titleZh: string }) =>
      `${u.kind === 'starter' ? 'Starter' : 'Unit'} ${u.order} · ${u.titleZh}`,
    []
  )

  return (
    <div className="space-y-6">
      <SectionTitle icon="📚" title="教材与单元管理" sub="人教版(2024) 七年级上册内容总览" />

      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full border-[2px] border-ink font-bold text-sm transition-all ${
                tab === t.key ? 'bg-ink text-brand shadow-hard-xs' : 'bg-white hover:-translate-y-0.5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== 'units' && (
          <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="field max-w-[220px]">
            <option value="">全部单元</option>
            {(units ?? []).map((u) => (
              <option key={u.id} value={u.id}>{unitLabel(u)}</option>
            ))}
          </select>
        )}
      </div>

      {tab === 'units' && (
        <Card className="p-2">
          <table className="tbl">
            <thead>
              <tr>
                <th>单元 ID</th>
                <th>单元</th>
                <th>主题页</th>
                <th>核心问题</th>
                <th>短语</th>
                <th>语法点</th>
                <th>资源</th>
              </tr>
            </thead>
            <tbody>
              {(units ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="font-mono text-xs">{u.id}</td>
                  <td className="font-black whitespace-nowrap">{unitLabel(u)}</td>
                  <td className="text-xs">{u.page}</td>
                  <td className="text-xs max-w-[220px] truncate">{u.bigQuestion}</td>
                  <td className="font-bold">{u.phrases.length}</td>
                  <td className="font-bold">{u.grammar.points.length}</td>
                  <td className="text-xs text-ink/50">听{u.listeningIds.length} · 读{u.readingIds.length} · 写{u.writingTaskIds.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'words' && (
        <Card className="p-2 max-h-[68vh] overflow-y-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>单元</th>
                <th>单词</th>
                <th>词性</th>
                <th>释义</th>
                <th>例句</th>
              </tr>
            </thead>
            <tbody>
              {(words ?? []).map((w) => (
                <tr key={w.id}>
                  <td className="font-mono text-xs">{w.unitId}</td>
                  <td className="font-black">{w.en}</td>
                  <td className="text-xs">{w.pos}</td>
                  <td className="font-bold whitespace-nowrap">{w.zh}</td>
                  <td className="text-xs text-ink/50 max-w-[280px] truncate">{w.exampleEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'listening' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(listening ?? []).map((p) => (
            <Card key={p.id} hover className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black">{p.title}</span>
                <DifficultyDots level={p.difficulty} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Chip bg="paper">{p.unitId.toUpperCase()}</Chip>
                <Chip bg="lav text-white">{p.type === 'words' ? '单词' : p.type === 'sentences' ? '句子' : '对话'}</Chip>
                <Chip bg="paper">{p.lines.length} 句</Chip>
                <Chip bg="paper">题 {p.quiz.length}</Chip>
              </div>
              <p className="text-xs font-bold text-ink/50">{p.titleZh} · {p.theme}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'reading' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(reading ?? []).map((a) => (
            <Card key={a.id} hover className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black">{a.title}</span>
                <DifficultyDots level={a.difficulty} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Chip bg="paper">{a.unitId.toUpperCase()}</Chip>
                <Chip bg="ice">{a.genre}</Chip>
                <Chip bg="paper">{a.wordCount} 词</Chip>
              </div>
              <p className="text-xs font-bold text-ink/50">{a.titleZh}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-paper">
        <p className="text-xs font-bold text-ink/50">
          💡 教材内容（单元结构、词汇、听力、阅读）当前由系统数据文件统一维护，正式版本将支持在此在线编辑。
        </p>
      </Card>
    </div>
  )
}
