import type { Category } from "@recipes/shared";
import type { Model } from "mongoose";
import { AppError } from "@/common/errors.js";
import { toCategory } from "@/common/utils/mongo.js";
import type {
  CategoryDocument,
  CreateCategoryBody,
} from "@/modules/categories/index.js";

export interface CategoryService {
  findAll(): Promise<Category[]>;
  create(data: CreateCategoryBody): Promise<Category>;
  deleteById(id: string): Promise<void>;
}

export function createCategoryService(
  categoryModel: Model<CategoryDocument>,
): CategoryService {
  return {
    findAll: async () => {
      const categories = await categoryModel.find().sort({ name: 1 }).lean();
      return categories.map(toCategory);
    },
    create: async (data) => {
      const category = await categoryModel.create(data);
      return toCategory(category.toObject());
    },
    deleteById: async (id) => {
      const result = await categoryModel.findByIdAndDelete(id);
      if (!result) {
        throw new AppError("Category not found", 404);
      }
    },
  };
}
