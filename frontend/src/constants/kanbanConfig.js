/** Visual themes per CRM stage — soft pastels like a professional task board */
export const STAGES = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost']

export const STAGE_THEME = {
    Lead: {
        label: 'Lead',
        subtitle: 'New opportunities',
        topBar: 'bg-violet-500',
        headerIcon: 'text-violet-600',
        headerBg: 'bg-violet-50/80',
        columnBg: 'bg-violet-50/30',
        badge: 'bg-violet-100 text-violet-800 border-violet-200/80',
    },
    Contacted: {
        label: 'Contacted',
        subtitle: 'In conversation',
        topBar: 'bg-orange-400',
        headerIcon: 'text-orange-600',
        headerBg: 'bg-orange-50/80',
        columnBg: 'bg-orange-50/30',
        badge: 'bg-orange-100 text-orange-900 border-orange-200/80',
    },
    Qualified: {
        label: 'Qualified',
        subtitle: 'Ready to close',
        topBar: 'bg-amber-400',
        headerIcon: 'text-amber-700',
        headerBg: 'bg-amber-50/80',
        columnBg: 'bg-amber-50/25',
        badge: 'bg-amber-100 text-amber-900 border-amber-200/80',
    },
    Won: {
        label: 'Won',
        subtitle: 'Closed won',
        topBar: 'bg-sky-400',
        headerIcon: 'text-sky-600',
        headerBg: 'bg-sky-50/80',
        columnBg: 'bg-sky-50/30',
        badge: 'bg-sky-100 text-sky-900 border-sky-200/80',
    },
    Lost: {
        label: 'Lost',
        subtitle: 'Closed lost',
        topBar: 'bg-slate-400',
        headerIcon: 'text-slate-600',
        headerBg: 'bg-slate-50/90',
        columnBg: 'bg-slate-50/40',
        badge: 'bg-slate-100 text-slate-800 border-slate-200/80',
    },
}

/** Short tag shown on cards (pipeline context) */
export const STAGE_CATEGORY_LABEL = {
    Lead: 'Pipeline',
    Contacted: 'Outreach',
    Qualified: 'Qualified',
    Won: 'Closed · Won',
    Lost: 'Closed · Lost',
}
