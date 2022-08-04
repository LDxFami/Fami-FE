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
import {
  addAppointment,
  selectAppointment,
  updateAppointment,
} from "../../../redux/appointment";

// ** Toast Component
const ToastComponent = ({ title, icon, color, message = "" }) => (
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
  const { role, open, dispatch, refetchEvents, handleAddEventSidebar } = props;

  // ** Vars & Hooks
  const { setError, setValue, getValues, handleSubmit } = useForm({
    defaultValues: { title: "" },
  });

  const customerStore = useSelector((state) => state.customer);
  const doctorStore = useSelector((state) => state.doctor);
  const appointmentStore = useSelector((state) => state.appointment);

  const { customers, customer: customerStoreVal } = customerStore;
  const { doctors } = doctorStore;
  const { appointment, selectedAppointment } = appointmentStore;

  // ** States
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState({ value: 1, label: "Hiệu lực" });
  const [startTime, setStartTime] = useState(new Date().setMinutes(0));
  const [endTime, setEndTime] = useState(new Date().setMinutes(0));
  const [startPicker, setStartPicker] = useState(new Date());
  const [customer, setCustomer] = useState();
  const [doctor, setDoctor] = useState();
  const [customerModal, setCustomerModal] = useState(false);
  const [customerInput, setCustomerInput] = useState({ phone: "", name: "" });
  const [isUpdate, setUpdate] = useState(false);

  //** Effects
  useEffect(() => {
    dispatch(getDoctor());
    dispatch(getCustomer());
  }, []);

  useEffect(() => {
    setUpdate(
      !(
        isObjEmpty(selectedAppointment) ||
        (!isObjEmpty(selectedAppointment) && !selectedAppointment.title.length)
      )
    );
  }, [selectedAppointment]);

  const statusOptions = [
    { value: 0, label: "Đã huỷ" },
    { value: 1, label: "Hiệu lực" },
  ];

  // ** Adds New Event
  const handleAddEvent = () => {
    const appointmentInfo = {
      doctor_id: doctor && doctor.length > 0 ? doctor[0].id : "",
      customer_id: customer && customer.length > 0 ? customer[0].id : "",
      date: moment(startPicker).format("YYYY-MM-DD"),
      time_start: moment(startTime).format("HH:mm:00"),
      time_end: moment(endTime).format("HH:mm:00"),
      status,
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
        refetchEvents();
        handleAddEventSidebar();
      })
      .catch((err) => {
        const {error} = err;
        toast.error(
          <ToastComponent
            title="Có lỗi xảy ra"
            color="warning"
            icon={<Check />}
            message={error}
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

  // ** Reset Input Values on Close
  const handleResetInputValues = () => {
    // dispatch(selectEvent({}));
    setDesc("");
    setCustomer(null);
    setDoctor(null);
    setStartPicker(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    dispatch(selectAppointment({}));
    setStatus({ value: 1, label: "Hiệu lực" });
    dispatch(getDoctor());
  };

  // ** Set sidebar fields
  const handleSelectedEvent = () => {
    if (!isObjEmpty(selectedAppointment)) {
      setDesc(selectedAppointment.extendedProps?.description || desc);
      setStartPicker(new Date(selectedAppointment.start) || startPicker);
      setStatus(
        statusOptions.filter(
          (i) => i.value === selectedAppointment.extendedProps.status
        )
      );
      setStartTime(
        new Date(
          selectedAppointment.extendedProps.date +
            "T" +
            selectedAppointment.extendedProps?.startTime
        ) || startTime
      );
      setEndTime(
        new Date(
          selectedAppointment.extendedProps.date +
            "T" +
            selectedAppointment.extendedProps?.endTime
        ) || endTime
      );
      setCustomer(
        [
          {
            label:
              selectedAppointment.extendedProps?.customer.name +
              " - " +
              (selectedAppointment.extendedProps?.customer?.phone ?? "Không có SDT"),
            value: selectedAppointment.extendedProps?.customer.id,
            id: selectedAppointment.extendedProps?.customer.id,
          },
        ] || null
      );
      setDoctor(
        [
          {
            label: selectedAppointment.extendedProps?.doctor?.name,
            value: selectedAppointment.extendedProps?.doctor?.id,
            id: selectedAppointment.extendedProps?.doctor?.id,
          },
        ] || null
      );
      setInputChangeHandler(selectedAppointment.extendedProps?.customer?.name);
      onDoctorInputChange(selectedAppointment.extendedProps?.doctor?.name);
    }
  };

  // ** Updates Event in Store
  const handleUpdateEvent = () => {
    if (!isObjEmpty(selectedAppointment)) {
      const appointmentInfo = {
        id: selectedAppointment.extendedProps.id,
        doctor_id: doctor.length > 0 ? doctor[0].id : "",
        customer_id: customer.length ? customer[0].id : "",
        date: moment(startPicker).format("YYYY-MM-DD"),
        time_start: moment(startTime).format("HH:mm:00"),
        time_end: moment(endTime).format("HH:mm:00"),
        description: desc,
        status: status[0].value,
      };
      dispatch(updateAppointment(appointmentInfo))
        .unwrap()
        .then(() => {
          toast.success(
            <ToastComponent
              title="Đã cập nhật lịch hẹn"
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
          refetchEvents();
          handleAddEventSidebar();
        })
        .catch((err) => {
          const { error } = err;
          toast.error(
            <ToastComponent
              title="Có lỗi xảy ra"
              color="warning"
              icon={<Check />}
              message={error}
            />,
            {
              icon: false,
              autoClose: 2000,
              hideProgressBar: true,
              closeButton: false,
            }
          );
          setError("title", {
            type: "manual",
          });
        });
    }
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
    if (role == "admin") {
      if (
        isObjEmpty(selectedAppointment) ||
        (!isObjEmpty(selectedAppointment) && !selectedAppointment.title.length)
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
            <Button
              className="me-1"
              color="primary"
              onClick={handleUpdateEvent}
            >
              Cập nhật
            </Button>
            {/* <Button color="danger" onClick={handleDeleteEvent} outline>
            Xoá
          </Button> */}
          </Fragment>
        );
      }
    } else {
      return <Fragment></Fragment>;
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
        const { error } = err;
        var errorMsg = error ? error : "";
        errorMsg = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1);
        toast.error(
          <ToastComponent
            title="Có lỗi xảy ra"
            color="warning"
            message={errorMsg}
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

  // const setInputChangeHandler = useCallback(
  //   _.debounce(async (inputValue) => {
  //     const originalPromiseResult = await dispatch(
  //       getCustomer({ search_param: inputValue })
  //     );
  //     const resultAction = unwrapResult(originalPromiseResult);
  //     return resultAction.data.items;
  //   }, 100),
  //   []
  // );

  const setInputChangeHandler = async (inputValue) => {
    const originalPromiseResult = await dispatch(
      getCustomer({ search_param: inputValue })
    );
    const resultAction = unwrapResult(originalPromiseResult);
    return resultAction.data.items;
  };

  const promiseOptions = async (inputValue, callback) => {
    const rs = await setInputChangeHandler(inputValue);
    callback(
      rs.map((i) => ({
        label: i.name + " - " + (i.phone ?? "Không có SĐT"),
        value: i.id,
        id: i.id,
      }))
    );
  };

  // const onDoctorInputChange = useCallback(
  //   _.debounce(async (inputValue) => {
  //     const originalPromiseResult = await dispatch(
  //       getDoctor({ search_param: inputValue })
  //     );
  //     const resultAction = unwrapResult(originalPromiseResult);
  //     return resultAction.data.items;
  //   }, 100),
  //   []
  // );

  const onDoctorInputChange = async (inputValue) => {
    const originalPromiseResult = await dispatch(
      getDoctor({ search_param: inputValue })
    );
    const resultAction = unwrapResult(originalPromiseResult);
    return resultAction.data.items;
  };

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
          {isUpdate ? "Cập nhật" : "Thêm"} Lịch Hẹn
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
              <Label required className="form-label" for="customer">
                Khách hàng
              </Label>
              <AsyncCreatableSelect
                required
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
                isDisabled={role != "admin"}
                formatCreateLabel={(inputValue)=>{return `Tạo khách hàng "${inputValue}"`}}
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
                isDisabled={role != "admin"}
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
                disabled={role != "admin"}
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
                  dateFormat: "H:i",
                  enableTime: true,
                  noCalendar: true,
                  enableSeconds:false,
                  time_24hr: true,
                }}
                disabled={role != "admin"}
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
                  dateFormat: "H:i",
                  enableTime: true,
                  noCalendar: true,
                  time_24hr: true,
                  enableSeconds:false
                }}
                disabled={role != "admin"}
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
                disabled={role != "admin"}
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
                isDisabled={!isUpdate || role != "admin"}
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
