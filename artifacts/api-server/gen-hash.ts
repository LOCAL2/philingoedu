import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("Admin@2024!", 12);
console.log(hash);
