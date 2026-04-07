import type { Comment, Paginated, Recipe, User } from "@recipes/shared";
import { NotFoundError } from "@/common/errors.js";
import { toUser } from "@/common/utils/mongo.js";
import type { CommentQuery, CommentService } from "@/modules/comments/index.js";
import type { FavoriteQuery } from "@/modules/favorites/favorite.schema.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface UserService {
  getCurrentUser(target: string): Promise<User>;
  getFavorites(
    target: string,
    query: FavoriteQuery,
  ): Promise<Paginated<Recipe>>;
  getComments(target: string, query: CommentQuery): Promise<Paginated<Comment>>;
}

export function createUserService(
  commentService: CommentService,
  favoriteService: FavoriteService,
  userModel: UserModelType,
): UserService {
  return {
    getCurrentUser: async (target) => {
      const user = await userModel.findById(target).lean();
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return toUser(user);
    },
    getFavorites: async (target, query) => {
      return favoriteService.findByUser(target, target, query);
    },
    getComments: async (target, query) => {
      return commentService.findByUser(target, target, query);
    },
  };
}
