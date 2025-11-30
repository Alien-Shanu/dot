const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5555/api';

export const api = {
    async register(username, password) {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Registration failed');
        }
        return res.json();
    },

    async login(username, password) {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Login failed');
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return data.user;
    },

    async getCards() {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        
        const res = await fetch(`${API_URL}/cards`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch cards');
        return res.json();
    },

    async createCard(card) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(card)
        });
        if (!res.ok) throw new Error('Failed to create card');
        return res.json();
    },

    async updateCard(id, updates) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/cards/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update card');
        return res.json();
    },

    async deleteCard(id) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/cards/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete card');
        return res.json();
    }
};
