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
import { updateEvent, addEvent, removeEvent } from "./store";

import { selectAppointment } from "../../../redux/appointment";
// ** Styles
import "@styles/react/apps/app-calendar.scss";
import { getAppointment } from "../../../redux/appointment";
import { getDoctor } from "../../../redux/doctor";
import { getUser } from "../../../redux/user";

// ** CalendarColors
const calendarsColor = {
  2: "success",
  1: "primary",
  0: "danger",
};

const CalendarComponent = () => {
  // ** Variables
  const dispatch = useDispatch();
  const store = useSelector((state) => state.appointment);
  const userStore = useSelector((state) => state.user);

  const { userData } = userStore;

  // ** states
  const [calendarApi, setCalendarApi] = useState(null);
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [doctorId, setDoctorId] = useState([]);
  const [customerId, setCustomerId] = useState("");
  // ** Hooks
  const [isRtl] = useRTL();
  // ** AddEventSidebar Toggle Function
  const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen);

  // ** LeftSidebar Toggle Function
  const toggleSidebar = (val) => setLeftSidebarOpen(val);

  const profileReady = Boolean(userData?.roles);
  const canViewAll =
    userData?.roles?.[0]?.name === "admin" ||
    userData?.group?.slug === "medic";

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

  const appointmentParams = {
    month,
    year,
    customer_id: customerId !== "" ? customerId : null,
  };

  // ** refetchEvents
  const refetchEvents = () => {
    dispatch(getDoctor());
    dispatch(getAppointment(appointmentParams));
    if (calendarApi !== null) {
      calendarApi.refetchEvents();
    }
  };

  useEffect(() => {
    dispatch(getUser());
    dispatch(getDoctor());
  }, []);

  // Fetch month appointments in parallel with doctors/profile — doctor
  // filtering is done client-side so we don't wait on sidebar check-all.
  useEffect(() => {
    dispatch(getAppointment(appointmentParams));
  }, [month, year, customerId]);

  useEffect(() => {
    if (!userData?.roles) return;
    const isAdmin = userData.roles[0]?.name === "admin";
    const isMedic = userData?.group?.slug === "medic";
    if (!isAdmin && !isMedic) {
      setDoctorId([userData.id]);
    }
  }, [userData]);
  const handleMonthChange = (payload) => {
    var middate = new Date(
      (new Date(payload.startStr).getTime() +
        new Date(payload.endStr).getTime()) /
        2
    );
    setMonth(middate.getMonth() + 1);
    setYear(middate.getFullYear());
  };

  const updateFilter = (id) => {
    const tempArr = [...doctorId];
    if (!tempArr.includes(id)) {
      //checking weather array contain the id
      tempArr.push(id); //adding to array because value doesnt exists
    } else {
      tempArr.splice(tempArr.indexOf(id), 1); //deleting
    }
    setDoctorId(tempArr);
  };

  const handleCheckAllFilter = (filters) => {
    setDoctorId(filters);
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
            {userData &&
            userData.roles &&
            (userData?.roles[0]?.name === "admin" ||
              userData?.roles[0]?.name === "doctor") ? (
              <SidebarLeft
                doctorId={[...doctorId]}
                store={store}
                dispatch={dispatch}
                updateFilter={updateFilter}
                toggleSidebar={toggleSidebar}
                handleAddEventSidebar={handleAddEventSidebar}
                onCheckAll={handleCheckAllFilter}
                canCreateAppointment={
                  userData?.roles[0]?.name === "admin" ||
                  userData?.group?.slug == "medic"
                }
              />
            ) : null}
          </Col>

          <Col className="position-relative">
            <Calendar
              role={userData?.roles ? userData?.roles[0]?.name : ""}
              isRtl={isRtl}
              store={store}
              doctorId={doctorId}
              canViewAll={canViewAll}
              profileReady={profileReady}
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
              onCustomerChange={(customer) => {
                setCustomerId(customer? customer.id : "");
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
        role={userData?.roles ? userData?.roles[0]?.name : ""}
        canModify={
          (userData?.roles ? userData?.roles[0]?.name : "") == "admin" ||
          userData?.group?.slug == "medic"
        }
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
