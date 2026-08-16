// ** React Imports
import { Fragment, useMemo, useState, useEffect, useRef } from "react";

// ** Custom Components
import classnames from "classnames";

// ** Reactstrap Imports
import { CardBody, Button, Input, Label } from "reactstrap";

// ** illustration import
import illustration from "@src/assets/images/pages/calendar-illustration.png";
import { useSelector } from "react-redux";

const SidebarLeft = (props) => {
  const {
    handleAddEventSidebar,
    toggleSidebar,
    updateFilter,
    doctorId,
    onCheckAll,
    canCreateAppointment = false,
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
        <CardBody className="card-body d-flex justify-content-center my-sm-0 mb-3">
          {canCreateAppointment && (
            <Button color="primary" block onClick={handleAddEventClick}>
              <span className="align-middle">Thêm lịch hẹn</span>
            </Button>
          )}
        </CardBody>
        <CardBody>
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
              filters.map((filter) => {
                return (
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
                      onChange={() => {
                        updateFilter(filter.id);
                      }}
                    />
                    <Label
                      className="form-check-label"
                      for={`${filter.id}-event`}
                    >
                      {filter.label}
                    </Label>
                  </div>
                );
              })}
          </div>
        </CardBody>
      </div>
      <div className="mt-auto">
        <img className="img-fluid" src={illustration} alt="illustration" />
      </div>
    </Fragment>
  );
};

export default SidebarLeft;
