import type { RecipeRatingBody } from "@recipes/shared";
import { isObjectIdOrHexString } from "mongoose";
import type { CacheService } from "@/common/cache/cache.service.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
} from "@/common/types/methods.js";
import { recipeCache } from "@/modules/recipes/recipe.cache.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";
import type { RecipeRatingModelType } from "./recipe-rating.model.js";

export interface RecipeRatingService {
  rate(
    recipeId: string,
    params: CreateMethodParams<RecipeRatingBody>,
  ): Promise<{ value: number }>;
  remove(recipeId: string, params: DeleteMethodParams): Promise<void>;
}

export function createRecipeRatingService(
  ratingModel: RecipeRatingModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
  cache: CacheService,
): RecipeRatingService {
  async function validateUser(userId: string): Promise<void> {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestError(`Invalid user ID: ${userId}`);
    }

    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      throw new NotFoundError(`User not found: ${userId}`);
    }
  }

  async function validateRecipe(recipeId: string): Promise<void> {
    if (!isObjectIdOrHexString(recipeId)) {
      throw new BadRequestError(`Invalid recipe ID: ${recipeId}`);
    }

    const recipeExists = await recipeModel.exists({ _id: recipeId });
    if (!recipeExists) {
      throw new NotFoundError(`Recipe not found: ${recipeId}`);
    }
  }

  return {
    rate: async (recipeId, { data, initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      const rating = await ratingModel.findOneAndUpdate(
        { user: initiator.id, recipe: recipeId },
        { value: data.value },
        { upsert: true, returnDocument: "after" },
      );

      await cache.deletePattern(recipeCache.keys.allPattern());

      return { value: rating.value };
    },

    remove: async (recipeId, { initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      const result = await ratingModel.findOneAndDelete({
        user: initiator.id,
        recipe: recipeId,
      });

      if (!result) {
        throw new NotFoundError(
          `Rating for ${recipeId} by ${initiator.id} not found`,
        );
      }

      await cache.deletePattern(recipeCache.keys.allPattern());
    },
  };
}
