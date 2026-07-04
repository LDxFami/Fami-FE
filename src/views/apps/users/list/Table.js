// ** React Imports
import { Fragment, useState, useEffect, useCallback } from "react";

// ** Sidebar & Columns
import Sidebar from "./Sidebar";
import { columns } from "./columns";

// ** Store & Actions
import { getUsers, deleteUser } from "../../../../redux/users";
import { useDispatch, useSelector } from "react-redux";

// ** Third Party
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { debounce } from "lodash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "react-toastify";
import { ChevronDown, Check } from "react-feather";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  CardTitle,
  CardHeader,
} from "reactstrap";

// ** Custom Components
import ToastComponent from "../../../components/toastComponent";

// ** Styles
import "@styles/react/libs/tables/react-dataTable-component.scss";

const MySwal = withReactContent(Swal);

const CustomHeader = ({ searchTerm, handleFilter, rowsPerPage, handlePerPage, toggleSidebar, total }) => (
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
          <label htmlFor="rows-per-page">Mục trong tổng {total} mục</label>
        </div>
      </Col>
      <Col
        xl="6"
        className="d-flex align-items-sm-center justify-content-xl-end justify-content-start flex-xl-nowrap flex-wrap flex-sm-row flex-column pe-xl-1 p-0 mt-xl-0 mt-1"
      >
        <div className="d-flex align-items-center mb-sm-0 mb-1 me-1">
          <label className="mb-0" style={{ whiteSpace: "nowrap" }} htmlFor="search-user">
            Tìm kiếm:
          </label>
          <Input
            id="search-user"
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
            onClick={() => toggleSidebar(null)}
          >
            Thêm người dùng
          </Button>
        </div>
      </Col>
    </Row>
  </div>
);

const UsersTable = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.users);
  const { data, loading } = store.users;

  const [sort, setSort] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(
    (params) => {
      dispatch(
        getUsers({
          search_param: params.searchTerm ?? searchTerm,
          page: params.page ?? currentPage,
          limit: params.limit ?? rowsPerPage,
          sort_column: params.sortColumn ?? sortColumn,
          sort_direction: params.sort ?? sort,
        })
      );
    },
    [dispatch, searchTerm, currentPage, rowsPerPage, sortColumn, sort]
  );

  useEffect(() => {
    if (!sidebarOpen) {
      fetchUsers({});
    }
  }, [sidebarOpen]);

  const toggleSidebar = (user = null) => {
    setSelectedUser(user);
    setSidebarOpen((prev) => !prev);
  };

  const handlePerPage = (e) => {
    const value = parseInt(e.currentTarget.value);
    setRowsPerPage(value);
    dispatch(
      getUsers({
        search_param: searchTerm,
        page: currentPage,
        limit: value,
        sort_column: sortColumn,
        sort_direction: sort,
      })
    );
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(
        getUsers({
          search_param: value,
          page: 1,
          limit: rowsPerPage,
          sort_column: sortColumn,
          sort_direction: sort,
        })
      );
      setCurrentPage(1);
    }, 500),
    [rowsPerPage, sortColumn, sort]
  );

  const handleFilter = (val) => {
    setSearchTerm(val);
    debouncedSearch(val);
  };

  const handlePagination = (page) => {
    const newPage = page.selected + 1;
    setCurrentPage(newPage);
    dispatch(
      getUsers({
        search_param: searchTerm,
        page: newPage,
        limit: rowsPerPage,
        sort_column: sortColumn,
        sort_direction: sort,
      })
    );
  };

  const handleSort = (column, sortDirection) => {
    setSort(sortDirection);
    setSortColumn(column.sortField);
    dispatch(
      getUsers({
        search_param: searchTerm,
        page: currentPage,
        limit: rowsPerPage,
        sort_column: column.sortField,
        sort_direction: sortDirection,
      })
    );
  };

  const handleDelete = (row) => {
    MySwal.fire({
      title: "Xác nhận xoá",
      html: `Bạn có chắc muốn xoá người dùng <strong>${row.name}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-outline-secondary ms-1",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUser(row.id))
          .unwrap()
          .then(() => {
            toast.success(
              <ToastComponent title="Đã xoá người dùng" color="success" icon={<Check />} />,
              { icon: false, autoClose: 2000, hideProgressBar: true, closeButton: false }
            );
            dispatch(
              getUsers({
                search_param: searchTerm,
                page: currentPage,
                limit: rowsPerPage,
                sort_column: sortColumn,
                sort_direction: sort,
              })
            );
          })
          .catch(() => {
            toast.error(
              <ToastComponent title="Xoá thất bại" color="warning" message="Đã có lỗi xảy ra" icon={<Check />} />,
              { icon: false, autoClose: 2000, hideProgressBar: true, closeButton: false }
            );
          });
      }
    });
  };

  const CustomPagination = () => {
    const count = Math.ceil((data?.total ?? 0) / rowsPerPage) || 1;
    return (
      <ReactPaginate
        previousLabel=""
        nextLabel=""
        pageCount={count}
        activeClassName="active"
        forcePage={currentPage !== 0 ? currentPage - 1 : 0}
        onPageChange={handlePagination}
        pageClassName="page-item"
        nextLinkClassName="page-link"
        nextClassName="page-item next"
        previousClassName="page-item prev"
        previousLinkClassName="page-link"
        pageLinkClassName="page-link"
        containerClassName="pagination react-paginate justify-content-end my-2 pe-1"
      />
    );
  };

  const noDataComponent = () => (
    <div style={{ padding: "24px" }}>Không có dữ liệu hiển thị</div>
  );

  const progressComponent = () => (
    <div style={{ fontSize: "18px", fontWeight: "600", padding: "24px" }}>
      Đang tải...
    </div>
  );

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle tag="h4">Danh sách người dùng</CardTitle>
        </CardHeader>
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
            columns={columns(
              (row) => toggleSidebar(row),
              handleDelete
            )}
            onSort={handleSort}
            sortIcon={<ChevronDown />}
            className="react-dataTable"
            paginationComponent={CustomPagination}
            data={data?.items ?? []}
            noDataComponent={noDataComponent()}
            progressPending={loading === "loading"}
            progressComponent={progressComponent()}
            subHeaderComponent={
              <CustomHeader
                total={data?.total ?? 0}
                searchTerm={searchTerm}
                rowsPerPage={rowsPerPage}
                handleFilter={handleFilter}
                handlePerPage={handlePerPage}
                toggleSidebar={() => toggleSidebar(null)}
              />
            }
          />
        </div>
      </Card>

      <Sidebar
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
        selectedUser={selectedUser}
      />
    </Fragment>
  );
};

export default UsersTable;
