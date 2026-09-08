import { useMemo, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Tabs, Chip, DifficultyDots, Modal, Button } from '../../components/ui'
import { Volume2 } from 'lucide-react'
import { speech } from '../../services/audio'

type TabKey = 'units' | 'words' | 'listening' | 'reading' | 'writing'

export function TeacherContentPage() {
  const [tab, setTab] = useState<TabKey>('units')
  const { data: units } = useAsync(() => repo.getUnits(), [])
  const { data: words } = useAsync(() => repo.getWords(), [])
  const { data: listening } = useAsync(() => repo.getListeningPrograms(), [])
  const { data: reading } = useAsync(() => repo.getReadingArticles(), [])
  const { data: writing } = useAsync(() => repo.getWritingTasks(), [])

  const tabs = [
    { key: 'units', label: `教材单元 (${units?.length ?? 0})` },
    { key: 'words', label: `词汇表 (${words?.length ?? 0})` },
    { key: 'listening', label: `听力节目 (${listening?.length ?? 0})` },
    { key: 'reading', label: `阅读文章 (${reading?.length ?? 0})` },
    { key: 'writing', label: `写作任务 (${writing?.length ?? 0})` },
  ] as { key: TabKey; label: string }[]

  const unitTitle = useMemo(() => {
    const m = new Map<string, string>()
    ;(units ?? []).forEach((u) => m.set(u.id, `${u.kind === 'starter' ? 'Starter' : 'Unit'} ${u.order} · ${u.titleZh}`))
    return m
  }, [units])

  return (
    <div className="space-y-6">
      <SectionTitle icon="📚" title="教学内容管理" sub="查看教材单元、词汇、听力、阅读与写作内容" />
      <Tabs items={tabs} value={tab} onChange={setTab} />

      {tab === 'units' && (
        <div className="grid md:grid-cols-2 gap-5">
          {(units ?? []).map((u) => (
            <Card key={u.id} hover className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-lg">
                  {u.kind === 'starter' ? 'Starter' : 'Unit'} {u.order} · {u.titleZh}
                </span>
                <Chip bg="paper">P{u.page}</Chip>
              </div>
              <p className="text-sm font-bold text-blue">{u.title}</p>
              <p className="text-xs font-bold text-ink/60">核心问题：{u.bigQuestion}</p>
              <p className="text-xs font-bold text-ink/50">{u.bigIdea}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {u.goals.slice(0, 3).map((g) => (
                  <Chip key={g} bg="paper">{g}</Chip>
                ))}
              </div>
              <div className="text-[11px] font-bold text-ink/40 pt-1">
                短语 {u.phrases.length} · 语法点 {u.grammar.points.length} · 听力 {u.listeningIds.length} · 阅读 {u.readingIds.length} · 写作 {u.writingTaskIds.length}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'words' && (
        <Card className="p-2 max-h-[70vh] overflow-y-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>单元</th>
                <th>单词</th>
                <th>音标</th>
                <th>词性</th>
                <th>释义</th>
                <th>例句</th>
              </tr>
            </thead>
            <tbody>
              {(words ?? []).map((w) => (
                <tr key={w.id}>
                  <td className="text-xs whitespace-nowrap">{unitTitle.get(w.unitId)?.split('·')[0]}</td>
                  <td className="font-black">
                    {w.en}
                    <button onClick={() => speech.speak(w.en, { rate: 0.9 })} className="ml-1.5 text-blue hover:text-coral">
                      <Volume2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                  <td className="font-mono text-xs">{w.phonetic}</td>
                  <td className="text-xs">{w.pos}</td>
                  <td className="font-bold">{w.zh}</td>
                  <td className="text-xs text-ink/50 max-w-[260px] truncate">{w.exampleEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'listening' && (
        <div className="grid md:grid-cols-2 gap-5">
          {(listening ?? []).map((p) => (
            <Card key={p.id} hover className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black">{p.title} <span className="text-sm font-bold text-ink/50">{p.titleZh}</span></span>
                <DifficultyDots level={p.difficulty} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Chip bg="lav text-white">{unitTitle.get(p.unitId) ?? p.unitId}</Chip>
                <Chip bg="paper">{p.type === 'words' ? '单词' : p.type === 'sentences' ? '句子' : '对话'}</Chip>
                <Chip bg="paper">{p.durationMin} 分钟</Chip>
                <Chip bg="paper">{p.lines.length} 句台词</Chip>
                <Chip bg="paper">{p.quiz.length} 道随听题</Chip>
              </div>
              <p className="text-xs font-bold text-ink/50">关键词：{p.keywords.map((k) => k.en).join(' / ')}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'reading' && (
        <div className="grid md:grid-cols-2 gap-5">
          {(reading ?? []).map((a) => (
            <Card key={a.id} hover className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black">{a.title}</span>
                <DifficultyDots level={a.difficulty} />
              </div>
              <p className="text-sm font-bold text-ink/60">{a.titleZh}</p>
              <div className="flex gap-2 flex-wrap">
                <Chip bg="ice">{unitTitle.get(a.unitId) ?? a.unitId}</Chip>
                <Chip bg="paper">{a.genre}</Chip>
                <Chip bg="paper">{a.wordCount} 词</Chip>
                <Chip bg="paper">{a.exercises.length} 道习题</Chip>
              </div>
              <p className="text-xs text-ink/50 font-bold line-clamp-2">读前引导：{a.guide}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'writing' && (
        <div className="grid md:grid-cols-2 gap-5">
          {(writing ?? []).map((t) => (
            <Card key={t.id} hover className="p-5 space-y-2.5">
              <span className="font-black">{t.title}</span>
              <p className="text-sm font-bold text-ink/60">{t.prompt}</p>
              <div className="flex gap-2 flex-wrap">
                <Chip bg="brand">{unitTitle.get(t.unitId) ?? t.unitId}</Chip>
                <Chip bg="paper">要求 {t.requirements.length} 条</Chip>
                <Chip bg="paper">结构 {t.structure.length} 步</Chip>
                <Chip bg="paper">范文 {t.sample.score} 分</Chip>
              </div>
              <div className="text-xs font-bold text-ink/50">
                句型：{t.patterns.map((p) => p.pattern).slice(0, 2).join(' / ')}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-paper">
        <p className="text-xs font-bold text-ink/50">
          💡 教学内容依据人教版七年级上册教材目录整理生成。
        </p>
      </Card>
    </div>
  )
}
