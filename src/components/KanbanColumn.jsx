import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DealCard from './DealCard'
import { MoreHorizontal, Plus } from 'lucide-react'

const KanbanColumn = ({ id, title, deals, onDealClick, onAddDeal }) => {
    const { setNodeRef } = useDroppable({ id })

    const totalAmount = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0)

    return (
        <div className="flex flex-col w-72 h-full bg-muted/30 rounded-xl border border-border/50">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
                        {deals.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onAddDeal}
                        className="p-1 hover:bg-muted rounded transition-colors"
                    >
                        <Plus size={16} className="text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                        <MoreHorizontal size={16} className="text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground font-medium">
                    Total: ${totalAmount.toLocaleString()}
                </p>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto kanban-column p-2 space-y-3">
                <SortableContext items={deals.map(d => d._id)} strategy={verticalListSortingStrategy}>
                    {deals.map(deal => (
                        <DealCard key={deal._id} deal={deal} onClick={() => onDealClick(deal._id)} />
                    ))}
                </SortableContext>

                {deals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">No deals here</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default KanbanColumn
