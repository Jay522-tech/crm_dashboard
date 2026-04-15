import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStore from '../store'
import { Menu, Search, Bell, Plus, UserPlus, SlidersHorizontal, LayoutList, LayoutGrid, Sun, Moon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import InviteMemberModal from './InviteMemberModal'
import { STAGES } from '../constants/kanbanConfig'
import { getInitialTheme, setTheme } from '../lib/theme'

const Header = ({ onMenuClick, onCreateDealRequest }) => {
    const {
        user,
        activeWorkspaceId,
        workspaces,
        setSearchTerm,
        searchTerm,
        pipelineStageFilter,
        setPipelineStageFilter,
        pipelineAssigneeFilter,
        setPipelineAssigneeFilter,
        pipelineAmountMin,
        pipelineAmountMax,
        setPipelineAmountMin,
        setPipelineAmountMax,
        clearAllPipelineFilters,
        pendingInvitations,
        fetchPendingInvitations,
    } = useStore()
    const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId)
    const navigate = useNavigate()
    const location = useLocation()
    const [inviteOpen, setInviteOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [theme, setThemeState] = useState(() => getInitialTheme())
    const notifRef = useRef(null)
    const filterRef = useRef(null)

    const currentUserId = user?._id || user?.id
    const currentUserRole = activeWorkspace?.members?.find((m) => {
        const memberUser = m.user
        const memberId = memberUser?._id || memberUser?.id || memberUser
        return String(memberId) === String(currentUserId)
    })?.role
    const isAtLeastAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin'

    const view = useMemo(() => {
        if (location.pathname.startsWith('/deals')) return 'list'
        if (location.pathname.startsWith('/pipeline')) return 'kanban'
        return 'kanban'
    }, [location.pathname])

    useEffect(() => {
        if (activeWorkspaceId) fetchPendingInvitations(activeWorkspaceId)
    }, [activeWorkspaceId, fetchPendingInvitations])

    useEffect(() => {
        if (!notifOpen && !filterOpen) return
        const onDown = (e) => {
            const t = e.target
            if (notifRef.current?.contains(t) || filterRef.current?.contains(t)) return
            setNotifOpen(false)
            setFilterOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [notifOpen, filterOpen])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        setThemeState(next)
    }

    const pendingCount = isAtLeastAdmin ? (pendingInvitations || []).length : 0

    const toggleStageInFilter = (stage) => {
        const current = pipelineStageFilter === null ? [...STAGES] : [...pipelineStageFilter]
        const set = new Set(current)
        if (set.has(stage)) set.delete(stage)
        else set.add(stage)
        const arr = STAGES.filter((s) => set.has(s))
        if (arr.length === STAGES.length) setPipelineStageFilter(null)
        else setPipelineStageFilter(arr)
    }

    const assigneeOptions = useMemo(() => {
        const members = activeWorkspace?.members || []
        const out = []
        const seen = new Set()
        for (const mem of members) {
            const u = mem.user
            const id = u?._id ?? u
            if (id == null || seen.has(String(id))) continue
            seen.add(String(id))
            const name = u?.name || u?.email || 'Member'
            out.push({ id: String(id), name })
        }
        return out.sort((a, b) => a.name.localeCompare(b.name))
    }, [activeWorkspace])

    const pipelineFiltersActive =
        pipelineStageFilter != null ||
        pipelineAssigneeFilter != null ||
        pipelineAmountMin != null ||
        pipelineAmountMax != null

    const parseAmountInput = (raw) => {
        if (raw === '' || raw == null) return null
        const n = parseFloat(String(raw))
        return Number.isFinite(n) ? n : null
    }

    return (
        <header className="relative z-50 shrink-0 border-b border-border bg-card/95 backdrop-blur-sm px-3 py-3 sm:px-4 md:px-5 lg:px-6">
            <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-lg p-2 -ml-2 text-slate-600 hover:bg-slate-100 transition"
                        aria-label="Toggle sidebar"
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
                            className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm outline-none transition focus:border-primary/40 focus:bg-card focus:ring-2 focus:ring-primary/15"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
                        </button>

                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setFilterOpen(false)
                                    setNotifOpen((o) => !o)
                                    if (activeWorkspaceId) fetchPendingInvitations(activeWorkspaceId)
                                }}
                                className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                title="Notifications"
                                aria-expanded={notifOpen}
                            >
                                <Bell size={20} strokeWidth={1.75} />
                                {pendingCount > 0 ? (
                                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                                ) : null}
                            </button>
                            {notifOpen ? (
                                <div className="absolute right-0 top-full z-[100] mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-card py-2 shadow-xl">
                                    <div className="border-b border-border/70 px-3 pb-2">
                                        <p className="text-xs font-semibold text-foreground">Notifications</p>
                                        <p className="text-[11px] text-muted-foreground">Workspace invites and alerts</p>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto px-2 py-2">
                                        {!isAtLeastAdmin ? (
                                            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                                                Pending invitations are visible to workspace admins. Visit{' '}
                                                <button
                                                    type="button"
                                                    className="font-semibold text-primary underline-offset-2 hover:underline"
                                                    onClick={() => {
                                                        setNotifOpen(false)
                                                        navigate('/team')
                                                    }}
                                                >
                                                    Team
                                                </button>{' '}
                                                for workspace activity.
                                            </p>
                                        ) : (pendingInvitations || []).length === 0 ? (
                                            <p className="px-2 py-6 text-center text-xs text-muted-foreground">No pending invitations.</p>
                                        ) : (
                                            <ul className="space-y-1">
                                                {(pendingInvitations || []).map((invite) => (
                                                    <li
                                                        key={invite._id}
                                                        className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs"
                                                    >
                                                        <p className="font-medium text-foreground">{invite.email}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Invited · {new Date(invite.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {isAtLeastAdmin && (pendingInvitations || []).length > 0 ? (
                                        <div className="border-t border-border/70 px-2 py-2">
                                            <button
                                                type="button"
                                                className="w-full rounded-lg py-2 text-center text-xs font-semibold text-primary hover:bg-primary/10"
                                                onClick={() => {
                                                    setNotifOpen(false)
                                                    navigate('/team')
                                                }}
                                            >
                                                Open Team
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="relative" ref={filterRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setNotifOpen(false)
                                    setFilterOpen((o) => !o)
                                }}
                                className={`relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted/40 ${
                                    pipelineFiltersActive
                                        ? 'border-indigo-300/80 bg-indigo-500/10 text-indigo-900 dark:text-indigo-100'
                                        : 'border-border text-muted-foreground'
                                }`}
                                title="Filter deals on Pipeline and Deals list"
                                aria-expanded={filterOpen}
                            >
                                <SlidersHorizontal size={16} />
                                <span className="hidden sm:inline">Filter</span>
                                {pipelineFiltersActive ? (
                                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
                                ) : null}
                            </button>
                            {filterOpen ? (
                                <div className="absolute right-0 top-full z-[100] mt-2 w-72 max-h-[min(32rem,85vh)] overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-xl">
                                    <p className="text-xs font-semibold text-foreground">Deal filters</p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        Applies to Kanban and All Deals. Search bar still narrows by text.
                                    </p>

                                    <div className="mt-3 border-t border-border/70 pt-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Stages</p>
                                        <ul className="mt-2 space-y-2">
                                            {STAGES.map((stage) => (
                                                <li key={stage}>
                                                    <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-border text-primary focus:ring-primary/30"
                                                            checked={
                                                                pipelineStageFilter === null ||
                                                                pipelineStageFilter.includes(stage)
                                                            }
                                                            onChange={() => toggleStageInFilter(stage)}
                                                        />
                                                        {stage}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-3 border-t border-border/70 pt-3">
                                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground" htmlFor="filter-assignee">
                                            Assignee
                                        </label>
                                        <select
                                            id="filter-assignee"
                                            className="mt-1.5 w-full rounded-lg border border-border bg-card px-2 py-2 text-xs text-foreground outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                                            value={pipelineAssigneeFilter ?? ''}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                setPipelineAssigneeFilter(v === '' ? null : v)
                                            }}
                                        >
                                            <option value="">All assignees</option>
                                            <option value="unassigned">Unassigned</option>
                                            {assigneeOptions.map(({ id, name }) => (
                                                <option key={id} value={id}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-3 border-t border-border/70 pt-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Deal amount (USD)</p>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="sr-only" htmlFor="filter-amt-min">
                                                    Minimum amount
                                                </label>
                                                <input
                                                    id="filter-amt-min"
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={0}
                                                    step="any"
                                                    placeholder="Min"
                                                    className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                                                    value={pipelineAmountMin ?? ''}
                                                    onChange={(e) => setPipelineAmountMin(parseAmountInput(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="sr-only" htmlFor="filter-amt-max">
                                                    Maximum amount
                                                </label>
                                                <input
                                                    id="filter-amt-max"
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={0}
                                                    step="any"
                                                    placeholder="Max"
                                                    className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                                                    value={pipelineAmountMax ?? ''}
                                                    onChange={(e) => setPipelineAmountMax(parseAmountInput(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="mt-4 w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/40"
                                        onClick={() => clearAllPipelineFilters()}
                                    >
                                        Reset all filters
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={() => setInviteOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/40"
                            title="Invite"
                        >
                            <UserPlus size={16} />
                            <span className="hidden sm:inline">Invite</span>
                        </button>
                        <button
                            type="button"
                            disabled={!activeWorkspaceId || workspaces.length === 0 || !isAtLeastAdmin}
                            title={
                                !activeWorkspaceId || workspaces.length === 0
                                    ? 'પહેલાં workspace બનાવો અથવા પસંદ કરો'
                                    : !isAtLeastAdmin
                                        ? 'Only Admin or Super Admin can create deals'
                                    : undefined
                            }
                            onClick={() => onCreateDealRequest?.({ stage: 'Lead' })}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-50"
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
