import React, { useEffect, useState } from 'react'
import {
    Briefcase,
    DollarSign,
    TrendingUp,
    Sparkles,
    Zap,
    ArrowUpRight,
    Globe,
    User
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
    Cell
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store'
import { cn } from '../lib/utils'

const VIBRANT_PALETTE = [
    { name: 'Indigo', bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', hex: '#4f46e5' },
    { name: 'Emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', hex: '#10b981' },
    { name: 'Amber', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', hex: '#f59e0b' },
    { name: 'Rose', bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', hex: '#f43f5e' },
]

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']

const STAGE_COLORS = {
    'Lead': 'bg-indigo-500',
    'Contacted': 'bg-blue-500',
    'Qualified': 'bg-amber-500',
    'Won': 'bg-emerald-500',
    'Lost': 'bg-rose-500'
}

const VibrantCard = ({ label, value, sub, icon, colorSet }) => (
    <div className={cn(
        "relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:scale-[1.02] shadow-xl",
        colorSet.bg
    )}>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md text-white">
                    {icon}
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">
                    Real-time
                </div>
            </div>
            <div>
                <p className="text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-4xl font-black text-white tracking-tight mb-2 italic">
                    {value}
                </h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{sub}</p>
            </div>
        </div>
    </div>
)

const DashboardPage = () => {
    const {
        activeWorkspaceId,
        dashboardStats,
        dashboardLoading,
        fetchDashboardStats,
        reportStats,
        fetchReportStats
    } = useStore()

    const [scope, setScope] = useState('workspace') // 'workspace' or 'global'

    useEffect(() => {
        if (scope === 'workspace' && activeWorkspaceId) {
            fetchDashboardStats(activeWorkspaceId)
        } else if (scope === 'global') {
            fetchReportStats('global')
        }
    }, [activeWorkspaceId, fetchDashboardStats, fetchReportStats, scope])

    const stats = scope === 'workspace' ? dashboardStats : reportStats
    const summary = stats?.summary || { totalDeals: 0, totalValue: 0, wonValue: 0, lostValue: 0, avgDealValue: 0, winRate: 0, openDeals: 0 }
    const stageCounts = scope === 'workspace' ? (stats?.stageCounts || {}) :
        (stats?.stageDistribution || []).reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
    const recentDeals = stats?.recentDeals || stats?.topDeals || []
    const growthData = stats?.growthData && stats.growthData.length > 0 ? stats.growthData :
        [{ name: 'Month 1', value: 0 }, { name: 'Month 2', value: 0 }, { name: 'Month 3', value: 0 }]
    const assigneeDistribution = stats?.assigneeDistribution && stats.assigneeDistribution.length > 0 ? stats.assigneeDistribution :
        [{ name: 'System', count: 1 }]

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0)

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl z-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                    <p className="text-sm font-black text-indigo-600 italic">{formatCurrency(payload[0].value)}</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="flex flex-col gap-10 min-h-0 pb-10">
            {/* Scoping Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                        DASHBOARD <span className="text-slate-300 not-italic ml-2">/</span> <span className="text-indigo-600 not-italic">{scope === 'global' ? 'NETWORK INTEL' : (stats?.workspace?.name || 'PRIVATE')}</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">
                        {scope === 'global' ? 'Aggregated cross-workspace asset performance' : 'Real-time performance metrics for this asset pool'}
                    </p>
                </div>

                <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] shadow-inner border border-slate-200/50 self-start md:self-center">
                    <button
                        onClick={() => setScope('workspace')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                            scope === 'workspace' ? "bg-white text-indigo-600 shadow-xl" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <User size={14} strokeWidth={3} />
                        Personal
                    </button>
                    <button
                        onClick={() => setScope('global')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                            scope === 'global' ? "bg-white text-indigo-600 shadow-xl" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Globe size={14} strokeWidth={3} />
                        Global
                    </button>
                </div>
            </div>

            {/* Vibrant KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <VibrantCard label="Deal Flow" value={summary.totalDeals} sub="Total Assets Tracked" icon={<TrendingUp size={24} />} colorSet={VIBRANT_PALETTE[0]} />
                <VibrantCard label="Volume" value={formatCurrency(summary.totalValue)} sub="Gross Pipeline size" icon={<DollarSign size={24} />} colorSet={VIBRANT_PALETTE[1]} />
                <VibrantCard label="Closure" value={formatCurrency(summary.wonValue)} sub="Actual Won Revenue" icon={<ArrowUpRight size={24} />} colorSet={VIBRANT_PALETTE[2]} />
                <VibrantCard label="Win Rate" value={`${summary.winRate || 0}%`} sub={`Active: ${summary.openDeals || 0}`} icon={<Zap size={24} />} colorSet={VIBRANT_PALETTE[3]} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Revenue Intelligence</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Market trajectory & Growth</p>
                    </div>
                    <div className="relative h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
                    <div className="absolute top-10 left-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Team Influence</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Resource Allocation map</p>
                    </div>
                    <div className="h-[280px] w-full mt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={assigneeDistribution} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="count" animationDuration={1000} stroke="none">
                                    {assigneeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl z-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payload[0].name}</p>
                                                <p className="text-sm font-black text-indigo-600">{payload[0].value} {payload[0].name === 'System' ? 'Metrics' : 'Deals'}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-x-0 bottom-10 flex flex-wrap justify-center gap-4 px-10">
                            {assigneeDistribution.slice(0, 4).map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution and Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="mb-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Market Distribution</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Asset Allocation by Stage</p>
                    </div>
                    <div className="space-y-8">
                        {['Lead', 'Contacted', 'Qualified', 'Won', 'Lost'].map((stage) => {
                            const count = stageCounts[stage] || 0
                            const total = summary.totalDeals || 1
                            const percent = Math.round((count / total) * 100)
                            return (
                                <div key={stage} className="group">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-2.5 h-2.5 rounded-full", STAGE_COLORS[stage])} />
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest italic">{stage}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-slate-900">{count}</span>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">{percent}%</span>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", STAGE_COLORS[stage])} style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Live Activity</h3>
                    </div>
                    {recentDeals.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                            <Briefcase size={40} className="opacity-10" />
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">No Recent Activity</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recentDeals.slice(0, 4).map((deal) => (
                                <div key={deal._id} className="relative p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all duration-500 group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate uppercase italic tracking-tight">{deal.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">{deal.assignee?.name || 'Global Pool'}</p>
                                        </div>
                                        <span className={cn("text-[9px] font-black rounded-lg px-2.5 py-1 uppercase text-white shadow-sm", STAGE_COLORS[deal.stage] || 'bg-slate-400')}>
                                            {deal.stage}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-sm font-black text-indigo-600 italic tracking-tighter">{formatCurrency(deal.amount)}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{deal.updatedAt ? formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true }) : 'Live'}</span>
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
