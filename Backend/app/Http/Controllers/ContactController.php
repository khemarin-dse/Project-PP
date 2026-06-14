<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\MessageReply;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // POST /api/contact — public, send a contact message
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // Link to user account if logged in
        $userId = null;
        if ($request->user()) {
            $userId = $request->user()->id;
        } else {
            // Try to find user by email
            $user = User::where('email', strtolower($data['email']))->first();
            if ($user) $userId = $user->id;
        }

        $msg = ContactMessage::create([
            'name'    => $data['name'],
            'email'   => strtolower($data['email']),
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'read'    => false,
            'user_id' => $userId,
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'id'      => $msg->id,
        ], 201);
    }

    // GET /api/contact — admin+, list all messages with replies
    public function index()
    {
        $messages = ContactMessage::with(['replies.admin'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    // PATCH /api/contact/{id}/read — admin+, mark as read
    public function markRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['read' => true]);
        return response()->json($contactMessage);
    }

    // POST /api/contact/{id}/reply — admin+, reply to a message
    public function reply(Request $request, ContactMessage $contactMessage)
    {
        $data = $request->validate([
            'reply' => 'required|string|max:5000',
        ]);

        // Save the reply
        $reply = MessageReply::create([
            'contact_message_id' => $contactMessage->id,
            'admin_id'           => $request->user()->id,
            'reply'              => $data['reply'],
        ]);

        // Mark original message as read
        $contactMessage->update(['read' => true]);

        // Create notification for the user if we can find them
        $user = null;
        if ($contactMessage->user_id) {
            $user = User::find($contactMessage->user_id);
        } else {
            $user = User::where('email', $contactMessage->email)->first();
        }

        if ($user) {
            Notification::create([
                'user_id'            => $user->id,
                'type'               => 'admin_reply',
                'title'              => 'Admin replied to your message',
                'message'            => $request->user()->name . ' replied: "' . substr($data['reply'], 0, 100) . (strlen($data['reply']) > 100 ? '…' : '') . '"',
                'read'               => false,
                'contact_message_id' => $contactMessage->id,
            ]);
        }

        return response()->json([
            'reply'   => $reply->load('admin'),
            'message' => 'Reply sent successfully.',
        ]);
    }
}
