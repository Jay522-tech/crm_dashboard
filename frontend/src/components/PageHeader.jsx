import React from 'react'

const PageHeader = ({ title, subtitle, icon, actions }) => {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    {icon ? <span className="text-slate-600">{icon}</span> : null}
                    <h2 className="text-xl font-semibold text-slate-900 truncate">{title}</h2>
                </div>
                {subtitle ? <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p> : null}
            </div>
            {actions ? <div className="shrink-0 flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    )
}

export default PageHeader

