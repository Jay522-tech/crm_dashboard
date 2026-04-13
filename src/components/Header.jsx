import React, { useState } from 'react'
import useStore from '../store'
import { Search, Bell, Plus, UserPlus, Mail } from 'lucide-react'
import Modal from './Modal'

const Header = () => {
    const { activeWorkspaceId, workspaces, addDeal, user, setSearchTerm, searchTerm } = useStore()
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')

    const handleInvite = (e) => {
        e.preventDefault()
        alert(`Invitation sent to ${inviteEmail}!`)
        setIsInviteOpen(false)
        setInviteEmail('')
    }

    return (
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">{activeWorkspace?.name || 'Board'}</h1>
                <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search deals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-sm focus:outline-none w-48"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold ring-2 ring-border">
                        {user?.name?.[0]}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user?.name}</span>
                </div>

                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Bell size={20} />
                </button>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg"
                >
                    <UserPlus size={18} />
                    Invite
                </button>
                <button
                    onClick={() => addDeal({ title: 'New Opportunity', stage: 'Lead', amount: 0 })}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg shadow-sm"
                >
                    <Plus size={18} />
                    New Deal
                </button>
            </div>

            <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Team Member">
                <form onSubmit={handleInvite} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Invite someone to join the **{activeWorkspace?.name}** workspace.
                    </p>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                            <input
                                autoFocus
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsInviteOpen(false)}
                            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                        >
                            Send Invitation
                        </button>
                    </div>
                </form>
            </Modal>
        </header>
    )
}

export default Header
