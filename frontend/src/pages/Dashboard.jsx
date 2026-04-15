import React, { useEffect, useMemo, useState } from 'react'
import {
    Briefcase,
    DollarSign,
    TrendingUp,
    Sparkles,
    ArrowUpRight,
    Globe,
    User,
    LayoutGrid,
    ChevronRight,
    BarChart3,
} from 'lucide-react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import useStore from '../store'
import { cn } from '../lib/utils'
import { STAGES } from '../constants/kanbanConfig'

/** Soft chart palette — light, professional */
const CHART_COLORS = ['#93c5fd', '#86efac', '#fcd34d', '#fca5a5', '#c4b5fd', '#67e8f9']

const STAGE_DOT = {
    Lead: 'bg-violet-300',
    Contacted: 'bg-orange-300',
    Qualified: 'bg-amber-300',
    Won: 'bg-sky-300',
    Lost: 'bg-slate-300',
}

/** Slightly stronger for small text badges (readability) */
const STAGE_BADGE = {
    Lead: 'bg-violet-500',
    Contacted: 'bg-orange-500',
    Qualified: 'bg-amber-500',
    Won: 'bg-sky-600',
    Lost: 'bg-slate-500',
}

const formatDashboardCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0)

const SUMMARY_DEFAULT = {
    totalDeals: 0,
    totalValue: 0,
    wonValue: 0,
    lostValue: 0,
    avgDealValue: 0,
    winRate: 0,
    openDeals: 0,
}

function DashboardAreaTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                <p className="text-[11px] font-medium text-muted-foreground">{payload[0].payload.name}</p>
                <p className="text-sm font-semibold text-sky-700">{formatDashboardCurrency(payload[0].value)}</p>
            </div>
        )
    }
    return null
}

function AssigneePieTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const row = payload[0]
        return (
            <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                <p className="text-[11px] font-medium text-muted-foreground">{row.name}</p>
                <p className="text-sm font-semibold text-foreground">
                    {row.value} deals
                </p>
            </div>
        )
    }
    return null
}

const statAccent = {
    indigo: 'bg-sky-50/90 text-sky-700 ring-sky-100/80',
    emerald: 'bg-emerald-50/90 text-emerald-700 ring-emerald-100/80',
    amber: 'bg-amber-50/90 text-amber-800 ring-amber-100/80',
    violet: 'bg-violet-50/90 text-violet-700 ring-violet-100/80',
}

function StatCard({ label, value, hint, icon, accent = 'indigo' }) {
    return (
        <div className="group rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div
                    className={cn(
                        'inline-flex rounded-xl p-2.5 ring-1',
                        statAccent[accent] || statAccent.indigo
                    )}
                >
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p> : null}
        </div>
    )
}

function StatCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
            <div className="mt-4 h-8 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
    )
}

function ChartEmpty({ title, hint }) {
    return (
        <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 text-center px-4">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="max-w-xs text-xs text-muted-foreground/70">{hint}</p>
        </div>
    )
}

const DashboardPage = () => {
    const navigate = useNavigate()
    const {
        activeWorkspaceId,
        dashboardStats,
        dashboardLoading,
        fetchDashboardStats,
        reportStats,
        reportLoading,
        fetchReportStats,
    } = useStore()

    const [scope, setScope] = useState('workspace')

    useEffect(() => {
        if (scope === 'workspace' && activeWorkspaceId) {
            fetchDashboardStats(activeWorkspaceId)
        } else if (scope === 'global') {
            fetchReportStats('global')
        }
    }, [activeWorkspaceId, fetchDashboardStats, fetchReportStats, scope])

    const stats = scope === 'workspace' ? dashboardStats : reportStats
    const isLoading = scope === 'workspace' ? dashboardLoading : reportLoading

    const summary = useMemo(() => {
        const s = stats?.summary
        if (!s) return { ...SUMMARY_DEFAULT }
        return { ...SUMMARY_DEFAULT, ...s }
    }, [stats])

    const stageCounts = useMemo(() => {
        const fromMap = stats?.stageCounts
        if (fromMap && typeof fromMap === 'object') {
            return STAGES.reduce((acc, st) => ({ ...acc, [st]: fromMap[st] || 0 }), {})
        }
        const dist = stats?.stageDistribution || []
        const merged = dist.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
        return STAGES.reduce((acc, st) => ({ ...acc, [st]: merged[st] || 0 }), {})
    }, [stats])

    const growthData = useMemo(() => {
        const raw = stats?.growthData
        if (!raw || !Array.isArray(raw)) return []
        return raw
    }, [stats])

    const growthChartData = useMemo(() => {
        if (growthData.length !== 1) return growthData
        const point = growthData[0]
        // Keep chart visible even with a single month by padding neighbors.
        return [
            { ...point, name: ' ' },
            point,
            { ...point, name: '  ' },
        ]
    }, [growthData])

    const assigneeDistribution = useMemo(() => {
        const raw = stats?.assigneeDistribution
        if (!raw || !Array.isArray(raw) || raw.length === 0) return []
        return raw
    }, [stats])

    const recentDeals = useMemo(() => {
        const raw = stats?.recentDeals ?? stats?.topDeals ?? []
        return raw.map((d) => ({
            _id: d._id,
            title: d.title,
            stage: d.stage,
            amount: d.amount ?? 0,
            assignee: d.assignee
                ? { _id: d.assignee._id, name: d.assignee.name }
                : null,
            updatedAt: d.updatedAt,
            workspaceName: d.workspace?.name,
        }))
    }, [stats])

    const workspaceLabel =
        scope === 'global'
            ? stats?.workspace?.name || 'All your workspaces'
            : stats?.workspace?.name || 'Workspace'

    const growthHint =
        scope === 'global'
            ? 'Based on deals created in the last 6 months across your workspaces.'
            : 'Based on when deals were created in this workspace.'

    return (
        <div className="flex flex-col gap-8 pb-8">
            {/* Hero — blur layer clipped; text layer overflow visible so headings are never cut off */}
            <div className="relative rounded-2xl border border-border/70 bg-gradient-to-br from-muted/70 via-card to-sky-500/10">
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                    aria-hidden
                >
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />
                    <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-100/35 blur-3xl" />
                </div>
                <div className="relative flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-9 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overview</p>
                        <h1 className="text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl sm:leading-snug">
                            Dashboard
                        </h1>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {scope === 'global'
                                ? `All workspaces you belong to — rolled up KPIs, stages, and top deals.`
                                : `${workspaceLabel} — live counts, trends, and recent updates.`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="inline-flex rounded-xl border border-border/70 bg-card/80 p-1 shadow-sm backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => setScope('workspace')}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                                    scope === 'workspace'
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/40'
                                )}
                            >
                                <User size={14} />
                                This workspace
                            </button>
                            <button
                                type="button"
                                onClick={() => setScope('global')}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                                    scope === 'global'
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/40'
                                )}
                            >
                                <Globe size={14} />
                                All workspaces
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/pipeline')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/90 px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted/40"
                        >
                            <LayoutGrid size={16} />
                            Open pipeline
                            <ChevronRight size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Total deals"
                            value={summary.totalDeals}
                            hint="In current scope"
                            accent="indigo"
                            icon={<TrendingUp size={20} strokeWidth={2} />}
                        />
                        <StatCard
                            label="Total deal value"
                            value={formatDashboardCurrency(summary.totalValue)}
                            hint="Sum of all deal amounts in view"
                            accent="emerald"
                            icon={<DollarSign size={20} strokeWidth={2} />}
                        />
                        <StatCard
                            label="Won revenue"
                            value={formatDashboardCurrency(summary.wonValue)}
                            hint="Closed won only"
                            accent="amber"
                            icon={<ArrowUpRight size={20} strokeWidth={2} />}
                        />
                        <StatCard
                            label="Win rate"
                            value={`${summary.winRate ?? 0}%`}
                            hint={`${summary.openDeals ?? 0} open deals`}
                            accent="violet"
                            icon={<Sparkles size={20} strokeWidth={2} />}
                        />
                    </>
                )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Revenue trend</h2>
                        <p className="mt-1 text-xs text-muted-foreground">{growthHint}</p>
                    </div>
                    {growthData.length === 0 ? (
                        <ChartEmpty
                            title="No trend data yet"
                            hint="When deals exist for this period, totals by month appear here. Add deals from the pipeline."
                        />
                    ) : (
                        <div className="h-[280px] w-full min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="dashAreaFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        tickFormatter={(value) => String(value || '').trim()}
                                        dy={8}
                                    />
                                    <YAxis hide domain={[0, 'auto']} />
                                    <Tooltip content={<DashboardAreaTooltip />} cursor={{ stroke: '#7dd3fc', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#38bdf8"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#dashAreaFill)"
                                        animationDuration={600}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="relative rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm sm:p-8">
                    <div className="mb-2">
                        <h2 className="text-base font-semibold text-slate-800">Deals by owner</h2>
                        <p className="mt-1 text-xs text-slate-400">Count of deals per assignee</p>
                    </div>
                    {assigneeDistribution.length === 0 ? (
                        <ChartEmpty
                            title="No assignee split"
                            hint="Assign deals to team members to see distribution here."
                        />
                    ) : (
                        <>
                            <div className="h-[280px] w-full min-h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assigneeDistribution}
                                            innerRadius={72}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="count"
                                            animationDuration={600}
                                            stroke="none"
                                        >
                                            {assigneeDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${entry.name}-${index}`}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<AssigneePieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-100/90 pt-4">
                                {assigneeDistribution.slice(0, 6).map((d, i) => (
                                    <div key={`${d.name}-${i}`} className="flex items-center gap-2 text-xs text-slate-500">
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                        />
                                        <span className="max-w-[8rem] truncate font-medium">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stages + activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm sm:p-8">
                    <h2 className="text-base font-semibold text-slate-800">Pipeline by stage</h2>
                    <p className="mt-1 text-xs text-slate-400">Deal counts for the selected scope</p>
                    <div className="mt-8 space-y-6">
                        {STAGES.map((stage) => {
                            const count = stageCounts[stage] || 0
                            const total = Math.max(summary.totalDeals || 0, 1)
                            const percent = Math.round((count / total) * 100)
                            return (
                                <div key={stage}>
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className={cn('h-2 w-2 shrink-0 rounded-full', STAGE_DOT[stage])} />
                                            <span className="truncate font-medium text-slate-700">{stage}</span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3 tabular-nums">
                                            <span className="font-semibold text-slate-800">{count}</span>
                                            <span className="rounded-md bg-slate-100/90 px-2 py-0.5 text-xs font-medium text-slate-500">
                                                {percent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100/90">
                                        <div
                                            className={cn('h-full rounded-full transition-all duration-700', STAGE_DOT[stage])}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-sky-50/90 p-2 text-sky-700 ring-1 ring-sky-100/80">
                            <Briefcase size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                {scope === 'global' ? 'Top deals' : 'Recent deals'}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {scope === 'global'
                                    ? 'Highest value in this scope'
                                    : 'Latest updates in this workspace'}
                            </p>
                        </div>
                    </div>
                    {recentDeals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 py-14 text-center">
                            <Briefcase size={32} className="text-slate-300" />
                            <p className="text-sm font-medium text-slate-600">No deals to show</p>
                            <p className="text-xs text-slate-400">Create deals on the pipeline</p>
                            <button
                                type="button"
                                onClick={() => navigate('/pipeline')}
                                className="mt-1 text-xs font-semibold text-sky-700 hover:underline"
                            >
                                Go to pipeline
                            </button>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {recentDeals.slice(0, 5).map((deal) => (
                                <li
                                    key={deal._id}
                                    className="rounded-xl border border-slate-100/90 bg-slate-50/30 p-4 transition-colors hover:border-slate-200/90 hover:bg-white"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-800">{deal.title}</p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {deal.assignee?.name || 'Unassigned'}
                                                {scope === 'global' && deal.workspaceName ? (
                                                    <span className="text-slate-400"> · {deal.workspaceName}</span>
                                                ) : null}
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white',
                                                STAGE_BADGE[deal.stage] || 'bg-slate-500'
                                            )}
                                        >
                                            {deal.stage}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-sky-700 tabular-nums">
                                            {formatDashboardCurrency(deal.amount)}
                                        </span>
                                        <span className="text-slate-400">
                                            {deal.updatedAt
                                                ? formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true })
                                                : '—'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
