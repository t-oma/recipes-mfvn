import { env } from "@/config/env.js";
import { UserModel } from "@/modules/users/user.model.js";

export async function ensureRootAdmin(): Promise<void> {
  const existing = await UserModel.findOne({ role: "admin" });
  if (existing) {
    return;
  }

  await UserModel.create({
    email: env.ROOT_ADMIN_EMAIL,
    password: env.ROOT_ADMIN_PASSWORD,
    name: "Root Admin",
    role: "admin",
  });

  console.log(`✓ Root admin created: ${env.ROOT_ADMIN_EMAIL}`);
}
