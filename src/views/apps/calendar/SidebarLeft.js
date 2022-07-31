// ** React Imports
import { Fragment, useMemo } from "react";

// ** Custom Components
import classnames from "classnames";

// ** Reactstrap Imports
import { CardBody, Button, Input, Label } from "reactstrap";

// ** illustration import
import illustration from "@src/assets/images/pages/calendar-illustration.png";
import { useSelector } from "react-redux";

// ** Filters Checkbox Array
const filters = [
  { label: "Cá nhân", color: "danger", className: "form-check-danger mb-1" },
  {
    label: "Quan trọng",
    color: "primary",
    className: "form-check-primary mb-1",
  },
  { label: "Family", color: "warning", className: "form-check-warning mb-1" },
  { label: "Holiday", color: "success", className: "form-check-success mb-1" },
  { label: "ETC", color: "info", className: "form-check-info" },
];

const SidebarLeft = (props) => {
  // ** Props
  const {
    handleAddEventSidebar,
    toggleSidebar,
    updateFilter,
    updateAllFilters,
    dispatch,
    doctorId,
  } = props;

  const doctorStore = useSelector((state) => state.doctor);
  const appointmentStore = useSelector((state) => state.appointment);

  const { doctors } = doctorStore;

  const hasNextPage = useMemo(() => {
    return doctors?.data?.total > doctors?.data?.items.length;
  }, [doctors]);

  const filters = useMemo(() => {
    const data = doctors?.data?.items.map((i) => ({
      label: i.name,
      id: i.id,
      color: "primary",
      className: "form-check-primary mb-1",
    }));
    return [...data];
  }, [doctors]);

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
                      checked={doctorId === filter.id}
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
