// ** React Imports
import { Fragment } from "react";

// ** Icons Imports
import { Edit2, Trash2, MoreVertical } from "react-feather";

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "reactstrap";

const roleColorMap = {
  admin: "light-danger",
  doctor: "light-primary",
};

const renderRoleBadge = (roles = []) => {
  if (!roles || roles.length === 0) return null;
  return roles.map((role) => (
    <Badge
      key={role.id}
      color={roleColorMap[role.name] ?? "light-secondary"}
      className="me-50"
    >
      {role.name === "admin" ? "Admin" : "Bác sĩ"}
    </Badge>
  ));
};

// Managing other users (including their passwords) is admin-only
export const columns = (onEdit, onDelete, isAdmin = false) => [
  {
    name: "Tên",
    sortable: true,
    minWidth: "200px",
    sortField: "name",
    selector: (row) => row.name,
    cell: (row) => (
      <div className="d-flex flex-column">
        <span className="fw-bolder text-truncate">{row.name}</span>
      </div>
    ),
  },
  {
    name: "Email",
    sortable: true,
    minWidth: "220px",
    sortField: "email",
    selector: (row) => row.email,
    cell: (row) => (
      <span className="text-truncate text-muted">{row.email}</span>
    ),
  },
  {
    name: "Vai trò",
    minWidth: "140px",
    selector: (row) => row.roles,
    cell: (row) => (
      <Fragment>{renderRoleBadge(row.roles)}</Fragment>
    ),
  },
  ...(isAdmin
    ? [
        {
          name: "Hành động",
          maxWidth: "120px",
          cell: (row) => (
            <div className="column-action">
              <UncontrolledDropdown>
                <DropdownToggle tag="div" className="btn btn-sm">
                  <MoreVertical size={14} className="cursor-pointer" />
                </DropdownToggle>
                <DropdownMenu end>
                  <DropdownItem
                    tag="a"
                    href="#"
                    className="w-100"
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(row);
                    }}
                  >
                    <Edit2 size={14} className="me-50" />
                    <span className="align-middle">Chỉnh sửa</span>
                  </DropdownItem>
                  <DropdownItem
                    tag="a"
                    href="#"
                    className="w-100 text-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(row);
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
