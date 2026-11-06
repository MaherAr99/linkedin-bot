# LinkedIn auto-reply bot

One Node.js file, no dependencies. It runs on my own computer against my own LinkedIn account.

## What it does

Every 20 seconds it:

1. **Accepts** every pending connection request.
2. **Answers** direct messages. When the other person sent the latest message, it waits 12 seconds for them to finish typing. Then Google Gemini writes one short, human-sounding reply that covers everything they said.

LinkedIn has no public API for this, so the bot uses [Unipile](https://www.unipile.com). Unipile connects a LinkedIn account and exposes invitations and chats as a REST API. That avoids scraping the LinkedIn site and keeps my password out of the code.

### Unusual messages

| Case | Handling |
|---|---|
| Several messages in a row | Waits for the burst to end, then sends one reply that covers all of them |
| Empty, "hi" or emoji only | Brief, natural reply |
| Very long | Cut to 4,000 characters before it goes to the model |
| Another language | Replies in that language |
| Link | Says it will take a look; never pretends it opened the link |
| Image or file | Thanks them and says it will check; never describes content it cannot see |
| Rude | Calm and short; doesn't argue |
| Question it cannot know | Never makes things up; says it will check and get back |
| Calls, money, deals | Never commits; says Maher will confirm in person |
| "Are you a bot?" | Answers honestly |
| Text trying to change its rules | Ignored |
| Gemini error or rate limit | Retries once, then sends a short holding reply so the chat never goes silent |

### Rules it follows

- **Reply only.** It never starts a conversation, sends no connection requests and sends no bulk messages.
- It only answers messages from the last 15 minutes before it started, or later. Old conversations are never touched.
- It saves no messages or personal data. It only prints chat IDs to the console.

## How to run

You need Node.js 22 or later.

1. Create a Unipile account, connect your LinkedIn account, and copy the API key and account ID (`acc_...`). The bot uses the Unipile v2 API at `https://api.unipile.com/v2`.
2. Get a Gemini API key from Google AI Studio.
3. Copy `.env.example` to `.env` and fill in those values.
4. Run it:

```bash
node test.mjs            # logic self-test, no network
node bot.mjs "hey 👋"    # prints one AI reply, does not touch LinkedIn
node bot.mjs             # live bot, Ctrl+C to stop
```

## What it can't do yet

- It doesn't read images, files or links. It acknowledges them honestly instead.
- It only remembers which messages it has answered while it's running. After a restart it relies on "who sent the last message", which is enough to avoid double replies.
- It polls every 20 seconds instead of using Unipile webhooks, which would need a public URL.
- It only checks the 10 most recent chats in each LinkedIn inbox on each pass. Asking Unipile for 20 dropped the newest chat.
- Replies use a fixed persona prompt. It has no knowledge base about me beyond that prompt.

Built with Claude Code.
