// ** Reactstrap Imports
import { Toast, ToastBody, ToastHeader, Row, Col } from "reactstrap";

const close = <button type="button" className="ms-1 btn-close"></button>;

const ToastCustom = (props) => {
  const { title, content } = props;
  return (
    <Toast>
      <ToastHeader close={close}>{title}</ToastHeader>
      <ToastBody>{content}</ToastBody>
    </Toast>
  );
};
export default ToastCustom;
