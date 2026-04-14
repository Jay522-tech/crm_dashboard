import React, { useMemo, useState } from 'react'
import { Briefcase, Search } from 'lucide-react'
import useStore from '../store'
import Pagination from '../components/Pagination'

const DealsPage = () => {
    const { deals } = useStore()
    const [q, setQ] = useState('')
    const [page, setPage] = useState(1)
    const limit = 10

    const rows = useMemo(() => {
        const term = q.trim().toLowerCase()
        if (!term) return deals || []
        return (deals || []).filter((d) => (d.title || '').toLowerCase().includes(term))
    }, [deals, q])

    const totalPages = Math.max(Math.ceil(rows.length / limit), 1)
    const pageRows = useMemo(() => {
        const start = (page - 1) * limit
        return rows.slice(start, start + limit)
    }, [rows, page])

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
                    <p className="text-sm text-slate-500 mt-0.5">A sortable table view (connected to the same deals data)</p>
                </div>
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search deals..."
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                    />
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
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                    onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                />
            )}
        </div>
    )
}

export default DealsPage

