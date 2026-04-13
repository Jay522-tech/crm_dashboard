import React, { useState } from 'react'
import { X, User, Mail, Phone, DollarSign, Calendar, MessageSquare, Plus, Trash2, CheckCircle2, ChevronDown } from 'lucide-react'
import useStore from '../store'
import { format } from 'date-fns'
import ConfirmModal from './ConfirmModal'
import ContactModal from './ContactModal'

const STAGES = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost']

const DealModal = ({ dealId, onClose }) => {
    const { deals, updateDeal, addNote, deleteDeal, workspaces, activeWorkspaceId } = useStore()
    const deal = deals.find(d => d._id === dealId)
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)

    const assignee = deal?.assignee
    const contact = deal?.contact
    const dealNotes = deal?.notes ? [...deal.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []

    const [noteContent, setNoteContent] = useState('')
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isContactOpen, setIsContactOpen] = useState(false)

    if (!deal) return null

    const handleAddNote = (e) => {
        e.preventDefault()
        if (!noteContent.trim()) return
        addNote(deal._id, noteContent)
        setNoteContent('')
    }

    const handleArchiveConfirm = async () => {
        await deleteDeal(deal._id)
        onClose()
    }

    const handleSaveContact = (contactData) => {
        updateDeal(deal._id, { contact: contactData })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex-1">
                        <input
                            value={deal.title}
                            onChange={(e) => updateDeal(deal._id, { title: e.target.value })}
                            className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full hover:bg-muted/50 rounded transition-colors px-1 -ml-1 outline-none"
                        />
                        <div className="flex items-center gap-4 mt-2">
                            <div className="relative group/stage">
                                <select
                                    value={deal.stage}
                                    onChange={(e) => updateDeal(deal._id, { stage: e.target.value })}
                                    className="appearance-none bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20 transition-all outline-none pr-8"
                                >
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1.5 text-primary pointer-events-none" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                                Created on {deal.createdAt ? format(new Date(deal.createdAt), 'MMM d, yyyy') : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto flex flex-col md:flex-row">
                    {/* Main Content */}
                    <div className="flex-[2] p-6 border-r border-border space-y-8">
                        <section>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <MessageSquare size={18} />
                                Activity Notes
                            </h3>
                            <form onSubmit={handleAddNote} className="mb-6">
                                <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Add a progress update or note..."
                                    className="w-full min-h-[100px] p-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm outline-none"
                                />
                                <div className="flex justify-end mt-2">
                                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                        Post Note
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                {dealNotes.map((note, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                        <div className="mt-2 text-[10px] text-muted-foreground font-medium flex items-center gap-2">
                                            <CheckCircle2 size={10} className="text-primary" />
                                            {note.createdAt ? format(new Date(note.createdAt), 'MMM d, h:mm a') : 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="flex-1 p-6 bg-muted/10 space-y-8">
                        <section>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Deal Details</h4>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                        <DollarSign size={14} />
                                        Deal Value ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={deal.amount}
                                        onChange={(e) => updateDeal(deal._id, { amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                        <User size={14} />
                                        Assignee
                                    </label>
                                    <select
                                        value={deal.assignee?._id || ''}
                                        onChange={(e) => updateDeal(deal._id, { assignee: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">Unassigned</option>
                                        {activeWorkspace?.members?.map(member => (
                                            <option key={member._id} value={member._id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Contact Info</h4>
                            {contact?.name ? (
                                <div className="space-y-3 p-4 rounded-xl bg-background border border-border shadow-sm group">
                                    <div className="flex items-center gap-3 border-b border-border pb-3 relative">
                                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground ring-2 ring-border">
                                            {contact.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{contact.name}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Decision Maker</div>
                                        </div>
                                        <button
                                            onClick={() => setIsContactOpen(true)}
                                            className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all text-muted-foreground"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-2 pt-1 text-xs">
                                        {contact.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                                <Mail size={14} />
                                                {contact.email}
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                                <Phone size={14} />
                                                {contact.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsContactOpen(true)}
                                    className="w-full py-4 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:bg-background hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                        <span>Add Contact Person</span>
                                    </div>
                                </button>
                            )}
                        </section>

                        <div className="pt-8">
                            <button
                                onClick={() => setIsConfirmOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-destructive border border-destructive/20 hover:bg-destructive/10 rounded-lg text-sm font-medium transition-all"
                            >
                                <Trash2 size={16} />
                                Archive Deal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleArchiveConfirm}
                title="Archive Deal"
                message={`Are you sure you want to archive "${deal.title}"? This action can be undone later from the archives.`}
                confirmText="Archive Deal"
                variant="destructive"
            />

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                onSave={handleSaveContact}
            />
        </div>
    )
}

export default DealModal
