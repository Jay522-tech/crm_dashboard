import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DealCard from './DealCard'
import { Plus, MoreHorizontal, CircleDot } from 'lucide-react'
import { STAGE_THEME } from '../constants/kanbanConfig'

const KanbanColumn = ({ id, title, deals, onDealClick, onAddDeal, isAtLeastAdmin }) => {
    const { setNodeRef, isOver } = useDroppable({ id })
    const theme = STAGE_THEME[id] || STAGE_THEME.Lead

    return (
        <div
            className={`
                flex flex-col w-[min(100%,20rem)] shrink-0 h-full max-h-full rounded-xl overflow-hidden
                bg-white shadow-sm border border-slate-200/80
                transition-shadow duration-200
                ${isOver ? 'ring-2 ring-primary/25 shadow-md' : 'hover:shadow-md'}
            `}
        >
            <div className={`h-1.5 w-full ${theme.topBar}`} aria-hidden />

            <div className={`px-3.5 pt-3.5 pb-2 flex items-start justify-between gap-2 ${theme.headerBg}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 ${theme.headerIcon}`}>
                        <CircleDot size={18} strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-[0.9375rem] text-slate-900 leading-tight truncate">
                            {title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{theme.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <span className="text-xs font-semibold tabular-nums text-slate-600 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200/90 shadow-sm">
                        {deals.length}
                    </span>
                    {isAtLeastAdmin && (
                        <button
                            type="button"
                            onClick={onAddDeal}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/90 transition-colors"
                            title="Add deal"
                        >
                            <Plus size={17} strokeWidth={2} />
                        </button>
                    )}
                    <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/90 transition-colors"
                        title="Column menu"
                    >
                        <MoreHorizontal size={17} />
                    </button>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={`
                    flex-1 overflow-y-auto min-h-[120px] kanban-column px-2.5 pb-2 flex flex-col gap-2.5
                    ${theme.columnBg}
                `}
            >
                <SortableContext items={deals.map((d) => d._id)} strategy={verticalListSortingStrategy}>
                    {deals.map((deal) => (
                        <DealCard key={deal._id} deal={deal} onClick={() => onDealClick(deal._id)} />
                    ))}
                </SortableContext>

                {deals.length === 0 && (
                    <div className="mx-0.5 my-1 rounded-lg border border-dashed border-slate-200/90 bg-white/50 py-8 px-3 text-center">
                        <p className="text-xs text-slate-400 font-medium">Drop deals here</p>
                    </div>
                )}
            </div>

            {isAtLeastAdmin && (
                <div className="p-2.5 pt-0 border-t border-slate-100/90 bg-white">
                    <button
                        type="button"
                        onClick={onAddDeal}
                        className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all"
                    >
                        + Add deal
                    </button>
                </div>
            )}
        </div>
    )
}

export default KanbanColumn
