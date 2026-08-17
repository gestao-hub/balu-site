import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../assets/agent-balu.js", import.meta.url), "utf8");

assert.match(
  source,
  /async function callPublicChat\(\{\s*message,\s*visitorId,\s*sessionId,\s*lead\s*\}\)/s,
  "callPublicChat must accept the structured lead payload without dropping the existing message/session parameters",
);

assert.match(
  source,
  /body:\s*JSON\.stringify\(\{[\s\S]*message,[\s\S]*visitor_id:\s*visitorId,[\s\S]*session_id:\s*sessionId\s*\|\|\s*undefined,[\s\S]*lead:\s*lead\s*\|\|\s*undefined,[\s\S]*\}\)/,
  "backend request body must preserve message, visitor_id, session_id and include lead when present",
);

assert.match(
  source,
  /const leadPayload = \{[\s\S]*name:\s*lead\.name,[\s\S]*whatsapp:\s*lead\.whatsapp,[\s\S]*email:\s*lead\.email,[\s\S]*source_page:\s*lead\.sourcePage,[\s\S]*source_url:\s*lead\.sourceUrl,[\s\S]*source_title:\s*lead\.sourceTitle,[\s\S]*first_touch:\s*true,[\s\S]*\};/,
  "gate submit must send first-touch lead fields as structured data",
);

assert.match(
  source,
  /const leadPayload = tags\.length \? \{ intent_tags: tags \} : undefined;/,
  "chat send must derive a lightweight tag-only lead payload from detected intent tags",
);

const retryCalls = source.match(
  /callPublicChat\(\{\s*message:\s*enrichedText,\s*visitorId:\s*state\.lead\.visitorId,\s*sessionId:\s*state\.lead\.sessionId,\s*lead:\s*leadPayload\s*\}\)/g,
) || [];
assert.equal(
  retryCalls.length,
  2,
  "both initial send and retry must include the lightweight lead payload",
);
