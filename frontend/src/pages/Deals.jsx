import React, { useMemo, useState } from 'react'
import { Briefcase } from 'lucide-react'
import useStore from '../store'
import Pagination from '../components/Pagination'
import { dealMatchesGlobalSearch, dealMatchesDealFilters } from '../utils/dealSearch'

const DealsPage = () => {
    const {
        deals,
        searchTerm,
        pipelineStageFilter,
        pipelineAssigneeFilter,
        pipelineAmountMin,
        pipelineAmountMax,
    } = useStore()
    const [page, setPage] = useState(1)
    const limit = 10

    const rows = useMemo(() => {
        const list = deals || []
        const opts = {
            assigneeFilter: pipelineAssigneeFilter,
            amountMin: pipelineAmountMin,
            amountMax: pipelineAmountMax,
        }
        return list.filter(
            (d) =>
                dealMatchesGlobalSearch(d, searchTerm) &&
                dealMatchesDealFilters(d, opts) &&
                (pipelineStageFilter === null || pipelineStageFilter.includes(d.stage))
        )
    }, [deals, searchTerm, pipelineStageFilter, pipelineAssigneeFilter, pipelineAmountMin, pipelineAmountMax])

    const totalPages = Math.max(Math.ceil(rows.length / limit), 1)
    const displayPage = Math.min(Math.max(1, page), totalPages)
    const pageRows = useMemo(() => {
        const start = (displayPage - 1) * limit
        return rows.slice(start, start + limit)
    }, [rows, displayPage, limit])

    const money = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0)

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Briefcase size={18} />
                        All Deals
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Header search plus filters: stages, assignee, and amount range.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Deals</p>
                    <span className="text-xs text-slate-500">{rows.length} results</span>
                </div>
                {rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        No deals found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-3">Title</th>
                                    <th className="text-left font-semibold px-4 py-3">Stage</th>
                                    <th className="text-left font-semibold px-4 py-3">Amount</th>
                                    <th className="text-left font-semibold px-4 py-3">Assignee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pageRows.map((d) => (
                                    <tr key={d._id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3 font-medium text-slate-900">{d.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{d.stage}</td>
                                        <td className="px-4 py-3 text-slate-600">{money(d.amount)}</td>
                                        <td className="px-4 py-3 text-slate-600">{d.assignee?.name || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {rows.length > 0 && (
                <Pagination
                    page={displayPage}
                    totalPages={totalPages}
                    onPrev={() => setPage(Math.max(displayPage - 1, 1))}
                    onNext={() => setPage(Math.min(displayPage + 1, totalPages))}
                />
            )}
        </div>
    )
}

export default DealsPage

