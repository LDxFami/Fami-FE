// ** React Imports
import { Fragment } from "react";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Modal,
  Label,
  Button,
  ModalBody,
  ModalHeader,
} from "reactstrap";

// ** Third Party Components
import { useForm } from "react-hook-form";

// ** Images


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
    handleSubmit,
  } = useForm({ defaultValues });


  const onSubmit = () => {
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
