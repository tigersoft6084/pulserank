import * as Icons from "@/assets/icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [],
        url: "/",
      },
      {
        title: "User Management",
        url: "/user-management",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Sales Management",
        url: "/sales-management",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Account Settings",
        url: "/account-settings",
        icon: Icons.SettingsIcon,
        items: [],
      },
    ],
  },
];
