import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MoreVertical, Plus } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { STAGE_CATEGORY_LABEL, STAGE_THEME } from '../constants/kanbanConfig'

const DealCard = ({ deal, onClick, isOverlay = false }) => {
    const assignee = deal.assignee
    const assigneeName = assignee?.name || assignee?.email || ''
    const assigneeInitial = assigneeName?.trim()?.[0]?.toUpperCase() || 'U'
    const stage = deal.stage || 'Lead'
    const theme = STAGE_THEME[stage] || STAGE_THEME.Lead
    const categoryLabel = STAGE_CATEGORY_LABEL[stage] || 'Deal'
    const dueRef = deal.updatedAt || deal.createdAt
    const description = (deal.description || '').trim()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: deal._id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    }

    const handleCardClick = (e) => {
        if (isOverlay) return
        if (e.target.closest('[data-no-drag]')) return
        onClick?.()
    }

    const cardInner = (
        <div
            className={`
                group relative rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm
                transition-all duration-300 ease-out
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300/80 hover:-translate-y-1
                ${isOverlay ? 'shadow-2xl ring-2 ring-primary/20 scale-[1.02]' : ''}
            `}
            onClick={handleCardClick}
        >
            <div className="flex items-start justify-between gap-2 mb-3">
                <span
                    className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border
                        ${theme.badge}
                    `}
                >
                    {categoryLabel}
                </span>
                <button
                    type="button"
                    data-no-drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick?.()
                    }}
                    className="p-1 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
                    aria-label="Deal actions"
                >
                    <MoreVertical size={14} />
                </button>
            </div>

            <h4 className="text-[1rem] font-bold text-slate-900 leading-tight mb-2 pr-2">
                {deal.title}
            </h4>
            <p className="text-[13px] text-slate-500/90 leading-relaxed line-clamp-2 min-h-[2.5rem] font-medium">
                {description || 'No description provided for this deal.'}
            </p>

            <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                    {assignee ? (
                        <div
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-[12px] font-bold text-primary ring-2 ring-white shadow-sm border border-primary/10"
                            title={assigneeName || 'Assigned'}
                        >
                            {assigneeInitial}
                        </div>
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-[10px] font-bold ring-2 ring-white"
                            title="Unassigned"
                        >
                            UA
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    ${deal.amount?.toLocaleString() || '0'}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/80">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    {dueRef ? format(new Date(dueRef), 'MMM d, yyyy') : 'No date'}
                </div>
            </div>
        </div>
    )

    if (isOverlay) return cardInner

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
            {cardInner}
        </div>
    )
}

export default DealCard
