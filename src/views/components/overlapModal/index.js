// ** React Imports
import { Fragment, useEffect, useState } from "react";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Modal,
  Label,
  Input,
  Button,
  CardBody,
  CardText,
  CardTitle,
  ModalBody,
  InputGroup,
  ModalHeader,
  FormFeedback,
  InputGroupText,
} from "reactstrap";

// ** Third Party Components
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Check, X, CreditCard } from "react-feather";
import { useForm, Controller } from "react-hook-form";
import { isObjEmpty } from "@utils";

// ** Images
import jcbCC from "@src/assets/images/icons/payments/jcb-cc.png";
import amexCC from "@src/assets/images/icons/payments/amex-cc.png";
import uatpCC from "@src/assets/images/icons/payments/uatp-cc.png";
import visaCC from "@src/assets/images/icons/payments/visa-cc.png";
import dinersCC from "@src/assets/images/icons/payments/diners-cc.png";
import maestroCC from "@src/assets/images/icons/payments/maestro-cc.png";
import discoverCC from "@src/assets/images/icons/payments/discover-cc.png";
import mastercardCC from "@src/assets/images/icons/payments/mastercard-cc.png";

const cardsObj = {
  jcb: jcbCC,
  uatp: uatpCC,
  visa: visaCC,
  amex: amexCC,
  diners: dinersCC,
  maestro: maestroCC,
  discover: discoverCC,
  mastercard: mastercardCC,
};

const defaultValues = {
  cardNumber: "",
};

const OverlapModal = (props) => {
  //Props
  const { isShow, onShowToggle,  handleOverlap ,message} = props;
  // ** States

  // ** Hooks
  const {
    reset,
    control,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });


  const onSubmit = (data) => {
    handleOverlap();
  };

  return (
    <Fragment>
      <Modal
        isOpen={isShow}
        toggle={onShowToggle}
        className="modal-dialog-centered"
      >
        <ModalHeader
          className="bg-transparent"
          toggle={onShowToggle}
        ></ModalHeader>
        <ModalBody className="px-sm-5 mx-50 pb-5">
          <h1 className="text-center mb-1">{message}</h1>
          <Row
            tag="form"
            className="gy-1 gx-2 mt-75"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Col md={6}>
              <Label className="form-label" for="name">
                Bạn có muốn tiếp tục?
              </Label>
            </Col>

            <Col className="text-center mt-1" xs={12}>
              <Button type="submit" className="me-1" color="primary">
                Thêm
              </Button>
              <Button
                color="secondary"
                outline
                onClick={() => {
                  reset();
                  onShowToggle();
                }}
              >
                Huỷ
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default OverlapModal;
