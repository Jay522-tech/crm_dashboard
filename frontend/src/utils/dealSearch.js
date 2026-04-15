/** Header / global search: match deal title, description, embedded contact, notes, assignee */
export function dealMatchesGlobalSearch(deal, term) {
    const t = (term || '').trim().toLowerCase()
    if (!t) return true
    const parts = [
        deal.title,
        deal.description,
        deal.contact?.name,
        deal.contact?.email,
        deal.contact?.phone,
        deal.assignee?.name,
        ...(Array.isArray(deal.notes) ? deal.notes.map((n) => n?.content) : []),
    ]
    return parts.some((p) => p != null && String(p).toLowerCase().includes(t))
}

/**
 * Deal pipeline filters (header panel).
 * @param {string|null|undefined} assigneeFilter null = any; 'unassigned' = no assignee; else user id
 * @param {number|null|undefined} amountMin amount >= (inclusive)
 * @param {number|null|undefined} amountMax amount <= (inclusive)
 */
export function dealMatchesDealFilters(deal, { assigneeFilter, amountMin, amountMax }) {
    const dealAssigneeId = deal.assignee?._id ?? deal.assignee
    const hasAssignee = dealAssigneeId != null && String(dealAssigneeId) !== ''

    if (assigneeFilter === 'unassigned') {
        if (hasAssignee) return false
    } else if (assigneeFilter != null && assigneeFilter !== '') {
        if (String(dealAssigneeId || '') !== String(assigneeFilter)) return false
    }

    const amt = Number(deal.amount)
    const n = Number.isFinite(amt) ? amt : 0
    if (amountMin != null && Number.isFinite(amountMin) && n < amountMin) return false
    if (amountMax != null && Number.isFinite(amountMax) && n > amountMax) return false
    return true
}
