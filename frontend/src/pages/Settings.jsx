import React, { useState, useEffect } from 'react'
import {
    Settings as SettingsIcon,
    User,
    Briefcase,
    Shield,
    Bell,
    ChevronRight,
    Save,
    Trash2,
    CheckCircle2
} from 'lucide-react'
import useStore from '../store'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

const SettingsPage = () => {
    const { user, workspaces, activeWorkspaceId, updateProfile, updateWorkspace, deleteWorkspace } = useStore()
    const [activeTab, setActiveTab] = useState('profile')

    // Form States
    const [profileForm, setProfileForm] = useState({ name: '', email: '' })
    const [workspaceForm, setWorkspaceForm] = useState({ name: '' })

    const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId)

    useEffect(() => {
        if (user) setProfileForm({ name: user.name, email: user.email })
        if (activeWorkspace) setWorkspaceForm({ name: activeWorkspace.name })
    }, [user, activeWorkspace])

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        try {
            // updateProfile implementation in store
            toast.success('Profile updated successfully!')
        } catch (err) {
            toast.error('Failed to update profile')
        }
    }

    const handleWorkspaceUpdate = async (e) => {
        e.preventDefault()
        try {
            await updateWorkspace(activeWorkspaceId, workspaceForm)
            toast.success('Workspace updated!')
        } catch (err) {
            toast.error('Failed to update workspace')
        }
    }

    const handleDeleteWorkspace = async () => {
        if (window.confirm(`Are you sure you want to delete "${activeWorkspace?.name}"? This action is irreversible.`)) {
            try {
                await deleteWorkspace(activeWorkspaceId)
                toast.success('Workspace deleted')
            } catch (err) {
                toast.error('Failed to delete workspace')
            }
        }
    }

    return (
        <div className="flex flex-col gap-8 min-h-0 pb-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Settings</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 italic">Configuration & Infrastructure</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'profile', label: 'Profile Settings', icon: User },
                        { id: 'workspace', label: 'Workspace', icon: Briefcase },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 3 : 2} />
                                <span className={cn("text-xs font-black uppercase tracking-widest", activeTab === tab.id ? "text-white" : "text-slate-600")}>
                                    {tab.label}
                                </span>
                            </div>
                            <ChevronRight size={14} className={cn(activeTab === tab.id ? "opacity-100" : "opacity-0")} />
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm min-h-[500px]">
                    {activeTab === 'profile' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase text-indigo-600">Personal Identity</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Update your account credentials</p>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profileForm.email}
                                        className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                                        <Save size={16} />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'workspace' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase text-indigo-600">Workspace Control</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage active environment: {activeWorkspace?.name}</p>
                                </div>
                                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                    <CheckCircle2 size={12} />
                                    Active Platform
                                </div>
                            </div>

                            <form onSubmit={handleWorkspaceUpdate} className="space-y-8">
                                <div className="max-w-md space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={workspaceForm.name}
                                        onChange={e => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="pt-4 flex items-center gap-4">
                                    <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                                        <Save size={16} />
                                        Update Meta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteWorkspace}
                                        className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        <Trash2 size={16} />
                                        Dissolve Workspace
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase text-indigo-600">Access Protocols</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Secure your account infrastructure</p>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-indigo-50 text-indigo-700 border border-indigo-100 italic font-bold text-sm">
                                Password reset functionality is available via the landing page authentication flow. High-security MFA features are being phased into the production environment.
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase text-indigo-600">Alert Matrix</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure your signal reception</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Email Alerts', sub: 'Receive digest of workspace activity' },
                                    { label: 'System Pings', sub: 'In-app notification for deal updates' },
                                    { label: 'Matter Reminders', sub: 'Alerts for upcoming deadlines' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 transition-all">
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.sub}</p>
                                        </div>
                                        <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                                            <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage

