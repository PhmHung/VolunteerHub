/** @format */

import bcrypt from "bcryptjs";

const users = [
  {
    userName: "Admin",
    userEmail: "admin@example.com",
    password: bcrypt.hashSync("AP23!", 10),
    role: "admin",
    phoneNumber: "0987654321",
    status: "active",
  },
  {
    userName: "Quản Lý A",
    userEmail: "managerA@example.com",
    password: bcrypt.hashSync("MP456@", 10),
    role: "manager",
    phoneNumber: "",
    status: "active",
  },
  {
    userName: "Nguyễn Văn B",
    userEmail: "vanb@gmail.com",
    password: bcrypt.hashSync("VP789#", 10),
    role: "volunteer",
    phoneNumber: "0912345678",
    status: "active",
  },
  {
    userName: "Nguyễn Văn C",
    userEmail: "vanc@outlook.com",
    password: bcrypt.hashSync("IP123!", 10),
    role: "volunteer",
    phoneNumber: "0355123456",
    status: "inactive",
  },
  {
    userName: "Tình Nguyện Viên Dũng",
    userEmail: "Dungnguyen@gmail.com",
    password: bcrypt.hashSync("MP123$", 10),
    role: "volunteer",
    status: "active",
  },
];

export default users;
