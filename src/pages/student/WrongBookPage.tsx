import { useMemo, useState } from 'react'
import { XCircle, ShieldCheck, RotateCcw, Check } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Tabs, EmptyState, Button, Modal, ProgressBar } from '../../components/ui'
import type { Unit, WrongItem } from '../../types'

export function WrongBookPage() {
  const [unitTab, setUnitTab] = useState('all')
  const [kindTab, setKindTab] = useState('all')
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'mastered'>('all')
  const [minTimes, setMinTimes] = useState(false)
  const [reviewing, setReviewing] = useState<WrongItem[]>([])
  const [reviewIdx, setReviewIdx] = useState(0)
  const [reviewStats, setReviewStats] = useState({ correct: 0, wrong: 0 })
  const [version, setVersion] = useState(0)

  const { data: units } = useAsync<Unit[]>(() => repo.getUnits(), [])
  const { data: items } = useAsync<WrongItem[]>(
    () => repo.getWrongItems('stu-001', { unitId: unitTab === 'all' ? undefined : unitTab, kind: kindTab === 'all' ? undefined : kindTab, status: statusTab === 'all' ? undefined : statusTab, minTimes: minTimes ? 2 : undefined }),
    [unitTab, kindTab, statusTab, minTimes, version]
  )

  const kinds = useMemo(() => Array.from(new Set((items ?? []).map((i) => i.kind))), [items])
  const activeCount = (items ?? []).filter((i) => i.status === 'active').length
  const masteredCount = (items ?? []).filter((i) => i.status === 'mastered').length

  const startReview = () => {
    const active = (items ?? []).filter((i) => i.status === 'active')
    if (active.length === 0) return
    setReviewing(active)
    setReviewIdx(0)
    setReviewStats({ correct: 0, wrong: 0 })
  }

  const answer = async (correct: boolean) => {
    const item = reviewing[reviewIdx]
    await repo.reviewWrongItem('stu-001', item.key, correct)
    setReviewStats((s) => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }))
    if (reviewIdx + 1 >= reviewing.length) {
      setReviewing([])
      setVersion((v) => v + 1)
    } else {
      setReviewIdx((i) => i + 1)
    }
  }

  const unitName = (id: string) => {
    const u = units?.find((x) => x.id === id)
    return u ? `${u.kind === 'starter' ? 'S' : 'U'}${u.order}` : id
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="错题本"
        sub="自动收录练习、单元测验、考试挑战和小游戏的错误 · 连续两次复习答对自动标记「已掌握」"
        right={
          <Button onClick={startReview} disabled={activeCount === 0}>
            <RotateCcw size={15} /> 开始复习（{activeCount} 题）
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-3xl font-display font-extrabold">{items?.length ?? 0}</div><div className="text-xs font-extrabold text-ink/45 mt-1">错题总数</div></Card>
        <Card className="p-4 text-center"><div className="text-3xl font-display font-extrabold text-coral">{activeCount}</div><div className="text-xs font-extrabold text-ink/45 mt-1">待掌握</div></Card>
        <Card className="p-4 text-center"><div className="text-3xl font-display font-extrabold text-blue">{masteredCount}</div><div className="text-xs font-extrabold text-ink/45 mt-1">已掌握（保留记录）</div></Card>
      </div>

      <Card className="p-5 space-y-4">
        <Tabs
          items={[{ key: 'all', label: '全部单元' }, ...(units ?? []).map((u) => ({ key: u.id, label: `${u.kind === 'starter' ? 'S' : 'U'}${u.order}` }))]}
          value={unitTab}
          onChange={setUnitTab}
        />
        <div className="flex gap-4 flex-wrap">
          <Tabs items={[{ key: 'all', label: '全部题型' }, ...kinds.map((k) => ({ key: k, label: k }))]} value={kindTab} onChange={setKindTab} />
          <Tabs items={[{ key: 'all', label: '全部状态' }, { key: 'active', label: '待掌握' }, { key: 'mastered', label: '已掌握' }]} value={statusTab} onChange={setStatusTab} />
          <button onClick={() => setMinTimes(!minTimes)} className={`chip ${minTimes ? 'chip-active' : ''}`}>
            <Check size={12} strokeWidth={3.5} className={minTimes ? '' : 'opacity-0'} /> 错 2 次以上
          </button>
        </div>
      </Card>

      {(items ?? []).length === 0 ? (
        <EmptyState icon="🛡️" text="没有符合条件的错题，太棒了！" />
      ) : (
        <div className="space-y-3.5">
          {(items ?? []).map((w, i) => (
            <Card key={w.key} hover className={`p-5 reveal d${Math.min(8, (i % 7) + 1)}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`chip !text-[10px] ${w.status === 'mastered' ? 'bg-blue text-white' : 'bg-coral text-white'}`}>{w.status === 'mastered' ? '已掌握' : '待掌握'}</span>
                    <span className="chip !text-[10px] bg-paper">{w.kind}</span>
                    <span className="chip !text-[10px] bg-paper">📍 {unitName(w.unitId)}</span>
                    <span className="chip !text-[10px] bg-paper">错 {w.wrongTimes} 次</span>
                    {w.reviewStreak > 0 && w.status === 'active' && <span className="chip !text-[10px] bg-brand">复习连对 {w.reviewStreak}/2</span>}
                  </div>
                  <p className="font-bold text-[15px] leading-relaxed">{w.question}</p>
                  <p className="text-sm font-semibold mt-1.5">
                    <span className="text-coral">我的答案：{w.yourAnswer || '—'}</span>
                    <span className="ml-4 text-blue">正确答案：{w.correctAnswer}</span>
                  </p>
                  <p className="text-xs font-semibold text-ink/55 mt-2 bg-paper rounded-lg border-2 border-ink/10 px-3 py-2">解析：{w.explain}</p>
                </div>
                {w.status === 'active' ? (
                  <Button size="sm" variant="secondary" onClick={startReview} disabled={activeCount === 0}>
                    去复习
                  </Button>
                ) : (
                  <span className="chip bg-blue text-white shrink-0">
                    <ShieldCheck size={12} /> 已掌握
                  </span>
                )}
              </div>
              {w.status === 'mastered' && <ProgressBar value={100} color="blue" height="h-1.5" />}
            </Card>
          ))}
        </div>
      )}

      {/* —— 复习模式 —— */}
      <Modal open={reviewing.length > 0} onClose={() => setReviewing([])} title={`错题复习 ${reviewIdx + 1} / ${reviewing.length}`}>
        {reviewing[reviewIdx] && (
          <div>
            <ProgressBar value={((reviewIdx + 1) / reviewing.length) * 100} color="coral" height="h-2.5" />
            <div className="mt-5 rounded-2xl border-[2.5px] border-ink bg-paper p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="chip !text-[10px] bg-coral text-white">{reviewing[reviewIdx].kind}</span>
                <span className="text-[11px] font-bold text-ink/45">先自己回想答案，再对照自查</span>
              </div>
              <p className="font-bold text-lg leading-relaxed">{reviewing[reviewIdx].question}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-ink/20 bg-white px-3.5 py-2.5">
                  <div className="text-[10px] font-extrabold text-ink/40">我的原答案</div>
                  <div className="font-bold text-sm text-coral">{reviewing[reviewIdx].yourAnswer || '—'}</div>
                </div>
                <div className="rounded-xl border-2 border-ink/20 bg-white px-3.5 py-2.5">
                  <div className="text-[10px] font-extrabold text-ink/40">正确答案</div>
                  <div className="font-bold text-sm text-blue">{reviewing[reviewIdx].correctAnswer}</div>
                </div>
              </div>
              <p className="text-xs font-semibold text-ink/60 mt-3">解析：{reviewing[reviewIdx].explain}</p>
            </div>
            <p className="text-center text-xs font-extrabold text-ink/45 mt-4">这次你答对了吗？（连续两次答对即标记已掌握）</p>
            <div className="flex justify-center gap-3 mt-3">
              <Button variant="coral" onClick={() => answer(false)}>
                <XCircle size={15} /> 答错了
              </Button>
              <Button onClick={() => answer(true)}>
                <Check size={15} /> 答对了
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* —— 复习结束 —— */}
      {reviewing.length === 0 && reviewStats.correct + reviewStats.wrong > 0 && (
        <Card className="p-6 bg-brand/20 pop text-center">
          <div className="text-4xl mb-2">🛡️</div>
          <p className="font-extrabold text-lg">复习完成！答对 {reviewStats.correct} 题、答错 {reviewStats.wrong} 题</p>
          <p className="text-sm font-semibold text-ink/55 mt-1">连对两次的错题已标记「已掌握」，历史记录仍会保留</p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => setReviewStats({ correct: 0, wrong: 0 })}>
            知道了
          </Button>
        </Card>
      )}
    </div>
  )
}
