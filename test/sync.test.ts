import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before importing the route
const mockUpdate = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn();
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createServiceClient: () => ({
    from: mockFrom,
  }),
}));

// Helper to build a fake NextRequest
function makeRequest(body: object, apiKey = "test-key") {
  return new Request("http://localhost/api/jobs/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

// Reset Supabase mock chain before each test
beforeEach(() => {
  vi.resetAllMocks();
  process.env.INGEST_API_KEY = "test-key";

  // Default chain: job not found
  mockSingle.mockResolvedValue({ data: null, error: null });
  mockLimit.mockReturnValue({ single: mockSingle });
  mockEq.mockReturnValue({ limit: mockLimit, single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  mockInsert.mockReturnValue({
    select: () => ({ single: vi.fn().mockResolvedValue({ data: { id: "abc" }, error: null }) }),
  });
  mockFrom.mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  });
});

describe("POST /api/jobs/sync", () => {
  it("rejects unauthorized requests", async () => {
    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({ url: "https://example.com", status: "applied" }, "wrong-key"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when url is missing", async () => {
    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({ status: "applied" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown status", async () => {
    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({ url: "https://example.com", status: "vibing" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Unknown status/);
  });

  it("maps 'dismissed' status and updates existing job", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "job-123" }, error: null });
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: updateEq });

    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({ url: "https://linkedin.com/jobs/1", status: "dismissed" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("dismissed");
    expect(body.action).toBe("updated");
    expect(mockUpdate).toHaveBeenCalledWith({ status: "dismissed" });
  });

  it("creates a dismissed job when not in DB and title/company provided", async () => {
    // First call (select) finds nothing
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    const insertSingle = vi.fn().mockResolvedValue({ data: { id: "new-123" }, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: insertSingle }) });

    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({
      url: "https://linkedin.com/jobs/2",
      status: "dismissed",
      title: "SDR",
      company: "Acme",
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.action).toBe("created");
    expect(body.status).toBe("dismissed");
  });

  it("returns not_found when job missing and no title/company", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({ url: "https://linkedin.com/jobs/3", status: "dismissed" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.action).toBe("not_found");
  });

  it("maps 'withdrawn' to 'rejected' (existing behavior preserved)", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "job-456" }, error: null });
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: updateEq });

    const { POST } = await import("@/app/api/jobs/sync/route");
    const res = await POST(makeRequest({ url: "https://linkedin.com/jobs/4", status: "withdrawn" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("rejected");
  });
});
