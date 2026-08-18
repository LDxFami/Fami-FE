// ** React Import
import { useEffect, useRef, memo, useMemo, useState, useCallback } from "react";

// ** Full Calendar & it's Plugins
import FullCalendar from "@fullcalendar/react";
import viLocale from "@fullcalendar/core/locales/vi";
import listPlugin from "@fullcalendar/list";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import moment from "moment";
// ** Custom Components
import SpinnerComponent from "../../../@core/components/spinner/Fallback-spinner";

// ** Third Party Components
import { Card, CardBody, Input, Label } from "reactstrap";
import { Menu, Star } from "react-feather";
import useWindowDimensions from "../../../utility/hooks/useWindowDimensions";
import { CustomerNameSelect } from "../../../utility/nameAsyncSelect";
import {
  createBlankCalendarEvent,
  matchesDoctorFilter,
} from "./calendarHelpers";

const scrollTime = moment().format("HH:mm:ss");
const PLUGINS = [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin];

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

const Calendar = (props) => {
  const calendarRef = useRef(null);
  const handlersRef = useRef({});
  const { width } = useWindowDimensions();

  const {
    store,
    isRtl,
    dispatch,
    calendarsColor,
    calendarApi,
    setCalendarApi,
    handleAddEventSidebar,
    handleDatesSet,
    selectEvent,
    toggleSidebar,
    role,
    onCustomerChange,
    doctorId = [],
    canViewAll = false,
    profileReady = false,
  } = props;

  const initialView = width > 540 ? "dayGridMonth" : "timeGridDay";

  const [viewCurrent, setViewCurrent] = useState(initialView);
  const [showPast, setShowPast] = useState(false);
  const [customerSelect, setCustomerSelect] = useState(null);
  const [noteTooltip, setNoteTooltip] = useState(emptyNoteTooltip);

  handlersRef.current = {
    dispatch,
    selectEvent,
    handleAddEventSidebar,
    handleDatesSet,
    toggleSidebar,
    onCustomerChange,
    role,
    calendarApi,
    width,
  };

  const renderEvent = useCallback((event) => {
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
  }, []);

  const renderAdminList = useCallback((event) => {
    const doctors = [
      event.extendedProps.doctor?.name,
      event.extendedProps.secondaryDoctor?.name,
    ].filter((i) => i);
    const doctorText = doctors.length > 0 ? doctors.join(", ") : "Chưa có BS";
    const description = event.extendedProps.description ?? "";
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
  }, []);

  const renderDayGridMonth = useCallback(
    (event, gridWidth) => {
      const { description, isImportant, customer, status } = event.extendedProps;

      if (gridWidth < 540) {
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
    },
    [calendarsColor]
  );

  useEffect(() => {
    if (calendarApi === null && calendarRef.current) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, [calendarApi, setCalendarApi]);

  useEffect(() => {
    document
      .querySelectorAll(
        ".tooltip[role='tooltip'], .tooltip.bs-tooltip-top, .tooltip.bs-tooltip-bottom"
      )
      .forEach((node) => node.remove());
  }, []);

  useEffect(() => {
    setViewCurrent(initialView);
  }, [initialView]);

  // Derive calendar events synchronously — avoids the extra render cycle that
  // the previous useState + useEffect pattern caused on every store change.
  const calendarData = useMemo(() => {
    const appointments = store.appointments?.data;
    if (!appointments?.length) return [];

    const doctorFiltered = appointments.filter((appointment) =>
      matchesDoctorFilter(appointment, { doctorId, canViewAll, profileReady })
    );

    let filtered = doctorFiltered;
    if (!showPast && viewCurrent === "listMonth") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = doctorFiltered.filter(
        (i) => new Date(i.date + "T" + i.time_start).getTime() > today.getTime()
      );
    }

    return filtered.map((i) => ({
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
    }));
  }, [store.appointments?.data, showPast, viewCurrent, doctorId, canViewAll, profileReady]);

  const customerSearchButton = useMemo(
    () => (
      <CustomerNameSelect
        id="customerCalendarSearch"
        value={customerSelect}
        isClearable
        onChange={(data) => {
          setCustomerSelect(data);
          handlersRef.current.onCustomerChange?.(data);
        }}
      />
    ),
    [customerSelect]
  );

  const showPastCheckBox = useMemo(
    () => (
      <div className="fc-button-group">
        <Input
          type="checkbox"
          key={"showpast"}
          label={"Hiển thị cuộc hẹn trong quá khứ"}
          className="input-filter"
          id={`showpast-event`}
          checked={showPast}
          onChange={() => setShowPast((prev) => !prev)}
        />
        <Label className="form-check-label" for={"showpast-event"}>
          &nbsp;Hiển thị cuộc hẹn trong quá khứ
        </Label>
      </div>
    ),
    [showPast]
  );

  const calendarOptions = useMemo(
    () => ({
      locale: viLocale,
      plugins: PLUGINS,
      initialView,
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
      scrollTime,
      buttonText: {
        listMonth: "List",
      },
      eventContent(arg) {
        const { event } = arg;
        if (arg.view.type === "timeGridDay") {
          return renderEvent(event);
        }
        if (arg.view.type === "listMonth") {
          return renderAdminList(event);
        }
        if (arg.view.type === "dayGridMonth") {
          return renderDayGridMonth(event, handlersRef.current.width);
        }
      },
      dayHeaderClassNames: "calendar-header",
      slotEventOverlap: false,
      editable: false,
      eventResizableFromStart: false,
      dragScroll: true,
      dayMaxEvents: width < 540 ? 30 : 5,
      navLinks: true,
      eventTimeFormat: {
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
        if (!tooltipText) return;
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
        const { width: w, calendarApi: api, dispatch: d, selectEvent: sel, handleAddEventSidebar: open } =
          handlersRef.current;
        if (view.type === "dayGridMonth" && w < 540) {
          api?.changeView("timeGridDay", clickedEvent.start);
        } else {
          d(sel(clickedEvent));
          open();
        }
      },
      customButtons: {
        sidebarToggle: {
          text: <Menu className="d-xl-none d-block" />,
          click() {
            handlersRef.current.toggleSidebar(true);
          },
        },
        customerSearch: {
          text: customerSearchButton,
        },
        showPastCheckBox: {
          text: showPastCheckBox,
        },
      },
      dateClick(info) {
        const { width: w, calendarApi: api, dispatch: d, selectEvent: sel, handleAddEventSidebar: open, role: r } =
          handlersRef.current;
        if (info.view.type === "dayGridMonth" && w < 540) {
          api?.changeView("timeGridDay", info.date);
          return;
        }
        if (r === "admin") {
          d(sel(createBlankCalendarEvent(info.date)));
          open();
        }
      },
      datesSet(info) {
        handlersRef.current.handleDatesSet?.(info);
        setViewCurrent(info.view.type);
      },
      ref: calendarRef,
      direction: isRtl ? "rtl" : "ltr",
    }),
    [
      initialView,
      viewCurrent,
      width,
      isRtl,
      calendarsColor,
      customerSearchButton,
      showPastCheckBox,
      renderEvent,
      renderAdminList,
      renderDayGridMonth,
    ]
  );

  return (
    <Card className="shadow-none border-0 mb-0 rounded-0">
      {store.appointments.loading !== "success" ? (
        <div className="calendar-loading">
          <SpinnerComponent />
        </div>
      ) : null}
      <CardBody className="pb-0">
        <FullCalendar {...calendarOptions} events={calendarData} />
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
