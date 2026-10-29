import { Head, Link, router, usePage } from '@inertiajs/react';
import { MessageSquare, Search, Send, Users, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { store, show } from '@/routes/chat/conversations';
import type { ChatConversation, ChatUser } from '@/types';


export default function ChatIndex({
    conversations,
    otherUsers,
}: {
    conversations: ChatConversation[];
    otherUsers: ChatUser[];
}) {
    const { currentTeam, auth } = usePage().props;
    const teamSlug = currentTeam?.slug;
    const currentUserId = auth?.user?.id;

    const [search, setSearch] = useState('');
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [processing, setProcessing] = useState(false);

    const filteredConversations = conversations.filter((conversation) => {
        const query = search.toLowerCase();
        const otherUserNames = (conversation.otherUsers ?? []).map((u) => u.name.toLowerCase()).join(' ');
        const lastMessageBody = conversation.lastMessage?.body.toLowerCase() ?? '';
        return otherUserNames.includes(query) || lastMessageBody.includes(query);
    });

    const filteredUsers = otherUsers.filter((user) => {
        const query = search.toLowerCase();
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    });

    function startConversation(e) {
        e.preventDefault();
        if (! selectedUser) {
            return;
        }

        setProcessing(true);
        router.post(
            store.url({ current_team: teamSlug }),
            { userId: Number(selectedUser) },
            {
                onSuccess: () => {
                    setNewChatOpen(false);
                    setSelectedUser('');
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            },
        );
    }

    function getInitials(name) {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function formatTime(dateString) {
        if (! dateString) {
            return '';
        }
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function truncateBody(body, maxLength = 50) {
        if (! body) {
            return '';
        }
        return body.length > maxLength ? body.slice(0, maxLength) + '...' : body;
    }

    return (
        <>
            <Head title="Chat" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-6 rounded-lg border bg-card overflow-hidden">
                    {/* Conversations list */}
                    <div className="flex flex-col md:flex-row h-[600px]">
                        <div className="w-full md:w-80 flex-shrink-0 border-r flex flex-col bg-card">
                            {/* Header */}
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between mb-3">
                                    <h1 className="text-xl font-bold">Messages</h1>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setNewChatOpen(true)}
                                        className="h-8 w-8"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search conversations..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 bg-muted/50"
                                    />
                                </div>
                            </div>

                            {/* Conversation list */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium mb-1">No conversations yet</p>
                                        <p className="text-xs text-muted-foreground mb-4">Start a new chat to begin messaging</p>
                                        <Button size="sm" onClick={() => setNewChatOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Chat
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {filteredConversations.map((conversation) => {
                                            const otherUsersList = conversation.otherUsers ?? [];
                                            const otherUser = otherUsersList[0];
                                            const isGroup = otherUsersList.length > 1;

                                            return (
                                                <Link
                                                    key={conversation.id}
                                                    href={show.url({ current_team: teamSlug, conversation: conversation.id })}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                {isGroup
                                                                    ? <Users className="h-5 w-5" />
                                                                    : getInitials(otherUser?.name ?? '')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {!isGroup && otherUser?.isOnline && (
                                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                                            <p className="text-sm font-semibold truncate">
                                                                {isGroup
                                                                    ? conversation.name || `${otherUsersList.length} members`
                                                                    : otherUser?.name}
                                                            </p>
                                                            {conversation.lastMessageAt && (
                                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                                    {formatTime(conversation.lastMessageAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {conversation.lastMessage
                                                                    ? conversation.lastMessage.senderId === currentUserId
                                                                        ? `You: ${truncateBody(conversation.lastMessage.body, 40)}`
                                                                        : `${truncateBody(conversation.lastMessage.body, 40)}`
                                                                    : 'No messages yet'}
                                                            </p>
                                                            {conversation.unreadCount > 0 && (
                                                                <Badge className="rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground font-semibold">
                                                                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat area - Welcome screen */}
                        <div className="flex-1 flex items-center justify-center bg-muted/20">
                            <div className="text-center max-w-md px-6">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare className="h-10 w-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Select a conversation from the list to start messaging, or create a new chat with a team member.
                                </p>
                                <Button size="lg" onClick={() => setNewChatOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Start New Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Chat Sheet */}
            <Sheet open={newChatOpen} onOpenChange={(open) => {
                setNewChatOpen(open);
                if (!open) {
                    setSelectedUser('');
                    setSearch('');
                }
            }}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>New Chat</SheetTitle>
                        <SheetDescription>
                            Select a team member to start a conversation.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="mt-4 space-y-1 max-h-[40vh] overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">No users found</p>
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedUser(user.id.toString());
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                            selectedUser === user.id.toString()
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'hover:bg-accent/50 border border-transparent'
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {user.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                            )}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <SheetFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setNewChatOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={startConversation}
                            disabled={! selectedUser || processing}
                            className="flex-1"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {processing ? 'Starting...' : 'Start Chat'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
