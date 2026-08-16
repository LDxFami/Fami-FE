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
import { useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useForm } from "react-hook-form";
import moment from "moment";
import { addCustomer, searchCustomers } from "../../../redux/customer";
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
  AsyncPaginateSelect,
  AsyncPaginateCreatableSelect,
  createPaginatedNameLoadOptions,
  NAME_SEARCH_LIMIT,
  NAME_SEARCH_DEBOUNCE_MS,
} from "../../../utility/asyncNameSearch";

// ** Styles Imports
import "@styles/react/libs/react-select/_react-select.scss";
import "@styles/react/libs/flatpickr/flatpickr.scss";
import AddCustomerModal from "../../components/addCustomerModal";
import { searchDoctors } from "../../../redux/doctor";
import {
  addAppointment,
  selectAppointment,
  updateAppointment,
  checkOverlapAppointment,
} from "../../../redux/appointment";
import OverlapModal from "../../components/overlapModal";

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

const optionId = (option) => option?.id ?? option?.value ?? "";

const AddEventSidebar = (props) => {
  const { canModify, open, dispatch, refetchEvents, handleAddEventSidebar } =
    props;

  const { setError, handleSubmit } = useForm({
    defaultValues: { title: "" },
  });

  const appointmentStore = useSelector((state) => state.appointment);
  const { selectedAppointment } = appointmentStore;

  const [desc, setDesc] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [status, setStatus] = useState({ value: 1, label: "Hiệu lực" });
  const [startTime, setStartTime] = useState(new Date().setHours(8, 0, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(8, 30, 0, 0));
  const [startPicker, setStartPicker] = useState(new Date());
  const [customer, setCustomer] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [secondaryDoctor, setSecondaryDoctor] = useState(null);
  const [customerModal, setCustomerModal] = useState(false);
  const [customerInput, setCustomerInput] = useState({ phone: "", name: "" });
  const [isUpdate, setUpdate] = useState(false);
  const [overlapModal, setoverlapModal] = useState(false);
  const [overlapMsg, setoverlapMsg] = useState("");

  useEffect(() => {
    setUpdate(
      !(
        isObjEmpty(selectedAppointment) ||
        (!isObjEmpty(selectedAppointment) && !selectedAppointment.title?.length)
      )
    );
  }, [selectedAppointment]);

  const statusOptions = [
    { value: 0, label: "Đã huỷ" },
    { value: 1, label: "Hiệu lực" },
    { value: 2, label: "Đã hoàn thành" },
  ];

  const handleAddEvent = () => {
    const appointmentInfo = {
      doctor_id: optionId(doctor),
      customer_id: optionId(customer),
      secondary_doctor_id: optionId(secondaryDoctor),
      date: moment(startPicker).format("YYYY-MM-DD"),
      time_start: moment(startTime).format("HH:mm:00"),
      time_end: moment(endTime).format("HH:mm:00"),
      status: status?.value ?? 1,
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

  const handleResetInputValues = () => {
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

  const handleSelectedEvent = () => {
    if (isObjEmpty(selectedAppointment)) return;

    const start = selectedAppointment.start
      ? new Date(selectedAppointment.start)
      : new Date();
    setStartPicker(start);

    const hasExisting = Boolean(selectedAppointment.title?.length);
    if (!hasExisting) {
      // New appointment from dateClick — apply clicked date/time defaults
      const startT =
        selectedAppointment.extendedProps?.startTime ||
        moment(start).format("HH:mm:00");
      const endT =
        selectedAppointment.extendedProps?.endTime ||
        moment(start).add(30, "minutes").format("HH:mm:00");
      const dateStr =
        selectedAppointment.extendedProps?.date ||
        moment(start).format("YYYY-MM-DD");
      setStartTime(new Date(`${dateStr}T${startT}`));
      setEndTime(new Date(`${dateStr}T${endT}`));
      setDesc(selectedAppointment.extendedProps?.description || "");
      setIsImportant(!!selectedAppointment.extendedProps?.isImportant);
      setStatus({ value: 1, label: "Hiệu lực" });
      setCustomer(null);
      setDoctor(null);
      setSecondaryDoctor(null);
      return;
    }

    setDesc(selectedAppointment.extendedProps?.description || "");
    setIsImportant(!!selectedAppointment.extendedProps?.isImportant);
    setStatus(
      statusOptions.find(
        (i) => i.value === selectedAppointment.extendedProps.status
      ) || statusOptions[1]
    );
    setStartTime(
      new Date(
        selectedAppointment.extendedProps.date +
          "T" +
          selectedAppointment.extendedProps?.startTime
      )
    );
    setEndTime(
      new Date(
        selectedAppointment.extendedProps.date +
          "T" +
          selectedAppointment.extendedProps?.endTime
      )
    );
    setCustomer(
      selectedAppointment.extendedProps?.customer
        ? {
            label:
              selectedAppointment.extendedProps.customer.name +
              " - " +
              (selectedAppointment.extendedProps.customer?.phone ??
                "Không có SDT"),
            value: selectedAppointment.extendedProps.customer.id,
            id: selectedAppointment.extendedProps.customer.id,
          }
        : null
    );
    setDoctor(
      selectedAppointment.extendedProps?.doctor
        ? {
            label: selectedAppointment.extendedProps.doctor.name,
            value: selectedAppointment.extendedProps.doctor.id,
            id: selectedAppointment.extendedProps.doctor.id,
          }
        : null
    );
    setSecondaryDoctor(
      selectedAppointment.extendedProps?.secondaryDoctor
        ? {
            label: selectedAppointment.extendedProps.secondaryDoctor.name,
            value: selectedAppointment.extendedProps.secondaryDoctor.id,
            id: selectedAppointment.extendedProps.secondaryDoctor.id,
          }
        : null
    );
  };

  const handleUpdateEvent = () => {
    if (!isObjEmpty(selectedAppointment) && selectedAppointment.title?.length) {
      const appointmentInfo = {
        id: selectedAppointment.extendedProps.id,
        doctor_id: optionId(doctor),
        secondary_doctor_id: optionId(secondaryDoctor),
        customer_id: optionId(customer),
        date: moment(startPicker).format("YYYY-MM-DD"),
        time_start: moment(startTime).format("HH:mm:00"),
        time_end: moment(endTime).format("HH:mm:00"),
        description: desc,
        is_important: isImportant,
        status: status?.value ?? 1,
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

  const EventActions = () => {
    if (!canModify) return <Fragment></Fragment>;

    if (
      isObjEmpty(selectedAppointment) ||
      (!isObjEmpty(selectedAppointment) && !selectedAppointment.title?.length)
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
    }

    return (
      <Fragment>
        <Button className="me-1" color="primary" onClick={onCheckOverlap}>
          Cập nhật
        </Button>
      </Fragment>
    );
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
        setCustomer({
          label:
            rs.data.customer.name +
            " - " +
            (rs.data.customer.phone ?? "Không có SĐT"),
          value: rs.data.customer.id,
          id: rs.data.customer.id,
        });
      })
      .catch((err) => {
        const { error } = err;
        let errorMsg = error ? error : "";
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

  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={handleAddEventSidebar} />
  );

  const customerLoadOptions = useMemo(
    () =>
      createPaginatedNameLoadOptions(async (inputValue, page, abortSignal) => {
        const params = {
          limit: NAME_SEARCH_LIMIT,
          page,
          abortSignal,
        };
        if (inputValue) {
          params.search_param = inputValue;
        }
        const originalPromiseResult = await dispatch(searchCustomers(params));
        const resultAction = unwrapResult(originalPromiseResult);
        const items = resultAction.data.items || [];
        return {
          options: items.map((i) => ({
            label: i.name + " - " + (i.phone ?? "Không có SĐT"),
            value: i.id,
            id: i.id,
          })),
          hasMore:
            resultAction.data.has_more ?? items.length >= NAME_SEARCH_LIMIT,
        };
      }),
    [dispatch]
  );

  const doctorLoadOptions = useMemo(
    () =>
      createPaginatedNameLoadOptions(async (inputValue, page, abortSignal) => {
        const params = {
          limit: NAME_SEARCH_LIMIT,
          page,
          abortSignal,
        };
        if (inputValue) {
          params.search_param = inputValue;
        }
        const originalPromiseResult = await dispatch(searchDoctors(params));
        const resultAction = unwrapResult(originalPromiseResult);
        const items = resultAction.data.items || [];
        return {
          options: items.map((i) => ({
            label: i.name,
            value: i.id,
            id: i.id,
          })),
          hasMore:
            resultAction.data.has_more ?? items.length >= NAME_SEARCH_LIMIT,
        };
      }),
    [dispatch]
  );

  const handleCreate = (inputValue) => {
    let customerVal = customerInput;
    const rxNumber = new RegExp("^([0-9])+$");
    if (rxNumber.test(inputValue)) {
      customerVal = { ...customerInput, phone: inputValue };
    } else {
      customerVal = { ...customerInput, name: inputValue };
    }
    setCustomerInput(customerVal);
    setCustomerModal(true);
  };

  const onCheckOverlap = async () => {
    const appointmentInfo = {
      id: isUpdate ? selectedAppointment?.extendedProps?.id : null,
      doctor_id: optionId(doctor),
      secondary_doctor_id: optionId(secondaryDoctor) || null,
      customer_id: optionId(customer),
      date: moment(startPicker).format("YYYY-MM-DD"),
      time_start: moment(startTime).format("HH:mm:00"),
      time_end: moment(endTime).format("HH:mm:00"),
      description: desc,
      is_important: isImportant,
      status: status?.value ?? 1,
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
              <AsyncPaginateCreatableSelect
                required
                placeholder=""
                id="customer"
                value={customer}
                theme={selectThemeColors}
                className="react-select"
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setCustomer(data)}
                onCreateOption={handleCreate}
                loadOptions={customerLoadOptions}
                additional={{ page: 1 }}
                debounceTimeout={NAME_SEARCH_DEBOUNCE_MS}
                defaultOptions
                filterOption={null}
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
              <AsyncPaginateSelect
                placeholder=""
                id="doctor"
                value={doctor}
                theme={selectThemeColors}
                defaultOptions
                additional={{ page: 1 }}
                debounceTimeout={NAME_SEARCH_DEBOUNCE_MS}
                filterOption={null}
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setDoctor(data)}
                isDisabled={!canModify}
                loadOptions={doctorLoadOptions}
                cacheUniqs={["primary-doctor"]}
              />
            </div>
            <div className="mb-1">
              <Label className="form-label" for="secondary-doctor">
                Bác sĩ 2
              </Label>
              <AsyncPaginateSelect
                placeholder=""
                id="secondary-doctor"
                value={secondaryDoctor}
                theme={selectThemeColors}
                classNamePrefix="select"
                defaultOptions
                additional={{ page: 1 }}
                debounceTimeout={NAME_SEARCH_DEBOUNCE_MS}
                filterOption={null}
                isClearable={true}
                onChange={(data) => setSecondaryDoctor(data)}
                isDisabled={!canModify}
                loadOptions={doctorLoadOptions}
                cacheUniqs={["secondary-doctor"]}
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
                classNamePrefix="select"
                isClearable={false}
                onChange={(data) => setStatus(data)}
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
