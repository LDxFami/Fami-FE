// ** React Imports
import { useEffect, useState } from "react";

// ** Custom Components
import Sidebar from "@components/sidebar";
import ToastComponent from "../../../components/toastComponent";

// ** Third Party
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { Check } from "react-feather";

// ** Reactstrap Imports
import { Button, Label, Form, Input, FormFeedback, Spinner } from "reactstrap";

// ** Store & Actions
import { useDispatch } from "react-redux";
import { addUser, updateUser } from "../../../../redux/users";

const defaultValues = {
  name: "",
  email: "",
  password: "",
};

const SidebarUser = ({ open, toggleSidebar, selectedUser }) => {
  const isUpdate = selectedUser !== null;
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (selectedUser) {
      setValue("name", selectedUser.name ?? "");
      setValue("email", selectedUser.email ?? "");
      setValue("password", "");
    } else {
      reset(defaultValues);
    }
  }, [selectedUser]);

  const handleSidebarClosed = () => {
    reset(defaultValues);
  };

  const onSubmit = (data) => {
    const payload = { name: data.name, email: data.email };
    if (isUpdate) {
      payload.id = selectedUser.id;
      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }
    } else {
      payload.password = data.password;
    }
    setIsSubmitting(true);
    dispatch(isUpdate ? updateUser(payload) : addUser(payload))
      .unwrap()
      .then(() => {
        toggleSidebar();
        toast.success(
          <ToastComponent
            title={`Đã ${isUpdate ? "cập nhật" : "thêm"} người dùng thành công`}
            color="success"
            icon={<Check />}
          />,
          { icon: false, autoClose: 2000, hideProgressBar: true, closeButton: false }
        );
      })
      .catch((err) => {
        const errorMsg = err?.error ?? err?.message ?? "Đã có lỗi xảy ra";
        toast.error(
          <ToastComponent
            title="Có lỗi xảy ra"
            color="warning"
            message={typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)}
            icon={<Check />}
          />,
          { icon: false, autoClose: 3000, hideProgressBar: true, closeButton: false }
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Sidebar
      size="lg"
      open={open}
      title={isUpdate ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      headerClassName="mb-1"
      contentClassName="pt-0"
      toggleSidebar={toggleSidebar}
      onClosed={handleSidebarClosed}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-1">
          <Label className="form-label" for="name">
            Họ tên <span className="text-danger">*</span>
          </Label>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Họ tên không được bỏ trống" }}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="Nhập họ tên"
                invalid={!!errors.name}
                {...field}
              />
            )}
          />
          {errors.name && (
            <FormFeedback>{errors.name.message}</FormFeedback>
          )}
        </div>

        <div className="mb-1">
          <Label className="form-label" for="email">
            Email <span className="text-danger">*</span>
          </Label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email không được bỏ trống",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ",
              },
            }}
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                invalid={!!errors.email}
                {...field}
              />
            )}
          />
          {errors.email && (
            <FormFeedback>{errors.email.message}</FormFeedback>
          )}
        </div>

        <div className="mb-1">
          <Label className="form-label" for="password">
            {isUpdate ? (
              <>
                Mật khẩu mới{" "}
                <small className="text-muted">(để trống nếu không thay đổi)</small>
              </>
            ) : (
              <>Mật khẩu <span className="text-danger">*</span></>
            )}
          </Label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: isUpdate ? false : "Mật khẩu không được bỏ trống",
              minLength: {
                value: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự",
              },
            }}
            render={({ field }) => (
              <Input
                id="password"
                type="password"
                placeholder={isUpdate ? "Nhập mật khẩu mới" : "Nhập mật khẩu"}
                invalid={!!errors.password}
                {...field}
              />
            )}
          />
          {errors.password && (
            <FormFeedback>{errors.password.message}</FormFeedback>
          )}
        </div>

        <div className="d-flex mt-2">
          <Button type="submit" className="me-1" color="primary" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="me-50" />}
            {isUpdate ? "Cập nhật" : "Thêm mới"}
          </Button>
          <Button type="button" color="secondary" outline onClick={toggleSidebar} disabled={isSubmitting}>
            Huỷ
          </Button>
        </div>
      </Form>
    </Sidebar>
  );
};

export default SidebarUser;
