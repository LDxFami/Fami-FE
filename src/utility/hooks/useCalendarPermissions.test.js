import { useCalendarPermissions } from "./useCalendarPermissions";

describe("useCalendarPermissions", () => {
  it("handles missing userData", () => {
    expect(useCalendarPermissions(null)).toMatchObject({
      roleName: "",
      profileReady: false,
      canViewAll: false,
      canCreateAppointment: false,
      canModify: false,
      showDoctorFilters: false,
    });
  });

  it("admin can view/create/modify and see filters", () => {
    const perms = useCalendarPermissions({
      roles: [{ name: "admin" }],
      group: { slug: "clinic" },
    });
    expect(perms).toMatchObject({
      roleName: "admin",
      isAdmin: true,
      profileReady: true,
      canViewAll: true,
      canCreateAppointment: true,
      canModify: true,
      showDoctorFilters: true,
    });
  });

  it("medic group can view/create even if not admin role", () => {
    const perms = useCalendarPermissions({
      roles: [{ name: "doctor" }],
      group: { slug: "medic" },
    });
    expect(perms.canViewAll).toBe(true);
    expect(perms.canCreateAppointment).toBe(true);
    expect(perms.isMedic).toBe(true);
    expect(perms.showDoctorFilters).toBe(true);
  });

  it("plain doctor sees filters but cannot create", () => {
    const perms = useCalendarPermissions({
      roles: [{ name: "doctor" }],
      group: { slug: "clinic" },
    });
    expect(perms.showDoctorFilters).toBe(true);
    expect(perms.canCreateAppointment).toBe(false);
    expect(perms.canViewAll).toBe(false);
  });
});
