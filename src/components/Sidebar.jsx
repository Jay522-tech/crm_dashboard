import React, { useState } from 'react'
import useStore from '../store'
import { Layout, Users, Settings, Briefcase, Plus, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import WorkspaceModal from './WorkspaceModal'

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const Sidebar = () => {
    const { workspaces, activeWorkspaceId, setActiveWorkspace, user, logout } = useStore()
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)

    return (
        <div className="w-64 border-r border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 px-2 py-1.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {activeWorkspace?.name?.[0] || user?.name?.[0] || 'W'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate">{activeWorkspace?.name || 'My CRM'}</h2>
                        <p className="text-xs text-muted-foreground truncate">{user?.name}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-6">
                <div>
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main</h3>
                    <div className="space-y-1">
                        <SidebarItem icon={<Layout size={18} />} label="Kanban Board" active />
                        <SidebarItem icon={<Users size={18} />} label="Teammates" onClick={() => alert('Feature coming soon!')} />
                        <SidebarItem icon={<Briefcase size={18} />} label="All Deals" onClick={() => alert('Feature coming soon!')} />
                    </div>
                </div>

                <div>
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Workspaces</h3>
                    <div className="space-y-1">
                        {workspaces.map(w => (
                            <button
                                key={w._id}
                                onClick={() => setActiveWorkspace(w._id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                                    activeWorkspaceId === w._id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                            >
                                <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                                <span className="truncate">{w.name}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => setIsWorkspaceModalOpen(true)}
                            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-primary hover:bg-primary/5 transition-colors mt-2"
                        >
                            <Plus size={16} />
                            New Workspace
                        </button>
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-border space-y-1">
                <SidebarItem icon={<Settings size={18} />} label="Settings" />
                <SidebarItem
                    icon={<LogOut size={18} />}
                    label="Logout"
                    onClick={logout}
                />
            </div>

            <WorkspaceModal
                isOpen={isWorkspaceModalOpen}
                onClose={() => setIsWorkspaceModalOpen(false)}
            />
        </div>
    )
}

const SidebarItem = ({ icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-left",
            active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
    >
        {icon}
        <span className="truncate">{label}</span>
    </button>
)

export default Sidebar
