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
import { dealMatchesGlobalSearch, dealMatchesDealFilters } from '../utils/dealSearch'

const KanbanBoard = ({ onDealClick, onCreateDealRequest }) => {
    const {
        user,
        deals,
        activeWorkspaceId,
        updateDealStage,
        searchTerm,
        pipelineStageFilter,
        pipelineAssigneeFilter,
        pipelineAmountMin,
        pipelineAmountMax,
        workspaces,
    } = useStore()
    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const currentUserId = user?._id || user?.id
    const currentUserRole = activeWorkspace?.members?.find((m) => {
        const memberUser = m.user
        const memberId = memberUser?._id || memberUser?.id || memberUser
        return String(memberId) === String(currentUserId)
    })?.role
    const isAtLeastAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin'

    const dealFilterOpts = {
        assigneeFilter: pipelineAssigneeFilter,
        amountMin: pipelineAmountMin,
        amountMax: pipelineAmountMax,
    }

    const workspaceDeals = deals.filter(
        (d) =>
            String(d.workspace) === String(activeWorkspaceId) &&
            dealMatchesGlobalSearch(d, searchTerm) &&
            dealMatchesDealFilters(d, dealFilterOpts) &&
            (pipelineStageFilter === null || pipelineStageFilter.includes(d.stage))
    )

    const stagesToShow =
        pipelineStageFilter === null
            ? STAGES
            : STAGES.filter((s) => pipelineStageFilter.includes(s))

    const [activeId, setActiveId] = React.useState(null)
    const scrollRef = React.useRef(null)

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

    const handleHorizontalWheel = (event) => {
        const el = scrollRef.current
        if (!el) return
        const hasHorizontalOverflow = el.scrollWidth > el.clientWidth
        if (!hasHorizontalOverflow) return
        if (event.deltaY === 0) return
        event.preventDefault()
        el.scrollLeft += event.deltaY
    }

    const activeDeal = activeId ? deals.find(d => d._id === activeId) : null

    if (!activeWorkspaceId) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center text-sm text-slate-500">
                {workspaces.length === 0 ? (
                    <>
                        No workspace yet. Create one from the sidebar, then you can add deals.
                    </>
                ) : (
                    <>Select a workspace from the sidebar to view the pipeline.</>
                )}
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
                {stagesToShow.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center text-sm text-slate-500">
                        No pipeline stages match the current filter. Open <strong className="text-slate-700">Filter</strong>{' '}
                        in the header and choose at least one stage.
                    </div>
                ) : null}
                <div
                    ref={scrollRef}
                    onWheel={handleHorizontalWheel}
                    className={`kanban-horizontal-scroll no-scrollbar min-h-0 flex-1 overflow-x-auto pb-2 ${stagesToShow.length === 0 ? 'hidden' : ''}`}
                >
                    <div className="flex min-h-0 min-w-max gap-5 pr-5">
                        {stagesToShow.map((stage) => (
                            <KanbanColumn
                                key={stage}
                                id={stage}
                                title={stage}
                                deals={workspaceDeals.filter((d) => d.stage === stage)}
                                onDealClick={onDealClick}
                                onAddDeal={isAtLeastAdmin ? () => onCreateDealRequest?.({ stage }) : null}
                                isAtLeastAdmin={isAtLeastAdmin}
                            />
                        ))}
                    </div>
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
