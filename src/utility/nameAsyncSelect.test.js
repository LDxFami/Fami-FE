import { mapCustomerOption, mapDoctorOption } from "./asyncNameSearch";

describe("name option mappers", () => {
  it("maps customers with consistent label format", () => {
    expect(
      mapCustomerOption({ id: 1, name: "Nguyễn A", phone: "090" })
    ).toEqual({
      label: "Nguyễn A - 090",
      value: 1,
      id: 1,
    });
    expect(mapCustomerOption({ id: 2, name: "B" }).label).toBe(
      "B - Không có SĐT"
    );
  });

  it("maps doctors by id/name", () => {
    expect(mapDoctorOption({ id: 9, name: "BS C" })).toEqual({
      label: "BS C",
      value: 9,
      id: 9,
    });
  });
});
