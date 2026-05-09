# openclaw-qwen36-key-fix

Workaround for the Qwen 3.6 function-calling quirk where certain JSON keys get a spurious trailing colon (e.g. `"name:"` instead of `"name"`).

## Problem

Qwen 3.6 sometimes produces malformed tool call arguments:

```json
{
  "action": "add",
  "job": {
    "name:": "my-reminder",
    "schedule:": { "kind:": "at", "at:": "2026-05-10T12:00:00Z" },
    "payload:": { "kind:": "systemEvent", "text:": "hello" }
  }
}
```

This causes OpenClaw's parameter validation to fail because the schema expects keys without trailing colons.

## Solution

This plugin hooks `before_tool_call` for the `cron` tool and recursively strips trailing colons from JSON keys before validation.

## Install

Locally:
```bash
openclaw plugins install ~/qwen36-key-fix
```

From ClawHub:

```bash
openclaw plugins install clawhub:@epistemic/qwen36-key-fix
```

## Verify

```bash
openclaw plugins list | grep qwen36
```

## Uninstall

```bash
openclaw plugins uninstall qwen36-key-fix
```

## Related

- GitHub issue: https://github.com/openclaw/openclaw/issues/79819
