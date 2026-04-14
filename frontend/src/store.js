import { create } from 'zustand';
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
    dashboardStats: null,
    dashboardLoading: false,
    isLoading: false,

    setUser: (user) => set({ user }),

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),

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
            }
        } catch (error) {
            console.error(error);
        }
    },

    inviteMemberToWorkspace: async (workspaceId, email) => {
        const { data } = await api.post(`/workspaces/${workspaceId}/invite`, { email });
        // If member was added immediately, refresh list for latest members.
        if (data?.mode === 'added_existing_user') {
            await get().fetchWorkspaces();
        }
        return data;
    },

    setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
        get().fetchDeals(id);
        get().fetchDashboardStats(id);
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
        try {
            const { data } = await api.post('/deals', {
                ...dealData,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ deals: [...state.deals, data] }));
            get().fetchDashboardStats();
        } catch (error) {
            console.error(error);
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

    createWorkspace: async (name) => {
        try {
            const { data } = await api.post('/workspaces', { name });
            set((state) => ({ workspaces: [...state.workspaces, data] }));
        } catch (error) {
            console.error(error);
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
            dashboardLoading: false
        });
    }
}));

export default useStore;
