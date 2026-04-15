import React, { useEffect, useMemo, useState } from 'react'
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    Globe,
    Briefcase,
    ArrowUpRight,
    Loader2,
    Users,
    LayoutList,
} from 'lucide-react'
import useStore from '../store'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
} from 'recharts'
import { cn } from '../lib/utils'

/** Soft fills — match Dashboard / light desktop look */
const BAR_COLORS = ['#93c5fd', '#86efac', '#fcd34d', '#fca5a5', '#c4b5fd', '#67e8f9']

const formatCurrency = (val) =>
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

const statAccent = {
    sky: 'bg-sky-50/90 text-sky-700 ring-sky-100/80',
    emerald: 'bg-emerald-50/90 text-emerald-700 ring-emerald-100/80',
    amber: 'bg-amber-50/90 text-amber-800 ring-amber-100/80',
    violet: 'bg-violet-50/90 text-violet-700 ring-violet-100/80',
}

function StatCard({ label, value, hint, icon, accent = 'sky' }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md">
            <div
                className={cn(
                    'inline-flex rounded-xl p-2.5 ring-1',
                    statAccent[accent] || statAccent.sky
                )}
            >
                {icon}
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-800 tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
            {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        </div>
    )
}

function StatCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="mt-4 h-8 w-28 animate-pulse rounded-md bg-slate-100" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-slate-100" />
        </div>
    )
}

function ChartCard({ title, subtitle, children, className }) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm sm:p-8',
                className
            )}
        >
            <div className="mb-6">
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            </div>
            {children}
        </div>
    )
}

const ReportsPage = () => {
    const { activeWorkspaceId, reportStats, reportLoading, fetchReportStats } = useStore()
    const [scope, setScope] = useState('workspace')

    useEffect(() => {
        fetchReportStats(scope, activeWorkspaceId)
    }, [scope, activeWorkspaceId, fetchReportStats])

    const summary = useMemo(() => {
        const s = reportStats?.summary
        if (!s) return { ...SUMMARY_DEFAULT }
        return { ...SUMMARY_DEFAULT, ...s }
    }, [reportStats])

    const {
        stageDistribution = [],
        growthData = [],
        topDeals = [],
        revenueByWorkspace = [],
        assigneeDistribution = [],
    } = reportStats || {}

    const stageBarData = useMemo(
        () => (Array.isArray(stageDistribution) ? stageDistribution : []),
        [stageDistribution]
    )

    const growthSeries = useMemo(
        () => (Array.isArray(growthData) && growthData.length > 0 ? growthData : []),
        [growthData]
    )

    const matrixRows = scope === 'global' ? revenueByWorkspace : stageDistribution
    const maxMatrixValue = useMemo(() => {
        if (!matrixRows?.length) return 1
        return Math.max(
            ...matrixRows.map((item) => Number(item.totalValue ?? item.value ?? 0) || 0),
            1
        )
    }, [matrixRows])

    if (!reportStats && reportLoading) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="animate-spin text-sky-600" size={28} />
                <p className="text-sm font-medium">Loading reports…</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Hero — same language as Dashboard */}
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
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Analytics</p>
                        <h1 className="text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl sm:leading-snug">
                            Reports
                        </h1>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {scope === 'global'
                                ? 'Performance across every workspace you belong to.'
                                : 'Pipeline economics and stage mix for the active workspace.'}
                        </p>
                    </div>
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
                            <Briefcase size={14} />
                            Workspace
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
                            Global
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {reportLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Pipeline value"
                            value={formatCurrency(summary.totalValue)}
                            hint={`${summary.totalDeals} deals in scope`}
                            accent="sky"
                            icon={<TrendingUp size={20} strokeWidth={2} />}
                        />
                        <StatCard
                            label="Won revenue"
                            value={formatCurrency(summary.wonValue)}
                            hint="Closed won"
                            accent="emerald"
                            icon={<ArrowUpRight size={20} strokeWidth={2} />}
                        />
                        <StatCard
                            label="Average deal size"
                            value={formatCurrency(summary.avgDealValue)}
                            hint="Mean amount"
                            accent="amber"
                            icon={<PieChartIcon size={20} strokeWidth={2} />}
                        />
                        <StatCard
                            label="Win rate"
                            value={`${summary.winRate ?? 0}%`}
                            hint={`${summary.openDeals ?? 0} open deals`}
                            accent="violet"
                            icon={<BarChart3 size={20} strokeWidth={2} />}
                        />
                    </>
                )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Deals by stage" subtitle="Count of deals in each stage for this report scope">
                    <div className="h-[320px] w-full min-h-[260px]">
                        {stageBarData.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-slate-50/40 text-center text-sm text-slate-500">
                                No stage data for this scope yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stageBarData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        allowDecimals={false}
                                        tickFormatter={(v) => String(v)}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(125, 211, 252, 0.12)' }}
                                        content={({ active, payload, label }) =>
                                            active && payload?.length ? (
                                                <div className="rounded-lg border border-slate-200/90 bg-white px-3 py-2 shadow-md">
                                                    <p className="text-[11px] font-medium text-slate-500">{label}</p>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {payload[0].value} deals
                                                    </p>
                                                </div>
                                            ) : null
                                        }
                                    />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                                        {stageBarData.map((_, index) => (
                                            <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>

                <ChartCard
                    title="Revenue trend"
                    subtitle="Deal value created per month (recent window)"
                >
                    <div className="h-[320px] w-full min-h-[260px]">
                        {growthSeries.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-slate-50/40 text-center text-sm text-slate-500">
                                No growth series yet — add dated deals to see the curve.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="reportsAreaFill" x1="0" y1="0" x2="0" y2="1">
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
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        domain={['auto', 'auto']}
                                        tickFormatter={(val) =>
                                            val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`
                                        }
                                    />
                                    <Tooltip
                                        content={({ active, payload }) =>
                                            active && payload?.length ? (
                                                <div className="rounded-lg border border-slate-200/90 bg-white px-3 py-2 shadow-md">
                                                    <p className="text-[11px] font-medium text-slate-500">
                                                        {payload[0].payload.name}
                                                    </p>
                                                    <p className="text-sm font-semibold text-sky-700">
                                                        {formatCurrency(payload[0].value)}
                                                    </p>
                                                </div>
                                            ) : null
                                        }
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#38bdf8"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#reportsAreaFill)"
                                        dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100/90 px-6 py-4 sm:px-8">
                        <h2 className="text-sm font-semibold text-slate-800">Top deals</h2>
                        <LayoutList size={16} className="text-slate-400" />
                    </div>
                    <div className="divide-y divide-slate-100/90">
                        {topDeals.length > 0 ? (
                            topDeals.map((deal) => (
                                <div
                                    key={deal._id}
                                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80 sm:px-8"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-800">{deal.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {deal.workspace?.name || 'Workspace'} · {deal.stage}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold tabular-nums text-sky-700">
                                        {formatCurrency(deal.amount)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-14 text-center text-sm text-slate-400 sm:px-8">
                                No deals in this scope.
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-2 rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100/90 px-6 py-4 sm:px-8">
                        <h2 className="text-sm font-semibold text-slate-800">
                            {scope === 'global' ? 'Revenue by workspace' : 'Value by stage'}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Volume, totals, and average deal size
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-medium text-slate-500">
                                <tr className="border-b border-slate-100/90">
                                    <th className="px-6 py-3 sm:px-8">{scope === 'global' ? 'Workspace' : 'Stage'}</th>
                                    <th className="px-6 py-3 text-center sm:px-8">Deals</th>
                                    <th className="px-6 py-3 sm:px-8">Total value</th>
                                    <th className="px-6 py-3 text-right sm:px-8">Avg / deal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/90 text-slate-700">
                                {matrixRows.length > 0 ? (
                                    matrixRows.map((item, idx) => {
                                        const label = item.name || item._id
                                        const count = item.count ?? 0
                                        const total = Number(item.totalValue ?? item.value ?? 0)
                                        const avg = count ? total / count : 0
                                        const pct = Math.min(100, (total / maxMatrixValue) * 100)
                                        return (
                                            <tr key={String(label)} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 sm:px-8">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                            style={{
                                                                backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                                                            }}
                                                        />
                                                        <span className="font-medium text-slate-800">{label}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center tabular-nums text-slate-600 sm:px-8">
                                                    {count}
                                                </td>
                                                <td className="px-6 py-4 sm:px-8">
                                                    <span className="font-semibold text-slate-900 tabular-nums">
                                                        {formatCurrency(total)}
                                                    </span>
                                                    <div className="mt-2 h-1.5 max-w-[160px] overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full bg-sky-300/90 transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums text-slate-600 sm:px-8">
                                                    {formatCurrency(avg)}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 sm:px-8">
                                            No rows for this scope.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Team */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100/90 pb-6">
                    <div className="rounded-xl bg-sky-50/90 p-2 text-sky-700 ring-1 ring-sky-100/80">
                        <Users size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Team performance</h2>
                        <p className="text-xs text-slate-400">Deal load, value, and win rate by assignee</p>
                    </div>
                </div>
                {assigneeDistribution.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {assigneeDistribution.map((member, idx) => (
                            <div
                                key={member.name}
                                className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-5 transition-colors hover:border-slate-200 hover:bg-white"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                                        style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                                    >
                                        {(member.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-800">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.count} deals</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3 text-xs">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Pipeline value</span>
                                        <span className="font-semibold tabular-nums text-slate-800">
                                            {formatCurrency(member.value)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Win rate</span>
                                        <span className="font-semibold text-sky-700 tabular-nums">
                                            {Math.round(Number(member.winRate) || 0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                                        <div
                                            className="h-full rounded-full bg-sky-400/90 transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, Number(member.winRate) || 0))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200/90 bg-slate-50/40 py-16 text-center">
                        <Briefcase size={36} className="text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No assignee breakdown</p>
                        <p className="text-xs text-slate-400">Assign deals to team members to populate this section.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReportsPage
