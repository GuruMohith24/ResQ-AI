const BASE_URL = 'http://localhost:8080/api';

export const api = {
    // Report by text
    reportText: async (text) => {
        const res = await fetch(`${BASE_URL}/incidents/report/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error('Failed to submit report');
        return res.json();
    },

    // Report by image + text
    reportImage: async (base64Image, mimeType, text) => {
        const res = await fetch(`${BASE_URL}/incidents/report/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, mimeType, text }),
        });
        if (!res.ok) throw new Error('Failed to submit image report');
        return res.json();
    },

    // Get all incidents
    getAllIncidents: async () => {
        const res = await fetch(`${BASE_URL}/incidents`);
        if (!res.ok) throw new Error('Failed to fetch incidents');
        return res.json();
    },

    // Dispatch
    dispatch: async (id) => {
        const res = await fetch(`${BASE_URL}/incidents/${id}/dispatch`, {
            method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to dispatch');
        return res.json();
    },

    // Resolve
    resolve: async (id) => {
        const res = await fetch(`${BASE_URL}/incidents/${id}/resolve`, {
            method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to resolve');
        return res.json();
    },
};
