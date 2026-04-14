import React, { useEffect } from 'react'
import { BarChart3, Briefcase, CircleCheckBig, DollarSign, TrendingUp, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store'
import PageHeader from '../components/PageHeader'

const STAGE_ORDER = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost']

const StagePill = ({ stage, count }) => (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
        <span className="text-sm font-medium text-slate-700">{stage}</span>
        <span className="text-xs font-semibold rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">{count}</span>
    </div>
)

const StatCard = ({ icon, title, value, hint }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 truncate">{value}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{hint}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                {icon}
            </div>
        </div>
    </div>
)

const DashboardPage = () => {
    const { activeWorkspaceId, dashboardStats, dashboardLoading, fetchDashboardStats } = useStore()

    useEffect(() => {
        if (activeWorkspaceId) {
            fetchDashboardStats(activeWorkspaceId)
        }
    }, [activeWorkspaceId, fetchDashboardStats])

    if (!activeWorkspaceId) {
        return (
            <div className="h-full rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 flex items-center justify-center">
                <p className="text-sm text-slate-500">Create or select a workspace to view dashboard analytics.</p>
            </div>
        )
    }

    if (dashboardLoading && !dashboardStats) {
        return (
            <div className="h-full rounded-xl border border-slate-200 bg-white/80 p-8 flex items-center justify-center">
                <p className="text-sm text-slate-500">Loading dashboard...</p>
            </div>
        )
    }

    const summary = dashboardStats?.summary || {}
    const stageCounts = dashboardStats?.stageCounts || {}
    const recentDeals = dashboardStats?.recentDeals || []

    const money = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0)

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <PageHeader
                title="Dashboard"
                subtitle={(
                    <>
                        Workspace: <span className="font-medium text-slate-700">{dashboardStats?.workspace?.name || '-'}</span>
                        {dashboardLoading ? (
                            <span className="ml-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 align-middle">
                                Refreshing…
                            </span>
                        ) : null}
                    </>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={<Briefcase size={18} />} title="Total Deals" value={summary.totalDeals || 0} hint="All opportunities in this workspace" />
                <StatCard icon={<DollarSign size={18} />} title="Pipeline Value" value={money(summary.totalValue)} hint="Sum of all deal values" />
                <StatCard icon={<CircleCheckBig size={18} />} title="Won Deals" value={summary.wonDeals || 0} hint={`Won value ${money(summary.wonValue)}`} />
                <StatCard icon={<TrendingUp size={18} />} title="Win Rate" value={`${summary.winRate || 0}%`} hint={`${summary.openDeals || 0} open deals`}/>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <BarChart3 size={16} />
                            Stage Distribution
                        </h3>
                        <span className="text-xs text-slate-500">
                            Members: {dashboardStats?.workspace?.membersCount || 0}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {STAGE_ORDER.map((stage) => {
                            const count = stageCounts[stage] || 0
                            const total = summary.totalDeals || 0
                            const percent = total > 0 ? Math.round((count / total) * 100) : 0

                            return (
                                <div key={stage}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-slate-700">{stage}</span>
                                        <span className="text-xs text-slate-500">{count} ({percent}%)</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <StagePill stage="Open Deals" count={summary.openDeals || 0} />
                        <StagePill stage="Lost Deals" count={summary.lostDeals || 0} />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={16} />
                        Recent Deal Updates
                    </h3>

                    {recentDeals.length === 0 ? (
                        <div className="h-[12rem] rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500">
                            No deals yet
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentDeals.map((deal) => (
                                <div key={deal._id} className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{deal.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{deal.assignee?.name || 'Unassigned'}</p>
                                        </div>
                                        <span className="text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">{deal.stage}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-slate-700 font-medium">{money(deal.amount)}</span>
                                        <span className="text-[11px] text-slate-500">
                                            {deal.updatedAt ? formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true }) : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default DashboardPage
