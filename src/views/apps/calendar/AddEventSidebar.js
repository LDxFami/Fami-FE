// ** React Imports
import { Fragment, useState, useEffect, useCallback } from "react";
import { unwrapResult } from "@reduxjs/toolkit";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Third Party Components
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import { X, Check } from "react-feather";
import Select, { components } from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";
import AsyncSelect from "react-select/async";

import { useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useForm, Controller } from "react-hook-form";
import _ from "lodash";
import moment from "moment";
import { addCustomer, getCustomer } from "../../../redux/customer";
// ** Reactstrap Imports
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  Form,
} from "reactstrap";

// ** Utils
import { selectThemeColors, isObjEmpty } from "@utils";

// ** Styles Imports
import "@styles/react/libs/react-select/_react-select.scss";
import "@styles/react/libs/flatpickr/flatpickr.scss";
import AddCustomerModal from "../../components/addCustomerModal";
import { getDoctor } from "../../../redux/doctor";
import { addAppointment } from "../../../redux/\bappointment";

// ** Toast Component
const ToastComponent = ({ title, icon, color, message }) => (
  <Fragment>
    <div className="toastify-header pb-0">
      <div className="title-wrapper">
        <Avatar size="sm" color={color} icon={icon} />
        <h6 className="toast-title">{title}</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </Fragment>
);

const AddEventSidebar = (props) => {
  // ** Props
  const {
    open,
    dispatch,
    calendarApi,
    updateEvent,
    removeEvent,
    refetchEvents,
    handleAddEventSidebar,
  } = props;

  // ** Vars & Hooks
  const
    {
      setError,
      setValue,
      getValues,
      handleSubmit,
    } = useForm({
      defaultValues: { title: "" },
    });

  const customerStore = useSelector((state) => state.customer);
  const doctorStore = useSelector((state) => state.doctor);
  const appointmentStore = useSelector((state) => state.appointment);

  const { customers, customer: customerStoreVal } = customerStore;
  const { doctors } = doctorStore;
  const {appointment} = appointmentStore;

  // ** States
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [guests, setGuests] = useState({});
  const [allDay, setAllDay] = useState(false);
  const [status, setStatus] = useState(null);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [startPicker, setStartPicker] = useState(new Date());
  const [customer, setCustomer] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [customerModal, setCustomerModal] = useState(false);
  const [customerInput, setCustomerInput] = useState({ phone: "", name: "" });
  //** Effects
  useEffect(() => {
    dispatch(getCustomer({}));
  }, [dispatch]);

  const statusOptions = [
    { value: 0, label: "Donna Frank" },
    { value: 1, label: "Jane Foster" },
  ];

  // ** Custom select components
  const OptionComponent = ({ data, ...props }) => {
    return (
      <components.Option {...props}>
        <span className={`bullet bullet-${data.color} bullet-sm me-50`}></span>
        {data.name}
      </components.Option>
    );
  };


  // ** Adds New Event
  const handleAddEvent = () => {
    

    const appointmentInfo = {
      doctor_id: doctor[0].id,
      customer_id: customer[0].id,
      date: moment(startPicker).format('YYYY-MM-DD'),
      time_start: moment(startTime).format('HH:MM:00'),
      time_end: moment(endTime).format('HH:MM:00'),
      description: desc,
    };
    dispatch(addAppointment(appointmentInfo))
    .unwrap()
    .then(() => {
      toast.success(
        <ToastComponent
          title="Đã thêm lịch hẹn"
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
    })
    .catch(() => {
      toast.error(
        <ToastComponent
          title="Có lỗi xảy ra"
          color="warning"
          icon={<Check />}
        />,
        {
          icon: false,
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
        }
      );
    });
    refetchEvents();
    handleAddEventSidebar();
  };

  // ** Reset Input Values on Close
  const handleResetInputValues = () => {
    // dispatch(selectEvent({}));
    setDesc("");
    setCustomer(null);
    setDoctor(null);
    setStartPicker(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
  };

  // ** Set sidebar fields
  const handleSelectedEvent = () => {
    // if (!isObjEmpty(selectedEvent)) {
    //   const calendar = selectedEvent.extendedProps.calendar;

    //   const resolveLabel = () => {
    //     if (calendar.length) {
    //       return {
    //         label: calendar,
    //         value: calendar,
    //         color: calendarsColor[calendar],
    //       };
    //     } else {
    //       return { value: "Cá nhân", label: "Cá nhân", color: "primary" };
    //     }
    //   };
    //   setValue("title", appointment.title || getValues("title"));
    //   setAllDay(appointment.allDay || allDay);
    //   setUrl(appointment.url || url);
    //   setStatus(appointment.extendedProps.status || status);
    //   setDesc(appointment.extendedProps.description || desc);
    //   setGuests(appointment.extendedProps.guests || guests);
    //   setStartPicker(new Date(appointment.start));
    //   setStartTime(
    //     appointment.allDay
    //       ? new Date(appointment.start)
    //       : new Date(appointment.end)
    //   );
    //   setEndTime(
    //     appointment.allDay
    //       ? new Date(appointment.start)
    //       : new Date(appointment.end)
    //   );
    //   setCustomer([resolveLabel()]);
    // }
  };

  // ** (UI) updateEventInCalendar
  const updateEventInCalendar = (
    updatedEventData,
    propsToUpdate,
    extendedPropsToUpdate
  ) => {
    const existingEvent = calendarApi.getEventById(updatedEventData.id);

    // ** Set event properties except date related
    // ? Docs: https://fullcalendar.io/docs/Event-setProp
    // ** dateRelatedProps => ['start', 'end', 'allDay']
    // ** eslint-disable-next-line no-plusplus
    for (let index = 0; index < propsToUpdate.length; index++) {
      const propName = propsToUpdate[index];
      existingEvent.setProp(propName, updatedEventData[propName]);
    }

    // ** Set date related props
    // ? Docs: https://fullcalendar.io/docs/Event-setDates
    existingEvent.setDates(
      new Date(updatedEventData.start),
      new Date(updatedEventData.end),
      {
        allDay: updatedEventData.allDay,
      }
    );

    // ** Set event's extendedProps
    // ? Docs: https://fullcalendar.io/docs/Event-setExtendedProp
    // ** eslint-disable-next-line no-plusplus
    for (let index = 0; index < extendedPropsToUpdate.length; index++) {
      const propName = extendedPropsToUpdate[index];
      existingEvent.setExtendedProp(
        propName,
        updatedEventData.extendedProps[propName]
      );
    }
  };

  // ** Updates Event in Store
  const handleUpdateEvent = () => {
    if (getValues("title").length) {
      const eventToUpdate = {
        // id: selectedEvent.id,
        title: getValues("title"),
        allDay,
        start: startPicker,
        startTime,
        endTime,
        url,
        display: allDay === false ? "block" : undefined,
        extendedProps: {
          status,
          description: desc,
          guests,
          customer: customer[0].label,
        },
      };

      const propsToUpdate = ["id", "title", "url"];
      const extendedPropsToUpdate = [
        "calendar",
        "guests",
        "location",
        "description",
      ];
      dispatch(updateEvent(eventToUpdate));
      updateEventInCalendar(
        eventToUpdate,
        propsToUpdate,
        extendedPropsToUpdate
      );

      handleAddEventSidebar();
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
    } else {
      setError("title", {
        type: "manual",
      });
    }
  };

  // ** (UI) removeEventInCalendar
  const removeEventInCalendar = (eventId) => {
    calendarApi.getEventById(eventId).remove();
  };

  const handleDeleteEvent = () => {
    // dispatch(removeEvent(selectedEvent.id));
    // removeEventInCalendar(selectedEvent.id);
    handleAddEventSidebar();
    toast.error(
      <ToastComponent title="Event Removed" color="danger" icon={<Check />} />,
      {
        // toast.error(<ToastComponent title='Event Removed' color='danger' icon={<Trash />} />, {
        icon: false,
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
      }
    );
  };

  // ** Event Action buttons
  const EventActions = () => {
    if (
      isObjEmpty(appointment) ||
      (!isObjEmpty(appointment) && !appointment.description.length)
    ) {
      return (
        <Fragment>
          <Button className="me-1" type="submit" color="primary">
            Thêm
          </Button>
          <Button
            color="secondary"
            type="reset"
            onClick={handleAddEventSidebar}
            outline
          >
            Huỷ
          </Button>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <Button className="me-1" color="primary" onClick={handleUpdateEvent}>
            Cập nhật
          </Button>
          <Button color="danger" onClick={handleDeleteEvent} outline>
            Xoá
          </Button>
        </Fragment>
      );
    }
  };

  const handleToggleModal = () => {
    setCustomerModal(!customerModal);
  };

  const handleAddCustomer = async (customerInfo) => {
    dispatch(addCustomer(customerInfo))
      .unwrap()
      .then(() => {
        toast.success(
          <ToastComponent
            title="Đã thêm khách hàng"
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
        setCustomerModal(false);
      })
      .catch((err) => {
        toast.error(
          <ToastComponent
            title="Có lỗi xảy ra"
            color="warning"
            message={err.error?.phone[0] | ""}
            icon={<Check />}
          />,
          {
            icon: false,
            autoClose: 2000,
            hideProgressBar: true,
            closeButton: false,
          }
        );
      });
  };

  // ** Close BTN
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={handleAddEventSidebar} />
  );

  const setInputChangeHandler = useCallback(
    _.debounce(async (inputValue) => {
      const originalPromiseResult = await dispatch(
        getCustomer({ search_param: inputValue })
      );
      const resultAction = unwrapResult(originalPromiseResult);
      return resultAction.data.items;
    }, 100),
    []
  );

  const promiseOptions = async (inputValue, callback) => {
    const rs = await setInputChangeHandler(inputValue);
    callback(
      rs.map((i) => ({
        label: i.name + " - " + i.phone,
        value: i.id,
        id: i.id,
      }))
    );
  };

  const onDoctorInputChange = useCallback(
    _.debounce(async (inputValue) => {
      const originalPromiseResult = await dispatch(
        getDoctor({ search_param: inputValue })
      );
      const resultAction = unwrapResult(originalPromiseResult);
      return resultAction.data.items;
    }, 100),
    []
  );

  const doctorPromiseOptions = async (inputValue, callback) => {
    const rs = await onDoctorInputChange(inputValue);
    callback(
      rs.map((i) => ({
        label: i.name,
        value: i.id,
        id: i.id,
      }))
    );
  };

  const handleCreate = (inputValue) => {
    var customerVal = customerInput;
    var rxNumber = new RegExp("^([0-9])+$");
    if (rxNumber.test(inputValue)) {
      customerVal = { ...customerInput, phone: inputValue };
    } else {
      customerVal = { ...customerInput, name: inputValue };
    }
    setCustomerInput(customerVal);
    setCustomerModal(true);
  };

  return (
    <Modal
      isOpen={open}
      className="sidebar-lg"
      toggle={handleAddEventSidebar}
      onOpened={handleSelectedEvent}
      onClosed={handleResetInputValues}
      contentClassName="p-0 overflow-hidden"
      modalClassName="modal-slide-in event-sidebar"
    >
      <ModalHeader
        className="mb-1"
        toggle={handleAddEventSidebar}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">
          {appointment && appointment.description && appointment.description.length
            ? "Cập nhật"
            : "Thêm"}{" "}
          Lịch Hẹn
        </h5>
      </ModalHeader>
      <PerfectScrollbar options={{ wheelPropagation: false }}>
        <ModalBody className="flex-grow-1 pb-sm-0 pb-3">
          <Form
            onSubmit={handleSubmit(() => {
               handleAddEvent();
              // if (data.title.length) {
              //   if (isObjEmpty(errors)) {
              //     if (
              //       isObjEmpty(selectedEvent) ||
              //       (!isObjEmpty(selectedEvent) && !selectedEvent.title.length)
              //     ) {
              //       handleAddEvent();
              //     } else {
              //       handleUpdateEvent();
              //     }
              //     handleAddEventSidebar();
              //   }
              // } else {
              //   setError("title", {
              //     type: "manual",
              //   });
              // }
            })}
          >
            <div className="mb-1">
              <Label className="form-label" for="customer">
                Khách hàng
              </Label>
              <AsyncCreatableSelect
                placeholder="Khách hàng..."
                id="customer"
                value={customer}
                theme={selectThemeColors}
                className="react-select"
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setCustomer([data])}
                // components={{
                //   Option: GuestsComponent,
                // }}
                onCreateOption={handleCreate}
                loadOptions={promiseOptions}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="doctor">
                Bác sĩ
              </Label>
              <AsyncSelect
                placeholder="Bác sĩ..."
                id="doctor"
                value={doctor}
                theme={selectThemeColors}
                // className="react-select"
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setDoctor([data])}
                // components={{
                //   Option: OptionComponent,
                // }}
                loadOptions={doctorPromiseOptions}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="startDate">
                Ngày
              </Label>
              <Flatpickr
                required
                id="startDate"
                name="startDate"
                className="form-control"
                onChange={(date) => setStartPicker(date[0])}
                value={startPicker}
                options={{
                  dateFormat: "Y-m-d",
                }}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="startTime">
                Giờ bắt đầu
              </Label>
              <Flatpickr
                required
                id="startTime"
                name="startTime"
                className="form-control"
                onChange={(date) => setStartTime(date[0])}
                value={startTime}
                options={{
                  dateFormat: "H:i:00",
                  enableTime: true,
                  noCalendar: true,
                  time_24hr: true,
                }}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="endTime">
                Giờ kết thúc
              </Label>
              <Flatpickr
                required
                enableTime
                noCalendar
                id="endTime"
                name="endTime"
                className="form-control"
                onChange={(date) => setEndTime(date[0])}
                value={endTime}
                options={{
                  dateFormat: "H:i:00",
                  enableTime: true,
                  noCalendar: true,
                  time_24hr: true,
                }}
              />
            </div>
            <div className="mb-1">
              <Label className="form-label" for="description">
                Mô tả
              </Label>
              <Input
                type="textarea"
                name="text"
                id="description"
                rows="3"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả..."
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="status">
                Trạng thái
              </Label>
              <Select
                placeholder="Trạng thái..."
                id="status"
                value={status}
                options={statusOptions}
                theme={selectThemeColors}
                // className="react-select"
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setStatus([data])}
                components={{
                  Option: OptionComponent,
                }}
              />
            </div>

            <div className="d-flex mb-1">
              <EventActions />
            </div>
          </Form>
        </ModalBody>
        <AddCustomerModal
          isShow={customerModal}
          onShowToggle={handleToggleModal}
          value={customerInput}
          handleAddCustomer={(customerInfo) => {
            handleAddCustomer(customerInfo);
          }}
        />
      </PerfectScrollbar>
    </Modal>
  );
};

export default AddEventSidebar;
