import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, maxWidthClass = 'max-w-lg' }) => {
    if (!isOpen) return null

    return createPortal((
        <div
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
                <div className={`bg-card w-full ${maxWidthClass} rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200`}>
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 max-h-[90vh] overflow-auto no-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    ), document.body)
}

export default Modal
