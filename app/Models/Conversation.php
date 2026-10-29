<?php

namespace App\Models;

use Database\Factories\ConversationFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $kind
 * @property string|null $key
 * @property string|null $name
 * @property int|null $owner_id
 * @property Carbon|null $last_message_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Participant> $participants
 * @property-read Collection<int, User> $users
 * @property-read Collection<int, Message> $messages
 * @property-read User|null $owner
 */
class Conversation extends Model
{
    /** @use HasFactory<ConversationFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'filum_conversations';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kind',
        'key',
        'name',
        'owner_id',
        'last_message_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    /**
     * Get the participants for the conversation.
     *
     * @return HasMany<Participant, $this>
     */
    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * Get the users in the conversation.
     *
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(Participant::class)->through('user');
    }

    /**
     * Get the messages for the conversation.
     *
     * @return HasMany<Message, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the owner of the conversation (for groups).
     *
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Check if the conversation is a direct (1-on-1) conversation.
     */
    public function isDirect(): bool
    {
        return $this->kind === 'direct';
    }

    /**
     * Check if the conversation is a group conversation.
     */
    public function isGroup(): bool
    {
        return $this->kind === 'group';
    }
}
