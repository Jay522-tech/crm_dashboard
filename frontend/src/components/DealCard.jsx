import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MoreVertical } from 'lucide-react'
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
                group relative rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm
                transition-all duration-200
                hover:shadow-md hover:border-slate-300/90
                ${isOverlay ? 'shadow-xl ring-2 ring-primary/20 scale-[1.02]' : ''}
            `}
            onClick={handleCardClick}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <span
                    className={`
                        inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border
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
                    className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 transition-all"
                    aria-label="Deal actions"
                >
                    <MoreVertical size={16} />
                </button>
            </div>

            <h4 className="text-[0.9375rem] font-semibold text-slate-900 leading-snug mb-1.5 pr-1">
                {deal.title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[2.25rem]">
                {description || 'Add a short description to keep your team aligned.'}
            </p>

            <div className="flex items-center gap-1.5 mt-3">
                {assignee ? (
                    <div
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-foreground ring-2 ring-card shadow-sm"
                        title={assigneeName || 'Assigned'}
                    >
                        {assigneeInitial}
                    </div>
                ) : (
                    <div
                        className="w-7 h-7 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px] font-semibold"
                        title="Unassigned"
                    >
                        UA
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    {dueRef ? format(new Date(dueRef), 'MMMM d, yyyy') : 'No date'}
                </div>
                <button
                    type="button"
                    data-no-drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        toast.success('Time tracking will link to this deal soon.')
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-primary px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                >
                    + Time
                </button>
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
