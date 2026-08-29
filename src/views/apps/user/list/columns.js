// ** React Imports
import { Link } from "react-router-dom";

// ** Custom Components

// ** Store & Actions
import { store } from "@store/store";
import { getUser } from "../store";

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

  return <div>{row.name}</div>;
};

// Phone and customer management are admin-only
export const columns = (
  toggleSidebar,
  setSelectedItem,
  toggleDelete,
  isAdmin = false
) => [
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
  ...(isAdmin
    ? [
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
      ]
    : []),
  ...(isAdmin
    ? [
        {
          name: "Hành động",
          maxWidth: "150px",
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
      ]
    : []),
];
