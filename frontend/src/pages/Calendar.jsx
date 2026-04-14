import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus, Clock, BadgeCheck, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import useStore from '../store'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'

const CalendarPage = () => {
    const { activeWorkspaceId, events, fetchEvents, createEvent, updateEvent, deleteEvent } = useStore()
    const [isOpen, setIsOpen] = useState(false)
    const [editingEventId, setEditingEventId] = useState(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [title, setTitle] = useState('')
    const [type, setType] = useState('Follow-up')
    const [startAt, setStartAt] = useState(() => {
        const now = new Date()
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15)
        return format(now, "yyyy-MM-dd'T'HH:mm")
    })

    useEffect(() => {
        if (activeWorkspaceId) fetchEvents({ workspaceId: activeWorkspaceId })
    }, [activeWorkspaceId, fetchEvents])

    const { upcomingList, upcomingCount, totalCount } = useMemo(() => {
        const all = Array.isArray(events) ? events : []
        const now = new Date()
        const upcomingAll = all
            .filter((e) => new Date(e.startAt) >= now)
            .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

        return {
            totalCount: all.length,
            upcomingCount: upcomingAll.length,
            upcomingList: upcomingAll.slice(0, 12),
        }
    }, [events])

    const getTypeStyle = (typeValue) => {
        switch (typeValue) {
            case 'Meeting':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'Call':
                return 'bg-violet-50 text-violet-700 border-violet-200'
            case 'Email':
                return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'Task':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200'
        }
    }

    const openCreateModal = () => {
        const now = new Date()
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15)
        setEditingEventId(null)
        setTitle('')
        setType('Follow-up')
        setStartAt(format(now, "yyyy-MM-dd'T'HH:mm"))
        setIsOpen(true)
    }

    const openEditModal = (eventItem) => {
        setEditingEventId(eventItem._id)
        setTitle(eventItem.title || '')
        setType(eventItem.type || 'Follow-up')
        setStartAt(format(new Date(eventItem.startAt), "yyyy-MM-dd'T'HH:mm"))
        setIsOpen(true)
    }

    const openDeleteModal = (eventItem) => {
        setDeleteTarget(eventItem)
        setIsDeleteOpen(true)
    }

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarDays size={18} />
                        Calendar
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Reminders, meetings and follow-ups</p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
                >
                    <Plus size={18} />
                    New event
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">Upcoming</h3>
                        <span className="text-xs font-medium text-slate-500">{upcomingCount} events</span>
                    </div>
                    {upcomingCount === 0 ? (
                        <div className="h-[14rem] rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500">
                            No upcoming events yet
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {upcomingList.map((ev) => (
                                <div key={ev._id} className="group -mx-2 px-2 py-3 rounded-lg flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{ev.title}</p>
                                            <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${getTypeStyle(ev.type)}`}>
                                                {ev.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{ev.status || 'Scheduled'}</p>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <div className="text-right min-w-[6.75rem]">
                                            <p className="text-xs font-semibold text-slate-700 tabular-nums">
                                                {format(new Date(ev.startAt), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs text-slate-500 tabular-nums">
                                                {format(new Date(ev.startAt), 'h:mm a')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(ev)}
                                            className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Edit event"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                openDeleteModal(ev)
                                            }}
                                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete event"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <ChevronRight size={16} className="text-slate-300 opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-[11px] text-slate-500">Total</p>
                            <p className="text-base font-semibold text-slate-900">{totalCount}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-[11px] text-slate-500">Upcoming</p>
                            <p className="text-base font-semibold text-slate-900">{upcomingCount}</p>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                            <BadgeCheck size={16} className="text-blue-600 mt-0.5" />
                            <p>Create follow-ups for deals so the team never misses a next step.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <BadgeCheck size={16} className="text-blue-600 mt-0.5" />
                            <p>Use event types to keep calendar organized by workflow.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingEventId ? 'Edit event' : 'New event'}>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        const selected = new Date(startAt)
                        if (Number.isNaN(selected.getTime())) {
                            toast.error('Please select a valid date/time')
                            return
                        }
                        if (selected.getTime() < Date.now()) {
                            toast.error('You cannot create an event in the past')
                            return
                        }
                        if (editingEventId) {
                            await updateEvent(editingEventId, { title, type, startAt })
                            toast.success('Event updated')
                        } else {
                            await createEvent({ title, type, startAt })
                            toast.success('Event created')
                        }
                        setIsOpen(false)
                        setTitle('')
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Follow-up with client"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {['Call', 'Meeting', 'Email', 'Follow-up', 'Task'].map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Start</label>
                            <input
                                type="datetime-local"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                className="w-full rounded-lg bg-muted border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                            {editingEventId ? 'Save changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={async () => {
                    if (!deleteTarget?._id) return
                    await deleteEvent(deleteTarget._id)
                    toast.success('Event deleted')
                    setDeleteTarget(null)
                }}
                title="Delete event"
                message={`Are you sure you want to delete "${deleteTarget?.title || 'this event'}"?`}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    )
}

export default CalendarPage

