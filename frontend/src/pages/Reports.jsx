import React, { useEffect, useState } from 'react'
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    Download,
    Globe,
    Briefcase,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Sparkles,
    Zap,
    Filter
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
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
    Area
} from 'recharts'

const VIBRANT_PALETTE = [
    { bg: 'bg-indigo-600', text: 'text-white', icon: 'bg-indigo-500', hex: '#4f46e5' },
    { bg: 'bg-emerald-500', text: 'text-white', icon: 'bg-emerald-400', hex: '#10b981' },
    { bg: 'bg-amber-500', text: 'text-white', icon: 'bg-amber-400', hex: '#f59e0b' },
    { bg: 'bg-rose-500', text: 'text-white', icon: 'bg-rose-400', hex: '#f43f5e' },
    { bg: 'bg-violet-600', text: 'text-white', icon: 'bg-violet-500', hex: '#8b5cf6' },
    { bg: 'bg-cyan-500', text: 'text-white', icon: 'bg-cyan-400', hex: '#06b6d4' },
]

const ReportsPage = () => {
    const {
        activeWorkspaceId,
        reportStats,
        reportLoading,
        fetchReportStats
    } = useStore()

    const [scope, setScope] = useState('workspace')

    useEffect(() => {
        fetchReportStats(scope, activeWorkspaceId)
    }, [scope, activeWorkspaceId, fetchReportStats])

    if (!reportStats && reportLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        )
    }

    const {
        summary = { totalDeals: 0, totalValue: 0, wonValue: 0, lostValue: 0, avgDealValue: 0 },
        stageDistribution = [],
        growthData = [],
        topDeals = [],
        revenueByWorkspace = [],
        assigneeDistribution = []
    } = reportStats || {}

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

    return (
        <div className="flex flex-col gap-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <PageHeader
                title="Intelligence Dashboard"
                subtitle={scope === 'global' ? "Universal performance analytics & ecosystem health" : "Workspace-specific pipeline metrics & conversion data"}
                icon={<BarChart3 size={22} className="text-indigo-600" />}
                actions={(
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setScope('workspace')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${scope === 'workspace' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-white'}`}
                        >
                            <Briefcase size={14} strokeWidth={3} />
                            Workspace
                        </button>
                        <button
                            onClick={() => setScope('global')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${scope === 'global' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-white'}`}
                        >
                            <Globe size={14} strokeWidth={3} />
                            Global
                        </button>
                    </div>
                )}
            />

            {/* Vibrant Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <VibrantCard
                    label="Pipeline Value"
                    value={formatCurrency(summary.totalValue)}
                    sub={`${summary.totalDeals} Opportunities`}
                    icon={<TrendingUp size={24} />}
                    colorSet={VIBRANT_PALETTE[0]}
                />
                <VibrantCard
                    label="Won Revenue"
                    value={formatCurrency(summary.wonValue)}
                    sub="Closed-won total"
                    icon={<ArrowUpRight size={24} />}
                    colorSet={VIBRANT_PALETTE[1]}
                />
                <VibrantCard
                    label="Avg Asset Size"
                    value={formatCurrency(summary.avgDealValue)}
                    sub="Per active deal"
                    icon={<PieChartIcon size={24} />}
                    colorSet={VIBRANT_PALETTE[2]}
                />
                <VibrantCard
                    label="Active Delta"
                    value={summary.totalDeals}
                    sub="Current lifecycle"
                    icon={<Zap size={24} />}
                    colorSet={VIBRANT_PALETTE[3]}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Distribution Chart */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Market Distribution</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Deal Volume by Stage</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stageDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={15} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={(val) => val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                                    cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                                    formatter={(value) => [formatCurrency(value), 'Value']}
                                />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={45}>
                                    {stageDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={VIBRANT_PALETTE[index % VIBRANT_PALETTE.length].hex} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Momentum</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total Pipeline Trajectory</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={15} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                                    formatter={(value) => [formatCurrency(value), 'Momentum']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Top Deals List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Alpha Assets</h3>
                        <Sparkles size={16} className="text-amber-500 animate-pulse" />
                    </div>
                    <div className="divide-y divide-slate-50">
                        {topDeals.length > 0 ? topDeals.map((deal, idx) => (
                            <div key={deal._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{deal.title}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{(deal.workspace?.name || 'Main')} • {deal.stage}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-base font-black text-slate-950 font-mono">{formatCurrency(deal.amount)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-16 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">Zero High-Value Delta</div>
                        )}
                    </div>
                </div>

                {/* Analysis Table */}
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50">
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Performance Matrix</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="py-5 px-8">Sector</th>
                                    <th className="py-5 px-8 text-center">Volume</th>
                                    <th className="py-5 px-8">Market Value</th>
                                    <th className="py-5 px-8 text-right">Avg Yield</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(scope === 'global' ? revenueByWorkspace : stageDistribution).map((item, idx) => (
                                    <tr key={item._id || item.name} className="hover:bg-indigo-50/10 transition-colors">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-3 h-3 rounded-full shadow-lg shadow-indigo-100" style={{ backgroundColor: VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length].hex }} />
                                                <span className="text-sm font-black text-slate-800">{item.name || item._id}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-sm font-black text-slate-400 text-center">{item.count}</td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-base font-black text-slate-900 leading-none">{formatCurrency(item.totalValue || item.value)}</span>
                                                <div className="w-full max-w-[140px] h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${Math.min(100, ((item.totalValue || item.value) / (summary.totalValue || 1)) * 100)}%`,
                                                            backgroundColor: VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length].hex
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-sm font-black text-slate-500 text-right font-mono">
                                            {formatCurrency((item.totalValue || item.value) / (item.count || 1))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Team Board */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                <div className="mb-10 border-b border-slate-50 pb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Operator Efficiency Matrix</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Individual Contribution and Win Probability</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {assigneeDistribution.length > 0 ? assigneeDistribution.map((member, idx) => (
                        <div key={member.name} className="p-8 rounded-3xl border border-slate-100 bg-white hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-center gap-5 mb-8 relative z-10">
                                <div className={`h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 transition-colors shadow-lg`}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-black text-slate-950 truncate">{member.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{member.count} Active Captures</p>
                                </div>
                            </div>
                            <div className="space-y-5 relative z-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Value</p>
                                        <p className="text-lg font-black text-slate-900 font-mono tracking-tighter">{formatCurrency(member.value)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Win Probability</p>
                                        <p className="text-base font-black text-indigo-600">{Math.round(member.winRate)}%</p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1500"
                                        style={{ width: `${member.winRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 text-center text-slate-200">
                            <Briefcase size={48} className="mx-auto mb-6 opacity-10" />
                            <p className="text-sm font-black uppercase tracking-[0.5em]">No Operational Data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const VibrantCard = ({ label, value, sub, icon, colorSet }) => (
    <div className={`${colorSet.bg} ${colorSet.text} p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}>
        {/* Subtle decorative circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div className={`${colorSet.icon} h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/10`}>
                    {icon}
                </div>
                <div className="h-2 w-8 bg-white/20 rounded-full group-hover:w-12 transition-all duration-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{label}</p>
            <p className="text-3xl font-black tracking-tighter mb-4">{value}</p>
            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{sub}</span>
            </div>
        </div>
    </div>
)

export default ReportsPage
