import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, DollarSign, MessageSquare } from 'lucide-react'
import useStore from '../store'
import { formatDistanceToNow } from 'date-fns'

const DealCard = ({ deal, onClick, isOverlay = false }) => {
    const { user } = useStore()
    const assignee = deal.assignee
    const dealNotesCount = deal.notes?.length || 0

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: deal._id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    }

    const cardContent = (
        <div
            className={`
        bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing
        ${isOverlay ? 'shadow-xl ring-2 ring-primary/20' : ''}
      `}
            onClick={!isOverlay ? onClick : undefined}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold leading-tight flex-1 mr-2">{deal.title}</h4>
            </div>

            {deal.amount > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-primary mb-3">
                    <DollarSign size={12} />
                    {deal.amount.toLocaleString()}
                </div>
            )}

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    {assignee?.name ? (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold border border-border">
                            {assignee.name[0]}
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-muted border border-dashed border-border flex items-center justify-center text-muted-foreground">
                            ?
                        </div>
                    )}
                    {dealNotesCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MessageSquare size={12} />
                            {dealNotesCount}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar size={12} />
                    {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
                </div>
            </div>
        </div>
    )

    if (isOverlay) return cardContent

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {cardContent}
        </div>
    )
}

export default DealCard
