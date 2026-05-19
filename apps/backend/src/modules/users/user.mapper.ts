import type { UserDetails, UserSummary } from "@recipes/shared";

export type UserSummaryView = {
  _id: string | { toString(): string };
  email: string;
  name: string;
};

export type UserDetailsView = UserSummaryView & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toUserSummary(view: UserSummaryView): UserSummary {
  return {
    id: view._id.toString(),
    email: view.email,
    name: view.name,
  };
}

export function toUserDetails(view: UserDetailsView): UserDetails {
  return {
    ...toUserSummary(view),
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
