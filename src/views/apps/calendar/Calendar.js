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
import { Menu, Check } from "react-feather";
import useWindowDimensions from "../../../utility/hooks/useWindowDimensions";
import { getCustomer } from "../../../redux/customer";
import { unwrapResult } from "@reduxjs/toolkit";

const scrollTime = moment().format("HH:mm:ss");

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
  } = props;

  const initialView = width > 540 ? "dayGridMonth" : "timeGridDay";

  const [calendarData, setCalendarData] = useState([]);
  const [calendarOptions, setCalendarOptions] = useState(defaultOptions);
  const [viewCurrent, setviewCurrent] = useState(initialView);
  const [showPast, setShowPast] = useState(true);
  const [customerSelect, setCustomerSelect] = useState("");
  // ** UseEffect checks for CalendarAPI Update
  useEffect(() => {
    if (calendarApi === null) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, [calendarApi, setCalendarApi]);

  useEffect(() => {
    setviewCurrent(initialView);
  }, [initialView]);

  useEffect(() => {
    var calendarDta = [];
    if (store.appointments?.data.length > 0) {
      console.log(viewCurrent)
      if (!showPast && viewCurrent === "listMonth") {
        console.log(showPast)
        var date = new Date();
        date.setDate(date.getDate() - 1);
        calendarDta = store.appointments?.data.filter((i) => {
          return (
            new Date(i.date + "T" + i.time_start).getTime() >
            date.getTime()
          );
        });
        console.log(calendarDta)
      } else {
        calendarDta = store.appointments?.data;
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
              customer: i.customer,
              description: i.description || "",
              startTime: i.time_start,
              endTime: i.time_end,
              status: i.status,
              date: i.date,
              id: i.id,
            },
          }))
        : []
    );
  }, [store, showPast, viewCurrent]);

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
      nowIndicator: true,
      eventClassNames({ event: calendarEvent }) {
        // eslint-disable-next-line no-underscore-dangle
        const colorName =
          calendarsColor[calendarEvent._def.extendedProps.status];

        return [
          // Background Color
          `bg-light-${colorName} bold `,
        ];
      },

      eventClick({ event: clickedEvent, view }) {
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
    return (
      <>
        <div className="fc-event-time">
          {moment(event.startStr).format("HH:mm")} -{" "}
          {moment(event.endStr).format("HH:mm")}
        </div>
        <div className="fc-event-title">
          {event.title}
          {event.extendedProps.description ? (
            <span className="fc-event-description">
              {" "}
              - {event.extendedProps.description}
            </span>
          ) : null}
        </div>
      </>
    );
  };

  const renderAdminList = (event, view, width) => {
    if (width > 540) {
      return (
        <>
          <div className="fw-bold">{event.title}</div>
          {event.extendedProps.doctor?.name ?? "Chưa có BS"}
          {event.extendedProps.description
            ? " - " + event.extendedProps.description
            : ""}
        </>
      );
    }

    return (
      <>
        <div className="fw-bold">{event.title}</div>
        {event.extendedProps.description}
      </>
    );
  };

  const renderDayGridMonth = (event, view, width) => {
    if (width < 540) {
      return <div className="fc-daygrid-event-dot" />;
    }

    return (
      <>
        <div
          className={`fc-daygrid-event-dot border-color-${
            calendarsColor[event.extendedProps.status ?? 1]
          }`}
        ></div>
        <div className="fc-event-time">
          {moment(event.startStr).format("HH:mm")}
        </div>
        <div className="fc-event-title">
          {event.extendedProps.customer?.name}
        </div>
      </>
    );
  };

  const setCustomerInputChangeHandler = async (inputValue) => {
    const originalPromiseResult = await dispatch(
      getCustomer({ search_param: inputValue })
    );
    const resultAction = unwrapResult(originalPromiseResult);
    return resultAction.data.items;
  };

  const customerSearchPromiseOption = async (inputValue, callback) => {
    const rs = await setCustomerInputChangeHandler(inputValue);
    callback(
      rs.map((i) => ({
        label: i.name + " - " + (i.phone ?? "Không có SĐT"),
        value: i.id,
        id: i.id,
      }))
    );
  };

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
        onChange={(data) => {
          setCustomerSelect(data);
          onCustomerChange(data);
        }}
        loadOptions={customerSearchPromiseOption}
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
      </CardBody>
    </Card>
  );
};

export default memo(Calendar);
