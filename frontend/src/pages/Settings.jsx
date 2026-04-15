import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
    User,
    Briefcase,
    Shield,
    Bell,
    ChevronRight,
    Save,
    Trash2,
    CheckCircle2,
    Sparkles,
    Loader2,
    Users,
    Hash,
    Calendar,
} from 'lucide-react'
import useStore from '../store'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import ConfirmDialog from '../components/ConfirmDialog'

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
]

const inputClass =
    'w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/15'

function DetailRow({ icon, label, value }) {
    const LucideIcon = icon
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-100/90 bg-slate-50/40 px-4 py-3">
            <LucideIcon size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 break-all text-sm text-slate-700">{value}</p>
            </div>
        </div>
    )
}

function ProfilePanel({ user, onRefresh }) {
    const updateProfile = useStore((s) => s.updateProfile)
    const [name, setName] = useState(user?.name ?? '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setName(user?.name ?? '')
    }, [user?._id, user?.name])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateProfile({ name: name.trim() })
            await onRefresh?.()
            toast.success('Profile saved')
        } catch {
            toast.error('Could not save profile')
        } finally {
            setSaving(false)
        }
    }

    const created = user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'

    return (
        <div className="space-y-8">
            <div className="flex items-start gap-3 border-b border-slate-100/90 pb-6">
                <div className="rounded-xl bg-sky-50/90 p-2 text-sky-700 ring-1 ring-sky-100/80">
                    <User size={18} />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-slate-800">Profile</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Your display name and account details (email is read-only).
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow icon={Hash} label="User ID" value={user?._id || '—'} />
                <DetailRow icon={Calendar} label="Member since" value={created} />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600" htmlFor="settings-name">
                        Full name
                    </label>
                    <input
                        id="settings-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600" htmlFor="settings-email">
                        Email
                    </label>
                    <input
                        id="settings-email"
                        type="email"
                        disabled
                        value={user?.email ?? ''}
                        className={cn(inputClass, 'cursor-not-allowed bg-slate-50 text-slate-500')}
                    />
                </div>
                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

function WorkspacePanel({ workspace, activeWorkspaceId, user }) {
    const updateWorkspace = useStore((s) => s.updateWorkspace)
    const deleteWorkspace = useStore((s) => s.deleteWorkspace)
    const workspaces = useStore((s) => s.workspaces)
    const navigate = useNavigate()

    const [name, setName] = useState(workspace?.name ?? '')
    const [saving, setSaving] = useState(false)
    const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false)

    useEffect(() => {
        setName(workspace?.name ?? '')
    }, [workspace?._id, workspace?.name])

    const myRole = useMemo(() => {
        if (!workspace?.members || !user?._id) return null
        const m = workspace.members.find(
            (mem) => String(mem.user?._id || mem.user) === String(user._id)
        )
        return m?.role ?? null
    }, [workspace, user?._id])

    const canEdit = myRole === 'Admin' || myRole === 'Super Admin'
    const isOwner = workspace?.owner && user?._id && String(workspace.owner._id || workspace.owner) === String(user._id)
    const canDelete = isOwner || myRole === 'Super Admin'

    const memberCount = workspace?.members?.length ?? 0
    const ownerName = workspace?.owner?.name || '—'
    const wsCreated = workspace?.createdAt
        ? format(new Date(workspace.createdAt), 'MMM d, yyyy')
        : '—'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!activeWorkspaceId || !canEdit) return
        setSaving(true)
        try {
            await updateWorkspace(activeWorkspaceId, { name: name.trim() })
            toast.success('Workspace updated')
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not update workspace')
        } finally {
            setSaving(false)
        }
    }

    const performDeleteWorkspace = async () => {
        if (!activeWorkspaceId || !canDelete) return
        try {
            await deleteWorkspace(activeWorkspaceId)
            toast.success('Workspace deleted')
            navigate('/pipeline')
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not delete workspace')
            throw err
        }
    }

    if (!activeWorkspaceId || !workspace) {
        return (
            <p className="text-sm text-slate-500">Select a workspace from the sidebar to manage it here.</p>
        )
    }

    const workspaceLabel = workspace?.name || 'this workspace'

    return (
        <div className="space-y-8">
            <ConfirmDialog
                isOpen={deleteWorkspaceOpen}
                onClose={() => setDeleteWorkspaceOpen(false)}
                title="Delete workspace?"
                message={`Delete "${workspaceLabel}" and all its deals, contacts, and files? This cannot be undone.`}
                confirmLabel="Delete workspace"
                cancelLabel="Cancel"
                danger
                onConfirm={performDeleteWorkspace}
            />

            <div className="flex flex-col gap-4 border-b border-slate-100/90 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-emerald-50/90 p-2 text-emerald-700 ring-1 ring-emerald-100/80">
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Workspace</h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Active workspace settings and metadata.
                        </p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-lg border border-emerald-200/80 bg-emerald-50/50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                    <CheckCircle2 size={14} />
                    Active
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow icon={Hash} label="Workspace ID" value={workspace._id || '—'} />
                <DetailRow icon={Users} label="Members" value={`${memberCount} people`} />
                <DetailRow icon={User} label="Owner" value={ownerName} />
                <DetailRow icon={Shield} label="Your role" value={myRole || '—'} />
                <DetailRow icon={Calendar} label="Created" value={wsCreated} />
            </div>

            {!canEdit ? (
                <p className="rounded-xl border border-amber-100/90 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
                    Only <strong>Admins</strong> and <strong>Super Admins</strong> can rename this workspace.
                </p>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="max-w-md space-y-1.5">
                    <label className="text-xs font-medium text-slate-600" htmlFor="ws-name">
                        Display name
                    </label>
                    <input
                        id="ws-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!canEdit || saving}
                        className={cn(inputClass, !canEdit && 'cursor-not-allowed opacity-70')}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={!canEdit || saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving…' : 'Save workspace'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteWorkspaceOpen(true)}
                        disabled={!canDelete}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Delete workspace
                    </button>
                </div>
            </form>

            {workspaces.length <= 1 ? (
                <p className="text-xs text-slate-400">
                    This is your only workspace — deleting it removes all CRM data tied to it. Create another
                    workspace first if you need a backup.
                </p>
            ) : null}
        </div>
    )
}

const SettingsPage = () => {
    const user = useStore((s) => s.user)
    const workspaces = useStore((s) => s.workspaces)
    const activeWorkspaceId = useStore((s) => s.activeWorkspaceId)
    const refreshUser = useStore((s) => s.refreshUser)

    const [activeTab, setActiveTab] = useState('profile')

    const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId)

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="relative rounded-2xl border border-border/70 bg-gradient-to-br from-muted/70 via-card to-sky-500/10">
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                    aria-hidden
                >
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />
                    <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-100/35 blur-3xl" />
                </div>
                <div className="relative px-6 py-8 sm:px-8 sm:py-9">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preferences</p>
                    <h1 className="mt-1 text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl sm:leading-snug">
                        Settings
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Account data loads from the server; saving profile or workspace calls the API.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <nav
                    className="lg:col-span-4 xl:col-span-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 no-scrollbar"
                    aria-label="Settings sections"
                >
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const on = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex min-w-[10.5rem] shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all lg:min-w-0',
                                    on
                                        ? 'border-foreground/20 bg-foreground text-background shadow-sm'
                                        : 'border-border/80 bg-card/90 text-muted-foreground hover:border-border hover:bg-muted/40'
                                )}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Icon size={18} className={on ? 'text-background' : 'text-muted-foreground'} strokeWidth={2} />
                                    {tab.label}
                                </span>
                                <ChevronRight
                                    size={16}
                                    className={cn('shrink-0 opacity-60', on ? 'text-background' : 'text-muted-foreground')}
                                />
                            </button>
                        )
                    })}
                </nav>

                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm sm:p-8 min-h-[420px]">
                        {activeTab === 'profile' && user ? (
                            <ProfilePanel key={user._id} user={user} onRefresh={refreshUser} />
                        ) : null}
                        {activeTab === 'profile' && !user ? (
                            <p className="text-sm text-muted-foreground">Sign in to edit your profile.</p>
                        ) : null}

                        {activeTab === 'workspace' ? (
                            <WorkspacePanel
                                key={activeWorkspaceId || 'none'}
                                workspace={activeWorkspace}
                                activeWorkspaceId={activeWorkspaceId}
                                user={user}
                            />
                        ) : null}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="flex items-start gap-3 border-b border-slate-100/90 pb-6">
                                    <div className="rounded-xl bg-violet-50/90 p-2 text-violet-700 ring-1 ring-violet-100/80">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-800">Security</h2>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Password and session options for your account.
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-sky-100/90 bg-sky-50/40 px-5 py-4 text-sm leading-relaxed text-slate-600">
                                    <p className="flex items-center gap-2 font-medium text-sky-900">
                                        <Sparkles size={16} className="text-sky-600" />
                                        Password reset
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                                        Use the login page &quot;Forgot password&quot; flow when available.
                                        Multi-factor authentication can be added later for this CRM.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="flex items-start gap-3 border-b border-slate-100/90 pb-6">
                                    <div className="rounded-xl bg-amber-50/90 p-2 text-amber-800 ring-1 ring-amber-100/80">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-800">Notifications</h2>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Preferences are not persisted yet — toggles are a preview only.
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        {
                                            label: 'Email summaries',
                                            sub: 'Periodic digest of workspace activity',
                                        },
                                        {
                                            label: 'In-app alerts',
                                            sub: 'Deal and pipeline updates in the app',
                                        },
                                        {
                                            label: 'Deadline reminders',
                                            sub: 'Matters and calendar nudges',
                                        },
                                    ].map((item) => (
                                        <li
                                            key={item.label}
                                            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-slate-50/30 px-4 py-4 transition hover:border-slate-200 hover:bg-white"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>
                                            </div>
                                            <div
                                                className="relative h-7 w-12 shrink-0 rounded-full bg-sky-200/80 p-0.5"
                                                aria-hidden
                                            >
                                                <div className="ml-auto h-6 w-6 rounded-full bg-white shadow-sm ring-1 ring-slate-200/50" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
