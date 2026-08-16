import {
  shouldSearchName,
  createPaginatedNameLoadOptions,
  NAME_SEARCH_MIN_CHARS,
  NAME_SEARCH_PHONE_MIN_DIGITS,
} from "./asyncNameSearch";

describe("shouldSearchName", () => {
  it("allows empty input for defaultOptions", () => {
    expect(shouldSearchName("")).toBe(true);
    expect(shouldSearchName("   ")).toBe(true);
  });

  it("requires min chars for text", () => {
    expect(shouldSearchName("a")).toBe(false);
    expect(shouldSearchName("ab".slice(0, NAME_SEARCH_MIN_CHARS - 1))).toBe(
      false
    );
    expect(shouldSearchName("ng")).toBe(true);
    expect(shouldSearchName("Nguyễn")).toBe(true);
  });

  it("requires min digits for phone-like input", () => {
    expect(shouldSearchName("12")).toBe(false);
    expect(
      shouldSearchName("1".repeat(NAME_SEARCH_PHONE_MIN_DIGITS))
    ).toBe(true);
  });
});

describe("createPaginatedNameLoadOptions", () => {
  it("skips API when input is too short", async () => {
    const fetchPage = jest.fn();
    const load = createPaginatedNameLoadOptions(fetchPage);
    const result = await load("a", [], { page: 1 });
    expect(fetchPage).not.toHaveBeenCalled();
    expect(result).toEqual({
      options: [],
      hasMore: false,
      additional: { page: 1 },
    });
  });

  it("fetches page and advances additional.page", async () => {
    const fetchPage = jest.fn().mockResolvedValue({
      options: [{ label: "A", value: 1 }],
      hasMore: true,
    });
    const load = createPaginatedNameLoadOptions(fetchPage);
    const result = await load("nguyen", [], { page: 2 });
    expect(fetchPage).toHaveBeenCalledWith("nguyen", 2, expect.any(AbortSignal));
    expect(result.options).toHaveLength(1);
    expect(result.hasMore).toBe(true);
    expect(result.additional.page).toBe(3);
  });

  it("returns empty on fetch error", async () => {
    const fetchPage = jest.fn().mockRejectedValue(new Error("network"));
    const load = createPaginatedNameLoadOptions(fetchPage);
    const result = await load("nguyen", [], { page: 1 });
    expect(result.options).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it("aborts previous in-flight request when a new one starts", async () => {
    const signals = [];
    const fetchPage = jest.fn((input, page, signal) => {
      signals.push(signal);
      return new Promise((resolve) => {
        setTimeout(
          () => resolve({ options: [{ label: input }], hasMore: false }),
          50
        );
      });
    });
    const load = createPaginatedNameLoadOptions(fetchPage);
    const p1 = load("nguyen", [], { page: 1 });
    const p2 = load("tran", [], { page: 1 });
    await Promise.all([p1, p2]);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });
});
