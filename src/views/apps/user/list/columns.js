// ** React Imports
import { Link } from "react-router-dom";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Store & Actions
import { store } from "@store/store";
import { getUser, deleteUser } from "../store";

// ** Icons Imports
import {
  Slack,
  User,
  Settings,
  Database,
  Edit2,
  MoreVertical,
  FileText,
  Trash2,
  Archive,
} from "react-feather";

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { deleteCustomer } from "../../../../redux/customer";

// ** Renders Client Columns
const renderClient = (row) => {
  const stateNum = Math.floor(Math.random() * 6),
    states = [
      "light-success",
      "light-danger",
      "light-warning",
      "light-info",
      "light-primary",
      "light-secondary",
    ],
    color = states[stateNum];

  if (row?.avatar?.length) {
    return (
      <div>
        <Avatar className="me-1" img={row.avatar} width="32" height="32" />
        {row.name}
      </div>
    );
  } else {
    return (
      <div>
        <Avatar
          color={color || "primary"}
          className="me-1"
          content={row.name || "John Doe"}
          initials
        />
        {row.name}
      </div>
    );
  }
};

// ** Renders Role Columns
const renderRole = (row) => {
  const roleObj = {
    subscriber: {
      class: "text-primary",
      icon: User,
    },
    maintainer: {
      class: "text-success",
      icon: Database,
    },
    editor: {
      class: "text-info",
      icon: Edit2,
    },
    author: {
      class: "text-warning",
      icon: Settings,
    },
    admin: {
      class: "text-danger",
      icon: Slack,
    },
  };

  const Icon = roleObj[row.role] ? roleObj[row.role].icon : Edit2;

  return (
    <span className="text-truncate text-capitalize align-middle">
      <Icon
        size={18}
        className={`${roleObj[row.role] ? roleObj[row.role].class : ""} me-50`}
      />
      {row.role}
    </span>
  );
};

const statusObj = {
  pending: "light-warning",
  active: "light-success",
  inactive: "light-secondary",
};

export const columns = (toggleSidebar, setSelectedItem, toggleDelete) => [
  {
    name: "Tên",
    sortable: true,
    minWidth: "140px",
    sortField: "name",
    selector: (row) => row.name,
    cell: (row) => (
      <div className="d-flex justify-content-left align-items-center">
        {renderClient(row)}
        <div className="d-flex flex-column">
          <Link
            to={`/apps/user/view/${row.id}`}
            className="user_name text-truncate text-body"
            onClick={() => store.dispatch(getUser(row.id))}
          >
            <span className="fw-bolder">{row.fullName}</span>
          </Link>
          <small className="text-truncate text-muted mb-0">{row.email}</small>
        </div>
      </div>
    ),
  },
  {
    name: "Số điện thoại",
    minWidth: "138px",
    sortable: true,
    sortField: "phone",
    selector: (row) => row.phone,
    cell: (row) => (
      <span>{row?.phone ? row?.phone : "Chưa có số điện thoại"}</span>
    ),
  },
  {
    name: "Hành động",
    minWidth: "100px",
    cell: (row) => (
      <div className="column-action">
        <UncontrolledDropdown>
          <DropdownToggle tag="div" className="btn btn-sm">
            <MoreVertical size={14} className="cursor-pointer" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem
              tag="a"
              href={`/user/list?id=${row.id}`}
              className="w-100"
              onClick={(e) => {
                e.preventDefault();
                toggleSidebar();
                setSelectedItem(row);
              }}
            >
              <Archive size={14} className="me-50" />
              <span className="align-middle">Chỉnh sửa</span>
            </DropdownItem>
            <DropdownItem
              tag="a"
              href="/"
              className="w-100"
              onClick={(e) => {
                e.preventDefault();
                store.dispatch(deleteCustomer(row.id));
                toggleDelete();
              }}
            >
              <Trash2 size={14} className="me-50" />
              <span className="align-middle">Xoá</span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    ),
  },
];
