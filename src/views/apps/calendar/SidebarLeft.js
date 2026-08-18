// ** React Imports
import { Fragment, useMemo, useState, useEffect, useRef } from "react";

// ** Custom Components
import classnames from "classnames";

// ** Reactstrap Imports
import { CardBody, Button, Input, Label } from "reactstrap";

// ** Icons
import { ChevronLeft, ChevronRight } from "react-feather";

// ** Customer search
import { CustomerNameSelect } from "../../../utility/nameAsyncSelect";

// ** illustration import
import illustration from "@src/assets/images/pages/calendar-illustration.png";
import { useSelector } from "react-redux";

const VIEWS = [
  { key: "dayGridMonth", label: "Tháng" },
  { key: "timeGridWeek", label: "Tuần" },
  { key: "timeGridDay", label: "Ngày" },
  { key: "listMonth", label: "List" },
];

const SidebarLeft = (props) => {
  const {
    handleAddEventSidebar,
    toggleSidebar,
    updateFilter,
    doctorId,
    onCheckAll,
    canCreateAppointment = false,
    showDoctorFilters = true,
    calendarApi,
    calendarTitle,
    viewCurrent,
    showPast,
    setShowPast,
    setCustomerId,
  } = props;

  const [filters, setFilters] = useState([]);
  const didInitCheckAll = useRef(false);

  const doctorStore = useSelector((state) => state.doctor);
  const doctorItems = useMemo(
    () => doctorStore.doctors?.data?.items ?? [],
    [doctorStore.doctors?.data?.items]
  );
  const doctorItemsKey = useMemo(
    () => doctorItems.map((i) => i.id).join(","),
    [doctorItems]
  );

  useEffect(() => {
    if (!doctorItems.length) return;

    const tmpData = doctorItems.map((i) => ({
      label: i.name,
      id: i.id,
      color: "primary",
      className: "form-check-primary mb-1",
    }));
    tmpData.push({
      label: "Chưa có bác sĩ",
      id: "",
      color: "primary",
      className: "form-check-primary mb-1",
    });
    setFilters(tmpData);

    if (canCreateAppointment && !didInitCheckAll.current) {
      didInitCheckAll.current = true;
      onCheckAll(tmpData.map((i) => i.id));
    }
  }, [doctorItems, doctorItemsKey, canCreateAppointment, onCheckAll]);

  const handleAddEventClick = () => {
    toggleSidebar(false);
    handleAddEventSidebar();
  };

  return (
    <Fragment>
      <div className="sidebar-wrapper">
        {/* Add appointment button */}
        {canCreateAppointment && (
          <CardBody className="card-body d-flex justify-content-center my-sm-0 mb-1">
            <Button color="primary" block onClick={handleAddEventClick}>
              <span className="align-middle">Thêm lịch hẹn</span>
            </Button>
          </CardBody>
        )}

        {/* Calendar navigation */}
        <CardBody className="pt-0 pb-75">
          <div className="d-flex align-items-center justify-content-between mb-75">
            <Button
              color="flat-secondary"
              className="btn-icon p-25"
              onClick={() => calendarApi?.prev()}
            >
              <ChevronLeft size={16} />
            </Button>
            <span
              className="fw-bold text-center text-capitalize"
              style={{ fontSize: "0.85rem", flex: 1 }}
            >
              {calendarTitle}
            </span>
            <Button
              color="flat-secondary"
              className="btn-icon p-25"
              onClick={() => calendarApi?.next()}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* View switcher */}
          <div className="d-flex flex-wrap gap-50 mb-75">
            {VIEWS.map(({ key, label }) => (
              <Button
                key={key}
                size="sm"
                color="primary"
                outline={viewCurrent !== key}
                className="px-75 py-25"
                onClick={() => calendarApi?.changeView(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Customer search */}
          <CustomerNameSelect
            id="sidebarCustomerSearch"
            isClearable
            placeholder="Tìm khách hàng..."
            onChange={(data) => setCustomerId(data ? data.id : "")}
          />

          {/* Show past (list view only) */}
          {viewCurrent === "listMonth" && (
            <div className="form-check mt-75">
              <Input
                type="checkbox"
                id="sidebar-showpast"
                checked={showPast}
                onChange={() => setShowPast((p) => !p)}
              />
              <Label className="form-check-label" for="sidebar-showpast">
                Hiển thị cuộc hẹn trong quá khứ
              </Label>
            </div>
          )}
        </CardBody>

        {/* Doctor filters */}
        {showDoctorFilters && (
          <CardBody className="pt-0">
            <h5 className="section-label mb-1">
              <span className="align-middle">Bộ lọc</span>
            </h5>
            <div className="form-check mb-1">
              <Input
                id="view-all"
                type="checkbox"
                label="View All"
                className="select-all"
                checked={filters.length > 0 && filters.length === doctorId.length}
                onChange={() => {
                  if (filters.length !== doctorId.length) {
                    onCheckAll(filters.map((i) => i.id));
                  } else {
                    onCheckAll([0]);
                  }
                  toggleSidebar();
                }}
              />
              <Label className="form-check-label" for="view-all">
                Tất cả
              </Label>
            </div>
            <div className="calendar-events-filter">
              {filters.length > 0 &&
                filters.map((filter) => (
                  <div
                    key={`${filter.label}-key`}
                    className={classnames("form-check", {
                      [filter.className]: filter.className,
                    })}
                  >
                    <Input
                      type="checkbox"
                      key={filter.id}
                      label={filter.label}
                      className="input-filter"
                      id={`${filter.id}-event`}
                      checked={doctorId.includes(filter.id)}
                      onChange={() => updateFilter(filter.id)}
                    />
                    <Label
                      className="form-check-label"
                      for={`${filter.id}-event`}
                    >
                      {filter.label}
                    </Label>
                  </div>
                ))}
            </div>
          </CardBody>
        )}
      </div>
      <div className="mt-auto">
        <img className="img-fluid" src={illustration} alt="illustration" />
      </div>
    </Fragment>
  );
};

export default SidebarLeft;
