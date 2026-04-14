import React, { useEffect, useState } from 'react'
import { MessageSquare, Send, FileText, Inbox, Plus, Mail, MessageCircle, Phone, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'
import MessageTemplateModal from '../components/MessageTemplateModal'
import useStore from '../store'
import { format } from 'date-fns'

const CommunicationsPage = () => {
    const {
        workspaces,
        activeWorkspaceId,
        user,
        templates,
        communicationHistory,
        fetchTemplates,
        fetchCommunicationHistory
    } = useStore()

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)
    const currentUserMember = activeWorkspace?.members?.find(
        (m) => (m.user?._id || m.user) === user?._id
    )
    const isAdmin = currentUserMember?.role === 'Admin' || currentUserMember?.role === 'Super Admin'

    useEffect(() => {
        if (activeWorkspaceId) {
            fetchTemplates(activeWorkspaceId)
            fetchCommunicationHistory(activeWorkspaceId)
        }
    }, [activeWorkspaceId, fetchTemplates, fetchCommunicationHistory])

    const getIconForType = (type) => {
        switch (type) {
            case 'Email': return <Mail size={16} />
            case 'WhatsApp': return <MessageCircle size={16} />
            case 'SMS': return <MessageSquare size={16} />
            default: return <Send size={16} />
        }
    }

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <MessageTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
            />

            <PageHeader
                title="Communications"
                subtitle="Manage templates and view interaction history"
                icon={<MessageSquare size={18} />}
                actions={isAdmin && (
                    <button
                        type="button"
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                        <Plus size={16} />
                        New Template
                    </button>
                )}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Templates List */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <FileText size={16} className="text-slate-400" /> Templates
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">
                                {templates.length}
                            </span>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[12rem] pr-1">
                            {templates.length > 0 ? templates.map((t) => (
                                <div key={t._id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:border-primary/30 transition-colors cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
                                        <span className="text-slate-400 group-hover:text-primary transition-colors">
                                            {getIconForType(t.type)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.subject || t.content}</p>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 py-4 text-center italic">No templates created yet</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats / History Info */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <Inbox size={16} className="text-slate-400" /> Stats
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Sent Today</p>
                                <p className="text-2xl font-bold text-blue-900 leading-none">0</p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100/50">
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Total History</p>
                                <p className="text-2xl font-bold text-purple-900 leading-none">{communicationHistory.length}</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed italic">
                            Email and WhatsApp automation stats will appear here as you grow.
                        </p>
                    </div>

                    {/* Recent History Table */}
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[22rem] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-slate-800">Recent Communications</p>
                            <div className="flex items-center gap-2">
                                <button className="text-[11px] font-medium text-primary hover:underline">View all</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {communicationHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {communicationHistory.map((log) => (
                                        <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${log.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                                                    log.type === 'WhatsApp' ? 'bg-green-100 text-green-600' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {getIconForType(log.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {log.subject || (log.type + ' to ' + (log.contactId?.name || 'Client'))}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                                                        <Clock size={10} /> {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{log.content}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${log.status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                                                            log.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                                'bg-slate-50 text-slate-500'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">• By {log.sentBy?.name || 'System'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
                                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                                        <Inbox size={24} className="text-slate-300" />
                                    </div>
                                    <p>No messages in the history yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Integrations */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Integrations</p>
                        <p className="text-xs text-slate-500 mb-4">Connect your message providers.</p>
                        <div className="space-y-2">
                            {[
                                { name: 'SMTP Email', status: 'Planned' },
                                { name: 'WhatsApp API', status: 'Planned' },
                                { name: 'SMS Gateway', status: 'Planned' }
                            ].map((integ) => (
                                <div key={integ.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 group hover:border-primary/20 transition-colors">
                                    <span className="text-sm text-slate-700 font-medium">{integ.name}</span>
                                    <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 rounded-full px-2 py-0.5 uppercase">
                                        {integ.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-semibold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors border border-dashed border-primary/30">
                            Request Custom Integration
                        </button>
                    </div>

                    <FeatureCard
                        title="Communication Tips"
                        description="Professional templates improve response rates by 40%."
                        items={['Use placeholders', 'Keep it concise', 'Add call to action']}
                    />
                </div>
            </div>
        </div>
    )
}

export default CommunicationsPage
