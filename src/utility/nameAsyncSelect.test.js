import { mapCustomerOption, mapDoctorOption } from "./asyncNameSearch";

describe("name option mappers", () => {
  it("hides the phone by default", () => {
    expect(
      mapCustomerOption({ id: 1, name: "Nguyễn A", phone: "090" })
    ).toEqual({
      label: "Nguyễn A",
      value: 1,
      id: 1,
    });
  });

  it("appends the phone for admins", () => {
    expect(
      mapCustomerOption(
        { id: 1, name: "Nguyễn A", phone: "090" },
        { showPhone: true }
      ).label
    ).toBe("Nguyễn A - 090");
    expect(
      mapCustomerOption({ id: 2, name: "B" }, { showPhone: true }).label
    ).toBe("B - Không có SĐT");
  });

  it("maps doctors by id/name", () => {
    expect(mapDoctorOption({ id: 9, name: "BS C" })).toEqual({
      label: "BS C",
      value: 9,
      id: 9,
    });
  });
});
