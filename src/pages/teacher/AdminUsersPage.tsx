import { useEffect, useMemo, useState } from 'react'
import { useAsync, useRepoVersion } from '../../hooks/useAsync'
import { repo } from '../../services/repo'
import type { NewUserData, Role, User } from '../../types'
import { Card, SectionTitle, Chip, Avatar, Tabs, Button, Modal } from '../../components/ui'
import { Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'

const ROLE_ZH: Record<Role, string> = { student: '学生', parent: '家长', teacher: '教师' }
const AVATARS = ['🧢', '🐯', '💡', '⭐', '🏃', '🍎', '🐰', '🦊', '🐱', '🚀', '🌈', '⚽', '🎨', '📚', '👨', '👩', '🧔', '👩‍🏫']

export function AdminUsersPage() {
  const version = useRepoVersion()
  const [role, setRole] = useState<'all' | Role>('all')
  const [keyword, setKeyword] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const { data: users } = useAsync(() => repo.getAllUsers(), [version])
  const { data: groups } = useAsync(() => repo.getGroups(), [])
  const { data: bindings } = useAsync(() => repo.getBindings(), [version])
  const { data: currentUser } = useAsync(() => repo.getCurrentUser(), [])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return (users ?? []).filter(
      (u) => (role === 'all' || u.role === role) && (!kw || u.name.toLowerCase().includes(kw) || u.id.includes(kw))
    )
  }, [users, role, keyword])

  const userName = (id: string) => users?.find((u) => u.id === id)?.name ?? id

  const tabs = [
    { key: 'all', label: `全部 (${users?.length ?? 0})` },
    { key: 'student', label: `学生 (${(users ?? []).filter((u) => u.role === 'student').length})` },
    { key: 'parent', label: `家长 (${(users ?? []).filter((u) => u.role === 'parent').length})` },
    { key: 'teacher', label: `教师 (${(users ?? []).filter((u) => u.role === 'teacher').length})` },
  ] as { key: 'all' | Role; label: string }[]

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (u: User) => {
    setEditing(u)
    setFormOpen(true)
  }

  const removeUser = async (u: User) => {
    if (u.id === currentUser?.id) {
      window.alert('不能删除当前登录的账号')
      return
    }
    if (u.role === 'teacher' && (users ?? []).filter((x) => x.role === 'teacher').length <= 1) {
      window.alert('至少需要保留一名教师账号')
      return
    }
    const msg =
      u.role === 'student'
        ? `确定删除学生「${u.name}」吗？其学习记录、考试成绩、错题本、家长绑定等数据会一并删除。`
        : `确定删除${ROLE_ZH[u.role]}「${u.name}」吗？`
    if (!window.confirm(msg)) return
    await repo.deleteUser(u.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionTitle icon="👤" title="用户列表" sub="新增/编辑/删除用户，管理角色与账号状态" />
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> 新增用户
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <Tabs items={tabs} value={role} onChange={setRole} />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索姓名或账号…" className="field pl-9" />
        </div>
        <Chip bg="brand">{filtered.length} 条结果</Chip>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((u, i) => (
          <Card key={u.id} className={`p-5 space-y-3 reveal d${Math.min(8, (i % 8) + 1)} ${!u.active ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar emoji={u.avatar} size="md" color={u.role === 'student' ? 'brand' : u.role === 'parent' ? 'ice' : 'lav'} />
                <div className="min-w-0">
                  <div className="font-black text-lg truncate">{u.name}</div>
                  <div className="text-[11px] font-mono font-bold text-ink/40 truncate">{u.id}</div>
                </div>
              </div>
              <Chip bg={u.role === 'student' ? 'brand' : u.role === 'parent' ? 'ice' : u.role === 'teacher' ? 'lav text-white' : 'ink text-white'}>
                {ROLE_ZH[u.role]}
              </Chip>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {u.classId && <Chip bg="paper">{groups?.length ? `701 班` : u.classId}</Chip>}
              {u.groupId && <Chip bg="paper">{groups?.find((g) => g.id === u.groupId)?.name}</Chip>}
              {u.childIds?.map((c) => (
                <Chip key={c} bg="ice">孩子：{userName(c)}</Chip>
              ))}
              {u.role === 'student' && bindings?.some((b) => b.studentId === u.id) && (
                <Chip bg="lav text-white">已绑定家长</Chip>
              )}
              {u.teacherTitle && <Chip bg="paper">{u.teacherTitle}</Chip>}
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className={`chip text-xs ${u.active ? 'bg-paper' : 'bg-coral text-white'}`}>
                {u.active ? '● 状态正常' : '● 已停用'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(u)}
                  className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-white flex items-center justify-center hover:bg-brand transition-colors"
                  title="编辑用户"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeUser(u)}
                  className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-white flex items-center justify-center hover:bg-coral hover:text-white transition-colors"
                  title="删除用户"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    await repo.setUserActive(u.id, !u.active)
                  }}
                  className={`btn btn-sm ${u.active ? 'btn-secondary' : 'btn-primary'}`}
                >
                  <Power className="w-3.5 h-3.5 mr-1" />
                  {u.active ? '停用账号' : '重新启用'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        groups={(groups ?? []).map((g) => ({ id: g.id, name: g.name }))}
        students={(users ?? []).filter((u) => u.role === 'student')}
      />
    </div>
  )
}

function UserFormModal({
  open,
  onClose,
  initial,
  groups,
  students,
}: {
  open: boolean
  onClose: () => void
  initial: User | null
  groups: { id: string; name: string }[]
  students: User[]
}) {
  const [role, setRole] = useState<Role>('student')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧢')
  const [bio, setBio] = useState('')
  const [groupId, setGroupId] = useState('')
  const [childIds, setChildIds] = useState<string[]>([])
  const [teacherTitle, setTeacherTitle] = useState('')

  useEffect(() => {
    if (!open) return
    setRole(initial?.role ?? 'student')
    setName(initial?.name ?? '')
    setAvatar(initial?.avatar ?? '🧢')
    setBio(initial?.bio ?? '')
    setGroupId(initial?.groupId ?? '')
    setChildIds(initial?.childIds ? [...initial.childIds] : [])
    setTeacherTitle(initial?.teacherTitle ?? '')
  }, [open, initial])

  const toggleChild = (sid: string) => {
    setChildIds((p) => (p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]))
  }

  const submit = async () => {
    if (!name.trim()) {
      window.alert('请填写用户姓名')
      return
    }
    if (role === 'parent' && childIds.length === 0) {
      window.alert('请至少选择一个孩子')
      return
    }
    const data: NewUserData = {
      name: name.trim(),
      role,
      avatar,
      bio: bio.trim() || undefined,
      groupId: role === 'student' ? groupId || undefined : undefined,
      childIds: role === 'parent' ? childIds : undefined,
      teacherTitle: role === 'teacher' ? teacherTitle.trim() || undefined : undefined,
    }
    if (initial) {
      await repo.updateUser(initial.id, data)
    } else {
      await repo.createUser(data)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? `编辑用户 · ${initial.name}` : '新增用户'} width="max-w-xl">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1.5">角色 {initial && <span className="text-ink/40 font-bold text-xs">（不可修改）</span>}</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={!!initial} className="field disabled:opacity-60">
              <option value="student">学生</option>
              <option value="parent">家长</option>
              <option value="teacher">教师</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-black mb-1.5">姓名 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="如：刘小雨" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-black mb-1.5">头像</label>
          <div className="flex flex-wrap gap-1.5">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`w-10 h-10 rounded-xl border-[2.5px] text-xl flex items-center justify-center transition-transform ${avatar === a ? 'border-ink bg-brand shadow-hard-xs scale-110' : 'border-ink/15 bg-white hover:-translate-y-0.5'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        {role === 'student' && (
          <div>
            <label className="block text-sm font-black mb-1.5">学习小组</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="field">
              <option value="">暂不加入小组</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}
        {role === 'parent' && (
          <div>
            <label className="block text-sm font-black mb-1.5">绑定孩子（已选 {childIds.length}）</label>
            <div className="rounded-2xl border-2 border-ink/20 bg-paper max-h-40 overflow-y-auto p-2 space-y-1">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer">
                  <input type="checkbox" checked={childIds.includes(s.id)} onChange={() => toggleChild(s.id)} className="accent-black w-4 h-4" />
                  <span className="text-sm font-bold">{s.avatar} {s.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {role === 'teacher' && (
          <div>
            <label className="block text-sm font-black mb-1.5">职称</label>
            <input value={teacherTitle} onChange={(e) => setTeacherTitle(e.target.value)} className="field" placeholder="如：英语教师" />
          </div>
        )}
        <div>
          <label className="block text-sm font-black mb-1.5">个人简介</label>
          <input value={bio} onChange={(e) => setBio(e.target.value)} className="field" placeholder="一句话介绍…" />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={submit}>{initial ? '保存修改' : '创建用户'}</Button>
        </div>
      </div>
    </Modal>
  )
}
