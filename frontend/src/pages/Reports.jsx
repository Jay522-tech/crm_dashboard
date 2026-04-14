import React from 'react'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'

const ReportsPage = () => {
    return (
        <div className="flex flex-col gap-4 min-h-0">
            <PageHeader
                title="Reports"
                subtitle="Pipeline analytics and team performance"
                icon={<BarChart3 size={18} />}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeatureCard
                        title="Pipeline performance"
                        description="Conversion and win-rate over time."
                        items={['Win rate trend', 'Average deal size', 'Time to close']}
                        rightSlot={<TrendingUp size={18} className="text-slate-400" />}
                    />
                    <FeatureCard
                        title="Stage breakdown"
                        description="Distribution across Lead → Won/Lost."
                        items={['Stage counts', 'Stage value', 'Bottlenecks']}
                        rightSlot={<PieChart size={18} className="text-slate-400" />}
                    />
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                        <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <Activity size={16} />
                            Charts
                        </p>
                        <div className="h-[14rem] rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500">
                            Charts will appear here
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <FeatureCard
                        title="Exports"
                        description="Download for offline analysis."
                        items={['CSV export', 'PDF report', 'Email schedule']}
                    />
                    <FeatureCard
                        title="Filters"
                        description="Slice reports by member, stage or date."
                        items={['Date range', 'Assignee', 'Workspace']}
                    />
                </div>
            </div>
        </div>
    )
}

export default ReportsPage

