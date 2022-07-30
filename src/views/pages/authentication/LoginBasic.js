// ** React Imports
import { Link, useHistory } from "react-router-dom";

// ** Icons Imports
import { useState, Fragment, useCallback, useEffect, useRef } from "react";

// ** Custom Components
import InputPasswordToggle from "@components/input-password-toggle";

// ** Reactstrap Imports
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Form,
  Label,
  Input,
  Button,
} from "reactstrap";

// ** Styles
import "@styles/react/pages/page-authentication.scss";

// ** Custom Hooks
import useJwt from "@src/auth/jwt/useJwt";
import useDelay from "@src/utility/hooks/useDelay.js";
// ** Third Party Components
import { useDispatch } from "react-redux";
import { toast, Slide, Flip } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { Coffee } from "react-feather";

// ** Actions
import { handleLogin } from "@store/authentication";

// ** Custom Components
import Avatar from "@components/avatar";

import log from "@src/assets/images/logo/logo.png";

// ** Utils
import { getHomeRouteForLoggedInUser } from "@utils";

// ** Reactstrap Imports

// ** Styles
import "@styles/react/pages/page-authentication.scss";

const ToastContent = ({ name, role, message, isIcon = true, type }) => (
  <Fragment>
    <div className="toastify-header">
      <div className="title-wrapper">
        {isIcon ? (
          <Avatar size="sm" color={type} icon={<Coffee size={12} />} />
        ) : null}{" "}
        <h6 className="toast-title fw-bold">{name}</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </Fragment>
);

const defaultValues = {
  password: "password",
  loginEmail: "admin@admin.com",
};

const LoginBasic = () => {
  // ** Hooks
  const dispatch = useDispatch();
  const history = useHistory();
  const { delay } = useDelay();
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [isLogin, setIsLogin] = useState(false);

  const toastId = useRef(null);

  useEffect(() => {
    if (isLogin) {
      if (toastId.current != null && toast.isActive(toastId.current)) {
        toast.update(toastId.current, {
          render: (
            <ToastContent
              name={`Thông báo`}
              message="Đang đăng nhập..."
              type="primary"
            />
          ),
          type: toast.TYPE.INFO,
          icon: false,
          transition: Slide,
          hideProgressBar: true,
        });
      } else {
        toastId.current = toast.info(
          <ToastContent
            name={`Thông báo`}
            message="Đang đăng nhập..."
            type="primary"
          />,
          {
            icon: false,
            transition: Slide,
            hideProgressBar: true,
          }
        );
      }
    }
  }, [isLogin]);

  const onSubmit = useCallback(
    (data) => {
      if (Object.values(data).every((field) => field.length > 0) && !isLogin) {
        setIsLogin(true);
        useJwt
          .login({ email: data.loginEmail, password: data.password })
          .then((res) => {

            const data = {
              accessToken:res.data.access_token,
              refreshToken: res.data.refreshToken || "",
            };
            dispatch(handleLogin(data));
            delay(300);
            // ability.update(res.data.userData.ability);
            history.push(getHomeRouteForLoggedInUser(data.role));
            toast.update(toastId.current, {
              render: (
                <ToastContent
                  name={`Xin chào, ${
                    data.fullName || data.username || "John Doe"
                  }`}
                  role={data.role || "admin"}
                  message="Bạn đã đăng nhập thành công."
                  type="success"
                />
              ),
              type: toast.TYPE.SUCCESS,
              icon: false,
              transition: Flip,
              hideProgressBar: true,
              autoClose: 1000,
            });
            setIsLogin(false);
          })
          .catch((err) => {
            delay(300);
            const { response } = err;
            toast.update(toastId.current, {
              render: (
                <ToastContent
                  name={"Uh oh"}
                  message={response.data.message}
                  type="warning"
                />
              ),
              type: toast.TYPE.ERROR,
              icon: false,
              transition: Flip,
              hideProgressBar: true,
              autoClose: 1000,
            });
            setIsLogin(false);
          });
      } else {
        for (const key in data) {
          if (data[key].length === 0) {
            setError(key, {
              type: "manual",
            });
          }
        }
      }
    },
    [delay, dispatch, history, isLogin, setError]
  );

  return (
    <div className="auth-wrapper auth-basic px-2">
      <div className="auth-inner my-2">
        <Card className="mb-0">
          <CardBody>
            <Link
              className="brand-logo"
              to="/"
              onClick={(e) => e.preventDefault()}
            >
              {/* <svg viewBox='0 0 139 95' version='1.1' height='28'>
                <defs>
                  <linearGradient x1='100%' y1='10.5120544%' x2='50%' y2='89.4879456%' id='linearGradient-1'>
                    <stop stopColor='#000000' offset='0%'></stop>
                    <stop stopColor='#FFFFFF' offset='100%'></stop>
                  </linearGradient>
                  <linearGradient x1='64.0437835%' y1='46.3276743%' x2='37.373316%' y2='100%' id='linearGradient-2'>
                    <stop stopColor='#EEEEEE' stopOpacity='0' offset='0%'></stop>
                    <stop stopColor='#FFFFFF' offset='100%'></stop>
                  </linearGradient>
                </defs>
                <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                  <g id='Artboard' transform='translate(-400.000000, -178.000000)'>
                    <g id='Group' transform='translate(400.000000, 178.000000)'>
                      <path
                        d='M-5.68434189e-14,2.84217094e-14 L39.1816085,2.84217094e-14 L69.3453773,32.2519224 L101.428699,2.84217094e-14 L138.784583,2.84217094e-14 L138.784199,29.8015838 C137.958931,37.3510206 135.784352,42.5567762 132.260463,45.4188507 C128.736573,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L6.71554594,44.4188507 C2.46876683,39.9813776 0.345377275,35.1089553 0.345377275,29.8015838 C0.345377275,24.4942122 0.230251516,14.560351 -5.68434189e-14,2.84217094e-14 Z'
                        id='Path'
                        className='text-primary'
                        style={{ fill: 'currentColor' }}
                      ></path>
                      <path
                        d='M69.3453773,32.2519224 L101.428699,1.42108547e-14 L138.784583,1.42108547e-14 L138.784199,29.8015838 C137.958931,37.3510206 135.784352,42.5567762 132.260463,45.4188507 C128.736573,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L32.8435758,70.5039241 L69.3453773,32.2519224 Z'
                        id='Path'
                        fill='url(#linearGradient-1)'
                        opacity='0.2'
                      ></path>
                      <polygon
                        id='Path-2'
                        fill='#000000'
                        opacity='0.049999997'
                        points='69.3922914 32.4202615 32.8435758 70.5039241 54.0490008 16.1851325'
                      ></polygon>
                      <polygon
                        id='Path-2'
                        fill='#000000'
                        opacity='0.099999994'
                        points='69.3922914 32.4202615 32.8435758 70.5039241 58.3683556 20.7402338'
                      ></polygon>
                      <polygon
                        id='Path-3'
                        fill='url(#linearGradient-2)'
                        opacity='0.099999994'
                        points='101.428699 0 83.0667527 94.1480575 130.378721 47.0740288'
                      ></polygon>
                    </g>
                  </g>
                </g>
              </svg> */}
              <img src={log} alt="fami-logo" />
              <h2 className="brand-text text-primary ms-1">Fami Dental</h2>
            </Link>
            <CardTitle tag="h4" className="mb-1">
              Nha Khoa Fami xin chào! 👋
            </CardTitle>
            <CardText className="mb-2">Hãy đăng nhập để bắt đầu</CardText>
            <Form
              className="auth-login-form mt-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="mb-1">
                <Label className="form-label" for="login-email">
                  Email
                </Label>
                <Controller
                  id="loginEmail"
                  name="loginEmail"
                  control={control}
                  render={({ field }) => (
                    <Input
                      autoFocus
                      type="email"
                      placeholder="ld123456@example.com"
                      invalid={errors.loginEmail && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-1">
                <div className="d-flex justify-content-between">
                  <Label className="form-label" for="login-password">
                    Mật khẩu
                  </Label>
                  <Link to="/pages/forgot-password-basic">
                    <small>Quên mật khẩu?</small>
                  </Link>
                </div>
                <Controller
                  id="password"
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <InputPasswordToggle
                      className="input-group-merge"
                      invalid={errors.password && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="form-check mb-1">
                <Input type="checkbox" id="remember-me" />
                <Label className="form-check-label" for="remember-me">
                  Lưu tài khoản
                </Label>
              </div>
              <Button color="primary" block>
                Đăng nhập
              </Button>
            </Form>
            {/* <p className="text-center mt-2">
              <span className="me-25">Bạn chưa có tài khoản?</span>
              <Link to="/pages/register-basic">
                <span>Tạo tài khoản</span>
              </Link>
            </p> */}
            {/* <div className='divider my-2'>
              <div className='divider-text'>or</div>
            </div>
            <div className='auth-footer-btn d-flex justify-content-center'>
              <Button color='facebook'>
                <Facebook size={14} />
              </Button>
              <Button color='twitter'>
                <Twitter size={14} />
              </Button>
              <Button color='google'>
                <Mail size={14} />
              </Button>
              <Button className='me-0' color='github'>
                <GitHub size={14} />
              </Button>
            </div> */}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginBasic;
