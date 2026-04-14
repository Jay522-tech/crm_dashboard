import React, { useEffect, useMemo, useState } from 'react'
import useStore from '../store'
import { Menu, Search, Bell, Plus, UserPlus, HelpCircle, SlidersHorizontal, LayoutList, LayoutGrid } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import InviteMemberModal from './InviteMemberModal'

const Header = ({ onMenuClick }) => {
    const { activeWorkspaceId, workspaces, addDeal, setSearchTerm, searchTerm } = useStore()
    const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId)
    const navigate = useNavigate()
    const location = useLocation()
    const [elapsed, setElapsed] = useState(0)
    const [inviteOpen, setInviteOpen] = useState(false)

    const view = useMemo(() => {
        if (location.pathname.startsWith('/deals')) return 'list'
        if (location.pathname.startsWith('/pipeline')) return 'kanban'
        return 'kanban'
    }, [location.pathname])

    useEffect(() => {
        const id = setInterval(() => setElapsed((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [])

    const formatClock = (totalSec) => {
        const h = Math.floor(totalSec / 3600)
        const m = Math.floor((totalSec % 3600) / 60)
        const s = totalSec % 60
        return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
    }

    return (
        <header className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-6 py-3.5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="lg:hidden rounded-lg p-2 -ml-2 text-slate-600 hover:bg-slate-100 transition"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold text-slate-900 tracking-tight truncate">
                            {activeWorkspace?.name || 'Board'}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">Pipeline overview</p>
                    </div>

                    <div className="inline-flex rounded-lg border border-slate-200/90 bg-slate-50/80 p-0.5 shadow-inner">
                        <button
                            type="button"
                            onClick={() => navigate('/deals')}
                            className={`
                                inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all
                                ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}
                            `}
                        >
                            <LayoutList size={14} />
                            List
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/pipeline')}
                            className={`
                                inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all
                                ${view === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}
                            `}
                        >
                            <LayoutGrid size={14} />
                            Kanban
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:max-w-3xl">
                    <div className="relative flex-1 min-w-0">
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={17}
                        />
                        <input
                            type="search"
                            placeholder="Search deals, contacts, notes…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
                        <div
                            className="hidden sm:flex items-center tabular-nums rounded-lg border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                            title="Session timer"
                        >
                            {formatClock(elapsed)}
                        </div>
                        <button
                            type="button"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            title="Notifications"
                        >
                            <Bell size={20} strokeWidth={1.75} />
                        </button>
                        <button
                            type="button"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            title="Help"
                        >
                            <HelpCircle size={20} strokeWidth={1.75} />
                        </button>
                        <button
                            type="button"
                            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            title="Filters"
                        >
                            <SlidersHorizontal size={16} />
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={() => setInviteOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            title="Invite"
                        >
                            <UserPlus size={16} />
                            <span className="hidden sm:inline">Invite</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => addDeal({ title: 'New deal', stage: 'Lead', amount: 0 })}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
                        >
                            <Plus size={18} strokeWidth={2.25} />
                            New deal
                        </button>
                    </div>
                </div>
            </div>

            <InviteMemberModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
        </header>
    )
}

export default Header
