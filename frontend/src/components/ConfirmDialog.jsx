import React, { useState } from 'react'
import Modal from './Modal'
import { Loader2 } from 'lucide-react'

/**
 * Replaces window.confirm with an in-app modal.
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    title = 'Confirm',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
}) => {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        if (!onConfirm) return
        setLoading(true)
        try {
            await Promise.resolve(onConfirm())
            onClose()
        } catch {
            // Parent may toast; keep dialog open
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="text-sm leading-relaxed text-slate-600">{message}</div>
                <div className="flex flex-wrap justify-end gap-3 pt-1">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleConfirm}
                        className={
                            danger
                                ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60'
                                : 'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:opacity-60'
                        }
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmDialog
