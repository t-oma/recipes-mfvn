import type { User } from "@recipes/shared";

export type UserView = {
  _id: string | { toString(): string };
  email: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toUser(view: UserView): User {
  return {
    id: view._id.toString(),
    email: view.email,
    name: view.name,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
