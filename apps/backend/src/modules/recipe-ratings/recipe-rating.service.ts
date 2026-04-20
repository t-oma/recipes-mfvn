import type { RecipeRatingBody } from "@recipes/shared";
import type { CacheService } from "@/common/cache/cache.service.js";
import { NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
} from "@/common/types/methods.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
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
    assertValidId(userId, "User");
    await assertExists(userModel, userId);
  }

  async function validateRecipe(recipeId: string): Promise<void> {
    assertValidId(recipeId, "Recipe");
    await assertExists(recipeModel, recipeId);
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
