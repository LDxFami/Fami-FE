import { Fragment } from "react";
import Avatar from "@components/avatar";

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

export default ToastComponent;
