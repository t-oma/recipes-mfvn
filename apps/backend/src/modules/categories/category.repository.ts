import type { CategoryQuery, CreateCategoryBody } from "@recipes/shared";
import type { PipelineStage, QueryFilter } from "mongoose";
import type {
  CategoryDocument,
  CategoryDocumentWithCount,
  CategoryModelType,
} from "./category.model.js";
import { buildSearchPipeline } from "./category.pipeline.js";

export class CategoryRepository {
  private model: CategoryModelType;

  constructor(model: CategoryModelType) {
    this.model = model;
  }

  async findMany(query: CategoryQuery): Promise<CategoryDocumentWithCount[]> {
    return this.aggregate<CategoryDocumentWithCount>(
      buildSearchPipeline(query),
    );
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return this.model.findById(id).lean();
  }

  async findOne(
    filter: QueryFilter<CategoryDocument>,
  ): Promise<CategoryDocument | null> {
    return this.model.findOne(filter).lean();
  }

  async exists(id: string): Promise<boolean> {
    return !!(await this.model.exists({ _id: id }));
  }

  async create(data: CreateCategoryBody): Promise<CategoryDocument> {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async delete(id: string): Promise<CategoryDocument | null> {
    return this.model.findByIdAndDelete(id).lean();
  }

  async aggregate<T>(pipeline: PipelineStage[]): Promise<T[]> {
    return this.model.aggregate<T>(pipeline);
  }
}
