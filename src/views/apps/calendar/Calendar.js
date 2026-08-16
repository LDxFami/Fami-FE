// ** React Import
import { useEffect, useRef, memo, Fragment, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";

// ** Full Calendar & it's Plugins
import FullCalendar from "@fullcalendar/react";
import viLocale from "@fullcalendar/core/locales/vi";
import listPlugin from "@fullcalendar/list";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import moment from "moment";
// ** Custom Components
import Avatar from "@components/avatar";
import SpinnerComponent from "../../../@core/components/spinner/Fallback-spinner";
import { selectThemeColors, isObjEmpty } from "@utils";

// ** Third Party Components
import { toast } from "react-toastify";
import { Card, CardBody, Input, Label } from "reactstrap";
import { Menu, Check, Star } from "react-feather";
import useWindowDimensions from "../../../utility/hooks/useWindowDimensions";
import { getCustomer } from "../../../redux/customer";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  createDebouncedNameLoader,
  NAME_SEARCH_LIMIT,
} from "../../../utility/asyncNameSearch";

const scrollTime = moment().format("HH:mm:ss");

const getAppointmentTooltip = (event) => {
  return event.extendedProps?.description?.trim() || "";
};

const emptyNoteTooltip = {
  show: false,
  text: "",
  important: false,
  x: 0,
  y: 0,
};

// ** Toast Component
const ToastComponent = ({ title, icon, color }) => (
  <Fragment>
    <div className="toastify-header pb-0">
      <div className="title-wrapper">
        <Avatar size="sm" color={color} icon={icon} />
        <h6 className="toast-title">{title}</h6>
      </div>
    </div>
  </Fragment>
);

const Calendar = (props) => {
  // ** Refs
  const calendarRef = useRef(null);
  const { height, width } = useWindowDimensions();

  const defaultOptions = {
    locale: viLocale,
    events: calendarData,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: width > 540 ? "dayGridMonth" : "timeGridDay",
    headerToolbar: {
      start: "sidebarToggle, prev,next, title",
      end: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
    },

    buttonText: {
      listMonth: "List",
    },

    now: new Date(),
    scrollTime: scrollTime,
    nowIndicator: true,

    dayHeaderClassNames: "calendar-header",
    /*
  Enable dragging and resizing event
  ? Docs: https://fullcalendar.io/docs/editable
*/
    editable: false,

    /*
  Enable resizing event from start
  ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
*/
    eventResizableFromStart: false,

    /*
  Automatically scroll the scroll-containers during event drag-and-drop and date selecting
  ? Docs: https://fullcalendar.io/docs/dragScroll
*/
    dragScroll: true,

    /*
  Max number of events within a given day
  ? Docs: https://fullcalendar.io/docs/dayMaxEvents
*/
    dayMaxEvents: 3,

    /*
  Determines if day names and week names are clickable
  ? Docs: https://fullcalendar.io/docs/navLinks
*/
    navLinks: true,

    eventClassNames({ event: calendarEvent }) {
      // eslint-disable-next-line no-underscore-dangle
      const colorName = calendarsColor[calendarEvent._def.extendedProps.status];

      return [
        // Background Color
        `bg-light-${colorName}`,
      ];
    },

    eventClick({ event: clickedEvent }) {
      dispatch(selectEvent(clickedEvent));
      handleAddEventSidebar();

      // * Only grab required field otherwise it goes in infinity loop
      // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
      // event.value = grabEventDataFromEventApi(clickedEvent)

      // eslint-disable-next-line no-use-before-define
      // isAddNewEventSidebarActive.value = true
    },

    customButtons: {
      sidebarToggle: {
        text: <Menu className="d-xl-none d-block" />,
        click() {
          toggleSidebar(true);
        },
      },
    },

    dateClick(info) {
      const ev = blankEvent;
      ev.start = info.date;
      ev.end = info.date;
      // dispatch(selectEvent(ev));
      if (role == "admin") {
        handleAddEventSidebar();
      }
    },

    /*
  Handle event drop (Also include dragged event)
  ? Docs: https://fullcalendar.io/docs/eventDrop
  ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
*/
    datesSet: handleMonthChange,

    eventDrop({ event: droppedEvent }) {
      dispatch(updateEvent(droppedEvent));
      toast.success(
        <ToastComponent
          title="Event Updated"
          color="success"
          icon={<Check />}
        />,
        {
          icon: false,
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
        }
      );
    },

    /*
  Handle event resize
  ? Docs: https://fullcalendar.io/docs/eventResize
*/
    eventResize({ event: resizedEvent }) {
      dispatch(updateEvent(resizedEvent));
      toast.success(
        <ToastComponent
          title="Event Updated"
          color="success"
          icon={<Check />}
        />,
        {
          icon: false,
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
        }
      );
    },

    ref: calendarRef,

    // Get direction from app state (store)
    direction: isRtl ? "rtl" : "ltr",
  };

  // ** Props
  const {
    store,
    isRtl,
    dispatch,
    calendarsColor,
    calendarApi,
    setCalendarApi,
    handleAddEventSidebar,
    handleMonthChange,
    blankEvent,
    toggleSidebar,
    selectEvent,
    updateEvent,
    role,
    onCustomerChange,
    doctorId = [],
    canViewAll = false,
    profileReady = false,
  } = props;

  const initialView = width > 540 ? "dayGridMonth" : "timeGridDay";

  const [calendarData, setCalendarData] = useState([]);
  const [calendarOptions, setCalendarOptions] = useState(defaultOptions);
  const [viewCurrent, setviewCurrent] = useState(initialView);
  const [showPast, setShowPast] = useState(false);
  const [customerSelect, setCustomerSelect] = useState("");
  const [noteTooltip, setNoteTooltip] = useState(emptyNoteTooltip);
  // ** UseEffect checks for CalendarAPI Update
  useEffect(() => {
    if (calendarApi === null) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, [calendarApi, setCalendarApi]);

  useEffect(() => {
    document
      .querySelectorAll(".tooltip[role='tooltip'], .tooltip.bs-tooltip-top, .tooltip.bs-tooltip-bottom")
      .forEach((node) => node.remove());
  }, []);

  useEffect(() => {
    setviewCurrent(initialView);
  }, [initialView]);

  useEffect(() => {
    var calendarDta = [];
    if (store.appointments?.data.length > 0) {
      const matchesDoctorFilter = (appointment) => {
        if (!profileReady) return false;
        if (!doctorId.length) return canViewAll;
        // Sidebar "uncheck all" uses sentinel [0]
        if (doctorId.length === 1 && doctorId[0] === 0) return false;

        const idSet = new Set(doctorId.map(String));
        const includeUnassigned = idSet.has("");
        const primaryId = appointment.doctor_id ?? appointment.doctor?.id;
        const secondaryId =
          appointment.secondary_doctor_id ?? appointment.secondary_doctor?.id;

        if (includeUnassigned && (primaryId == null || primaryId === "")) {
          return true;
        }
        if (primaryId != null && idSet.has(String(primaryId))) return true;
        if (secondaryId != null && idSet.has(String(secondaryId))) return true;
        return false;
      };

      const doctorFiltered = store.appointments.data.filter(matchesDoctorFilter);

      if (!showPast && viewCurrent === "listMonth") {
        var date = new Date();
        date.setHours(0, 0, 0);
        calendarDta = doctorFiltered.filter((i) => {
          return (
            new Date(i.date + "T" + i.time_start).getTime() > date.getTime()
          );
        });
      } else {
        calendarDta = doctorFiltered;
      }
    }
    setCalendarData(
      calendarDta.length > 0
        ? calendarDta.map((i) => ({
            id: i.id,
            url: "",
            title: i.customer.name,
            start: new Date(i.date + "T" + i.time_start),
            end: new Date(i.date + "T" + i.time_end),
            description: i.description || "",
            extendedProps: {
              doctor: i.doctor,
              secondaryDoctor: i.secondary_doctor,
              customer: i.customer,
              description: i.description || "",
              isImportant: !!i.is_important,
              startTime: i.time_start,
              endTime: i.time_end,
              status: i.status,
              date: i.date,
              id: i.id,
            },
          }))
        : []
    );
  }, [store, showPast, viewCurrent, doctorId, canViewAll, profileReady]);

  useEffect(() => {
    const options = {
      locale: viLocale,
      events: calendarData,
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: initialView,
      allDaySlot: false,
      headerToolbar: {
        start: `sidebarToggle, prev,next, title, ${
          viewCurrent === "listMonth" ? "showPastCheckBox" : ""
        }`,
        center: "customerSearch",
        end: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
      },
      slotMinTime: "07:00:00",
      slotMaxTime: "21:30:00",

      now: new Date(),
      scrollTime: scrollTime,
      buttonText: {
        listMonth: "List",
      },
      eventContent: function (arg, createElement) {
        const { event } = arg;
        if (arg.view.type === "timeGridDay") {
          return renderEvent(event, arg.view.type);
        }
        if (arg.view.type === "listMonth") {
          return renderAdminList(event, arg.view.type, width);
        }
        if (arg.view.type === "dayGridMonth") {
          return renderDayGridMonth(event, arg.view.type, width);
        }
      },

      dayHeaderClassNames: "calendar-header",
      slotEventOverlap: false,
      /*
    Enable dragging and resizing event
    ? Docs: https://fullcalendar.io/docs/editable
  */
      editable: false,

      /*
    Enable resizing event from start
    ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
  */
      eventResizableFromStart: false,

      /*
    Automatically scroll the scroll-containers during event drag-and-drop and date selecting
    ? Docs: https://fullcalendar.io/docs/dragScroll
  */
      dragScroll: true,

      /*
    Max number of events within a given day
    ? Docs: https://fullcalendar.io/docs/dayMaxEvents
  */
      dayMaxEvents: width < 540 ? 30 : 5,

      /*
    Determines if day names and week names are clickable
    ? Docs: https://fullcalendar.io/docs/navLinks
  */
      navLinks: true,

      eventTimeFormat: {
        // like '14:30:00'
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },

      slotLabelFormat: {
        hour: "2-digit",
        minute: "2-digit",
      },
      listDayFormat: {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
      listDaySideFormat: false,
      nowIndicator: true,
      eventClassNames({ event: calendarEvent }) {
        // eslint-disable-next-line no-underscore-dangle
        const colorName =
          calendarsColor[calendarEvent._def.extendedProps.status];
        const classes = [`bg-light-${colorName} bold`];

        if (calendarEvent._def.extendedProps.isImportant) {
          classes.push("event-important");
        }

        return classes;
      },

      eventMouseEnter({ event, el }) {
        const tooltipText = getAppointmentTooltip(event);
        if (!tooltipText) {
          return;
        }

        const rect = el.getBoundingClientRect();
        setNoteTooltip({
          show: true,
          text: tooltipText,
          important: !!event.extendedProps?.isImportant,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      },

      eventMouseLeave() {
        setNoteTooltip(emptyNoteTooltip);
      },

      eventClick({ event: clickedEvent, view }) {
        setNoteTooltip(emptyNoteTooltip);

        if (view.type === "dayGridMonth" && width < 54) {
          calendarApi.changeView("timeGridDay", clickedEvent.start);
        } else {
          dispatch(selectEvent(clickedEvent));
          handleAddEventSidebar();
        }

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)

        // eslint-disable-next-line no-use-before-define
        // isAddNewEventSidebarActive.value = true
      },

      customButtons: {
        sidebarToggle: {
          text: <Menu className="d-xl-none d-block" />,
          click() {
            toggleSidebar(true);
          },
        },
        customerSearch: {
          text: renderCustomerSearch(),
        },
        showPastCheckBox: {
          text: renderShowPastCheckBox(),
        },
      },

      dateClick(info) {
        if (info.view.type === "dayGridMonth" && width < 540) {
          calendarApi.changeView("timeGridDay", info.date);
        } else {
          const ev = blankEvent;
          ev.start = info.date;
          ev.end = info.date;
          // dispatch(selectEvent(ev));
          if (role == "admin") {
            handleAddEventSidebar();
          }
        }
      },

      /*
    Handle event drop (Also include dragged event)
    ? Docs: https://fullcalendar.io/docs/eventDrop
    ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
  */
      datesSet: function (info) {
        handleMonthChange(info);
        setviewCurrent(info.view.type);
      },
      eventDrop({ event: droppedEvent }) {
        dispatch(updateEvent(droppedEvent));
        toast.success(
          <ToastComponent
            title="Event Updated"
            color="success"
            icon={<Check />}
          />,
          {
            icon: false,
            autoClose: 2000,
            hideProgressBar: true,
            closeButton: false,
          }
        );
      },

      /*
    Handle event resize
    ? Docs: https://fullcalendar.io/docs/eventResize
  */
      eventResize({ event: resizedEvent }) {
        dispatch(updateEvent(resizedEvent));
        toast.success(
          <ToastComponent
            title="Event Updated"
            color="success"
            icon={<Check />}
          />,
          {
            icon: false,
            autoClose: 2000,
            hideProgressBar: true,
            closeButton: false,
          }
        );
      },

      ref: calendarRef,

      // Get direction from app state (store)
      direction: isRtl ? "rtl" : "ltr",
    };
    setCalendarOptions({ ...options });
  }, [role, calendarData, initialView, customerSelect, showPast, viewCurrent]);

  const renderEvent = (event, view) => {
    const { description, isImportant } = event.extendedProps;
    return (
      <>
        <div className="fc-event-time d-flex align-items-center">
          {isImportant ? (
            <Star size={12} className="me-25 event-important-star" fill="currentColor" />
          ) : null}
          {moment(event.startStr).format("HH:mm")} -{" "}
          {moment(event.endStr).format("HH:mm")}
        </div>
        <div className="fc-event-title">
          {event.title}
          {description ? (
            <span
              className={`fc-event-description${
                isImportant ? " note-important" : ""
              }`}
            >
              {" "}
              - {description}
            </span>
          ) : null}
        </div>
      </>
    );
  };

  const renderAdminList = (event, view, width) => {
    let doctors = [event.extendedProps.doctor?.name, event.extendedProps.secondaryDoctor?.name].filter((i) => i);
    let doctorText = doctors.length > 0 ? doctors.join(", ") : "Chưa có BS";
    let description = event.extendedProps.description ?? "";
    const { isImportant } = event.extendedProps;
    return (
      <>
        <div className="fw-bold d-flex align-items-center">
          {isImportant ? (
            <Star size={14} className="me-25 event-important-star" fill="currentColor" />
          ) : null}
          {event.title}
        </div>
        {doctorText}
        {description ? (
          <span className={isImportant ? "note-important" : undefined}>
            {" - "}
            {description}
          </span>
        ) : null}
      </>
    );
  };

  const renderDayGridMonth = (event, view, width) => {
    const { description, isImportant, customer, status } = event.extendedProps;

    if (width < 540) {
      return isImportant ? (
        <Star size={12} className="event-important-star" fill="currentColor" />
      ) : (
        <div className="fc-daygrid-event-dot" />
      );
    }

    return (
      <>
        {isImportant ? (
          <Star size={12} className="event-important-star me-25" fill="currentColor" />
        ) : (
          <div
            className={`fc-daygrid-event-dot border-color-${
              calendarsColor[status ?? 1]
            }`}
          ></div>
        )}
        <div className="fc-event-time">
          {moment(event.startStr).format("HH:mm")}
        </div>
        <div className="fc-event-title">
          {customer?.name}
          {isImportant && description ? (
            <span className="fc-event-description note-important">
              {" "}
              - {description}
            </span>
          ) : null}
        </div>
      </>
    );
  };

  const customerLoadOptions = useMemo(
    () =>
      createDebouncedNameLoader(async (inputValue) => {
        const params = {
          limit: NAME_SEARCH_LIMIT,
          page: 1,
          typeahead: 1,
        };
        if (inputValue) {
          params.search_param = inputValue;
        }
        const originalPromiseResult = await dispatch(getCustomer(params));
        const resultAction = unwrapResult(originalPromiseResult);
        return (resultAction.data.items || []).map((i) => ({
          label: i.name + " - " + (i.phone ?? "Không có SĐT"),
          value: i.id,
          id: i.id,
        }));
      }),
    [dispatch]
  );

  const renderCustomerSearch = () => {
    return (
      <AsyncSelect
        placeholder="Tìm khách hàng..."
        id="customerCalendarSearch"
        value={customerSelect}
        theme={selectThemeColors}
        className="react-select"
        classNamePrefix="select"
        isClearable={true}
        cacheOptions
        defaultOptions
        onChange={(data) => {
          setCustomerSelect(data);
          onCustomerChange(data);
        }}
        loadOptions={customerLoadOptions}
      />
    );
  };

  const renderShowPastCheckBox = () => (
    <div className="fc-button-group">
      <Input
        type="checkbox"
        key={"showpast"}
        label={"Hiển thị cuộc hẹn trong quá khứ"}
        className="input-filter"
        id={`showpast-event`}
        checked={showPast}
        onChange={() => setShowPast(!showPast)}
      />
      <Label className="form-check-label" for={"showpast-event"}>
        &nbsp;Hiển thị cuộc hẹn trong quá khứ
      </Label>
    </div>
  );
  return (
    <Card className="shadow-none border-0 mb-0 rounded-0">
      {store.appointments.loading !== "success" ? (
        <div className="calendar-loading">
          <SpinnerComponent />
        </div>
      ) : null}
      <CardBody className="pb-0">
        <FullCalendar {...calendarOptions} />{" "}
        {noteTooltip.show ? (
          <div
            className={`appointment-note-tooltip${
              noteTooltip.important ? " important" : ""
            }`}
            style={{
              top: noteTooltip.y,
              left: noteTooltip.x,
            }}
          >
            {noteTooltip.text}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default memo(Calendar);
