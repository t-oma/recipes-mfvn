import type { CommentDetails } from "@recipes/shared/comments";
import type { Paginated } from "@recipes/shared/core";
import type { PaginationQuery } from "@recipes/shared/query";
import type { RecipeListItem } from "@recipes/shared/recipes";
import type { UserDetails } from "@recipes/shared/users";
import { NotFoundError } from "@/common/errors.js";
import type {
  DefaultInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { toUserDetails } from "./user.mapper.js";
import type { UserRepository } from "./user.repository.js";

export interface UserService {
  getCurrentUser(userId: string): Promise<UserDetails>;
  getFavorites(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<RecipeListItem>>;
  getComments(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<CommentDetails>>;
}

type UserRepositoryPort = Pick<UserRepository, "findById">;
type CommentServicePort = Pick<CommentService, "findByAuthor">;
type FavoriteServicePort = Pick<FavoriteService, "findByUser">;

export function createUserService(
  repository: UserRepositoryPort,
  commentService: CommentServicePort,
  favoriteService: FavoriteServicePort,
): UserService {
  return {
    getCurrentUser: async (userId) => {
      const user = await repository.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return toUserDetails(user);
    },
    getFavorites: async (userId, params) => {
      return favoriteService.findByUser(userId, params);
    },
    getComments: async (userId, params) => {
      return commentService.findByAuthor(userId, params);
    },
  };
}
