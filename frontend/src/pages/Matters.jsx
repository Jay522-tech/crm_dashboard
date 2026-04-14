import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Scale, Flag, CalendarClock, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import useStore from '../store'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const MattersPage = () => {
    const { activeWorkspaceId, matters, fetchMatters, createMatter, updateMatter, deleteMatter } = useStore()
    const [isOpen, setIsOpen] = useState(false)
    const [page, setPage] = useState(1)
    const limit = 10
    const [editingMatterId, setEditingMatterId] = useState(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState('Open')
    const [priority, setPriority] = useState('Medium')
    const [dueAt, setDueAt] = useState('')

    useEffect(() => {
        if (activeWorkspaceId) fetchMatters(activeWorkspaceId)
    }, [activeWorkspaceId, fetchMatters])

    const all = useMemo(() => matters || [], [matters])
    const effectivePage = Math.min(page, Math.max(Math.ceil(all.length / limit), 1))
    const totalPages = Math.max(Math.ceil(all.length / limit), 1)
    const rows = useMemo(() => {
        const start = (effectivePage - 1) * limit
        return all.slice(start, start + limit)
    }, [all, effectivePage])

    const openCreateModal = () => {
        setEditingMatterId(null)
        setTitle('')
        setStatus('Open')
        setPriority('Medium')
        setDueAt('')
        setIsOpen(true)
    }

    const openEditModal = (matter) => {
        setEditingMatterId(matter._id)
        setTitle(matter.title || '')
        setStatus(matter.status || 'Open')
        setPriority(matter.priority || 'Medium')
        setDueAt(matter.dueAt ? format(new Date(matter.dueAt), 'yyyy-MM-dd') : '')
        setIsOpen(true)
    }

    const openDeleteModal = (matter) => {
        setDeleteTarget(matter)
        setIsDeleteOpen(true)
    }

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Scale size={18} />
                        Matters
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Track cases, projects or internal matters</p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
                >
                    <Plus size={18} />
                    New matter
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">All matters</p>
                    <span className="text-xs text-slate-500">{all.length} items</span>
                </div>
                {all.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        No matters yet. Create your first matter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-3">Title</th>
                                    <th className="text-left font-semibold px-4 py-3">Status</th>
                                    <th className="text-left font-semibold px-4 py-3">Priority</th>
                                    <th className="text-left font-semibold px-4 py-3">Due</th>
                                    <th className="text-right font-semibold px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((m) => (
                                    <tr key={m._id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3 font-medium text-slate-900">{m.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{m.status || 'Open'}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                <Flag size={12} />
                                                {m.priority || 'Medium'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {m.dueAt ? format(new Date(m.dueAt), 'MMM d, yyyy') : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(m)}
                                                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                                    title="Edit matter"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        openDeleteModal(m)
                                                    }}
                                                    className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                                                    title="Delete matter"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {all.length > 0 && (
                <Pagination
                    page={effectivePage}
                    totalPages={totalPages}
                    onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                    onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                />
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingMatterId ? 'Edit matter' : 'New matter'}>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        const payload = { title, status, priority, dueAt: dueAt || undefined }
                        if (editingMatterId) {
                            await updateMatter(editingMatterId, payload)
                            toast.success('Matter updated')
                        } else {
                            await createMatter(payload)
                            toast.success('Matter created')
                        }
                        setIsOpen(false)
                        setTitle('')
                        setStatus('Open')
                        setPriority('Medium')
                        setDueAt('')
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition"
                            placeholder="Draft agreement review"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Status</label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full appearance-none rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 pr-9 outline-none focus:bg-white focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition"
                                >
                                    {['Open', 'In Progress', 'Review', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Priority</label>
                            <div className="relative">
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full appearance-none rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 pr-9 outline-none focus:bg-white focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition"
                                >
                                    {['Low', 'Medium', 'High'].map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Due date</label>
                            <div className="relative">
                                <CalendarClock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={dueAt}
                                    onChange={(e) => setDueAt(e.target.value)}
                                    className="w-full pl-9 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                            {editingMatterId ? 'Save changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={async () => {
                    if (!deleteTarget?._id) return
                    await deleteMatter(deleteTarget._id)
                    toast.success('Matter deleted')
                    setDeleteTarget(null)
                }}
                title="Delete matter"
                message={`Are you sure you want to delete "${deleteTarget?.title || 'this matter'}"?`}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    )
}

export default MattersPage

