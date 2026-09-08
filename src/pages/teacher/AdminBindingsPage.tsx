import { useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import { Card, SectionTitle, Chip, Avatar, Button, Modal, EmptyState } from '../../components/ui'
import { Link2, Unlink, Plus } from 'lucide-react'

export function AdminBindingsPage() {
  const version = useRepoVersion()
  const { data: bindings } = useAsync(() => repo.getBindings(), [version])
  const { data: users } = useAsync(() => repo.getAllUsers(), [version])
  const [showAdd, setShowAdd] = useState(false)

  const userName = (id: string) => users?.find((u) => u.id === id)
  const parents = (users ?? []).filter((u) => u.role === 'parent')
  const students = (users ?? []).filter((u) => u.role === 'student')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionTitle icon="🔗" title="家长绑定关系" sub="查看、新增、解除家长与学生的绑定" />
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> 新增绑定
        </Button>
      </div>

      {bindings?.length === 0 ? (
        <EmptyState icon="🔗" text="暂无绑定关系，点击右上角新增一条绑定。" />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(bindings ?? []).map((b, i) => {
            const p = userName(b.parentId)
            const s = userName(b.studentId)
            return (
              <Card key={b.id} hover className={`p-6 reveal d${(i % 6) + 1}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center">
                      <Avatar emoji={p?.avatar ?? '👪'} size="md" color="ice" />
                      <div className="w-10 h-[3px] bg-ink" />
                      <Avatar emoji={s?.avatar ?? '👦'} size="md" color="brand" />
                    </div>
                    <div>
                      <div className="font-black">
                        {p?.name} <span className="text-coral">({b.relation})</span>
                      </div>
                      <div className="text-xs font-bold text-ink/40">→ {s?.name}（{s?.id}）</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-dashed border-ink/15">
                  <span className="text-[11px] font-bold text-ink/40">绑定 ID：{b.id}</span>
                  <button
                    onClick={async () => {
                      if (window.confirm(`确定解除 ${p?.name} 与 ${s?.name} 的绑定吗？`)) await repo.removeBinding(b.id)
                    }}
                    className="btn btn-sm btn-secondary text-coral"
                  >
                    <Unlink className="w-3.5 h-3.5 mr-1" /> 解除绑定
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="p-5 bg-paper flex items-center gap-3">
        <Link2 className="w-5 h-5 text-blue" />
        <p className="text-sm font-bold text-ink/60">
          绑定后，家长可在家长端查看孩子的学习概览、作业完成、考试成绩与每周报告。当前共 {bindings?.length ?? 0} 条绑定关系。
        </p>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增家长绑定" width="max-w-md">
        <AddBindingForm
          parents={parents.map((p) => ({ id: p.id, name: p.name }))}
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          onDone={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}

function AddBindingForm({
  parents,
  students,
  onDone,
}: {
  parents: { id: string; name: string }[]
  students: { id: string; name: string }[]
  onDone: () => void
}) {
  const version = useRepoVersion()
  const [parentId, setParentId] = useState(parents[0]?.id ?? '')
  const [studentId, setStudentId] = useState(students[0]?.id ?? '')
  const [relation, setRelation] = useState('妈妈')

  const submit = async () => {
    if (!parentId || !studentId) {
      window.alert('请选择家长和学生')
      return
    }
    await repo.addBinding(parentId, studentId, relation.trim() || '家长')
    void version
    onDone()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-black mb-1.5">家长账号</label>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="field">
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（{p.id}）
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-black mb-1.5">学生账号</label>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="field">
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}（{s.id}）
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-black mb-1.5">关系</label>
        <select value={relation} onChange={(e) => setRelation(e.target.value)} className="field">
          {['妈妈', '爸爸', '爷爷', '奶奶', '外公', '外婆', '其他监护人'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onDone}>取消</Button>
        <Button variant="primary" onClick={submit}>确认绑定</Button>
      </div>
    </div>
  )
}
