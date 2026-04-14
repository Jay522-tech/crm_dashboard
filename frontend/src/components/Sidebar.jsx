import React, { useState } from 'react'
import useStore from '../store'
import {
    Users,
    Settings,
    Briefcase,
    Plus,
    LogOut,
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Scale,
    Activity,
    CreditCard,
    FileText,
    MessageSquare,
    BarChart3,
    Sparkles,
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import WorkspaceModal from './WorkspaceModal'
import { NavLink, useNavigate } from 'react-router-dom'

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const Sidebar = ({ onNavigate }) => {
    const { workspaces, activeWorkspaceId, setActiveWorkspace, user, logout } = useStore()
    const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId)
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
    const navigate = useNavigate()

    // Get current user's role in the active workspace
    const currentUserMember = activeWorkspace?.members?.find(
        (m) => (m.user?._id || m.user) === user?._id
    )
    const isAdmin = currentUserMember?.role === 'Admin' || currentUserMember?.role === 'Super Admin'

    const handleNavigate = () => {
        if (typeof onNavigate === 'function') onNavigate()
    }

    return (
        <div className="w-[17rem] shrink-0 border-r border-slate-200/80 bg-white flex flex-col shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)]">
            <div className="p-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/25">
                        <Sparkles size={20} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                            {activeWorkspace?.name || 'CRM'}
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Personal dashboard</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
                <div>
                    <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Main
                    </h3>
                    <div className="space-y-0.5">
                        <NavRow icon={<LayoutDashboard size={18} />} label="Dashboard" to="/dashboard" onNavigate={handleNavigate} />
                        <NavRow icon={<Calendar size={18} />} label="Calendar" to="/calendar" onNavigate={handleNavigate} />
                        <NavRow icon={<CheckSquare size={18} />} label="Pipeline" to="/pipeline" onNavigate={handleNavigate} />
                        <NavRow icon={<Scale size={18} />} label="Matters" to="/matters" onNavigate={handleNavigate} />
                        <NavRow icon={<Users size={18} />} label="Contacts" to="/contacts" onNavigate={handleNavigate} />
                        <NavRow icon={<Users size={18} />} label="Team" to="/team" onNavigate={handleNavigate} />
                        <NavRow icon={<Activity size={18} />} label="Activities" to="/activities" onNavigate={handleNavigate} />
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Workspaces
                    </h3>
                    <div className="space-y-0.5">
                        <NavRow icon={<Briefcase size={18} />} label="All deals" to="/deals" onNavigate={handleNavigate} />
                        <NavRow icon={<FileText size={18} />} label="Documents" to="/documents" onNavigate={handleNavigate} />
                        {isAdmin && (
                            <NavRow icon={<MessageSquare size={18} />} label="Communications" to="/communications" onNavigate={handleNavigate} />
                        )}
                        <NavRow icon={<BarChart3 size={18} />} label="Reports" to="/reports" onNavigate={handleNavigate} />

                        <button
                            type="button"
                            onClick={() => setIsWorkspaceModalOpen(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors mt-2 mb-1"
                        >
                            <Plus size={17} strokeWidth={2.25} />
                            New workspace
                        </button>

                        {workspaces.map((w) => (
                            <button
                                key={w._id}
                                type="button"
                                onClick={() => {
                                    setActiveWorkspace(w._id)
                                    navigate('/pipeline')
                                    handleNavigate()
                                }}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left font-medium',
                                    activeWorkspaceId === w._id
                                        ? 'bg-slate-100 text-slate-900 border-l-[3px] border-primary -ml-px pl-[10px]'
                                        : 'text-slate-600 hover:bg-slate-50 border-l-[3px] border-transparent'
                                )}
                            >
                                <div className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
                                <span className="truncate">{w.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>


            <div className="mt-auto border-t border-slate-200/80 p-3 space-y-1">
                <NavRow icon={<Settings size={18} />} label="Settings" to="/settings" onNavigate={handleNavigate} />
                <button
                    type="button"
                    onClick={() => {
                        logout()
                        handleNavigate()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 mt-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-bold text-slate-700 ring-2 ring-white shadow-sm">
                        {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
                    </div>
                </div>
            </div>

            <WorkspaceModal isOpen={isWorkspaceModalOpen} onClose={() => setIsWorkspaceModalOpen(false)} />
        </div>
    )
}

const NavRow = ({ icon, label, to, onNavigate }) => (
    <NavLink
        to={to}
        onClick={() => {
            if (typeof onNavigate === 'function') onNavigate()
        }}
        className={({ isActive }) =>
            cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                isActive
                    ? 'bg-slate-100 text-slate-900 border-l-[3px] border-primary -ml-px pl-[10px]'
                    : 'text-slate-600 hover:bg-slate-50 border-l-[3px] border-transparent'
            )
        }
    >
        {({ isActive }) => (
            <>
                <span className={isActive ? 'text-primary' : 'text-slate-400'}>{icon}</span>
                <span className="truncate">{label}</span>
            </>
        )}
    </NavLink>
)

export default Sidebar
