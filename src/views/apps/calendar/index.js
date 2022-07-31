// ** React Imports
import { Fragment, useState, useEffect } from "react";

// ** Third Party Components
import classnames from "classnames";
import { Row, Col } from "reactstrap";

// ** Calendar App Component Imports
import Calendar from "./Calendar";
import SidebarLeft from "./SidebarLeft";
import AddEventSidebar from "./AddEventSidebar";

// ** Custom Hooks
import { useRTL } from "@hooks/useRTL";

// ** Store & Actions
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEvents,
  selectEvent,
  updateEvent,
  updateAllFilters,
  addEvent,
  removeEvent,
} from "./store";

import { selectAppointment } from "../../../redux/\bappointment";
// ** Styles
import "@styles/react/apps/app-calendar.scss";
import { getAppointment } from "../../../redux/\bappointment";
import { getDoctor } from "../../../redux/doctor";

// ** CalendarColors
const calendarsColor = {
  1: "primary",
  0: "warning",
};

const CalendarComponent = () => {
  // ** Variables
  const dispatch = useDispatch();
  const store = useSelector((state) => state.appointment);

  // ** states
  const [calendarApi, setCalendarApi] = useState(null);
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [doctorId, setDoctorId] = useState("");
  // ** Hooks
  const [isRtl] = useRTL();

  // ** AddEventSidebar Toggle Function
  const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen);

  // ** LeftSidebar Toggle Function
  const toggleSidebar = (val) => setLeftSidebarOpen(val);

  // ** Blank Event Object
  const blankEvent = {
    title: "",
    start: "",
    end: "",
    allDay: false,
    url: "",
    extendedProps: {
      calendar: "",
      guests: [],
      location: "",
      description: "",
    },
  };

  // ** refetchEvents
  const refetchEvents = () => {
    dispatch(getDoctor());
    dispatch(getAppointment({ month }));
    if (calendarApi !== null) {
      calendarApi.refetchEvents();
    }
  };

  // ** Fetch Events On Mount
  useEffect(() => {
    dispatch(getAppointment({ month, doctor_id: doctorId }));
  }, [month, doctorId]);

  const handleMonthChange = (payload) => {
    var middate = new Date(
      (new Date(payload.startStr).getTime() +
        new Date(payload.endStr).getTime()) /
        2
    );
    setMonth(middate.getMonth() + 1);
  };

  const updateFilter = (doctorId) => {
    setDoctorId(doctorId);
  };

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
            <SidebarLeft
              doctorId={doctorId}
              store={store}
              dispatch={dispatch}
              updateFilter={updateFilter}
              toggleSidebar={toggleSidebar}
              handleAddEventSidebar={handleAddEventSidebar}
            />
          </Col>
          <Col className="position-relative">
            <Calendar
              
              isRtl={isRtl}
              store={store}
              handleMonthChange={handleMonthChange}
              dispatch={dispatch}
              blankEvent={blankEvent}
              calendarApi={calendarApi}
              selectEvent={selectAppointment}
              updateEvent={updateEvent}
              toggleSidebar={toggleSidebar}
              calendarsColor={calendarsColor}
              setCalendarApi={setCalendarApi}
              handleAddEventSidebar={handleAddEventSidebar}
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
        dispatch={dispatch}
        addEvent={addEvent}
        open={addSidebarOpen}
        selectEvent={selectAppointment}
        updateEvent={updateEvent}
        removeEvent={removeEvent}
        calendarApi={calendarApi}
        refetchEvents={refetchEvents}
        calendarsColor={calendarsColor}
        handleAddEventSidebar={handleAddEventSidebar}
      />
    </Fragment>
  );
};

export default CalendarComponent;
