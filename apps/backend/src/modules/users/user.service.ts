import type { Comment, Paginated, Recipe, User } from "@recipes/shared";
import { NotFoundError } from "@/common/errors.js";
import type { PaginationQuery } from "@/common/schemas.js";
import type { QueryMethodParams } from "@/common/types/methods.js";
import { toUser } from "@/common/utils/mongo.js";
import type { CommentService } from "@/modules/comments/index.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface UserService {
  getCurrentUser(target: string): Promise<User>;
  getFavorites(
    userId: string,
    params: QueryMethodParams<PaginationQuery, { initiator: string }>,
  ): Promise<Paginated<Recipe>>;
  getComments(
    userId: string,
    params: QueryMethodParams<PaginationQuery, { initiator: string }>,
  ): Promise<Paginated<Comment>>;
}

export function createUserService(
  commentService: CommentService,
  favoriteService: FavoriteService,
  userModel: UserModelType,
): UserService {
  return {
    getCurrentUser: async (userId) => {
      const user = await userModel.findById(userId).lean();
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return toUser(user);
    },
    getFavorites: async (userId, { query, initiator }) => {
      return favoriteService.findByUser(userId, initiator, query);
    },
    getComments: async (userId, params) => {
      return commentService.findByAuthor(userId, params);
    },
  };
}
