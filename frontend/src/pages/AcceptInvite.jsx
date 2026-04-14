import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import useStore from '../store'

const AcceptInvite = () => {
    const { user, setUser, fetchWorkspaces } = useStore()
    const location = useLocation()
    const navigate = useNavigate()

    const token = useMemo(() => {
        const params = new URLSearchParams(location.search)
        return params.get('token') || ''
    }, [location.search])

    const [loading, setLoading] = useState(true)
    const [invitation, setInvitation] = useState(null)
    const [accepting, setAccepting] = useState(false)

    // Token-based invites: whoever is logged in can join using the token.

    useEffect(() => {
        const run = async () => {
            if (!token) {
                setInvitation(null)
                setLoading(false)
                return
            }
            setLoading(true)
            try {
                const { data } = await api.get(`/workspaces/invitations/${encodeURIComponent(token)}`)
                setInvitation(data)
            } catch (err) {
                setInvitation(null)
                toast.error(err?.response?.data?.message || 'Invite not found')
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [token])

    // If user is not logged in, push them to register (new user flow),
    // then come back to this page via `next`.
    useEffect(() => {
        if (loading) return
        if (!token) return
        if (!invitation) return
        if (user) return

        const next = `/accept-invite?token=${encodeURIComponent(token)}`
        navigate(`/register?next=${encodeURIComponent(next)}&invite=${encodeURIComponent(token)}`, { replace: true })
    }, [accepting, invitation, loading, navigate, token, user])

    const accept = async () => {
        if (!token) return
        setAccepting(true)
        try {
            // Ensure user info is fresh
            if (!user) {
                const { data } = await api.get('/auth/me')
                setUser(data)
            }
            await api.post(`/workspaces/invitations/${encodeURIComponent(token)}/accept`)
            await fetchWorkspaces()
            toast.success('Joined workspace')
            navigate('/pipeline')
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to accept invite')
        } finally {
            setAccepting(false)
        }
    }

    const authLinks = useMemo(() => {
        const next = `/accept-invite?token=${encodeURIComponent(token)}`
        return {
            login: `/login?next=${encodeURIComponent(next)}`,
            register: `/register?next=${encodeURIComponent(next)}&invite=${encodeURIComponent(token)}`
        }
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-slate-900">Accept invite</h1>

                {loading ? (
                    <p className="text-sm text-muted-foreground mt-3">Loading invite…</p>
                ) : !token ? (
                    <p className="text-sm text-muted-foreground mt-3">Missing invite token.</p>
                ) : invitation ? (
                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-sm text-slate-700">
                                You’re invited to join <span className="font-semibold">{invitation.workspace?.name || 'a workspace'}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Invite for: <span className="font-medium">{invitation.email}</span>
                            </p>
                        </div>

                        {user ? (
                            <button
                                type="button"
                                onClick={accept}
                                disabled={accepting}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {accepting ? 'Joining…' : 'Join workspace'}
                            </button>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Link
                                    to={authLinks.login}
                                    className="text-center w-full py-3 rounded-lg font-semibold border border-slate-200 bg-white hover:bg-slate-50 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to={authLinks.register}
                                    className="text-center w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        <p className="text-xs text-slate-500">
                            Note: you must login or register to accept this invite.
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground mt-3">Invite not available.</p>
                )}
            </div>
        </div>
    )
}

export default AcceptInvite

