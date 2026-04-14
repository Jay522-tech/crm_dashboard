import React from 'react'

const FeatureCard = ({ title, description, items = [], rightSlot }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    {description ? <p className="text-xs text-slate-500 mt-1">{description}</p> : null}
                </div>
                {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
            </div>
            {items.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {items.map((it) => (
                        <li key={it} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300" />
                            <span className="leading-snug">{it}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    )
}

export default FeatureCard

