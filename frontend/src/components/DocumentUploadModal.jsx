import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { File, Tag, Folder, Link as LinkIcon, Upload, X, Loader2, ChevronDown } from 'lucide-react'
import useStore from '../store'

const DocumentUploadModal = ({ isOpen, onClose }) => {
    const {
        activeWorkspaceId,
        uploadDocument,
        contacts,
        deals,
        fetchContacts,
        fetchDeals
    } = useStore()

    const [file, setFile] = useState(null)
    const [metadata, setMetadata] = useState({
        name: '',
        folder: 'Root',
        tags: '',
        contactId: '',
        dealId: ''
    })
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (isOpen && activeWorkspaceId) {
            fetchContacts(activeWorkspaceId)
            fetchDeals(activeWorkspaceId)
        }
    }, [isOpen, activeWorkspaceId, fetchContacts, fetchDeals])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            if (!metadata.name) {
                setMetadata(prev => ({ ...prev, name: selectedFile.name }))
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file || !activeWorkspaceId) return

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('workspaceId', activeWorkspaceId)
            formData.append('name', metadata.name)
            formData.append('folder', metadata.folder)
            formData.append('tags', metadata.tags)
            if (metadata.contactId) formData.append('contactId', metadata.contactId)
            if (metadata.dealId) formData.append('dealId', metadata.dealId)

            await uploadDocument(formData)
            handleClose()
        } catch (error) {
            console.error('Upload failed:', error)
            toast.error('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleClose = () => {
        setFile(null)
        setMetadata({
            name: '',
            folder: 'Root',
            tags: '',
            contactId: '',
            dealId: ''
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Drop Area */}
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {file ? (
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <File size={20} />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="p-1 hover:bg-primary/10 rounded-full"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Upload size={20} />
                            </div>
                            <p className="text-sm text-slate-500">Click to select or drag and drop</p>
                            <p className="text-[11px] text-slate-400">PDF, PNG, JPG, DOCX up to 10MB</p>
                        </>
                    )}
                </div>

                {/* Metadata Fields */}
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</label>
                        <input
                            required
                            value={metadata.name}
                            onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                            placeholder="Invoice_2024.pdf"
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Folder size={12} /> Folder
                            </label>
                            <input
                                value={metadata.folder}
                                onChange={(e) => setMetadata({ ...metadata, folder: e.target.value })}
                                placeholder="Root"
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag size={12} /> Tags
                            </label>
                            <input
                                value={metadata.tags}
                                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                                placeholder="urgent, tax"
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <LinkIcon size={12} /> Link to Contact
                        </label>
                        <div className="relative">
                            <select
                                value={metadata.contactId}
                                onChange={(e) => setMetadata({ ...metadata, contactId: e.target.value })}
                                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                            >
                                <option value="">No Contact</option>
                                {contacts.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <LinkIcon size={12} /> Link to Deal
                        </label>
                        <div className="relative">
                            <select
                                value={metadata.dealId}
                                onChange={(e) => setMetadata({ ...metadata, dealId: e.target.value })}
                                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                            >
                                <option value="">No Deal</option>
                                {deals.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </div>
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
                        disabled={!file || uploading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default DocumentUploadModal
