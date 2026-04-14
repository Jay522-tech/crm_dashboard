import React from 'react'
import { Settings, Shield, Users, Bell, KeyRound } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'

const SettingsPage = () => {
    return (
        <div className="flex flex-col gap-4 min-h-0">
            <PageHeader
                title="Settings"
                subtitle="Workspace and account settings"
                icon={<Settings size={18} />}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeatureCard
                        title="Workspace members"
                        description="Invite and manage access."
                        items={['Roles & permissions', 'Member list', 'Invites']}
                        rightSlot={<Users size={18} className="text-slate-400" />}
                    />
                    <FeatureCard
                        title="Security"
                        description="Authentication and access controls."
                        items={['JWT cookie sessions', 'Password policy', 'Audit logs']}
                        rightSlot={<Shield size={18} className="text-slate-400" />}
                    />
                    <FeatureCard
                        title="Notifications"
                        description="Email reminders and alerts."
                        items={['Event reminders', 'Matter due reminders', 'Digest emails']}
                        rightSlot={<Bell size={18} className="text-slate-400" />}
                    />
                    <FeatureCard
                        title="API keys (later)"
                        description="Integrations for WhatsApp/SMS/Email providers."
                        items={['SMTP', 'WhatsApp API', 'SMS gateway']}
                        rightSlot={<KeyRound size={18} className="text-slate-400" />}
                    />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Tips</p>
                    <p className="text-xs text-slate-500 mt-1">
                        We can connect settings here to real backend config next.
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        {[
                            'Use SMTP env vars to enable reminders',
                            'Invite members from Workspaces settings',
                            'Keep Activities enabled for auditing',
                        ].map((t) => (
                            <div key={t} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage

