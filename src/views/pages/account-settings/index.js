// ** React Imports
import { Fragment, useState } from "react";

// ** Third Party Components
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { Check } from "react-feather";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  Label,
  Button,
  FormFeedback,
  Spinner,
} from "reactstrap";

// ** Custom Components
import Breadcrumbs from "@components/breadcrumbs";
import InputPasswordToggle from "@components/input-password-toggle";
import ToastComponent from "../../components/toastComponent";

// ** Store & Actions
import { useDispatch } from "react-redux";
import { updatePassword } from "../../../redux/user";

const MIN_PASSWORD_LENGTH = 8;

const defaultValues = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

const AccountSettings = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const newPassword = watch("password");
  const currentPassword = watch("current_password");

  const onSubmit = (data) => {
    setIsSubmitting(true);
    dispatch(updatePassword(data))
      .unwrap()
      .then(() => {
        reset(defaultValues);
        toast.success(
          <ToastComponent
            title="Đã đổi mật khẩu"
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
        const errorMsg = err?.error ?? err?.message ?? "Đã có lỗi xảy ra";
        toast.error(
          <ToastComponent
            title="Có lỗi xảy ra"
            color="warning"
            message={
              typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)
            }
            icon={<Check />}
          />,
          {
            icon: false,
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
          }
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Fragment>
      <Breadcrumbs
        breadCrumbTitle="Tài khoản"
        breadCrumbParent="Trang cá nhân"
        breadCrumbActive="Đổi mật khẩu"
      />
      <Row>
        <Col md="8" lg="6">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-1">
                  <Label className="form-label" for="current_password">
                    Mật khẩu hiện tại <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="current_password"
                    control={control}
                    rules={{
                      required: "Mật khẩu hiện tại không được bỏ trống",
                    }}
                    render={({ field }) => (
                      <InputPasswordToggle
                        id="current_password"
                        className="input-group-merge"
                        invalid={!!errors.current_password}
                        {...field}
                      />
                    )}
                  />
                  {errors.current_password && (
                    <FormFeedback className="d-block">
                      {errors.current_password.message}
                    </FormFeedback>
                  )}
                </div>

                <div className="mb-1">
                  <Label className="form-label" for="password">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Mật khẩu mới không được bỏ trống",
                      minLength: {
                        value: MIN_PASSWORD_LENGTH,
                        message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
                      },
                      validate: (value) =>
                        value !== currentPassword ||
                        "Mật khẩu mới phải khác mật khẩu hiện tại",
                    }}
                    render={({ field }) => (
                      <InputPasswordToggle
                        id="password"
                        className="input-group-merge"
                        invalid={!!errors.password}
                        {...field}
                      />
                    )}
                  />
                  {errors.password && (
                    <FormFeedback className="d-block">
                      {errors.password.message}
                    </FormFeedback>
                  )}
                </div>

                <div className="mb-1">
                  <Label className="form-label" for="password_confirmation">
                    Xác nhận mật khẩu mới{" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="password_confirmation"
                    control={control}
                    rules={{
                      required: "Xác nhận mật khẩu không được bỏ trống",
                      validate: (value) =>
                        value === newPassword ||
                        "Xác nhận mật khẩu không khớp",
                    }}
                    render={({ field }) => (
                      <InputPasswordToggle
                        id="password_confirmation"
                        className="input-group-merge"
                        invalid={!!errors.password_confirmation}
                        {...field}
                      />
                    )}
                  />
                  {errors.password_confirmation && (
                    <FormFeedback className="d-block">
                      {errors.password_confirmation.message}
                    </FormFeedback>
                  )}
                </div>

                <div className="d-flex mt-2">
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Spinner size="sm" className="me-50" />}
                    Đổi mật khẩu
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default AccountSettings;
