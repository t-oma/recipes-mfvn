import type { RequireKeys } from "@recipes/shared";
import type { CreateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { UserDocument } from "./user.model.js";

export type UserCreateInput = RequireKeys<
  CreateInput<Omit<UserDocument, "role">>,
  "email" | "password" | "name"
>;
// export type UserUpdateInput = UpdateInput<Omit<UserDocument, "role">>;

export class UserRepository extends BaseRepository<
  UserDocument,
  UserCreateInput,
  never
> {}
