import React, { useState } from 'react'
import Modal from './Modal'
import { User, Mail, Phone } from 'lucide-react'

const ContactModal = ({ isOpen, onClose, onSave }) => {
    const [contact, setContact] = useState({ name: '', email: '', phone: '' })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!contact.name.trim()) return
        onSave(contact)
        setContact({ name: '', email: '', phone: '' })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Contact Person">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <User size={14} /> Full Name
                    </label>
                    <input
                        autoFocus
                        required
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Mail size={14} /> Email Address
                    </label>
                    <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Phone size={14} /> Phone Number
                    </label>
                    <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                    >
                        Save Contact
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ContactModal
