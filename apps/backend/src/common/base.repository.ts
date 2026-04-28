import type { Prettify } from "@recipes/shared";
import type {
  Model,
  PipelineStage,
  PopulateOption,
  QueryFilter,
  QueryOptions,
  Types,
} from "mongoose";

type Merge<A, B> = Prettify<Omit<A, keyof B> & B>;

export class BaseRepository<
  TDoc extends { _id: Types.ObjectId },
  TCreate extends Partial<TDoc>,
  TUpdate extends Partial<TDoc> = TCreate,
> {
  protected readonly model: Model<TDoc>;

  constructor(model: Model<TDoc>) {
    this.model = model;
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async findById<TPopulate extends Record<string, unknown> = {}>(
    id: string,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const query = this.model.findById(id, null, options);

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async findOne<TPopulate extends Record<string, unknown> = {}>(
    filter: QueryFilter<TDoc>,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const query = this.model.findOne(filter, null, options);

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async findMany<TPopulate extends Record<string, unknown> = {}>(
    filter: QueryFilter<TDoc> = {},
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate>[]> {
    const query = this.model.find(filter, null, options);

    return query.lean<Merge<TDoc, TPopulate>[]>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async create<TPopulate extends Record<string, unknown> = {}>(
    data: TCreate,
    options: PopulateOption = {},
  ): Promise<Merge<TDoc, TPopulate>> {
    const doc = await this.model.create(data);

    if (options.populate) {
      await doc.populate(options.populate);
    }

    return doc.toObject<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async update<TPopulate extends Record<string, unknown> = {}>(
    id: string,
    data: TUpdate,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const query = this.model.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
      ...options,
    });

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async delete<TPopulate extends Record<string, unknown> = {}>(
    id: string,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    return this.model
      .findByIdAndDelete(id, options)
      .lean<Merge<TDoc, TPopulate>>();
  }

  async exists(filter: QueryFilter<TDoc>): Promise<boolean> {
    return !!(await this.model.exists(filter));
  }

  async count(filter: QueryFilter<TDoc> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async aggregate<TResult = TDoc>(
    pipeline: PipelineStage[],
  ): Promise<TResult[]> {
    return this.model.aggregate<TResult>(pipeline);
  }
}
