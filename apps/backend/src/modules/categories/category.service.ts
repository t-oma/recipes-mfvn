import type { Category } from "@recipes/shared";
import { Category as CategoryModel } from "@/modules/categories/category.model.js";
import type { CreateCategoryBody } from "@/modules/categories/category.schema.js";

function toCategory(doc: unknown): Category {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    name: d.name as string,
    slug: d.slug as string,
    description: d.description as string | undefined,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

export class CategoryService {
  async findAll(): Promise<Category[]> {
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    return categories.map(toCategory);
  }

  async create(data: CreateCategoryBody): Promise<Category> {
    const category = await CategoryModel.create(data);
    return toCategory(category.toObject());
  }

  async deleteById(id: string): Promise<void> {
    const result = await CategoryModel.findByIdAndDelete(id);
    if (!result) {
      throw Object.assign(new Error("Category not found"), {
        statusCode: 404,
      });
    }
  }
}
