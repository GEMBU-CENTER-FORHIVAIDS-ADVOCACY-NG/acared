export type ChatConversation = {
    id: number;
    kind: string;
    name: string | null;
    lastMessageAt: string | null;
    otherUsers: ChatUser[];
    lastMessage: ChatMessagePreview | null;
    unreadCount: number;
};

export type ChatUser = {
    id: number;
    name: string;
    email: string;
    isOnline: boolean;
};

export type ChatMessagePreview = {
    id: number;
    body: string;
    senderId: number;
    senderName: string;
    createdAt: string;
};

export type ChatMessage = {
    id: number;
    body: string;
    senderId: number;
    senderName: string;
    isOwn: boolean;
    isReply: boolean;
    parentId: number | null;
    createdAt: string;
};

export type ChatConversationShow = ChatConversation & {
    messages: ChatMessage[];
    otherParticipants: ChatUser[];
};
