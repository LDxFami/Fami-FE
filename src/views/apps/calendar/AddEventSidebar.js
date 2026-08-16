// ** React Imports
import { Fragment, useState, useEffect, useMemo } from "react";
import { unwrapResult } from "@reduxjs/toolkit";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Third Party Components
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import { X, Check } from "react-feather";
import Select from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";
import AsyncSelect from "react-select/async";

import { useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useForm } from "react-hook-form";
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
import {
  createDebouncedNameLoader,
  NAME_SEARCH_LIMIT,
} from "../../../utility/asyncNameSearch";

// ** Styles Imports
import "@styles/react/libs/react-select/_react-select.scss";
import "@styles/react/libs/flatpickr/flatpickr.scss";
import AddCustomerModal from "../../components/addCustomerModal";
import { getDoctor } from "../../../redux/doctor";
import {
  addAppointment,
  selectAppointment,
  updateAppointment,
  checkOverlapAppointment,
} from "../../../redux/appointment";
import OverlapModal from "../../components/overlapModal";

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
  const {
    canModify,
    open,
    dispatch,
    refetchEvents,
    handleAddEventSidebar,
  } = props;

  // ** Vars & Hooks
  const { setError, handleSubmit } = useForm({
    defaultValues: { title: "" },
  });

  const appointmentStore = useSelector((state) => state.appointment);

  const { selectedAppointment } = appointmentStore;

  // ** States
  const [desc, setDesc] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [status, setStatus] = useState({ value: 1, label: "Hiệu lực" });
  const [startTime, setStartTime] = useState(new Date().setHours(8, 0, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(8, 30, 0, 0));
  const [startPicker, setStartPicker] = useState(new Date());
  const [customer, setCustomer] = useState();
  const [doctor, setDoctor] = useState();
  const [secondaryDoctor, setSecondaryDoctor] = useState();
  const [customerModal, setCustomerModal] = useState(false);
  const [customerInput, setCustomerInput] = useState({ phone: "", name: "" });
  const [isUpdate, setUpdate] = useState(false);
  const [overlapModal, setoverlapModal] = useState(false);
  const [overlapMsg, setoverlapMsg] = useState("");

  //** Effects
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
    { value: 2, label: "Đã hoàn thành" },
  ];

  // ** Adds New Event
  const handleAddEvent = () => {
    const appointmentInfo = {
      doctor_id: doctor && doctor.length > 0 ? doctor[0].id : "",
      customer_id: customer && customer.length > 0 ? customer[0].id : "",
      secondary_doctor_id: secondaryDoctor && secondaryDoctor.length > 0 ? secondaryDoctor[0].id : "",
      date: moment(startPicker).format("YYYY-MM-DD"),
      time_start: moment(startTime).format("HH:mm:00"),
      time_end: moment(endTime).format("HH:mm:00"),
      status,
      description: desc,
      is_important: isImportant,
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
      });
  };

  // ** Reset Input Values on Close
  const handleResetInputValues = () => {
    // dispatch(selectEvent({}));
    setDesc("");
    setIsImportant(false);
    setCustomer(null);
    setDoctor(null);
    setSecondaryDoctor(null);
    setStartPicker(new Date());
    setStartTime(new Date().setHours(8, 0, 0, 0));
    setEndTime(new Date().setHours(8, 30, 0, 0));
    dispatch(selectAppointment({}));
    setStatus({ value: 1, label: "Hiệu lực" });
  };

  // ** Set sidebar fields
  const handleSelectedEvent = () => {
    if (!isObjEmpty(selectedAppointment)) {
      setDesc(selectedAppointment.extendedProps?.description || desc);
      setIsImportant(!!selectedAppointment.extendedProps?.isImportant);
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
              (selectedAppointment.extendedProps?.customer?.phone ??
                "Không có SDT"),
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
      setSecondaryDoctor(
        [
          {
            label: selectedAppointment.extendedProps?.secondaryDoctor?.name,
            value: selectedAppointment.extendedProps?.secondaryDoctor?.id,
            id: selectedAppointment.extendedProps?.secondaryDoctor?.id,
          },
        ] || null
      );
    }
  };

  // ** Updates Event in Store
  const handleUpdateEvent = () => {
    if (!isObjEmpty(selectedAppointment)) {
      const appointmentInfo = {
        id: selectedAppointment.extendedProps.id,
        doctor_id: doctor && doctor.length > 0 ? doctor[0].id : "",
        secondary_doctor_id: secondaryDoctor && secondaryDoctor.length > 0 && secondaryDoctor[0] ? secondaryDoctor[0].id : "",
        customer_id: customer && customer.length ? customer[0].id : "",
        date: moment(startPicker).format("YYYY-MM-DD"),
        time_start: moment(startTime).format("HH:mm:00"),
        time_end: moment(endTime).format("HH:mm:00"),
        description: desc,
        is_important: isImportant,
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


  // ** Event Action buttons
  const EventActions = () => {
    if (canModify) {
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
            <Button className="me-1" color="primary" onClick={onCheckOverlap}>
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

  const handleToggleOverlap = () => {
    setoverlapModal(false);
  };

  const handleAddCustomer = async (customerInfo) => {
    dispatch(addCustomer(customerInfo))
      .unwrap()
      .then((rs) => {
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

        const customerOptionItem = {
          label: rs.data.customer.name + " - " + (rs.data.customer.phone ?? "Không có SĐT"),
          value: rs.data.customer.id,
          id: rs.data.customer.id,
        };
        setCustomer([customerOptionItem]);
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

  const customerLoadOptions = useMemo(
    () =>
      createDebouncedNameLoader(async (inputValue) => {
        const params = {
          limit: NAME_SEARCH_LIMIT,
          page: 1,
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

  const doctorLoadOptions = useMemo(
    () =>
      createDebouncedNameLoader(async (inputValue) => {
        const params = {
          limit: NAME_SEARCH_LIMIT,
          page: 1,
        };
        if (inputValue) {
          params.search_param = inputValue;
        }
        const originalPromiseResult = await dispatch(getDoctor(params));
        const resultAction = unwrapResult(originalPromiseResult);
        return (resultAction.data.items || []).map((i) => ({
          label: i.name,
          value: i.id,
          id: i.id,
        }));
      }),
    [dispatch]
  );

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

  const onCheckOverlap = async () => {
    var isOverlap = false;
    const appointmentInfo = {
      id: isUpdate ? selectedAppointment?.extendedProps?.id : null,
      doctor_id: doctor && doctor.length > 0 ? doctor[0].id : "",
      secondary_doctor_id: secondaryDoctor && secondaryDoctor.length > 0 ? secondaryDoctor[0]?.id : null,
      customer_id: customer && customer.length ? customer[0].id : "",
      date: moment(startPicker).format("YYYY-MM-DD"),
      time_start: moment(startTime).format("HH:mm:00"),
      time_end: moment(endTime).format("HH:mm:00"),
      description: desc,
      is_important: isImportant,
      status: status.length ? status[0].value : 1,
    };
    await dispatch(checkOverlapAppointment(appointmentInfo))
      .unwrap()
      .then((rs) => {
        if (rs.is_overlap) {
          setoverlapModal(true);
          setoverlapMsg(rs.message);
        } else {
          isUpdate ? handleUpdateEvent() : handleAddEvent();
        }
      })
      .catch(() => {});
    return isOverlap;
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
              onCheckOverlap();
            })}
          >
            <div className="mb-1">
              <Label required className="form-label" for="customer">
                Khách hàng
              </Label>
              <AsyncCreatableSelect
                required
                placeholder=""
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
                loadOptions={customerLoadOptions}
                cacheOptions
                defaultOptions
                isDisabled={!canModify}
                formatCreateLabel={(inputValue) => {
                  return `Tạo khách hàng "${inputValue}"`;
                }}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="doctor">
                Bác sĩ
              </Label>
              <AsyncSelect
                placeholder=""
                id="doctor"
                value={doctor}
                theme={selectThemeColors}
                // className="react-select"
                defaultOptions
                cacheOptions
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setDoctor([data])}
                // components={{
                //   Option: OptionComponent,
                // }}
                isDisabled={!canModify}
                loadOptions={doctorLoadOptions}
              />
            </div>
            <div className="mb-1">
              <Label className="form-label" for="secondary-doctor">
                Bác sĩ 2
              </Label>
              <AsyncSelect
                placeholder=""
                id="secondary-doctor"
                value={secondaryDoctor}
                theme={selectThemeColors}
                // className="react-select"
                classNamePrefix="select"
                defaultOptions
                cacheOptions
                isClearable={true}
                onChange={(data) => setSecondaryDoctor([data])}
                // components={{
                //   Option: OptionComponent,
                // }}
                isDisabled={!canModify}
                loadOptions={doctorLoadOptions}
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
                  locale: {
                    firstDayOfWeek: 1,
                  },
                }}
                disabled={!canModify}
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
                  enableSeconds: false,
                  time_24hr: true,
                }}
                disabled={!canModify}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="endTime">
                Giờ kết thúc
              </Label>
              <Flatpickr
                required
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
                  enableSeconds: false,
                }}
                disabled={!canModify}
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
                placeholder=""
                disabled={!canModify}
              />
            </div>

            <div className="form-check form-switch mb-1">
              <Input
                type="switch"
                id="isImportant"
                name="isImportant"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                disabled={!canModify}
              />
              <Label className="form-check-label" for="isImportant">
                Ghi chú quan trọng
              </Label>
            </div>

            <div className="mb-1">
              <Label className="form-label" for="status">
                Trạng thái
              </Label>
              <Select
                placeholder=""
                id="status"
                value={status}
                options={statusOptions}
                theme={selectThemeColors}
                // className="react-select"
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setStatus([data])}
                isDisabled={!isUpdate || !canModify}
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
        <OverlapModal
          onShowToggle={handleToggleOverlap}
          handleOverlap={() => {
            isUpdate ? handleUpdateEvent() : handleAddEvent();
            setoverlapModal(false);
          }}
          message={overlapMsg}
          isShow={overlapModal}
        />
      </PerfectScrollbar>
    </Modal>
  );
};

export default AddEventSidebar;
