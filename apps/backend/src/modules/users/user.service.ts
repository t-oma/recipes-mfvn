import type { PaginatedResult, Recipe, User } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
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

  constructor(favoriteService: FavoriteService = new FavoriteService()) {
    this.favoriteService = favoriteService;
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
}
