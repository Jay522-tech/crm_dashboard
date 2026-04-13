import React from 'react'
import Modal from './Modal'
import { AlertCircle } from 'lucide-react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'primary' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className={variant === 'destructive' ? 'text-destructive' : 'text-primary'}>
                        <AlertCircle size={24} />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmModal
