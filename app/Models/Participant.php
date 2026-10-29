<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $conversation_id
 * @property int $user_id
 * @property string $state
 * @property int|null $invited_by_id
 * @property int|null $last_read_message_id
 * @property Carbon|null $joined_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Conversation $conversation
 * @property-read User $user
 * @property-read User|null $invitedBy
 */
class Participant extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'filum_participants';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'conversation_id',
        'user_id',
        'state',
        'invited_by_id',
        'last_read_message_id',
        'joined_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    /**
     * Get the conversation for the participant.
     *
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the user for the participant.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who invited this participant.
     *
     * @return BelongsTo<User, $this>
     */
    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    /**
     * Mark the conversation as read up to the given message ID.
     */
    public function markAsRead(?int $messageId = null): void
    {
        $this->last_read_message_id = $messageId ?? $this->conversation->messages()->latest('id')->value('id');
        $this->save();
    }

    /**
     * Get the unread message count for this participant.
     */
    public function unreadCount(): int
    {
        if ($this->last_read_message_id === null) {
            return $this->conversation->messages()->count();
        }

        return $this->conversation->messages()
            ->where('id', '>', $this->last_read_message_id)
            ->count();
    }
}
