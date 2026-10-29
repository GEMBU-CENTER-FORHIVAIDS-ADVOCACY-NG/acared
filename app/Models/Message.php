<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $conversation_id
 * @property int $sender_id
 * @property string $body
 * @property int|null $reply_to_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Conversation $conversation
 * @property-read User $sender
 * @property-read Message|null $replyTo
 */
class Message extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'filum_messages';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'reply_to_id',
    ];

    /**
     * Get the conversation for the message.
     *
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the sender of the message.
     *
     * @return BelongsTo<User, $this>
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the parent message (if this is a reply).
     *
     * @return BelongsTo<Message, $this>
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    /**
     * Check if this message is a reply.
     */
    public function isReply(): bool
    {
        return $this->reply_to_id !== null;
    }
}
