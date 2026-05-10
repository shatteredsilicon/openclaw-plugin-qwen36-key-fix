import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

/**
 * Recursively strip trailing non-alphanumeric characters from JSON object keys.
 * Workaround for Qwen 3.6 function-calling quirk where certain keys
 * get spurious trailing garbage (e.g. "name:" instead of "name").
 */
function stripTrailingGarbageFromKeys(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => stripTrailingGarbageFromKeys(item));
  }
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const cleanKey = key.replace(/[^a-zA-Z0-9]+$/, '');
    cleaned[cleanKey] = stripTrailingGarbageFromKeys(val);
  }
  return cleaned;
}

export default definePluginEntry({
  id: "qwen36-key-fix",
  name: "Qwen 3.6 Key Fix",
  description: "Strips spurious trailing non-alphanumeric characters from JSON keys in cron tool params (Qwen 3.6 function-calling quirk)",
  register(api) {
    api.on("before_tool_call", async (event) => {
      // Only intercept the cron tool — that's where the quirk manifests
      if (event.toolName !== "cron") {
        return;
      }

      const params = { ...event.params };
      let changed = false;

      // Clean job object (add action)
      if (params.job && typeof params.job === "object" && !Array.isArray(params.job)) {
        const cleaned = stripTrailingGarbageFromKeys(params.job);
        if (cleaned !== params.job) {
          params.job = cleaned as Record<string, unknown>;
          changed = true;
        }
      }

      // Clean patch object (update action)
      if (params.patch && typeof params.patch === "object" && !Array.isArray(params.patch)) {
        const cleaned = stripTrailingGarbageFromKeys(params.patch);
        if (cleaned !== params.patch) {
          params.patch = cleaned as Record<string, unknown>;
          changed = true;
        }
      }

      // Only return modified params if something actually changed
      if (changed) {
        return { params };
      }

      return;
    });
  },
});
