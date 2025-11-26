import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

const JWT_SECRET = process.env.JWT_SECRET;

// 4 USER ID MẪU (bạn thay đúng _id trong MongoDB của bạn)
const volunteer1Id = "6926f2455b7f0d5ca68c8169";
const volunteer2Id = "6926f2455b7f0d5ca68c816a";
const managerId = "6926f2455b7f0d5ca68c816b";
const adminId = "6926f2455b7f0d5ca68c816c";
const volunteer3Id = "6926f2455b7f0d5ca68c816d";

// Hàm tạo token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

console.log("====================================");
console.log("        GENERATED TEST TOKENS        ");
console.log("====================================\n");

console.log("Volunteer 1 Token:\n", createToken(volunteer1Id, "volunteer"), "\n");

console.log("Volunteer 2 Token:\n", createToken(volunteer2Id, "volunteer"), "\n");

console.log("Manager Token:\n", createToken(managerId, "manager"), "\n");

console.log("Admin Token:\n", createToken(adminId, "admin"), "\n");

console.log("Volunteer 3 Token:\n", createToken(volunteer3Id, "volunteer"), "\n");

console.log("====================================");
console.log("      COPY TOKEN FOR TESTING          ");
console.log("====================================");
