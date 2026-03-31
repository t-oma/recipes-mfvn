import type { Comment, PaginatedResult, Recipe, User } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import type { CommentQuery } from "@/modules/comments/comment.schema.js";
import { CommentService } from "@/modules/comments/comment.service.js";
import type { FavoriteQuery } from "@/modules/favorites/favorite.schema.js";
import { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { UserModel } from "@/modules/users/user.model.js";

function toUser(doc: unknown): User {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    email: d.email as string,
    name: d.name as string,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

export class UserService {
  private readonly favoriteService: FavoriteService;
  private readonly commentService: CommentService;

  constructor(
    favoriteService: FavoriteService = new FavoriteService(),
    commentService: CommentService = new CommentService(),
  ) {
    this.favoriteService = favoriteService;
    this.commentService = commentService;
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return toUser(user);
  }

  async getFavorites(
    userId: string,
    query: FavoriteQuery,
  ): Promise<PaginatedResult<Recipe>> {
    return this.favoriteService.findByUser(userId, query);
  }

  async getComments(
    userId: string,
    query: CommentQuery,
  ): Promise<PaginatedResult<Comment>> {
    return this.commentService.findByUser(userId, query);
  }
}
