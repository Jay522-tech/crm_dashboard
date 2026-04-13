import { create } from 'zustand';
import api from './api';

const useStore = create((set, get) => ({
    user: null,
    workspaces: [],
    activeWorkspaceId: null,
    deals: [],
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
            if (data[0]) get().fetchDeals(data[0]._id);
        } catch (error) {
            console.error(error);
        }
    },

    setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
        get().fetchDeals(id);
    },

    fetchDeals: async (workspaceId) => {
        try {
            const { data } = await api.get(`/deals/workspace/${workspaceId}`);
            set({ deals: data });
        } catch (error) {
            console.error(error);
        }
    },

    addDeal: async (dealData) => {
        try {
            const { data } = await api.post('/deals', {
                ...dealData,
                workspaceId: get().activeWorkspaceId
            });
            set((state) => ({ deals: [...state.deals, data] }));
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
        set({ user: null, workspaces: [], deals: [], activeWorkspaceId: null });
    }
}));

export default useStore;
