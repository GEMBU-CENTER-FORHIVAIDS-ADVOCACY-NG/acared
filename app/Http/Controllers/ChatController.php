<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * List all conversations for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $user->currentTeam) {
            return redirect()->route('teams.index');
        }

        $conversations = Conversation::query()
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with(['participants.user', 'messages.sender'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(fn (Conversation $conversation) => $this->serializeConversation($conversation, $user));

        // Calculate total unread count per user across all conversations
        $unreadByUserId = [];
        foreach ($conversations as $conv) {
            foreach ($conv['otherUsers'] ?? [] as $otherUser) {
                $unreadByUserId[$otherUser['id']] = ($unreadByUserId[$otherUser['id']] ?? 0) + ($conv['unreadCount'] ?? 0);
            }
        }

        $otherUsers = User::query()
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_online'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'isOnline' => $u->isCurrentlyOnline(),
                'unreadCount' => $unreadByUserId[$u->id] ?? 0,
            ]);

        return Inertia::render('chat/index', [
            'breadcrumbs' => [
                ['title' => 'Chat', 'href' => route('chat.index', $user->currentTeam->slug)],
            ],
            'conversations' => $conversations,
            'otherUsers' => $otherUsers,
        ]);
    }

    /**
     * Return chat data as JSON for the modal.
     */
    public function data(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->currentTeam) {
            return response()->json(['error' => 'No current team'], 403);
        }

        $conversations = Conversation::query()
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with(['participants.user', 'messages.sender'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(fn (Conversation $conversation) => $this->serializeConversation($conversation, $user));

        // Calculate total unread count per user across all conversations
        $unreadByUserId = [];
        foreach ($conversations as $conv) {
            foreach ($conv['otherUsers'] ?? [] as $otherUser) {
                $unreadByUserId[$otherUser['id']] = ($unreadByUserId[$otherUser['id']] ?? 0) + ($conv['unreadCount'] ?? 0);
            }
        }

        $otherUsers = User::query()
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_online'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'isOnline' => $u->isCurrentlyOnline(),
                'unreadCount' => $unreadByUserId[$u->id] ?? 0,
            ]);

        return response()->json([
            'conversations' => $conversations,
            'otherUsers' => $otherUsers,
            'currentUserId' => $user->id,
        ]);
    }

    /**
     * Show a specific conversation with its messages.
     */
    public function show(Request $request, string $currentTeam, Conversation $conversation): Response
    {
        $user = $request->user();

        // Ensure the user is a participant
        if (! $conversation->participants()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        // Mark as read
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        $lastMessageId = $conversation->messages()->latest('id')->value('id');
        if ($lastMessageId) {
            $participant->markAsRead($lastMessageId);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (Message $message) => $this->serializeMessage($message, $user));

        $otherParticipants = $conversation->participants()
            ->with('user')
            ->where('user_id', '!=', $user->id)
            ->get()
            ->map(fn (Participant $p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'email' => $p->user->email,
                'isOnline' => $p->user->isCurrentlyOnline(),
            ]);

        $isGroup = $conversation->participants()->where('user_id', '!=', $user->id)->count() > 1;
        $otherParticipantsCount = $conversation->participants()->where('user_id', '!=', $user->id)->count();
        $otherUser = $conversation->participants()->where('user_id', '!=', $user->id)->first()?->user;

        // Get all conversations for the sidebar
        $allConversations = Conversation::query()
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with(['participants.user', 'messages.sender'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(fn (Conversation $conv) => $this->serializeConversation($conv, $user));

        // Calculate total unread count per user across all conversations
        $unreadByUserId = [];
        foreach ($allConversations as $conv) {
            foreach ($conv['otherUsers'] ?? [] as $otherUser) {
                $unreadByUserId[$otherUser['id']] = ($unreadByUserId[$otherUser['id']] ?? 0) + ($conv['unreadCount'] ?? 0);
            }
        }

        // Get all other users for the sidebar
        $otherUsers = User::query()
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_online', 'last_activity_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'isOnline' => $u->isCurrentlyOnline(),
                'unreadCount' => $unreadByUserId[$u->id] ?? 0,
            ]);

        return Inertia::render('chat/show', [
            'breadcrumbs' => [
                ['title' => 'Chat', 'href' => route('chat.index', $user->currentTeam->slug)],
                ['title' => $isGroup ? ($conversation->name ?? ($otherParticipantsCount.' members')) : ($otherUser->name ?? 'Conversation'), 'href' => route('chat.conversations.show', [$user->currentTeam->slug, $conversation->id])],
            ],
            'conversation' => $this->serializeConversation($conversation, $user),
            'messages' => $messages,
            'otherParticipants' => $otherParticipants,
            'conversations' => $allConversations,
            'otherUsers' => $otherUsers,
        ]);
    }

    /**
     * Start a new direct conversation with another user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id', 'different:'.$request->user()->id],
        ]);

        $user = $request->user();
        $otherUserId = $validated['userId'];

        // Sort IDs to create a deterministic key
        $ids = [$user->id, $otherUserId];
        sort($ids);
        $key = implode(':', $ids);

        $conversation = DB::transaction(function () use ($key, $user, $otherUserId) {
            // Find or create the conversation
            $conversation = Conversation::firstOrCreate(
                ['key' => $key, 'kind' => 'direct'],
                ['kind' => 'direct'],
            );

            // Add participants if not already added
            Participant::firstOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $user->id],
                ['state' => 'joined', 'joined_at' => now()],
            );

            Participant::firstOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $otherUserId],
                ['state' => 'joined', 'joined_at' => now()],
            );

            return $conversation;
        });

        return to_route('chat.conversations.show', ['current_team' => $user->currentTeam->slug, 'conversation' => $conversation->id]);
    }

    /**
     * Start a new conversation and return JSON for the modal.
     */
    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id', 'different:'.$request->user()->id],
        ]);

        $user = $request->user();
        $otherUserId = $validated['userId'];

        // Sort IDs to create a deterministic key
        $ids = [$user->id, $otherUserId];
        sort($ids);
        $key = implode(':', $ids);

        $conversation = DB::transaction(function () use ($key, $user, $otherUserId) {
            // Find or create the conversation
            $conversation = Conversation::firstOrCreate(
                ['key' => $key, 'kind' => 'direct'],
                ['kind' => 'direct'],
            );

            // Add participants if not already added
            Participant::firstOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $user->id],
                ['state' => 'joined', 'joined_at' => now()],
            );

            Participant::firstOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $otherUserId],
                ['state' => 'joined', 'joined_at' => now()],
            );

            return $conversation;
        });

        // Fetch the other user info
        $otherUser = User::find($otherUserId);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'otherUsers' => $otherUser ? [[
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'email' => $otherUser->email,
                    'isOnline' => $otherUser->isCurrentlyOnline(),
                ]] : [],
            ],
        ]);
    }

    /**
     * Fetch messages for a conversation (JSON for modal).
     */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        // Ensure the user is a participant
        if (! $conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Mark as read
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        $lastMessageId = $conversation->messages()->latest('id')->value('id');
        if ($lastMessageId) {
            $participant->markAsRead($lastMessageId);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (Message $message) => $this->serializeMessage($message, $user));

        $otherParticipants = $conversation->participants()
            ->with('user')
            ->where('user_id', '!=', $user->id)
            ->get()
            ->map(fn (Participant $p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'email' => $p->user->email,
                'isOnline' => $p->user->isCurrentlyOnline(),
            ]);

        return response()->json([
            'messages' => $messages,
            'otherParticipants' => $otherParticipants->toArray(),
        ]);
    }

    /**
     * Send a new message to a conversation (Inertia redirect).
     */
    public function message(Request $request, Conversation $conversation): RedirectResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'parentId' => ['nullable', 'integer', 'exists:filum_messages,id'],
        ]);

        $user = $request->user();

        // Ensure the user is a participant
        if (! $conversation->participants()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        DB::transaction(function () use ($conversation, $user, $validated) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => $validated['body'],
                'reply_to_id' => $validated['parentId'] ?? null,
            ]);

            // Update the conversation's last_message_at
            $conversation->update(['last_message_at' => now()]);

            // Broadcast the new message to all participants
            MessageSent::dispatch($message);
        });

        return back();
    }

    /**
     * Send a new message to a conversation (JSON for modal).
     */
    public function messageJson(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'parentId' => ['nullable', 'integer', 'exists:filum_messages,id'],
        ]);

        $user = $request->user();

        // Ensure the user is a participant
        if (! $conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = DB::transaction(function () use ($conversation, $user, $validated) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => $validated['body'],
                'reply_to_id' => $validated['parentId'] ?? null,
            ]);

            // Update the conversation's last_message_at
            $conversation->update(['last_message_at' => now()]);

            return $message;
        });

        // Broadcast the new message to all participants
        MessageSent::dispatch($message);

        return response()->json([
            'message' => $this->serializeMessage($message, $user),
        ]);
    }

    /**
     * Search for users to start a conversation with.
     */
    public function searchUsers(Request $request): Response
    {
        $query = $request->validate([
            'q' => ['required', 'string', 'min:1'],
        ]);

        $users = User::query()
            ->where('id', '!=', $request->user()->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query['q']}%")
                    ->orWhere('email', 'like', "%{$query['q']}%");
            })
            ->limit(20)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]);

        return Inertia::render('chat/search', [
            'users' => $users,
            'query' => $query['q'],
        ]);
    }

    /**
     * Serialize a conversation for the frontend.
     *
     * @return array<string, mixed>
     */
    private function serializeConversation(Conversation $conversation, User $user): array
    {
        $participant = $conversation->participants->firstWhere('user_id', $user->id);

        // Get the other user(s) in the conversation
        $otherUsers = collect($conversation->participants ?? [])
            ->filter(fn ($p) => $p->user_id !== $user->id && $p->user !== null)
            ->map(fn ($p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'email' => $p->user->email,
                'isOnline' => $p->user->isCurrentlyOnline(),
            ])
            ->values();

        // Get the last message
        $lastMessage = collect($conversation->messages ?? [])->last();

        // Calculate unread count
        $unreadCount = 0;
        if ($participant) {
            $unreadCount = collect($conversation->messages ?? [])
                ->when($participant->last_read_message_id, fn ($q, $id) => $q->where('id', '>', $id))
                ->count();
        }

        return [
            'id' => $conversation->id,
            'kind' => $conversation->kind,
            'name' => $conversation->name,
            'lastMessageAt' => $conversation->last_message_at?->toIso8601String(),
            'otherUsers' => $otherUsers->toArray(),
            'lastMessage' => $lastMessage ? [
                'id' => $lastMessage->id,
                'body' => $lastMessage->body,
                'senderId' => $lastMessage->sender_id,
                'senderName' => $lastMessage->sender?->name ?? 'Unknown',
                'createdAt' => $lastMessage->created_at->toIso8601String(),
            ] : null,
            'unreadCount' => $unreadCount,
        ];
    }

    /**
     * Serialize a message for the frontend.
     *
     * @return array<string, mixed>
     */
    private function serializeMessage(Message $message, User $user): array
    {
        return [
            'id' => $message->id,
            'body' => $message->body,
            'senderId' => $message->sender_id,
            'senderName' => $message->sender?->name ?? 'Unknown',
            'isOwn' => $message->sender_id === $user->id,
            'isReply' => $message->isReply(),
            'parentId' => $message->reply_to_id,
            'createdAt' => $message->created_at->toIso8601String(),
        ];
    }
}
