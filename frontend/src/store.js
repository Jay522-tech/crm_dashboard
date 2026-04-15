import { create } from 'zustand';
import toast from 'react-hot-toast';
import api from './api';

const useStore = create((set, get) => ({
    user: null,
    workspaces: [],
    activeWorkspaceId: null,
    deals: [],
    contacts: [],
    events: [],
    matters: [],
    activities: [],
    documents: [],
    templates: [],
    communicationHistory: [],
    reportStats: null,
    reportLoading: false,
    dashboardStats: null,
    dashboardLoading: false,
    pendingInvitations: [],
    isLoading: false,

    setUser: (user) => set({ user }),

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),

    /** null = all stages; string[] = only those stages (may be empty = hide all) */
    pipelineStageFilter: null,
    setPipelineStageFilter: (stages) => set({ pipelineStageFilter: stages }),

    /** null = any assignee; 'unassigned' = no owner; else workspace member user id */
    pipelineAssigneeFilter: null,
    setPipelineAssigneeFilter: (id) => set({ pipelineAssigneeFilter: id }),

    /** Inclusive USD amount bounds; null = no bound */
    pipelineAmountMin: null,
    pipelineAmountMax: null,
    setPipelineAmountMin: (n) => set({ pipelineAmountMin: n }),
    setPipelineAmountMax: (n) => set({ pipelineAmountMax: n }),

    clearAllPipelineFilters: () =>
        set({
            pipelineStageFilter: null,
            pipelineAssigneeFilter: null,
            pipelineAmountMin: null,
            pipelineAmountMax: null,
        }),

    fetchWorkspaces: async () => {
        try {
            const { data } = await api.get('/workspaces');
            set({
                workspaces: data,
                activeWorkspaceId: data[0]?._id || null
            });
            if (data[0]) {
                get().fetchDeals(data[0]._id);
                get().fetchDashboardStats(data[0]._id);
            } else {
                set({
                    deals: [],
                    dashboardStats: null,
                });
            }
        } catch (error) {
            console.error(error);
        }
    },

    inviteMemberToWorkspace: async (workspaceId, email) => {
        const { data } = await api.post(`/workspaces/${workspaceId}/invite`, { email });
        // Refresh to get updated members
        await get().fetchWorkspaces();
        await get().fetchPendingInvitations(workspaceId);
        return data;
    },

    updateMemberRole: async (workspaceId, userId, role) => {
        const { data } = await api.put(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
        set((state) => ({
            workspaces: state.workspaces.map((w) => w._id === workspaceId ? data : w)
        }));
    },

    removeMemberFromWorkspace: async (workspaceId, userId) => {
        const { data } = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
        set((state) => ({
            workspaces: state.workspaces.map((w) => w._id === workspaceId ? data : w)
        }));
    },

    fetchPendingInvitations: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/invitations`);
            set({ pendingInvitations: data });
        } catch (error) {
            console.error(error);
        }
    },

    setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
        get().fetchDeals(id);
        get().fetchDashboardStats(id);
        get().fetchDocuments(id);
        get().fetchTemplates(id);
        get().fetchCommunicationHistory(id);
        get().fetchPendingInvitations(id);
    },

    fetchDeals: async (workspaceId) => {
        try {
            const { data } = await api.get(`/deals/workspace/${workspaceId}`);
            set({ deals: data });
        } catch (error) {
            console.error(error);
        }
    },

    fetchContacts: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get('/contacts', { params: { workspaceId } });
            set({ contacts: data });
        } catch (error) {
            console.error(error);
        }
    },

    createContact: async (payload) => {
        try {
            const { data } = await api.post('/contacts', {
                ...payload,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ contacts: [data, ...state.contacts] }));
            get().fetchDashboardStats();
        } catch (error) {
            console.error(error);
        }
    },

    fetchEvents: async ({ workspaceId = get().activeWorkspaceId, from, to } = {}) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get('/events', { params: { workspaceId, from, to } });
            set({ events: data });
        } catch (error) {
            console.error(error);
        }
    },

    createEvent: async (payload) => {
        try {
            const { data } = await api.post('/events', {
                ...payload,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ events: [...state.events, data].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)) }));
        } catch (error) {
            console.error(error);
        }
    },

    updateEvent: async (eventId, payload) => {
        try {
            const { data } = await api.put(`/events/${eventId}`, payload);
            set((state) => ({
                events: state.events
                    .map((e) => (e._id === eventId ? { ...e, ...data } : e))
                    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
            }));
        } catch (error) {
            console.error(error);
        }
    },

    deleteEvent: async (eventId) => {
        try {
            await api.delete(`/events/${eventId}`);
            set((state) => ({ events: state.events.filter((e) => e._id !== eventId) }));
        } catch (error) {
            console.error(error);
        }
    },

    fetchMatters: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get('/matters', { params: { workspaceId } });
            set({ matters: data });
        } catch (error) {
            console.error(error);
        }
    },

    createMatter: async (payload) => {
        try {
            const { data } = await api.post('/matters', {
                ...payload,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ matters: [data, ...state.matters] }));
        } catch (error) {
            console.error(error);
        }
    },

    updateMatter: async (matterId, payload) => {
        try {
            const { data } = await api.put(`/matters/${matterId}`, payload);
            set((state) => ({
                matters: state.matters.map((m) => (m._id === matterId ? data : m))
            }));
        } catch (error) {
            console.error(error);
        }
    },

    deleteMatter: async (matterId) => {
        try {
            await api.delete(`/matters/${matterId}`);
            set((state) => ({ matters: state.matters.filter((m) => m._id !== matterId) }));
        } catch (error) {
            console.error(error);
        }
    },

    activitiesPage: { items: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    fetchActivities: async ({ workspaceId = get().activeWorkspaceId, page = 1, limit = 10 } = {}) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get('/activities', { params: { workspaceId, page, limit } });
            set({ activitiesPage: data, activities: data.items });
        } catch (error) {
            console.error(error);
        }
    },

    fetchDashboardStats: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;

        try {
            set({ dashboardLoading: true });
            const { data } = await api.get(`/workspaces/${workspaceId}/dashboard`);
            set({ dashboardStats: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ dashboardLoading: false });
        }
    },

    addDeal: async (dealData) => {
        const workspaceId = get().activeWorkspaceId;
        if (!workspaceId) {
            toast.error('પહેલાં એક workspace બનાવો અથવા સાઇડબારમાંથી પસંદ કરો — deal ને workspace જોઈએ.');
            return null;
        }
        try {
            const { data } = await api.post('/deals', {
                ...dealData,
                workspaceId,
            });
            set((state) => ({ deals: [...state.deals, data] }));
            get().fetchDashboardStats();
            return data;
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message || 'Deal create failed';
            toast.error(msg);
            return null;
        }
    },

    updateDealStage: async (dealId, stage) => {
        try {
            const { data } = await api.put(`/deals/${dealId}`, { stage });
            set((state) => ({
                deals: state.deals.map((d) => d._id === dealId ? data : d)
            }));
            get().fetchDashboardStats();
        } catch (error) {
            console.error(error);
        }
    },

    updateDeal: async (dealId, updates) => {
        try {
            const { data } = await api.put(`/deals/${dealId}`, updates);
            set((state) => ({
                deals: state.deals.map((d) => d._id === dealId ? data : d)
            }));
            get().fetchDashboardStats();
        } catch (error) {
            console.error(error);
        }
    },

    addNote: async (dealId, content) => {
        try {
            const { data } = await api.post(`/deals/${dealId}/notes`, { content });
            set((state) => ({
                deals: state.deals.map((d) => d._id === dealId ? data : d)
            }));
        } catch (error) {
            console.error(error);
        }
    },

    deleteDeal: async (dealId) => {
        try {
            await api.delete(`/deals/${dealId}`);
            set((state) => ({ deals: state.deals.filter((d) => d._id !== dealId) }));
            get().fetchDashboardStats();
        } catch (error) {
            console.error(error);
        }
    },

    fetchDocuments: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get(`/documents/workspace/${workspaceId}`);
            set({ documents: data });
        } catch (error) {
            console.error(error);
        }
    },

    uploadDocument: async (formData) => {
        try {
            const { data } = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set((state) => ({ documents: [data, ...state.documents] }));
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteDocument: async (documentId) => {
        try {
            await api.delete(`/documents/${documentId}`);
            set((state) => ({ documents: state.documents.filter((d) => d._id !== documentId) }));
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Could not delete document');
            throw error;
        }
    },

    // --- Communications & Templates ---
    fetchTemplates: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get(`/communications/templates/workspace/${workspaceId}`);
            set({ templates: data });
        } catch (error) {
            console.error(error);
        }
    },

    createTemplate: async (payload) => {
        try {
            const { data } = await api.post('/communications/templates', {
                ...payload,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ templates: [data, ...state.templates] }));
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    fetchCommunicationHistory: async (workspaceId = get().activeWorkspaceId) => {
        if (!workspaceId) return;
        try {
            const { data } = await api.get(`/communications/workspace/${workspaceId}`);
            set({ communicationHistory: data });
        } catch (error) {
            console.error(error);
        }
    },

    logCommunication: async (payload) => {
        try {
            const { data } = await api.post('/communications/log', {
                ...payload,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ communicationHistory: [data, ...state.communicationHistory] }));
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    fetchReportStats: async (scope = 'workspace', workspaceId = get().activeWorkspaceId) => {
        try {
            set({ reportLoading: true });
            const { data } = await api.get('/reports/stats', {
                params: { scope, workspaceId }
            });
            set({ reportStats: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ reportLoading: false });
        }
    },

    createWorkspace: async (name) => {
        try {
            const { data } = await api.post('/workspaces', { name });
            set((state) => ({ workspaces: [...state.workspaces, data] }));
            await get().setActiveWorkspace(data._id);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Could not create workspace');
            throw error;
        }
    },

    refreshUser: async () => {
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data });
        } catch (error) {
            console.error(error);
        }
    },

    updateProfile: async (payload) => {
        const { data } = await api.put('/auth/me', payload);
        set({ user: data });
        return data;
    },

    /** Rename workspace (Admin / Super Admin) */
    updateWorkspace: async (workspaceId, payload) => {
        const { data } = await api.put(`/workspaces/${workspaceId}`, payload);
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                String(w._id) === String(workspaceId) ? data : w
            ),
        }));
        return data;
    },

    /** Owner or Super Admin — deletes workspace and related data server-side */
    deleteWorkspace: async (workspaceId) => {
        await api.delete(`/workspaces/${workspaceId}`);
        await get().fetchWorkspaces();
        const wid = get().activeWorkspaceId;
        if (wid) {
            await get().fetchDeals(wid);
            await get().fetchDashboardStats(wid);
            await get().fetchDocuments(wid);
            await get().fetchTemplates(wid);
            await get().fetchCommunicationHistory(wid);
            await get().fetchPendingInvitations(wid);
        } else {
            set({
                deals: [],
                contacts: [],
                dashboardStats: null,
                documents: [],
                templates: [],
                communicationHistory: [],
                pendingInvitations: [],
            });
        }
    },

    logout: async () => {
        await api.post('/auth/logout');
        set({
            user: null,
            workspaces: [],
            deals: [],
            contacts: [],
            events: [],
            matters: [],
            activities: [],
            activeWorkspaceId: null,
            dashboardStats: null,
            dashboardLoading: false,
            searchTerm: '',
            pipelineStageFilter: null,
            pipelineAssigneeFilter: null,
            pipelineAmountMin: null,
            pipelineAmountMax: null,
        });
    }
}));

export default useStore;
