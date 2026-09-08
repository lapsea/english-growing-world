import { useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { storageUsageKB } from '../../services/storage'
import { Card, SectionTitle, Chip, Button, EmptyState } from '../../components/ui'
import { Database, RefreshCcw, HardDrive, Trash2 } from 'lucide-react'

export function AdminDataPage() {
  const version = useRepoVersion()
  const [active, setActive] = useState(0)
  const { data: collections } = useAsync(() => repo.browseCollections(), [version])
  const kb = useMemo(() => storageUsageKB(), [version])

  const current = collections?.[active]

  return (
    <div className="space-y-6">
      <SectionTitle icon="🗄️" title="业务数据浏览器" sub="查看系统中的全部业务数据集合" />

      <div className="grid md:grid-cols-3 gap-5">
        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 font-black">
            <Database className="w-5 h-5 text-blue" /> 数据集合
          </div>
          <div className="text-3xl font-black">{collections?.length ?? 0} 个</div>
          <p className="text-xs font-bold text-ink/40">各业务模块产生的数据记录</p>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 font-black">
            <HardDrive className="w-5 h-5 text-coral" /> localStorage 占用
          </div>
          <div className="text-3xl font-black">{kb} KB</div>
          <p className="text-xs font-bold text-ink/40">键名前缀 egw: 的本地持久化数据</p>
        </Card>
        <Card className="p-5 space-y-2 bg-coral/10">
          <div className="flex items-center gap-2 font-black">
            <Trash2 className="w-5 h-5 text-coral" /> 危险操作
          </div>
          <p className="text-xs font-bold text-ink/50">重置会清空本地数据（进度、错题、草稿、成绩）并恢复初始数据。</p>
          <Button
            variant="coral"
            size="sm"
            onClick={async () => {
              if (window.confirm('确定重置全部数据吗？此操作会清除你产生的所有本地记录。')) {
                await repo.resetDemoData()
              }
            }}
          >
            <RefreshCcw className="w-3.5 h-3.5 mr-1" /> 重置数据
          </Button>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(collections ?? []).map((c, i) => (
          <button
            key={c.name}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-full border-[2px] border-ink font-bold text-sm transition-all ${
              active === i ? 'bg-ink text-brand shadow-hard-xs' : 'bg-white hover:-translate-y-0.5'
            }`}
          >
            {c.label}
            <span className="ml-1.5 text-[10px] opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      {current ? (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Chip bg="ink text-white">{current.name}</Chip>
              <span className="text-sm font-bold text-ink/50">{current.label} · {current.count} 条记录</span>
            </div>
            <Chip bg="paper text-xs">read-only 只读预览</Chip>
          </div>
          <div className="max-h-[55vh] overflow-auto rounded-2xl border-2 border-ink/15">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-paper">#</th>
                  <th className="sticky top-0 bg-paper">记录（JSON 摘要）</th>
                </tr>
              </thead>
              <tbody>
                {current.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-ink/40">{i + 1}</td>
                    <td>
                      <code className="text-xs font-mono break-all leading-relaxed">{summarize(row)}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState icon="🗄️" text="没有数据集合，请检查数据层实现。" />
      )}
    </div>
  )
}

function summarize(row: Record<string, unknown>): string {
  const entries = Object.entries(row).map(([k, v]) => {
    if (v === null || v === undefined) return `${k}: -`
    if (Array.isArray(v)) return `${k}: [${v.length} 项]`
    if (typeof v === 'object') return `${k}: {…}`
    const s = String(v)
    return `${k}: ${s.length > 40 ? s.slice(0, 40) + '…' : s}`
  })
  return entries.join('  ·  ')
}
