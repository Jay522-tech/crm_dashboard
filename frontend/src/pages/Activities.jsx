import React, { useEffect, useMemo } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store'
import Pagination from '../components/Pagination'

const ActivitiesPage = () => {
    const { activeWorkspaceId, activitiesPage, fetchActivities } = useStore()
    const limit = 10

    useEffect(() => {
        if (activeWorkspaceId) fetchActivities({ workspaceId: activeWorkspaceId, page: 1, limit })
    }, [activeWorkspaceId, fetchActivities])

    const rows = useMemo(() => activitiesPage?.items || [], [activitiesPage])
    const totalPages = activitiesPage?.totalPages || 1
    const total = activitiesPage?.total || 0
    const page = activitiesPage?.page || 1

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Activity size={18} />
                        Activities
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Audit trail across deals, contacts, events and workspaces</p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchActivities({ workspaceId: activeWorkspaceId, page, limit })}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-0">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Latest</p>
                    <span className="text-xs text-slate-500">{total} items</span>
                </div>
                {rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        No activities yet. Create a deal/contact/event to generate activity logs.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {rows.map((a) => (
                            <div key={a._id} className="px-4 py-3 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {a.message || `${a.type} • ${a.action}`}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                                        {a.actor?.name || 'Someone'} • {a.type} • {a.action}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-slate-600">
                                        {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => fetchActivities({ workspaceId: activeWorkspaceId, page: Math.max(page - 1, 1), limit })}
                onNext={() => fetchActivities({ workspaceId: activeWorkspaceId, page: Math.min(page + 1, totalPages), limit })}
            />
        </div>
    )
}

export default ActivitiesPage

