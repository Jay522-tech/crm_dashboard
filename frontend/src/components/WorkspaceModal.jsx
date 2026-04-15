import React, { useState } from 'react'
import Modal from './Modal'
import useStore from '../store'

const WorkspaceModal = ({ isOpen, onClose }) => {
    const { createWorkspace } = useStore()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            await createWorkspace(name)
            setName('')
            onClose()
        } catch {
            /* toast in store */
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block">Workspace Name</label>
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sales Team, Marketing"
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
                        disabled={loading || !name.trim()}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Workspace'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default WorkspaceModal
