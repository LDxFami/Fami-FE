// ** Table Component
import UsersTable from "./Table";

// ** Styles
import "@styles/react/apps/app-users.scss";

const UserManagementList = () => {
  return (
    <div className="app-user-list">
      <UsersTable />
    </div>
  );
};

export default UserManagementList;
