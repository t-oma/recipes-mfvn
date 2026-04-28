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

export type RefsForInput<T> = Prettify<
  Omit<T, RefKeys<T>> & {
    [K in RefKeys<T>]: T[K] extends readonly Types.ObjectId[]
      ? readonly (Types.ObjectId | string)[]
      : T[K] extends Types.ObjectId
        ? Types.ObjectId | string
        : T[K];
  }
>;
export type CreateInput<T extends { _id: Types.ObjectId }> = Partial<
  Omit<RefsForInput<T>, "_id">
>;
export type UpdateInput<T extends { _id: Types.ObjectId }> = Partial<
  Omit<RefsForInput<T>, "_id">
>;

export class BaseRepository<TDoc extends { _id: Types.ObjectId }> {
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
    data: CreateInput<TDoc>,
    options: PopulateOption = {},
  ): Promise<Merge<TDoc, TPopulate>> {
    const doc = await this.model.create(this.castInput(data));

    if (options.populate) {
      await doc.populate(options.populate);
    }

    return doc.toObject<Merge<TDoc, TPopulate>>();
  }

  // biome-ignore lint/complexity/noBannedTypes: default object value
  async update<TPopulate extends PopulateKeys<TDoc> = {}>(
    id: string,
    data: UpdateInput<TDoc>,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const query = this.model.findByIdAndUpdate(id, this.castInput(data), {
      returnDocument: "after",
      runValidators: true,
      ...options,
    });

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  /**
   * Deletes a document by id or filter.
   *
   * @param filter - The filter to use for finding the document to delete.
   * @param options - The options to use for the delete operation.
   * @returns The deleted document, or null if no document was found.
   */
  // biome-ignore lint/complexity/noBannedTypes: default object value
  async delete<TPopulate extends PopulateKeys<TDoc> = {}>(
    filter: string | QueryFilter<TDoc>,
    options: QueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    if (typeof filter === "string") {
      return this.model
        .findByIdAndDelete(filter, options)
        .lean<Merge<TDoc, TPopulate>>();
    }

    return this.model
      .findOneAndDelete(filter, options)
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

  protected castInput<TInput extends Record<string, unknown>>(
    data: TInput,
  ): Partial<TDoc> {
    return this.model.castObject(data) as Partial<TDoc>;
  }
}
