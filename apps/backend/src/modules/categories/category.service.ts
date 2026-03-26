import { cleanupDocs } from "@/common/utils/transform.js";
import { Category } from "@/modules/categories/category.model.js";
import type { CreateCategoryBody } from "@/modules/categories/category.schema.js";

export class CategoryService {
  async findAll() {
    const categories = await Category.find().sort({ name: 1 }).lean();
    return cleanupDocs(categories);
  }

  async create(data: CreateCategoryBody) {
    return Category.create(data);
  }

  async deleteById(id: string): Promise<void> {
    const result = await Category.findByIdAndDelete(id);
    if (!result) {
      throw Object.assign(new Error("Category not found"), {
        statusCode: 404,
      });
    }
  }
}
