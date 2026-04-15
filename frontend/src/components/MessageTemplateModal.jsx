import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { FileText, Type, AlignLeft, Info, ChevronDown } from 'lucide-react'
import useStore from '../store'

const MessageTemplateModal = ({ isOpen, onClose }) => {
    const { createTemplate } = useStore()
    const [template, setTemplate] = useState({
        name: '',
        subject: '',
        content: '',
        type: 'Email'
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!template.name || !template.content) return

        try {
            setLoading(true)
            await createTemplate(template)
            handleClose()
        } catch (error) {
            console.error('Failed to create template:', error)
            toast.error('Failed to save template')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setTemplate({ name: '', subject: '', content: '', type: 'Email' })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create Message Template">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={12} /> Template Name
                    </label>
                    <input
                        required
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                        placeholder="e.g., Welcome Email, Follow-up #1"
                        className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            Type
                        </label>
                        <div className="relative">
                            <select
                                value={template.type}
                                onChange={(e) => setTemplate({ ...template, type: e.target.value })}
                                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                            >
                                <option value="Email">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="WhatsApp">WhatsApp</option>
                            </select>
                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {template.type === 'Email' && (
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Type size={12} /> Subject Line
                        </label>
                        <input
                            value={template.subject}
                            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                            placeholder="Re: Your inquiry about..."
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <AlignLeft size={12} /> Message Content
                    </label>
                    <textarea
                        required
                        rows={6}
                        value={template.content}
                        onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                        placeholder="Hi {{name}}, thank you for..."
                        className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all text-sm resize-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Info size={10} /> Use double curly braces for placeholders, e.g., &#123;&#123;name&#125;&#125;
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
                    >
                        {loading ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default MessageTemplateModal
