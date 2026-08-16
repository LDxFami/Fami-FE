jest.mock("../configs/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import doctorReducer, { getDoctor, searchDoctors } from "./doctor";

describe("doctor redux slice", () => {
  const initial = doctorReducer(undefined, { type: "@@init" });

  it("starts with empty doctor list pending", () => {
    expect(initial.doctors.loading).toBe("pending");
    expect(initial.doctors.data.items).toEqual([]);
  });

  it("getDoctor.fulfilled replaces sidebar list", () => {
    const payload = {
      data: {
        items: [{ id: 1, name: "BS A" }],
        total: 1,
        page: 1,
        limit: 200,
      },
    };
    const next = doctorReducer(initial, {
      type: getDoctor.fulfilled.type,
      payload,
      meta: { arg: { limit: 200 } },
    });
    expect(next.doctors.loading).toBe("success");
    expect(next.doctors.data.items).toEqual([{ id: 1, name: "BS A" }]);
  });

  it("searchDoctors.fulfilled does not touch doctors store", () => {
    const seeded = doctorReducer(initial, {
      type: getDoctor.fulfilled.type,
      payload: {
        data: { items: [{ id: 1, name: "BS A" }], total: 1 },
      },
      meta: { arg: {} },
    });
    const afterSearch = doctorReducer(seeded, {
      type: searchDoctors.fulfilled.type,
      payload: {
        data: { items: [{ id: 99, name: "Search Hit" }], has_more: false },
      },
      meta: { arg: { search_param: "ng" } },
    });
    expect(afterSearch.doctors.data.items).toEqual([{ id: 1, name: "BS A" }]);
  });

  it("searchDoctors action type differs from getDoctor", () => {
    expect(searchDoctors.fulfilled.type).not.toBe(getDoctor.fulfilled.type);
    expect(searchDoctors.typePrefix).toBe("doctor/searchDoctors");
    expect(getDoctor.typePrefix).toBe("doctor/getDoctor");
  });
});
