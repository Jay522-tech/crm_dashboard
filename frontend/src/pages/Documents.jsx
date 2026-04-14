import React from 'react'
import { FileText, Upload, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'

const DocumentsPage = () => {
    return (
        <div className="flex flex-col gap-4 min-h-0">
            <PageHeader
                title="Documents"
                subtitle="Upload, search and organize shared files"
                icon={<FileText size={18} />}
                actions={(
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <Upload size={16} />
                        Upload
                    </button>
                )}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[18rem]">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-sm font-semibold text-slate-800">Files</p>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Search documents..."
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                            />
                        </div>
                    </div>
                    <div className="h-[14rem] rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500">
                        No documents yet
                    </div>
                </div>

                <div className="space-y-4">
                    <FeatureCard
                        title="Folders & tags"
                        description="Keep attachments organized by deal/contact/matter."
                        items={['Tag by workspace', 'Link to deals', 'Quick search']}
                    />
                    <FeatureCard
                        title="Storage (next)"
                        description="Start with local uploads, later S3."
                        items={['Local uploads', 'S3 integration', 'Permissions']}
                    />
                </div>
            </div>
        </div>
    )
}

export default DocumentsPage

