import React, { useState } from 'react'
import { User, Mail, Phone, DollarSign, Calendar, MessageSquare, Plus, Trash2, CheckCircle2, ChevronDown } from 'lucide-react'
import useStore from '../store'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import ContactModal from './ContactModal'

const STAGES = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost']

const DealModal = ({ dealId, onClose, defaultStage = 'Lead' }) => {
    const { user, deals, updateDeal, addDeal, addNote, deleteDeal, workspaces, activeWorkspaceId } = useStore()
    const isNew = dealId === 'new'
    const deal = deals.find(d => d._id === dealId)
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const currentUserRole = activeWorkspace?.members?.find(m => String(m.user?._id || m.user) === String(user?._id))?.role
    const isAtLeastAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin'

    const [form, setForm] = useState(() => {
        if (isNew) {
            return {
                title: '',
                stage: defaultStage,
                amount: 0,
                description: '',
                assignee: '',
                contact: null
            }
        }
        return {
            title: deal?.title || '',
            stage: deal?.stage || 'Lead',
            amount: deal?.amount || 0,
            description: deal?.description || '',
            assignee: deal?.assignee?._id || deal?.assignee || '',
            contact: deal?.contact || null
        }
    })

    const [noteContent, setNoteContent] = useState('')
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    if (!isNew && !deal) return null

    const handleUpdateChanges = (updates) => {
        setForm(prev => ({ ...prev, ...updates }))
    }

    const handleAddNote = (e) => {
        e.preventDefault()
        if (!noteContent.trim() || isNew) return
        addNote(deal._id, noteContent)
        setNoteContent('')
    }

    const handleDeleteConfirm = async () => {
        await deleteDeal(deal._id)
        onClose()
    }

    const handleCreateDeal = async () => {
        if (!form.title.trim()) {
            toast.error('Deal title is required')
            return
        }
        setSaving(true)
        const success = await addDeal({
            ...form,
            title: form.title.trim(),
            description: form.description.trim()
        })
        setSaving(false)
        if (success) {
            toast.success('Deal created successfully')
            onClose()
        }
    }

    const handleUpdateDeal = async () => {
        if (!form.title.trim()) {
            toast.error('Deal title is required')
            return
        }
        setSaving(true)
        const success = await updateDeal(deal._id, {
            ...form,
            title: form.title.trim(),
            description: form.description.trim()
        })
        setSaving(false)
        if (success) {
            toast.success('Deal updated successfully')
            onClose()
        }
    }

    const handleSaveContact = (contactData) => {
        handleUpdateChanges({ contact: contactData })
    }

    const createdLabel = !isNew && deal?.createdAt ? format(new Date(deal.createdAt), 'MMM d, yyyy') : '—'
    const dealNotes = !isNew && deal?.notes ? [...deal.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []

    return (
        <>
            <Modal isOpen={true} onClose={onClose} title={isNew ? "Create deal" : "Deal details"} maxWidthClass="max-w-5xl">
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Title</label>
                                <input
                                    autoFocus={isNew}
                                    value={form.title}
                                    onChange={(e) => handleUpdateChanges({ title: e.target.value })}
                                    placeholder="Enter deal title..."
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                />
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {isNew ? 'New deal' : `Created ${createdLabel}`}
                                    </span>
                                    <span className="h-4 w-px bg-slate-200/80" aria-hidden />
                                    <span className="inline-flex items-center gap-1.5">
                                        <DollarSign size={14} />
                                        Value ${form.amount || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:items-end">
                                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Stage</label>
                                <div className="relative w-full sm:w-56">
                                    <select
                                        value={form.stage}
                                        onChange={(e) => handleUpdateChanges({ stage: e.target.value })}
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                                    >
                                        {STAGES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                {!isNew && isAtLeastAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/90 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                    >
                                        <Trash2 size={14} />
                                        Delete deal
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-3">
                        <div className="space-y-5 lg:col-span-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Description</p>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => handleUpdateChanges({ description: e.target.value })}
                                    placeholder="Short summary shown on the board card…"
                                    rows={3}
                                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                />
                            </div>

                            <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${isNew ? 'opacity-50 pointer-events-none' : ''}`}>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-slate-400" />
                                    Activity notes {isNew && "(Available after creation)"}
                                </p>
                                <form onSubmit={handleAddNote} className="mt-3">
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        disabled={isNew}
                                        placeholder={isNew ? "Wait until deal is created..." : "Add a progress update or note..."}
                                        className="w-full min-h-[96px] resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={isNew || !noteContent.trim()}
                                            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            Post note
                                        </button>
                                    </div>
                                </form>

                                {!isNew && (
                                    <div className="mt-4 space-y-3">
                                        {dealNotes.length === 0 ? (
                                            <p className="text-sm text-slate-500">No notes yet.</p>
                                        ) : (
                                            dealNotes.map((note, index) => (
                                                <div key={index} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                                    <p className="text-sm whitespace-pre-wrap text-slate-800">{note.content}</p>
                                                    <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-2">
                                                        <CheckCircle2 size={12} className="text-emerald-600" />
                                                        {note.createdAt ? format(new Date(note.createdAt), 'MMM d, h:mm a') : '—'}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Deal details</p>
                                <div className="mt-3 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                                            <DollarSign size={14} className="text-slate-400" />
                                            Amount (USD)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={form.amount}
                                            onChange={(e) =>
                                                handleUpdateChanges({ amount: parseFloat(e.target.value) || 0 })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            Assignee
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={form.assignee}
                                                onChange={(e) => handleUpdateChanges({ assignee: e.target.value })}
                                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                                            >
                                                <option value="">Unassigned</option>
                                                {activeWorkspace?.members?.map((m) => {
                                                    const mid = m.user?._id || m.user
                                                    return (
                                                        <option key={mid} value={mid}>
                                                            {m.user?.name || m.name || m.email}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                            <ChevronDown
                                                size={16}
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Contact</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsContactOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <Plus size={14} />
                                        {form.contact?.name ? 'Edit' : 'Add'}
                                    </button>
                                </div>

                                {form.contact?.name ? (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-900">{form.contact.name}</p>
                                        <div className="mt-2 space-y-2 text-xs text-slate-600">
                                            {form.contact.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {form.contact.email}
                                                </div>
                                            )}
                                            {form.contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {form.contact.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-slate-500">No contact linked yet.</p>
                                )}
                            </div>

                            <div className="pt-2">
                                {isNew ? (
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleCreateDeal}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-70"
                                    >
                                        {saving ? 'Creating...' : 'Create deal'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleUpdateDeal}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-70"
                                    >
                                        {saving ? 'Updating...' : 'Update deal'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Delete deal?"
                message={`Delete "${form.title}"? This cannot be undone.`}
                confirmLabel="Delete deal"
                cancelLabel="Cancel"
                danger
                onConfirm={handleDeleteConfirm}
            />

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                onSave={handleSaveContact}
            />
        </>
    )
}

export default DealModal
