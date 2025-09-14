import * as logos from "@/assets/logos";

export async function getTopProducts() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      image: "/images/product/product-01.png",
      name: "Apple Watch Series 7",
      category: "Electronics",
      price: 296,
      sold: 22,
      profit: 45,
    },
    {
      image: "/images/product/product-02.png",
      name: "Macbook Pro M1",
      category: "Electronics",
      price: 546,
      sold: 12,
      profit: 125,
    },
    {
      image: "/images/product/product-03.png",
      name: "Dell Inspiron 15",
      category: "Electronics",
      price: 443,
      sold: 64,
      profit: 247,
    },
    {
      image: "/images/product/product-04.png",
      name: "HP Probook 450",
      category: "Electronics",
      price: 499,
      sold: 72,
      profit: 103,
    },
  ];
}

export async function getInvoiceTableData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1400));

  return [
    {
      name: "Free package",
      price: 0.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Paid",
    },
    {
      name: "Standard Package",
      price: 59.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Paid",
    },
    {
      name: "Business Package",
      price: 99.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Unpaid",
    },
    {
      name: "Standard Package",
      price: 59.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Pending",
    },
  ];
}

export async function getTopChannels() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      name: "Google",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.google,
    },
    {
      name: "X.com",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.x,
    },
    {
      name: "Github",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.github,
    },
    {
      name: "Vimeo",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.vimeo,
    },
    {
      name: "Facebook",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.facebook,
    },
  ];
}

export async function getUserManagementData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return [
    {
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      joinedDate: "2023-01-15T10:00:00.000Z",
    },
    {
      name: "Jane Smith",
      username: "janesmith",
      email: "jane.smith@example.com",
      role: "Manager",
      status: "Active",
      joinedDate: "2023-02-20T14:30:00.000Z",
    },
    {
      name: "Mike Johnson",
      username: "mikejohnson",
      email: "mike.johnson@example.com",
      role: "User",
      status: "Active",
      joinedDate: "2023-03-10T09:15:00.000Z",
    },
    {
      name: "Sarah Wilson",
      username: "sarahwilson",
      email: "sarah.wilson@example.com",
      role: "User",
      status: "Inactive",
      joinedDate: "2023-01-25T16:45:00.000Z",
    },
    {
      name: "David Brown",
      username: "davidbrown",
      email: "david.brown@example.com",
      role: "Manager",
      status: "Active",
      joinedDate: "2023-02-05T11:20:00.000Z",
    },
    {
      name: "Emily Davis",
      username: "emilydavis",
      email: "emily.davis@example.com",
      role: "User",
      status: "Pending",
      joinedDate: "2023-04-01T13:00:00.000Z",
    },
    {
      name: "Robert Taylor",
      username: "roberttaylor",
      email: "robert.taylor@example.com",
      role: "Admin",
      status: "Active",
      joinedDate: "2023-01-08T08:30:00.000Z",
    },
    {
      name: "Lisa Anderson",
      username: "lisaanderson",
      email: "lisa.anderson@example.com",
      role: "User",
      status: "Active",
      joinedDate: "2023-03-15T15:45:00.000Z",
    },
  ];
}
