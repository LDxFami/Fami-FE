// ** React Imports
import { Fragment, useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// ** Invoice List Sidebar
import Sidebar from "./Sidebar";

// ** Table Columns
import { columns } from "./columns";

// ** Store & Actions
import { getCustomer } from "../../../../redux/customer";
import { useDispatch } from "react-redux";

// ** Third Party Components
import Select from "react-select";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { debounce } from "lodash";

import {
  ChevronDown,
  Share,
  Printer,
  FileText,
  File,
  Grid,
  Copy,
} from "react-feather";

// ** Utils
import { selectThemeColors } from "@utils";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Input,
  Label,
  Button,
  CardBody,
  CardTitle,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/react-select/_react-select.scss";
import "@styles/react/libs/tables/react-dataTable-component.scss";
import BasicSweetCallback from "../../../components/alerts/AlertCallback";

// ** Table Header
const CustomHeader = ({
  toggleSidebar,
  setSelectedItem,
  handlePerPage,
  rowsPerPage,
  handleFilter,
  searchTerm,
  data,
}) => {
  const { items } = data;
  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result;

    const columnDelimiter = ",";
    const lineDelimiter = "\n";
    const keys = Object.keys(items[0]);
    result = "";
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    array.forEach((item) => {
      let ctr = 0;
      keys.forEach((key) => {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];

        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  // ** Downloads CSV
  function downloadCSV(array) {
    const link = document.createElement("a");
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv === null) return;

    const filename = "export.csv";

    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }

    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", filename);
    link.click();
  }

  const handleConfirmText = () => {
    return MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-danger ms-1",
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        MySwal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your file has been deleted.",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      }
    });
  };
  return (
    <div className="invoice-list-table-header w-100 me-1 ms-50 mt-2 mb-75">
      <Row>
        <Col xl="6" className="d-flex align-items-center p-0">
          <div className="d-flex align-items-center w-100">
            <label htmlFor="rows-per-page">Hiển thị</label>
            <Input
              className="mx-50"
              type="select"
              id="rows-per-page"
              value={rowsPerPage}
              onChange={handlePerPage}
              style={{ width: "5rem" }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Input>
            <label htmlFor="rows-per-page">
              Mục trong tổng {data.total} mục
            </label>
          </div>
        </Col>
        <Col
          xl="6"
          className="d-flex align-items-sm-center justify-content-xl-end justify-content-start flex-xl-nowrap flex-wrap flex-sm-row flex-column pe-xl-1 p-0 mt-xl-0 mt-1"
        >
          <div className="d-flex align-items-center mb-sm-0 mb-1 me-1">
            <label
              className="mb-0"
              style={{ whiteSpace: "nowrap" }}
              htmlFor="search-invoice"
            >
              Tìm kiếm:
            </label>
            <Input
              id="search-invoice"
              className="ms-50 w-100"
              type="text"
              value={searchTerm}
              onChange={(e) => handleFilter(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center table-header-actions">
            <Button
              className="add-new-user"
              color="primary"
              onClick={() => {
                toggleSidebar();
                setSelectedItem(null);
              }}
            >
              Thêm khách hàng
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};
const MySwal = withReactContent(Swal);

const UsersList = ({ data, loading }) => {
  // ** Store Vars
  const dispatch = useDispatch();

  // ** States
  const [sort, setSort] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentRole, setCurrentRole] = useState({
    value: "",
    label: "Select Role",
  });
  const [currentPlan, setCurrentPlan] = useState({
    value: "",
    label: "Select Plan",
  });
  const [currentStatus, setCurrentStatus] = useState({
    value: "",
    label: "Select Status",
    number: 0,
  });

  // ** Function to toggle sideb
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ** Get data on mount
  useEffect(() => {
    if (!sidebarOpen)
      dispatch(
        getCustomer({
          search_param: searchTerm,
          page: currentPage,
          limit: rowsPerPage,
          sort_column: sortColumn,
          sort_direction: sort,
        })
      );
  }, [dispatch, sidebarOpen]);

  // ** User filter options
  const roleOptions = [
    { value: "", label: "Select Role" },
    { value: "admin", label: "Admin" },
    { value: "author", label: "Author" },
    { value: "editor", label: "Editor" },
    { value: "maintainer", label: "Maintainer" },
    { value: "subscriber", label: "Subscriber" },
  ];

  const planOptions = [
    { value: "", label: "Select Plan" },
    { value: "basic", label: "Basic" },
    { value: "company", label: "Company" },
    { value: "enterprise", label: "Enterprise" },
    { value: "team", label: "Team" },
  ];

  const statusOptions = [
    { value: "", label: "Select Status", number: 0 },
    { value: "pending", label: "Pending", number: 1 },
    { value: "active", label: "Active", number: 2 },
    { value: "inactive", label: "Inactive", number: 3 },
  ];

  // ** Function in get data on page change
  const handlePagination = (page) => {
    dispatch(
      getCustomer({
        search_param: searchTerm,
        page: page.selected + 1,
        limit: rowsPerPage,
        sortColumn: sortColumn,
        sort_direction: sort,
      })
    );
    setCurrentPage(page.selected + 1);
  };

  // ** Function in get data on rows per page

  const handlePerPage = (e) => {
    const value = parseInt(e.currentTarget.value);
    dispatch(
      getCustomer({
        search_param: searchTerm,
        page: currentPage,
        limit: value,
        sort_direction: sort,
        sort_column: sortColumn,
      })
    );
    setRowsPerPage(value);
  };

  // ** Function in get data on search query change
  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(
        getCustomer({
          search_param: value,
          page: 1,
          limit: rowsPerPage,
          sort_column: sortColumn,
          sort_direction: sort,
        })
      );
      setCurrentPage(1);
    }, 300),
    [rowsPerPage, sortColumn, sort]
  );

  const handleFilter = (val) => {
    setSearchTerm(val);
    debouncedSearch(val);
  };

  // ** Custom Pagination
  const CustomPagination = () => {
    const count = Number(Math.ceil(data.total / rowsPerPage));

    return (
      <ReactPaginate
        previousLabel={""}
        nextLabel={""}
        pageCount={count || 1}
        activeClassName="active"
        forcePage={currentPage !== 0 ? currentPage - 1 : 0}
        onPageChange={(page) => handlePagination(page)}
        pageClassName={"page-item"}
        nextLinkClassName={"page-link"}
        nextClassName={"page-item next"}
        previousClassName={"page-item prev"}
        previousLinkClassName={"page-link"}
        pageLinkClassName={"page-link"}
        containerClassName={
          "pagination react-paginate justify-content-end my-2 pe-1"
        }
      />
    );
  };

  // ** Table data to render
  const dataToRender = () => {
    const filters = {
      role: currentRole.value,
      currentPlan: currentPlan.value,
      status: currentStatus.value,
      q: searchTerm,
    };

    const isFiltered = Object.keys(filters).some(function (k) {
      return filters[k].length > 0;
    });

    if (data.items.length > 0) {
      return data.items;
    } else if (data.items.length === 0 && isFiltered) {
      return [];
    } else {
      // return store.allData.slice(0, rowsPerPage);
    }
  };

  const noDataComponent = () => (
    <div style={{ padding: "24px" }}>Không có dữ liệu hiển thị</div>
  );

  const progressComponent = () => (
    <div style={{ fontSize: "24px", fontWeight: "700", padding: " 24px" }}>
      Đang tải...
    </div>
  );

  const handleSort = (column, sortDirection) => {
    setSort(sortDirection);
    setSortColumn(column.sortField);
    dispatch(
      getCustomer({
        search_param: searchTerm,
        page: currentPage,
        limit: rowsPerPage,
        sort_column: column.sortField,
        sort_direction: sortDirection,
      })
    );
  };

  const handleConfirmText = () => {
    return MySwal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc xoá khách hàng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá khách hàng",
      cancelButtonText: "Huỷ",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-danger ms-1",
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        dispatch(
          getCustomer({
            search_param: searchTerm,
            page: currentPage,
            limit: rowsPerPage,
            sort_column: sortColumn,
            sort_direction: sort,
          })
        );
        MySwal.fire({
          icon: "success",
          title: "Xác nhận",
          text: "Đã xoá khách hàng.",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      }
    });
  };

  const toggleDelete = () => {
    // dispatch(
    //   getCustomer({
    //     search_param: searchTerm,
    //     page: currentPage,
    //     limit: rowsPerPage,
    //     sort_column: sortColumn,
    //     sort_direction: sort,
    //   })
    // );
    handleConfirmText();
  };

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle tag="h4">Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardBody>
          {false && (
            <Row>
              <Col md="4">
                <Label for="role-select">Role</Label>
                <Select
                  isClearable={false}
                  value={currentRole}
                  options={roleOptions}
                  className="react-select"
                  classNamePrefix="select"
                  theme={selectThemeColors}
                  onChange={(data) => {
                    setCurrentRole(data);
                    // dispatch(
                    //   getData({
                    //     sort,
                    //     sortColumn,
                    //     q: searchTerm,
                    //     role: data.value,
                    //     page: currentPage,
                    //     perPage: rowsPerPage,
                    //     status: currentStatus.value,
                    //     currentPlan: currentPlan.value,
                    //   })
                    // );
                  }}
                />
              </Col>
              <Col className="my-md-0 my-1" md="4">
                <Label for="plan-select">Plan</Label>
                <Select
                  theme={selectThemeColors}
                  isClearable={false}
                  className="react-select"
                  classNamePrefix="select"
                  options={planOptions}
                  value={currentPlan}
                  onChange={(data) => {
                    setCurrentPlan(data);
                    // dispatch(
                    //   getData({
                    //     sort,
                    //     sortColumn,
                    //     q: searchTerm,
                    //     page: currentPage,
                    //     perPage: rowsPerPage,
                    //     role: currentRole.value,
                    //     currentPlan: data.value,
                    //     status: currentStatus.value,
                    //   })
                    // );
                  }}
                />
              </Col>
              <Col md="4">
                <Label for="status-select">Status</Label>
                <Select
                  theme={selectThemeColors}
                  isClearable={false}
                  className="react-select"
                  classNamePrefix="select"
                  options={statusOptions}
                  value={currentStatus}
                  onChange={(data) => {
                    setCurrentStatus(data);
                    // dispatch(
                    //   getData({
                    //     sort,
                    //     sortColumn,
                    //     q: searchTerm,
                    //     page: currentPage,
                    //     status: data.value,
                    //     perPage: rowsPerPage,
                    //     role: currentRole.value,
                    //     currentPlan: currentPlan.value,
                    //   })
                    // );
                  }}
                />
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <div className="react-dataTable">
          <DataTable
            noHeader
            subHeader
            sortServer
            pagination
            responsive
            paginationServer
            columns={columns(toggleSidebar, setSelectedItem, toggleDelete)}
            onSort={handleSort}
            sortIcon={<ChevronDown />}
            className="react-dataTable"
            paginationComponent={CustomPagination}
            data={dataToRender()}
            noDataComponent={noDataComponent()}
            progressPending={loading}
            progressComponent={progressComponent()}
            subHeaderComponent={
              <CustomHeader
                data={data}
                searchTerm={searchTerm}
                rowsPerPage={rowsPerPage}
                handleFilter={handleFilter}
                handlePerPage={handlePerPage}
                toggleSidebar={toggleSidebar}
                setSelectedItem={(id) => setSelectedItem(id)}
              />
            }
          />
        </div>
      </Card>

      <Sidebar
        open={sidebarOpen}
        toggleSidebar={toggleSidebar}
        item={selectedItem}
      />
    </Fragment>
  );
};

export default UsersList;
