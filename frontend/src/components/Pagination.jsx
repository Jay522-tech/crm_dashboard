import React from 'react'

const Pagination = ({ page, totalPages, onPrev, onNext, className = '' }) => {
    const safeTotal = Math.max(totalPages || 1, 1)
    const safePage = Math.min(Math.max(page || 1, 1), safeTotal)

    return (
        <div className={`flex items-center justify-between ${className}`}>
            <p className="text-xs text-slate-500">
                Page {safePage} of {safeTotal}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={onPrev}
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                    Prev
                </button>
                <button
                    type="button"
                    disabled={safePage >= safeTotal}
                    onClick={onNext}
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default Pagination

