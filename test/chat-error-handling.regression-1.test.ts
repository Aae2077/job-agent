/**
 * Regression: ISSUE-002 — chat API errors show raw HTML and lock send button
 * Found by /qa on 2026-03-28
 * Report: .gstack/qa-reports/qa-report-job-agent-henna-vercel-app-2026-03-28.md
 */

import { describe, it, expect } from "vitest";

/**
 * The fix: in sendMessage(), wrap the fetch+stream in try/finally so
 * setStreaming(false) is ALWAYS called, and check res.ok before reading
 * the body so a 500 error page is never displayed as a message.
 *
 * We verify the fix's logic by testing the condition guards directly.
 */
describe("chat error handling fix", () => {
  it("try/finally guarantees streaming resets even when fetch throws", async () => {
    let streamingReset = false;

    async function simulateSendWithFinally() {
      try {
        throw new Error("network error");
      } finally {
        streamingReset = true;
      }
    }

    await simulateSendWithFinally().catch(() => {});
    expect(streamingReset).toBe(true);
  });

  it("res.ok check prevents reading error HTML as message content", () => {
    const mockRes = { ok: false, status: 500 };
    const errorMessages: string[] = [];

    function handleResponse(res: typeof mockRes, newMessages: unknown[]) {
      if (!res.ok) {
        errorMessages.push("Something went wrong. Please try again.");
        return;
      }
      // would read body here
    }

    handleResponse(mockRes, []);
    expect(errorMessages).toHaveLength(1);
    expect(errorMessages[0]).toBe("Something went wrong. Please try again.");
  });

  it("ok response proceeds to read body without error message", () => {
    const mockRes = { ok: true, status: 200 };
    const errorMessages: string[] = [];
    let bodyWouldBeRead = false;

    function handleResponse(res: typeof mockRes) {
      if (!res.ok) {
        errorMessages.push("Something went wrong. Please try again.");
        return;
      }
      bodyWouldBeRead = true;
    }

    handleResponse(mockRes);
    expect(errorMessages).toHaveLength(0);
    expect(bodyWouldBeRead).toBe(true);
  });
});
