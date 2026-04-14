import React from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners
} from '@dnd-kit/core'
import useStore from '../store'
import KanbanColumn from './KanbanColumn'
import DealCard from './DealCard'
import { STAGES } from '../constants/kanbanConfig'

const KanbanBoard = ({ onDealClick }) => {
    const { user, deals, activeWorkspaceId, updateDealStage, addDeal, searchTerm, workspaces } = useStore()
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const currentUserRole = activeWorkspace?.members?.find(m => String(m.user?._id || m.user) === String(user?._id))?.role
    const isAtLeastAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin'

    const workspaceDeals = deals.filter(d =>
        d.workspace === activeWorkspaceId &&
        d.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const [activeId, setActiveId] = React.useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const handleDragStart = (event) => {
        if (!isAtLeastAdmin) return
        setActiveId(event.active.id)
    }

    const handleDragOver = (event) => {
        if (!isAtLeastAdmin) return
        const { active, over } = event
        if (!over) return

        const activeDeal = deals.find(d => d._id === active.id)
        const overId = over.id

        // If over a column
        if (STAGES.includes(overId)) {
            if (activeDeal && activeDeal.stage !== overId) {
                updateDealStage(activeDeal._id, overId)
            }
        } else {
            // If over another card
            const overDeal = deals.find(d => d._id === overId)
            if (activeDeal && overDeal && activeDeal.stage !== overDeal.stage) {
                updateDealStage(activeDeal._id, overDeal.stage)
            }
        }
    }

    const handleDragEnd = () => {
        setActiveId(null)
    }

    const activeDeal = activeId ? deals.find(d => d._id === activeId) : null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 gap-5 overflow-x-auto pb-1 no-scrollbar">
                    {STAGES.map((stage) => (
                        <KanbanColumn
                            key={stage}
                            id={stage}
                            title={stage}
                            deals={workspaceDeals.filter((d) => d.stage === stage)}
                            onDealClick={onDealClick}
                            onAddDeal={isAtLeastAdmin ? () => addDeal({ title: 'New Deal', stage, amount: 0 }) : null}
                            isAtLeastAdmin={isAtLeastAdmin}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeDeal ? (
                    <div className="rotate-3 scale-105 opacity-80 pointer-events-none">
                        <DealCard deal={activeDeal} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

export default KanbanBoard
