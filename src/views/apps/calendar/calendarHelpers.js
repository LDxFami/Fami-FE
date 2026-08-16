/**
 * Pure calendar helpers — kept free of React for unit testing.
 */

export const createBlankCalendarEvent = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  const endDate = new Date(d.getTime() + 30 * 60 * 1000);
  const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;

  return {
    title: "",
    start: d,
    end: d,
    allDay: false,
    url: "",
    extendedProps: {
      calendar: "",
      guests: [],
      location: "",
      description: "",
      startTime,
      endTime,
      date: dateStr,
      status: 1,
    },
  };
};

/**
 * Whether an appointment should show given sidebar doctor filter state.
 */
export const matchesDoctorFilter = (
  appointment,
  { doctorId = [], canViewAll = false, profileReady = false } = {}
) => {
  if (!profileReady) return false;
  if (!doctorId.length) return canViewAll;
  // Sidebar "uncheck all" uses sentinel [0]
  if (doctorId.length === 1 && doctorId[0] === 0) return false;

  const idSet = new Set(doctorId.map(String));
  const includeUnassigned = idSet.has("");
  const primaryId = appointment.doctor_id ?? appointment.doctor?.id;
  const secondaryId =
    appointment.secondary_doctor_id ?? appointment.secondary_doctor?.id;

  if (includeUnassigned && (primaryId == null || primaryId === "")) {
    return true;
  }
  if (primaryId != null && idSet.has(String(primaryId))) return true;
  if (secondaryId != null && idSet.has(String(secondaryId))) return true;
  return false;
};

/**
 * FullCalendar datesSet end is exclusive — convert to inclusive Y-M-D range.
 */
export const visibleDateRangeFromDatesSet = (payload) => {
  const start = new Date(payload.start);
  const endExclusive = new Date(payload.end);
  const endInclusive = new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000);

  const toYmd = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return {
    start: toYmd(start),
    end: toYmd(endInclusive),
  };
};

export const dateRangesEqual = (a, b) =>
  a?.start === b?.start && a?.end === b?.end;
