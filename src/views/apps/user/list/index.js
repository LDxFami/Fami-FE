// ** User List Component
import Table from "./Table";

// ** Reactstrap Imports
import { Row, Col } from "reactstrap";

// ** Custom Components
import StatsHorizontal from "@components/widgets/stats/StatsHorizontal";
import SpinnerComponent from "../../../../@core/components/spinner/Fallback-spinner";

// ** Icons Imports
import { User } from "react-feather";

// ** Styles
import "@styles/react/apps/app-users.scss";

//** Store
import { useSelector } from "react-redux";

const UsersList = () => {
  const store = useSelector((state) => state.customer);

  const { data, loading } = store.customers;
 
  return (
    <div className="app-user-list">
      {loading !== "success" ? (
        <div className="user-list-loading">
          <SpinnerComponent />
        </div>
      ) : null}
      <Row>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="primary"
            statTitle="Số khách hàng"
            icon={<User size={20} />}
            renderStats={<h3 className="fw-bolder mb-75">{data?.total ??"Loading..."}</h3>}
          />
        </Col>
        {/* <Col lg="3" sm="6">
          <StatsHorizontal
            color="danger"
            statTitle="Paid Users"
            icon={<UserPlus size={20} />}
            renderStats={<h3 className="fw-bolder mb-75">4,567</h3>}
          />
        </Col>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="success"
            statTitle="Active Users"
            icon={<UserCheck size={20} />}
            renderStats={<h3 className="fw-bolder mb-75">19,860</h3>}
          />
        </Col>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="warning"
            statTitle="Pending Users"
            icon={<UserX size={20} />}
            renderStats={<h3 className="fw-bolder mb-75">237</h3>}
          />
        </Col> */}
      </Row>
      <Table data={data} loading={loading !== "success"} />
    </div>
  );
};

export default UsersList;
