// ** Icons Import
import {
  Mail,
  MessageSquare,
  CheckSquare,
  Calendar,
  FileText,
  Circle,
  ShoppingCart,
  User,
  Shield,
} from "react-feather";

const navigationItem = [
  {
    header: "Chức năng",
  },
  // {
  //   id: "email",
  //   title: "Email",
  //   icon: <Mail size={20} />,
  //   navLink: "/email",
  // },
  // {
  //   id: "chat",
  //   title: "Chat",
  //   icon: <MessageSquare size={20} />,
  //   navLink: "/chat",
  // },
  // {
  //   id: "todo",
  //   title: "Todo",
  //   icon: <CheckSquare size={20} />,
  //   navLink: "/todo",
  // },
  {
    id: "calendar",
    title: "Lịch hẹn",
    icon: <Calendar size={20} />,
    navLink: "/calendar",
  },
  // {
  //   id: "invoiceApp",
  //   title: "Invoice",
  //   icon: <FileText size={20} />,
  //   children: [
  //     {
  //       id: "invoiceList",
  //       title: "List",
  //       icon: <Circle size={12} />,
  //       navLink: "/invoice/list",
  //     },
  //     {
  //       id: "invoicePreview",
  //       title: "Preview",
  //       icon: <Circle size={12} />,
  //       navLink: "/invoice/preview",
  //     },
  //     {
  //       id: "invoiceEdit",
  //       title: "Edit",
  //       icon: <Circle size={12} />,
  //       navLink: "/invoice/edit",
  //     },
  //     {
  //       id: "invoiceAdd",
  //       title: "Add",
  //       icon: <Circle size={12} />,
  //       navLink: "/invoice/add",
  //     },
  //   ],
  // },

  // {
  //   id: "roles-permissions",
  //   title: "Roles & Permissions",
  //   icon: <Shield size={20} />,
  //   children: [
  //     {
  //       id: "roles",
  //       title: "Roles",
  //       icon: <Circle size={12} />,
  //       navLink: "/roles",
  //     },
  //     {
  //       id: "permissions",
  //       title: "Permissions",
  //       icon: <Circle size={12} />,
  //       navLink: "/permissions",
  //     },
  //   ],
  // },
  // {
  //   id: "eCommerce",
  //   title: "eCommerce",
  //   icon: <ShoppingCart size={20} />,
  //   children: [
  //     {
  //       id: "shop",
  //       title: "Shop",
  //       icon: <Circle size={12} />,
  //       navLink: "/ecommerce/shop",
  //     },
  //     {
  //       id: "detail",
  //       title: "Details",
  //       icon: <Circle size={12} />,
  //       navLink: "/ecommerce/product-detail",
  //     },
  //     {
  //       id: "wishList",
  //       title: "Wish List",
  //       icon: <Circle size={12} />,
  //       navLink: "/ecommerce/wishlist",
  //     },
  //     {
  //       id: "checkout",
  //       title: "Checkout",
  //       icon: <Circle size={12} />,
  //       navLink: "/ecommerce/checkout",
  //     },
  //   ],
  // },
  {
    id: "customer",
    title: "Customer",
    icon: <User size={20} />,
    children: [
      {
        id: "list",
        title: "List",
        icon: <Circle size={12} />,
        navLink: "/user/list",
      },
      // {
      //   id: "view",
      //   title: "View",
      //   icon: <Circle size={12} />,
      //   navLink: "/user/view",
      // },
    ],
  },
];

export default navigationItem;
