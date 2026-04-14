import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Users, Mail, Phone, Building2, Tag } from 'lucide-react'
import useStore from '../store'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

const ContactsTable = ({ contacts }) => {
    const [page, setPage] = useState(1)
    const limit = 10

    const all = useMemo(() => contacts || [], [contacts])
    const totalPages = Math.max(Math.ceil(all.length / limit), 1)
    const rows = useMemo(() => {
        const start = (page - 1) * limit
        return all.slice(start, start + limit)
    }, [all, page])

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Directory</p>
                    <span className="text-xs text-slate-500">{all.length} contacts</span>
                </div>
                {all.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        No contacts yet. Add a contact to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-3">Name</th>
                                    <th className="text-left font-semibold px-4 py-3">Company</th>
                                    <th className="text-left font-semibold px-4 py-3">Email</th>
                                    <th className="text-left font-semibold px-4 py-3">Phone</th>
                                    <th className="text-left font-semibold px-4 py-3">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{c.company || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{c.email || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{c.phone || '—'}</td>
                                        <td className="px-4 py-3">
                                            {(c.tags?.length || 0) === 0 ? (
                                                <span className="text-slate-400">—</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {c.tags.slice(0, 3).map((t) => (
                                                        <span key={t} className="text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
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
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                    onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                />
            )}
        </>
    )
}

const ContactsPage = () => {
    const { activeWorkspaceId, contacts, fetchContacts, createContact } = useStore()
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [company, setCompany] = useState('')
    const [tags, setTags] = useState('')

    useEffect(() => {
        if (activeWorkspaceId) fetchContacts(activeWorkspaceId)
    }, [activeWorkspaceId, fetchContacts])

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Users size={18} />
                        Contacts
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">People and companies linked to deals</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
                >
                    <Plus size={18} />
                    New contact
                </button>
            </div>

            <ContactsTable key={activeWorkspaceId || 'no-workspace'} contacts={contacts} />

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New contact">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const parsedTags = tags
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                        createContact({ name, email: email || undefined, phone: phone || undefined, company: company || undefined, tags: parsedTags })
                        setIsOpen(false)
                        setName('')
                        setEmail('')
                        setPhone('')
                        setCompany('')
                        setTags('')
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            <Users size={16} />
                            Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                                <Mail size={16} />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                                <Phone size={16} />
                                Phone
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="+1 555 0100"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            <Building2 size={16} />
                            Company
                        </label>
                        <input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Acme Inc."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            <Tag size={16} />
                            Tags (comma separated)
                        </label>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="client, vip, decision-maker"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                            Create
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ContactsPage

