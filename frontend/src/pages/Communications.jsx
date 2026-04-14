import React from 'react'
import { MessageSquare, Send, FileText, Inbox } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'

const CommunicationsPage = () => {
    return (
        <div className="flex flex-col gap-4 min-h-0">
            <PageHeader
                title="Communications"
                subtitle="Templates, history and sending (email/SMS/WhatsApp later)"
                icon={<MessageSquare size={18} />}
                actions={(
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
                    >
                        <Send size={16} />
                        New message
                    </button>
                )}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeatureCard
                        title="Templates"
                        description="Reusable messages for follow-ups and introductions."
                        items={['Follow-up', 'Intro', 'Reminder']}
                        rightSlot={<FileText size={18} className="text-slate-400" />}
                    />
                    <FeatureCard
                        title="Inbox (history)"
                        description="All sent messages linked to deals/contacts."
                        items={['Timeline view', 'Search', 'Filters']}
                        rightSlot={<Inbox size={18} className="text-slate-400" />}
                    />
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                        <p className="text-sm font-semibold text-slate-800 mb-3">Recent</p>
                        <div className="h-[14rem] rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500">
                            No messages yet
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Integrations</p>
                    <p className="text-xs text-slate-500 mt-1">We can plug in providers later.</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        {['SMTP Email', 'WhatsApp API', 'SMS Gateway'].map((t) => (
                            <div key={t} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span>{t}</span>
                                <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-full px-2 py-0.5">
                                    Planned
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommunicationsPage

