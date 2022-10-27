// ** React Import
import { useState, useEffect } from "react";

// ** Custom Components
import Sidebar from "@components/sidebar";
import ToastComponent from "../../../components/toastComponent";

// ** Utils

// ** Third Party Components
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { Check } from "react-feather";

// ** Reactstrap Imports
import { Button, Label, Form, Input } from "reactstrap";

// ** Store & Actions
import { useDispatch } from "react-redux";
import { addCustomer, updateCustomer } from "../../../../redux/customer";

const defaultValues = {
  name: "",
  phone: "",
};

const checkIsValid = (data) => {
  return Object.values(data).every((field) =>
    typeof field === "object" ? field !== null : field.length > 0
  );
};

const SidebarNewUsers = ({ open, toggleSidebar, item }) => {
  // ** States
  const [data, setData] = useState(null);
  const [isUpdate, setIsUpdate] = useState(item !== null);

  //** Use Effect */
  useEffect(() => {
    setIsUpdate(item != null);
    if (item) {
      setValue("name", item.name);
      setValue("phone", item.phone);
    }
  }, [item]);

  // ** Store Vars
  const dispatch = useDispatch();

  // ** Vars
  const {
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  // ** Function to handle form submit
  const onSubmit = (data) => {
    setData(data);
    if (checkIsValid(data)) {
      if (isUpdate) {
        data.id = item.id;
      }
      handleAddUpdateCustomer(data);
    } else {
      for (const key in data) {
        if (data[key] !== null && data[key].length === 0) {
          setError(key, {
            type: "manual",
          });
        }
      }
    }
  };

  const handleAddUpdateCustomer = async (customerInfo) => {
    dispatch(
      isUpdate ? updateCustomer(customerInfo) : addCustomer(customerInfo)
    )
      .unwrap()
      .then((rs) => {
        toggleSidebar();
        toast.success(
          <ToastComponent
            title={`Đã ${isUpdate ? "sửa" : "thêm"} khách hàng`}
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
      .catch((err) => {
        toggleSidebar();
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

  const handleSidebarClosed = () => {
    for (const key in defaultValues) {
      setValue(key, "");
    }
  };

  return (
    <Sidebar
      size="lg"
      open={open}
      title={`${isUpdate ? "Sửa" : "Thêm"} khách hàng`}
      headerClassName="mb-1"
      contentClassName="pt-0"
      toggleSidebar={toggleSidebar}
      onClosed={handleSidebarClosed}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-1">
          <Label className="form-label" for="name">
            Tên khách hàng <span className="text-danger">*</span>
          </Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="Tên khách hàng"
                invalid={errors.name && true}
                {...field}
              />
            )}
          />
        </div>

        <div className="mb-1">
          <Label className="form-label" for="phone">
            Số điện thoại <span className="text-danger">*</span>
          </Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                id="phone"
                placeholder="Số điện thoại"
                invalid={errors.phone && true}
                {...field}
              />
            )}
          />
        </div>
        <Button type="submit" className="me-1" color="primary">
          Gửi
        </Button>
        <Button type="reset" color="secondary" outline onClick={toggleSidebar}>
          Huỷ
        </Button>
      </Form>
    </Sidebar>
  );
};

export default SidebarNewUsers;
