import dotenv from "dotenv";
dotenv.config();

export const JWT_PASSWORD = process.env.JWT_PASSWORD || "mysecretjwtkey123";
export const PORT = process.env.PORT || 3000;
