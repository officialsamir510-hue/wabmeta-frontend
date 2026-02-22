// src/services/inboxExtra.ts - COMPLETE

import api from './api';

export const inboxExtra = {
    uploadMedia: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/inbox/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    sendMedia: (
        conversationId: string,
        data: { mediaType: 'image' | 'video' | 'audio' | 'document'; mediaUrl: string; caption?: string }
    ) => api.post(`/inbox/conversations/${conversationId}/messages/media`, data),

    pinConversation: (conversationId: string, isPinned: boolean) =>
        api.patch(`/inbox/conversations/${conversationId}/pin`, { isPinned }),

    addLabels: (conversationId: string, labels: string[]) =>
        api.post(`/inbox/conversations/${conversationId}/labels`, { labels }),

    removeLabel: (conversationId: string, label: string) =>
        api.delete(`/inbox/conversations/${conversationId}/labels/${encodeURIComponent(label)}`),
};

export default inboxExtra;