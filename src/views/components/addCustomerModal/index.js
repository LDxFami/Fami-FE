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
import OverlapModal from "../overlapModal";

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

const AddCustomerModal = (props) => {
  //Props
  const { isShow, onShowToggle, value, handleAddCustomer } = props;
  // ** States

  // ** Hooks
  const {
    reset,
    control,
    setError,
    clearErrors,
    handleSubmit,
    handleCancle,
    formState: { errors },
  } = useForm({ defaultValues });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errMsg, seterrMsg] = useState("")
  const [customerConfirmodal, setcustomerConfirmodal] = useState(false)

  const onSubmit = (data) => {
    if(name == "" || phone == ""){
      seterrMsg('Bạn chưa điền đầy đủ thông tin');
      setcustomerConfirmodal(true);
      return;
    }
    else{
      handleAddCustomer({name,phone});
    }
  };

  const handleSelectedEvent = () => {
    if (!isObjEmpty(value)) {
      setName(value.name);
      setPhone(value.phone);
    }
  };

  return (
    <Fragment>
      <Modal
        isOpen={isShow}
        toggle={onShowToggle}
        className="modal-dialog-centered"
        onOpened={() => handleSelectedEvent()}
      >
        <ModalHeader
          className="bg-transparent"
          toggle={onShowToggle}
        ></ModalHeader>
        <ModalBody className="px-sm-5 mx-50 pb-5">
          <h1 className="text-center mb-1">Thêm khách hàng mới</h1>
          <Row
            tag="form"
            className="gy-1 gx-2 mt-75"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Col md={6}>
              <Label className="form-label" for="name">
                Tên khách hàng
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên khách hàng..."
              />
            </Col>
            <Col md={6}>
              <Label className="form-label" for="phone">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại..."
              />
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
      <OverlapModal
          onShowToggle={()=>{setcustomerConfirmodal(false)}}
          handleOverlap={() => {
            handleAddCustomer({name,phone});
            setcustomerConfirmodal(false)
          }}
          message={errMsg}
          isShow={customerConfirmodal}
        />
    </Fragment>
  );
};

export default AddCustomerModal;
