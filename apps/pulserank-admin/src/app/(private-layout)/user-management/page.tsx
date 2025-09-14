import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { UserManagementTable } from "@/components/Tables/user-management-table";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

const UserManagementPage = () => {
  return (
    <>
      <Breadcrumb pageName="User Management" />

      <div className="space-y-10">
        <UserManagementTable />
      </div>
    </>
  );
};

export default UserManagementPage;
