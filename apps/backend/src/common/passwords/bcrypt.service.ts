import bcrypt from "bcryptjs";
import type { PasswordService } from "./password.service.js";

export function createBcryptPasswordService(rounds: number): PasswordService {
  return {
    async hash(password: string) {
      return bcrypt.hash(password, rounds);
    },

    async verify(password: string, hash: string) {
      return bcrypt.compare(password, hash);
    },
  };
}
