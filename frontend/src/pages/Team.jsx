import React, { useState, useEffect } from 'react'
import { Users, Mail, Plus, Loader2, Sparkles } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import useStore from '../store'
import toast from 'react-hot-toast'

const TeamPage = () => {
    const { user, workspaces, activeWorkspaceId, inviteMemberToWorkspace, updateMemberRole, removeMemberFromWorkspace, pendingInvitations, fetchPendingInvitations } = useStore()

    useEffect(() => {
        if (activeWorkspaceId) {
            fetchPendingInvitations(activeWorkspaceId)
        }
    }, [activeWorkspaceId, fetchPendingInvitations])
    const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId)
    const currentUserRole = activeWorkspace?.members?.find(m => String(m.user?._id || m.user) === String(user?._id))?.role
    const isAtLeastAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin'
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [removeMemberPending, setRemoveMemberPending] = useState(null)
    const getMemberInitials = (member) => {
        const raw = member?.user?.name || member?.name || member?.user?.email || member?.email || ''
        const parts = String(raw).trim().split(/\s+/).filter(Boolean)
        if (parts.length === 0) return '?'
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
        return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
    }

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!inviteEmail.trim()) return
        if (!activeWorkspaceId) return

        try {
            setInviting(true)
            const res = await inviteMemberToWorkspace(activeWorkspaceId, inviteEmail.trim())
            if (res.mode === 'added_existing_user') {
                toast.success(`${inviteEmail} added to workspace!`)
            } else {
                toast.success(`Invite sent to ${inviteEmail}`)
            }
            setInviteEmail('')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invite')
        } finally {
            setInviting(false)
        }
    }

    const confirmRemoveMember = async () => {
        if (!activeWorkspaceId || !removeMemberPending?.userId) return
        try {
            await removeMemberFromWorkspace(activeWorkspaceId, removeMemberPending.userId)
            toast.success('Member removed from workspace')
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not remove member')
            throw err
        }
    }

    return (
        <div className="flex flex-col gap-6 min-h-0 overflow-y-auto">
            <PageHeader
                title="Team Management"
                subtitle="Manage your workspace members and invitations"
                icon={<Users size={18} />}
            />

            <ConfirmDialog
                isOpen={Boolean(removeMemberPending)}
                onClose={() => setRemoveMemberPending(null)}
                title="Remove member?"
                message={
                    removeMemberPending
                        ? `Are you sure you want to remove ${removeMemberPending.name} from this workspace?`
                        : ''
                }
                confirmLabel="Remove"
                cancelLabel="Cancel"
                danger
                onConfirm={confirmRemoveMember}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Workspace Members</h3>
                                    <p className="text-xs text-slate-500">Invite colleagues to collaborate on deals</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white">
                            <form onSubmit={handleInvite} className="flex gap-2 mb-8">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Enter their email address..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={inviting || !inviteEmail.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
                                >
                                    {inviting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Invite Member
                                </button>
                            </form>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Current Members ({activeWorkspace?.members?.length || 0})</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {activeWorkspace?.members?.map((member) => (
                                        <div key={member.user?._id || member.user} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center text-sm font-bold text-foreground ring-2 ring-card shadow-sm transition-all">
                                                    {getMemberInitials(member)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{member.user?.name || member.name}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{member.user?.email || member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {isAtLeastAdmin && String(member.user?._id || member.user) !== String(user?._id) && String(member.user?._id || member.user) !== String(activeWorkspace.owner) ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) => updateMemberRole(activeWorkspaceId, member.user?._id || member.user, e.target.value)}
                                                            className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                                                        >
                                                            <option value="Admin">Admin</option>
                                                            <option value="Member">Member</option>
                                                        </select>
                                                        <button
                                                            onClick={() =>
                                                                setRemoveMemberPending({
                                                                    userId: member.user?._id || member.user,
                                                                    name: member.user?.name || 'this member',
                                                                })
                                                            }
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remove member"
                                                        >
                                                            <Plus size={14} className="rotate-45" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {activeWorkspace.owner === (member.user?._id || member.user) && (
                                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider ring-1 ring-primary/20">Owner</span>
                                                        )}
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${member.role === 'Super Admin' ? 'text-primary bg-primary/10' :
                                                            member.role === 'Admin' ? 'text-amber-600 bg-amber-50' :
                                                                'text-slate-400 bg-slate-100'
                                                            }`}>
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pending Invitations Section */}
                    {isAtLeastAdmin && (pendingInvitations || []).length > 0 && (
                        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-6">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Pending Invitations</h3>
                                        <p className="text-xs text-slate-500">Waiting for users to accept their invite</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {(pendingInvitations || []).map((invite) => (
                                    <div key={invite._id} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {invite.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{invite.email}</p>
                                                <p className="text-[10px] text-slate-400 italic">Sent on {new Date(invite.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md uppercase tracking-wider">Pending</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Workspace Context</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Team</p>
                                <p className="text-sm font-bold text-slate-800">{activeWorkspace?.name || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Seats</p>
                                <p className="text-sm font-bold text-slate-800">{activeWorkspace?.members?.length || 0} / 50</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-indigo-50/50 to-primary/5 p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={80} />
                        </div>
                        <p className="text-sm font-bold text-slate-900 relative z-10">Collaboration</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed relative z-10">
                            Inviting members allows them to view deals, add notes, and move cards across stages. You can assign them as "Assignees" in any deal's secondary details.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamPage
