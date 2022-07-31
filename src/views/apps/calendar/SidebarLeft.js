// ** React Imports
import { Fragment, useMemo, useState, useEffect } from "react";

// ** Custom Components
import classnames from "classnames";

// ** Reactstrap Imports
import { CardBody, Button, Input, Label } from "reactstrap";

// ** illustration import
import illustration from "@src/assets/images/pages/calendar-illustration.png";
import { useSelector } from "react-redux";

// ** Filters Checkbox Array

const SidebarLeft = (props) => {
  // ** Props
  const {
    handleAddEventSidebar,
    toggleSidebar,
    updateFilter,
    updateAllFilters,
    dispatch,
    doctorId,
    onCheckAll,
  } = props;

  const [filters, setFilters] = useState([]);

  const doctorStore = useSelector((state) => state.doctor);
  const appointmentStore = useSelector((state) => state.appointment);

  const { doctors } = doctorStore;

  const hasNextPage = useMemo(() => {
    return doctors?.data?.total > doctors?.data?.items.length;
  }, [doctors]);

  useEffect(() => {
    if (filters.length == 0) {
      setFilters(
        doctors?.data?.items.map((i) => ({
          label: i.name,
          id: i.id,
          color: "primary",
          className: "form-check-primary mb-1",
        }))
      );
    }
  }, [doctors]);

  // const filters = useMemo(() => {
  //   const data = doctors?.data?.items.map((i) => ({
  //     label: i.name,
  //     id: i.id,
  //     color: "primary",
  //     className: "form-check-primary mb-1",
  //   }));
  //   return [...data];
  // }, [doctors]);

  // ** Function to handle Add Event Click
  const handleAddEventClick = () => {
    toggleSidebar(false);
    handleAddEventSidebar();
  };

  return (
    <Fragment>
      <div className="sidebar-wrapper">
        <CardBody className="card-body d-flex justify-content-center my-sm-0 mb-3">
          <Button color="primary" block onClick={handleAddEventClick}>
            <span className="align-middle">Thêm lịch hẹn</span>
          </Button>
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
              checked={filters.length === doctorId.length}
              onChange={(e) => {
                if (filters.length !== doctorId.length) {
                  onCheckAll(filters.map((i) => i.id));
                } else {
                  onCheckAll([]);
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
                        toggleSidebar();
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
