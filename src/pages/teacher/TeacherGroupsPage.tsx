import { useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Avatar, Card, Chip, SectionTitle, ProgressBar, Button, Modal } from '../../components/ui'
import { Pencil, Plus, Minus, Trophy } from 'lucide-react'

export function TeacherGroupsPage() {
  const version = useRepoVersion()
  const { data: groups } = useAsync(() => repo.getGroups(), [version])
  const { data: students } = useAsync(() => repo.getStudents(), [version])
  const { data: standings } = useAsync(() => repo.getGroupStandings('class-701'), [version])
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [motto, setMotto] = useState('')
  const [addPoints, setAddPoints] = useState('5')

  const membersOf = (gid: string) => (students ?? []).filter((s) => s.groupId === gid)

  const startEdit = (id: string, n: string, m: string) => {
    setEditing(id)
    setName(n)
    setMotto(m)
  }

  const saveEdit = async () => {
    if (!editing) return
    await repo.updateGroup(editing, { name: name.trim() || undefined, motto: motto.trim() || undefined })
    setEditing(null)
  }

  const adjustPoints = async (id: string, delta: number) => {
    const g = groups?.find((x) => x.id === id)
    if (!g) return
    const next = Math.max(0, g.points + delta)
    await repo.updateGroup(id, { points: next })
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon="🚩" title="学习小组管理" sub="重命名小组、修改口号、手动调整小组积分" />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {(groups ?? []).map((g, gi) => {
          const standing = standings?.find((s) => s.group.id === g.id)
          const members = membersOf(g.id)
          return (
            <Card key={g.id} hover className={`p-6 space-y-4 reveal d${gi + 1}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-2xl font-black">{g.name}</h3>
                    {standing?.rank === 1 && <Chip bg="brand"><Trophy className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />暂列第一</Chip>}
                  </div>
                  <p className="text-xs font-bold text-ink/40 mt-1">口号：{g.motto}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => startEdit(g.id, g.name, g.motto)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> 编辑
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>小组基础积分</span>
                    <span>{g.points}</span>
                  </div>
                  <ProgressBar value={(g.points / 130) * 100} color={g.color} height="h-3" />
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustPoints(g.id, -5)} className="w-8 h-8 rounded-lg border-2 border-ink bg-white font-black hover:bg-paper">−</button>
                  <button onClick={() => adjustPoints(g.id, 5)} className="w-8 h-8 rounded-lg border-2 border-ink bg-brand font-black hover:-translate-y-0.5 transition-transform">+</button>
                </div>
              </div>
              <p className="text-[11px] font-bold text-ink/40">成员游戏积分之和：+{standing ? standing.totalPoints - g.points : 0} → 总计 {standing?.totalPoints ?? g.points} 分</p>

              <div>
                <div className="font-black text-sm mb-2">成员（{members.length}）</div>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <span key={m.id} className="flex items-center gap-1.5 chip bg-paper">
                      <Avatar emoji={m.avatar} size="sm" color="ice" />
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-5 bg-paper space-y-2">
        <div className="font-black flex items-center gap-2">
          <Plus className="w-4 h-4 text-coral" />
          <Minus className="w-4 h-4 text-blue" />
          周挑战规则说明
        </div>
        <p className="text-sm font-bold text-ink/60">
          学生通过答题（+10/题）、完成作业（+30/份）、考试挑战（+考试得分）和小游戏（每游戏每天前 3 局，最高 +50）为小组赚取积分。
          老师可手动 ±5 分用于线下活动奖励。小组积分 = 基础积分 + 组员个人积分之和，实时生效。
        </p>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="编辑小组信息" width="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black mb-1.5">小组名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">小组口号</label>
            <input value={motto} onChange={(e) => setMotto(e.target.value)} className="field" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditing(null)}>取消</Button>
            <Button variant="primary" onClick={saveEdit}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
