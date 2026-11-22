<?php

use App\Models\User;

test('guests are redirected to login from the messenger', function () {
    $this->get('/chatify')->assertRedirect('/login');
});

test('authenticated users can load the messenger', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/chatify')
        ->assertOk()
        ->assertSee('id="chatify-app"', false)
        ->assertSee('/vendor/chatify/chatify.js', false);
});

test('a participant can send a message in a direct conversation', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();
    $conversation = $sender->conversationWith($recipient);

    $this->actingAs($sender)
        ->post("/api/chatify/v1/conversations/{$conversation->id}/messages", ['body' => 'Hello there'])
        ->assertCreated()
        ->assertJsonPath('data.attributes.body', 'Hello there');

    $this->assertDatabaseHas('ch_messages', [
        'conversation_id' => $conversation->id,
        'user_id' => $sender->getKey(),
        'body' => 'Hello there',
    ]);
});

test('a non participant cannot view a conversation', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();
    $conversation = $sender->conversationWith($recipient);
    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->get("/api/chatify/v1/conversations/{$conversation->id}")
        ->assertNotFound();
});
