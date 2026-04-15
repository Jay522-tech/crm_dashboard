import React, { useState } from 'react'
import { User, Mail, Phone, DollarSign, Calendar, MessageSquare, Plus, Trash2, CheckCircle2, ChevronDown } from 'lucide-react'
import useStore from '../store'
import { format } from 'date-fns'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import ContactModal from './ContactModal'

const STAGES = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost']

const DealModal = ({ dealId, onClose }) => {
    const { user, deals, updateDeal, addNote, deleteDeal, workspaces, activeWorkspaceId } = useStore()
    const deal = deals.find(d => d._id === dealId)
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const currentUserRole = activeWorkspace?.members?.find(m => String(m.user?._id || m.user) === String(user?._id))?.role
    const isAtLeastAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin'

    const contact = deal?.contact
    const dealNotes = deal?.notes ? [...deal.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []

    const [noteContent, setNoteContent] = useState('')
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isContactOpen, setIsContactOpen] = useState(false)

    if (!deal) return null
    let createdLabel = '—'
    if (deal.createdAt) {
        try {
            createdLabel = format(new Date(deal.createdAt), 'MMM d, yyyy')
        } catch {
            createdLabel = '—'
        }
    }

    const handleAddNote = (e) => {
        e.preventDefault()
        if (!noteContent.trim()) return
        addNote(deal._id, noteContent)
        setNoteContent('')
    }

    const handleDeleteConfirm = async () => {
        await deleteDeal(deal._id)
        onClose()
    }

    const handleSaveContact = (contactData) => {
        updateDeal(deal._id, { contact: contactData })
    }

    return (
        <>
            <Modal isOpen={true} onClose={onClose} title="Deal details" maxWidthClass="max-w-4xl">
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Title</label>
                                <input
                                    value={deal.title}
                                    onChange={(e) => updateDeal(deal._id, { title: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                />
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        Created {createdLabel}
                                    </span>
                                    <span className="h-4 w-px bg-slate-200/80" aria-hidden />
                                    <span className="inline-flex items-center gap-1.5">
                                        <DollarSign size={14} />
                                        Value ${deal.amount || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:items-end">
                                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Stage</label>
                                <div className="relative w-full sm:w-56">
                                    <select
                                        value={deal.stage}
                                        onChange={(e) => updateDeal(deal._id, { stage: e.target.value })}
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

                                {isAtLeastAdmin ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/90 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                    >
                                        <Trash2 size={14} />
                                        Delete deal
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-3">
                        <div className="space-y-5 lg:col-span-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Description</p>
                                <textarea
                                    value={deal.description || ''}
                                    onChange={(e) => updateDeal(deal._id, { description: e.target.value })}
                                    placeholder="Short summary shown on the board card…"
                                    rows={3}
                                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                />
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-slate-400" />
                                    Activity notes
                                </p>
                                <form onSubmit={handleAddNote} className="mt-3">
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Add a progress update or note..."
                                        className="w-full min-h-[96px] resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                        >
                                            Post note
                                        </button>
                                    </div>
                                </form>

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
                                            value={deal.amount}
                                            onChange={(e) =>
                                                updateDeal(deal._id, { amount: parseFloat(e.target.value) || 0 })
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
                                                value={deal.assignee?._id || ''}
                                                onChange={(e) => updateDeal(deal._id, { assignee: e.target.value })}
                                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                                            >
                                                <option value="">Unassigned</option>
                                                {activeWorkspace?.members?.map((m) => (
                                                    <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                                                        {m.user?.name || m.name}
                                                    </option>
                                                ))}
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
                                        {contact?.name ? 'Edit' : 'Add'}
                                    </button>
                                </div>

                                {contact?.name ? (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                                        <div className="mt-2 space-y-2 text-xs text-slate-600">
                                            {contact.email ? (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {contact.email}
                                                </div>
                                            ) : null}
                                            {contact.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {contact.phone}
                                                </div>
                                            ) : null}
                                            {!contact.email && !contact.phone ? (
                                                <p className="text-slate-500">No contact details.</p>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-slate-500">No contact linked yet.</p>
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
                message={`Delete "${deal.title}"? This cannot be undone.`}
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
