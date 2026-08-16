/**
 * Calendar role/group permissions derived from the authenticated profile.
 */
export const useCalendarPermissions = (userData) => {
  const roleName = userData?.roles?.[0]?.name ?? "";
  const groupSlug = userData?.group?.slug ?? "";
  const profileReady = Boolean(userData?.roles);

  const isAdmin = roleName === "admin";
  const isDoctor = roleName === "doctor";
  const isMedic = groupSlug === "medic";

  return {
    roleName,
    groupSlug,
    profileReady,
    isAdmin,
    isDoctor,
    isMedic,
    canViewAll: isAdmin || isMedic,
    canCreateAppointment: isAdmin || isMedic,
    canModify: isAdmin || isMedic,
    showDoctorFilters: isAdmin || isDoctor,
  };
};
