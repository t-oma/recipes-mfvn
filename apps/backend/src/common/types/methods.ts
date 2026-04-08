import type { Prettify } from "@recipes/shared";

export type DefaultQuery = { page: number; limit: number };
export type DefaultInitiator = { id: string /* role:TODO */ };

export type InitiatedMethodParams<TInitiator = DefaultInitiator> = {
  initiator: TInitiator;
};

export type QueryMethodParams<
  TQuery = DefaultQuery,
  TInitiator = Partial<DefaultInitiator>,
> = Prettify<
  {
    query: TQuery;
  } & InitiatedMethodParams<TInitiator>
>;

export type DeleteMethodParams<TInitiator = DefaultInitiator> =
  InitiatedMethodParams<TInitiator>;

export type CreateMethodParams<TData, TInitiator = DefaultInitiator> = Prettify<
  {
    data: TData;
  } & InitiatedMethodParams<TInitiator>
>;

export type UpdateMethodParams<TData, TInitiator = DefaultInitiator> = Prettify<
  {
    data: TData;
  } & InitiatedMethodParams<TInitiator>
>;
