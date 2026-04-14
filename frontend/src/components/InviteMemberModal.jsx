import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Copy, Link as LinkIcon, Mail } from 'lucide-react'
import useStore from '../store'
import Modal from './Modal'

const InviteMemberModal = ({ isOpen, onClose }) => {
    const { activeWorkspaceId, inviteMemberToWorkspace } = useStore()
    const [email, setEmail] = useState('')
    const [inviteLink, setInviteLink] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const canSubmit = Boolean(activeWorkspaceId) && Boolean(email.trim()) && !submitting

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite member">
            <form
                onSubmit={async (e) => {
                    e.preventDefault()
                    const target = email.trim()
                    if (!activeWorkspaceId) {
                        toast.error('Select a workspace first')
                        return
                    }
                    if (!target) return

                    setSubmitting(true)
                    try {
                        const result = await inviteMemberToWorkspace(activeWorkspaceId, target)
                        const link = result?.inviteLink || result?.data?.inviteLink
                        const mailSent = Boolean(result?.mailSent || result?.data?.mailSent)
                        if (link) {
                            setInviteLink(link)
                            toast.success(mailSent ? 'Invite sent via email' : 'Invite link created')
                        } else {
                            toast.success('Member added')
                            setEmail('')
                            setInviteLink('')
                            onClose()
                        }
                    } catch (err) {
                        toast.error(err?.response?.data?.message || 'Failed to send invite')
                    } finally {
                        setSubmitting(false)
                    }
                }}
                className="space-y-4"
            >
                <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                        <Mail size={16} />
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@company.com"
                        className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {inviteLink ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                            <LinkIcon size={14} />
                            Invite link
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                value={inviteLink}
                                readOnly
                                className="flex-1 min-w-0 rounded-lg bg-muted border border-border px-3 py-2 text-xs outline-none"
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(inviteLink)
                                        toast.success('Copied')
                                    } catch {
                                        toast.error('Copy failed')
                                    }
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                <Copy size={14} />
                                Copy
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                            Share this with the user. They can register and join.
                        </p>
                    </div>
                ) : null}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!canSubmit}
                    >
                        {submitting ? 'Sending…' : 'Send invite'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default InviteMemberModal

