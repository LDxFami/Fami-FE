import {
  createBlankCalendarEvent,
  matchesDoctorFilter,
  visibleDateRangeFromDatesSet,
  dateRangesEqual,
} from "./calendarHelpers";

describe("createBlankCalendarEvent", () => {
  it("returns a fresh object each call (no shared mutation)", () => {
    const date = new Date("2026-08-16T10:00:00");
    const a = createBlankCalendarEvent(date);
    const b = createBlankCalendarEvent(date);
    a.start = new Date("2020-01-01");
    a.extendedProps.description = "mutated";
    expect(b.extendedProps.description).toBe("");
    expect(b.start.getFullYear()).toBe(2026);
  });

  it("sets date and default 30-minute window", () => {
    const date = new Date(2026, 7, 16, 9, 15, 0);
    const ev = createBlankCalendarEvent(date);
    expect(ev.title).toBe("");
    expect(ev.extendedProps.date).toBe("2026-08-16");
    expect(ev.extendedProps.startTime).toBe("09:15:00");
    expect(ev.extendedProps.endTime).toBe("09:45:00");
    expect(ev.extendedProps.status).toBe(1);
  });
});

describe("matchesDoctorFilter", () => {
  const apt = (overrides = {}) => ({
    doctor_id: 1,
    secondary_doctor_id: null,
    ...overrides,
  });

  it("hides everything until profile is ready", () => {
    expect(
      matchesDoctorFilter(apt(), {
        doctorId: [1],
        canViewAll: true,
        profileReady: false,
      })
    ).toBe(false);
  });

  it("with empty doctorId, only canViewAll sees events", () => {
    expect(
      matchesDoctorFilter(apt(), {
        doctorId: [],
        canViewAll: true,
        profileReady: true,
      })
    ).toBe(true);
    expect(
      matchesDoctorFilter(apt(), {
        doctorId: [],
        canViewAll: false,
        profileReady: true,
      })
    ).toBe(false);
  });

  it("treats [0] as uncheck-all sentinel", () => {
    expect(
      matchesDoctorFilter(apt(), {
        doctorId: [0],
        canViewAll: true,
        profileReady: true,
      })
    ).toBe(false);
  });

  it("matches primary doctor id", () => {
    expect(
      matchesDoctorFilter(apt({ doctor_id: 5 }), {
        doctorId: [5, 6],
        profileReady: true,
      })
    ).toBe(true);
  });

  it("matches secondary doctor id", () => {
    expect(
      matchesDoctorFilter(apt({ doctor_id: 9, secondary_doctor_id: 3 }), {
        doctorId: [3],
        profileReady: true,
      })
    ).toBe(true);
  });

  it("includes unassigned when empty-string filter is selected", () => {
    expect(
      matchesDoctorFilter(apt({ doctor_id: null }), {
        doctorId: [""],
        profileReady: true,
      })
    ).toBe(true);
    expect(
      matchesDoctorFilter(apt({ doctor_id: 1 }), {
        doctorId: [""],
        profileReady: true,
      })
    ).toBe(false);
  });

  it("coerces numeric/string ids", () => {
    expect(
      matchesDoctorFilter(apt({ doctor_id: "7" }), {
        doctorId: [7],
        profileReady: true,
      })
    ).toBe(true);
  });
});

describe("visibleDateRangeFromDatesSet", () => {
  it("converts exclusive end to inclusive Y-M-D", () => {
    const range = visibleDateRangeFromDatesSet({
      start: new Date(2026, 7, 1),
      end: new Date(2026, 8, 1), // exclusive Sep 1 → inclusive Aug 31
    });
    expect(range.start).toBe("2026-08-01");
    expect(range.end).toBe("2026-08-31");
  });

  it("handles single day view", () => {
    const range = visibleDateRangeFromDatesSet({
      start: new Date(2026, 7, 16),
      end: new Date(2026, 7, 17),
    });
    expect(range).toEqual({ start: "2026-08-16", end: "2026-08-16" });
  });
});

describe("dateRangesEqual", () => {
  it("compares start/end", () => {
    expect(
      dateRangesEqual(
        { start: "2026-08-01", end: "2026-08-31" },
        { start: "2026-08-01", end: "2026-08-31" }
      )
    ).toBe(true);
    expect(
      dateRangesEqual(
        { start: "2026-08-01", end: "2026-08-31" },
        { start: "2026-08-01", end: "2026-08-30" }
      )
    ).toBe(false);
  });
});
