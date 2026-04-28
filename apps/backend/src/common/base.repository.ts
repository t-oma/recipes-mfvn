import type { Prettify } from "@recipes/shared";
import type {
  Model,
  PipelineStage,
  PopulateOption,
  QueryFilter,
  QueryOptions,
  Types,
} from "mongoose";
import type { RefKeys } from "@/common/types/mongoose.js";

export type Merge<A, B> = Prettify<Omit<A, keyof B> & B>;
export type PopulateKeys<T> = Partial<Prettify<Record<RefKeys<T>, unknown>>>;

export class BaseRepository<
  TDoc extends { _id: Types.ObjectId },
  TCreate extends Partial<TDoc>,
  TUpdate extends Partial<TDoc> = TCreate,
> {
  protected readonly model: Model<TDoc>;

  constructor(model: Model<TDoc>) {
    this.model = model;
  }

  async findById<
    // biome-ignore lint/complexity/noBannedTypes: default object value
    TPopulate extends PopulateKeys<TDoc> = {},
  >(
    id: string,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const query = this.model.findById(id, null, options);

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async findOne<TPopulate extends PopulateKeys<TDoc> = {}>(
    filter: QueryFilter<TDoc>,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const query = this.model.findOne(filter, null, options);

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async find<TPopulate extends PopulateKeys<TDoc> = {}>(
    filter: QueryFilter<TDoc> = {},
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate>[]> {
    const query = this.model.find(filter, null, options);

    return query.lean<Merge<TDoc, TPopulate>[]>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async create<TPopulate extends PopulateKeys<TDoc> = {}>(
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
  async update<TPopulate extends PopulateKeys<TDoc> = {}>(
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
  async delete<TPopulate extends PopulateKeys<TDoc> = {}>(
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
