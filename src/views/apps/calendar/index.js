// ** React Imports
import { Fragment, useState, useEffect, useCallback, useMemo } from "react";

// ** Third Party Components
import classnames from "classnames";
import { Row, Col } from "reactstrap";

// ** Calendar App Component Imports
import Calendar from "./Calendar";
import SidebarLeft from "./SidebarLeft";
import AddEventSidebar from "./AddEventSidebar";

// ** Custom Hooks
import { useRTL } from "@hooks/useRTL";
import { useCalendarPermissions } from "../../../utility/hooks/useCalendarPermissions";
import {
  visibleDateRangeFromDatesSet,
  dateRangesEqual,
} from "./calendarHelpers";

// ** Store & Actions
import { useSelector, useDispatch } from "react-redux";
import { selectAppointment, getAppointment } from "../../../redux/appointment";
import { getDoctor } from "../../../redux/doctor";
import { getUser } from "../../../redux/user";

// ** Styles
import "@styles/react/apps/app-calendar.scss";

// ** CalendarColors
const calendarsColor = {
  2: "success",
  1: "primary",
  0: "danger",
};

const CalendarComponent = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.appointment);
  const userStore = useSelector((state) => state.user);
  const { userData } = userStore;

  const {
    roleName,
    profileReady,
    canViewAll,
    canCreateAppointment,
    canModify,
    showDoctorFilters,
  } = useCalendarPermissions(userData);

  const [calendarApi, setCalendarApi] = useState(null);
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [doctorId, setDoctorId] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [isRtl] = useRTL();

  const handleAddEventSidebar = useCallback(
    () => setAddSidebarOpen((open) => !open),
    []
  );
  const toggleSidebar = useCallback((val) => setLeftSidebarOpen(val), []);

  const appointmentParams = useMemo(
    () =>
      dateRange
        ? {
            start_date: dateRange.start,
            end_date: dateRange.end,
            customer_id: customerId !== "" ? customerId : null,
          }
        : null,
    [dateRange, customerId]
  );

  const refetchEvents = useCallback(
    (options = {}) => {
      if (!appointmentParams) return;
      dispatch(
        getAppointment({
          ...appointmentParams,
          silent: Boolean(options.silent),
        })
      );
    },
    [dispatch, appointmentParams]
  );

  useEffect(() => {
    dispatch(getUser());
    dispatch(getDoctor({ limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if (!appointmentParams) return;
    dispatch(getAppointment(appointmentParams));
  }, [dispatch, appointmentParams]);

  useEffect(() => {
    if (!userData?.roles) return;
    if (!canViewAll) {
      setDoctorId([userData.id]);
    }
  }, [userData, canViewAll]);

  const handleDatesSet = useCallback((payload) => {
    const next = visibleDateRangeFromDatesSet(payload);
    setDateRange((prev) => (dateRangesEqual(prev, next) ? prev : next));
  }, []);

  const updateFilter = useCallback((id) => {
    setDoctorId((prev) => {
      const tempArr = [...prev];
      const idx = tempArr.indexOf(id);
      if (idx === -1) {
        tempArr.push(id);
      } else {
        tempArr.splice(idx, 1);
      }
      return tempArr;
    });
  }, []);

  const handleCheckAllFilter = useCallback((filters) => {
    setDoctorId(filters);
  }, []);

  return (
    <Fragment>
      <div className="app-calendar overflow-hidden border">
        <Row className="g-0">
          <Col
            id="app-calendar-sidebar"
            className={classnames(
              "col app-calendar-sidebar flex-grow-0 overflow-hidden d-flex flex-column",
              {
                show: leftSidebarOpen,
              }
            )}
          >
            {userData && userData.roles && showDoctorFilters ? (
              <SidebarLeft
                doctorId={doctorId}
                updateFilter={updateFilter}
                toggleSidebar={toggleSidebar}
                handleAddEventSidebar={handleAddEventSidebar}
                onCheckAll={handleCheckAllFilter}
                canCreateAppointment={canCreateAppointment}
              />
            ) : null}
          </Col>

          <Col className="position-relative">
            <Calendar
              role={roleName}
              isRtl={isRtl}
              store={store}
              doctorId={doctorId}
              canViewAll={canViewAll}
              profileReady={profileReady}
              handleDatesSet={handleDatesSet}
              dispatch={dispatch}
              calendarApi={calendarApi}
              selectEvent={selectAppointment}
              toggleSidebar={toggleSidebar}
              calendarsColor={calendarsColor}
              setCalendarApi={setCalendarApi}
              handleAddEventSidebar={handleAddEventSidebar}
              onCustomerChange={(customer) => {
                setCustomerId(customer ? customer.id : "");
              }}
            />
          </Col>
          <div
            className={classnames("body-content-overlay", {
              show: leftSidebarOpen === true,
            })}
            onClick={() => toggleSidebar(false)}
          ></div>
        </Row>
      </div>
      <AddEventSidebar
        store={store}
        role={roleName}
        canModify={canModify}
        dispatch={dispatch}
        open={addSidebarOpen}
        calendarApi={calendarApi}
        refetchEvents={refetchEvents}
        calendarsColor={calendarsColor}
        handleAddEventSidebar={handleAddEventSidebar}
      />
    </Fragment>
  );
};

export default CalendarComponent;
