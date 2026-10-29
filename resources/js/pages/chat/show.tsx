import { Head, Link, router, usePage, usePoll } from '@inertiajs/react';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { store as messagesStore } from '@/routes/chat/conversations/messages';
import { index } from '@/routes/chat';
import type { ChatConversation, ChatMessage, ChatUser } from '@/types';


export default function ChatShow({
    conversation,
    messages,
    otherParticipants,
}: {
    conversation: ChatConversation;
    messages: ChatMessage[];
    otherParticipants: ChatUser[];
}) {
    const { currentTeam, auth } = usePage().props;
    const teamSlug = currentTeam?.slug;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [body, setBody] = useState('');
    const [processing, setProcessing] = useState(false);

    // Auto-refresh messages every 3 seconds
    usePoll(3000, {
        only: ['messages'],
    });

    const otherUser = otherParticipants[0];
    const isGroup = otherParticipants.length > 1;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function sendMessage(e) {
        e.preventDefault();
        if (! body.trim() || processing) {
            return;
        }

        setProcessing(true);
        router.post(
            messagesStore.url({ current_team: teamSlug, conversation: conversation.id }),
            { body: body.trim() },
            {
                onSuccess: () => {
                    setBody('');
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
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    function formatFullTime(dateString) {
        if (! dateString) {
            return '';
        }
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return formatTime(dateString);
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + formatTime(dateString);
    }

    return (
        <>
            <Head title={`${isGroup ? (conversation.name || 'Group') : (otherUser?.name ?? 'Chat')} - Chat`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col rounded-lg border bg-card overflow-hidden h-[600px]">
                    {/* Header */}
                    <div className="flex-shrink-0 border-b bg-card px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Link href={index.url({ current_team: teamSlug })}>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {isGroup
                                            ? <Users className="h-5 w-5" />
                                            : getInitials(otherUser?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                                {!isGroup && otherUser?.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-base font-semibold">
                                    {isGroup ? (conversation.name || `${otherParticipants.length} members`) : otherUser?.name}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {isGroup
                                        ? `${otherParticipants.length} participants`
                                        : otherUser?.isOnline
                                            ? 'Online'
                                            : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Send className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">No messages yet</p>
                                <p className="text-xs text-muted-foreground">Send the first message to start the conversation</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const prevMessage = messages[index - 1];
                                const isGroupStart = !prevMessage || prevMessage.senderId !== message.senderId;

                                return (
                                    <div key={message.id} className={`flex items-end gap-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                                        {!message.isOwn && isGroupStart && (
                                            <Avatar className="h-8 w-8 flex-shrink-0 mb-4">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                    {getInitials(message.senderName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        {!message.isOwn && !isGroupStart && (
                                            <div className="w-8 flex-shrink-0" />
                                        )}
                                        <div className={`max-w-[65%] group`}
                                        >
                                            {isGroupStart && !message.isOwn && (
                                                <p className="text-xs text-muted-foreground mb-1 ml-1">{message.senderName}</p>
                                            )}
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl ${
                                                    message.isOwn
                                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                        : 'bg-card border shadow-sm rounded-bl-sm'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>
                                            </div>
                                            <p className={`text-xs mt-1 px-1 ${message.isOwn ? 'text-muted-foreground text-right' : 'text-muted-foreground'}`}>
                                                {formatFullTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message input */}
                    <div className="flex-shrink-0 border-t bg-card p-4">
                        <form onSubmit={sendMessage} className="flex items-end gap-3">
                            <div className="flex-1 relative">
                                <Textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Type a message..."
                                    className="resize-none bg-muted/50 rounded-xl min-h-[44px] max-h-32 pr-10"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(e);
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={! body.trim() || processing}
                                size="icon"
                                className="h-11 w-11 flex-shrink-0 rounded-xl"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
