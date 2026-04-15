import React, { useMemo, useState } from 'react'
import { BriefcaseBusiness, ChevronDown, DollarSign, FileText, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import useStore from '../store'
import { STAGES } from '../constants/kanbanConfig'

const initialForm = (stage = 'Lead') => ({
    title: '',
    stage: stage || 'Lead',
    amount: '',
    description: '',
    assignee: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
})

const NewDealModal = ({ isOpen, onClose, defaultStage = 'Lead' }) => {
    const { addDeal, workspaces, activeWorkspaceId } = useStore()
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(() => initialForm(defaultStage))

    const activeWorkspace = useMemo(
        () => workspaces.find((w) => w._id === activeWorkspaceId),
        [workspaces, activeWorkspaceId]
    )

    const memberOptions = useMemo(() => {
        const members = activeWorkspace?.members || []
        return members
            .map((m) => ({
                id: String(m.user?._id || m.user),
                label: m.user?.name || m.user?.email || m.name || 'Member',
            }))
            .filter((m) => Boolean(m.id))
    }, [activeWorkspace])

    const handleClose = () => {
        if (saving) return
        setForm(initialForm(defaultStage))
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) {
            toast.error('Deal title is required')
            return
        }

        const payload = {
            title: form.title.trim(),
            stage: form.stage,
            amount: Number.isFinite(parseFloat(form.amount)) ? parseFloat(form.amount) : 0,
            description: form.description.trim(),
            assignee: form.assignee || undefined,
            contact: {
                name: form.contactName.trim(),
                email: form.contactEmail.trim(),
                phone: form.contactPhone.trim(),
            },
        }

        if (!payload.contact.name && !payload.contact.email && !payload.contact.phone) {
            delete payload.contact
        }

        setSaving(true)
        const created = await addDeal(payload)
        setSaving(false)

        if (!created) return
        toast.success('Deal created successfully')
        setForm(initialForm(defaultStage))
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Deal">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <BriefcaseBusiness size={12} /> Deal title
                        </span>
                        <input
                            autoFocus
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. ACME Annual Contract"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                            required
                        />
                    </label>

                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</span>
                        <div className="relative">
                            <select
                                value={form.stage}
                                onChange={(e) => setForm((prev) => ({ ...prev, stage: e.target.value }))}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                            >
                                {STAGES.map((stage) => (
                                    <option key={stage} value={stage}>
                                        {stage}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </label>

                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign size={12} /> Amount
                        </span>
                        <input
                            type="number"
                            min={0}
                            step="any"
                            value={form.amount}
                            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                            placeholder="0"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                        />
                    </label>

                    <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={12} /> Description
                        </span>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Short context about this opportunity..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                        />
                    </label>

                    <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <UserRound size={12} /> Assignee
                        </span>
                        <div className="relative">
                            <select
                                value={form.assignee}
                                onChange={(e) => setForm((prev) => ({ ...prev, assignee: e.target.value }))}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                            >
                                <option value="">Unassigned</option>
                                {memberOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </label>

                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact name</span>
                        <input
                            value={form.contactName}
                            onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                            placeholder="Optional"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                        />
                    </label>
                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact phone</span>
                        <input
                            value={form.contactPhone}
                            onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                            placeholder="Optional"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                        />
                    </label>
                    <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact email</span>
                        <input
                            type="email"
                            value={form.contactEmail}
                            onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="Optional"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        {saving ? 'Creating...' : 'Create deal'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default NewDealModal
