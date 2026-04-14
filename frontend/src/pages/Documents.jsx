import React, { useEffect, useState } from 'react'
import { FileText, Upload, Search, Trash2, Download, File } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'
import DocumentUploadModal from '../components/DocumentUploadModal'
import useStore from '../store'
import { format } from 'date-fns'

const DocumentsPage = () => {
    const {
        documents,
        fetchDocuments,
        deleteDocument,
        activeWorkspaceId
    } = useStore()

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (activeWorkspaceId) {
            fetchDocuments(activeWorkspaceId)
        }
    }, [activeWorkspaceId, fetchDocuments])

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            await deleteDocument(id)
        }
    }

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="flex flex-col gap-4 min-h-0">
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />

            <PageHeader
                title="Documents"
                subtitle="Upload, search and organize shared files"
                icon={<FileText size={18} />}
                actions={(
                    <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <Upload size={16} />
                        Upload
                    </button>
                )}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <p className="text-sm font-semibold text-slate-800">Files ({filteredDocuments.length})</p>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredDocuments.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {filteredDocuments.map((doc) => (
                                    <div key={doc._id} className="group flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <File size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500">
                                                        {formatFileSize(doc.size)} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                                    </span>
                                                    {doc.tags?.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            {doc.tags.map((tag, i) => (
                                                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium uppercase tracking-tight">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {doc.folder !== 'Root' && (
                                                    <p className="text-[10px] text-primary/70 font-medium uppercase mt-0.5">📁 {doc.folder}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents/download/${doc._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-sm text-slate-500 gap-2 py-8">
                                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                                    <FileText size={24} className="text-slate-300" />
                                </div>
                                <p>{searchTerm ? 'No documents match your search' : 'No documents yet'}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <FeatureCard
                        title="Folders & tags"
                        description="Check out your tags and folders in the list."
                        items={['Metadata enabled', 'Workspace filtering', 'Live updates']}
                    />
                    <FeatureCard
                        title="Storage Status"
                        description="Using secure local storage."
                        items={[
                            `Total Files: ${documents.length}`,
                            `Latest: ${documents[0] ? format(new Date(documents[0].createdAt), 'MMM d') : 'N/A'}`
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}

export default DocumentsPage
