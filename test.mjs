// node test.mjs - checks the reply logic without calling LinkedIn or Gemini.
import assert from 'node:assert';
import { describe, toContents, needsReply } from './bot.mjs';

const t = s => `2026-11-06T10:00:${String(s).padStart(2, '0')}Z`;
const burst = [
  { id: '3', text: 'are you there?', is_sender: 0, timestamp: t(30) },
  { id: '1', text: 'hi', is_sender: 0, timestamp: t(10) },
  { id: '0', text: 'I wrote first', is_sender: 1, timestamp: t(0) },
  { id: '2', text: '', is_sender: 0, timestamp: t(20), attachments: [{ type: 'img' }] },
];

// Oldest first, leading own message dropped, burst merged into one user turn.
assert.deepEqual(toContents(burst), [{ role: 'user', parts: [{ text: 'hi\n[sent an image]\nare you there?' }] }]);

const base = { startedAt: Date.parse(t(0)), answered: new Set() };
assert.equal(needsReply(burst, { ...base, now: Date.parse(t(35)) }), null, 'burst still going: wait');
assert.equal(needsReply(burst, { ...base, now: Date.parse(t(50)) }).id, '3', 'burst over: reply');
assert.equal(needsReply(burst, { ...base, now: Date.parse(t(50)), answered: new Set(['3']) }), null, 'already answered');
assert.equal(needsReply(burst, { ...base, startedAt: Date.parse(t(40)), now: Date.parse(t(50)) }), null, 'old message: never reply');
assert.equal(needsReply([{ id: '9', text: 'ok', is_sender: 1, timestamp: t(1) }], { ...base, now: Date.parse(t(50)) }), null, 'we spoke last');

assert.equal(describe({ text: '  ' }), '[empty message]');
assert.match(describe({ text: 'x'.repeat(5000) }), /message cut/);
assert.equal(describe({ text: 'see', attachments: [{ type: 'file', filename: 'cv.pdf' }] }), 'see\n[sent an attachment (file): cv.pdf]');
assert.equal(needsReply([{ id: '8', text: 'hey', is_sender: true, timestamp: t(1) }], { ...base, now: Date.parse(t(50)) }), null, 'v2 boolean is_sender');
console.log('ok');
