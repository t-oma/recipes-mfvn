import type { Prettify } from "@recipes/shared";

export type DefaultQuery = { page: number; limit: number };
export type DefaultInitiator = { readonly id: string; readonly role: string };
export type OptionalInitiator = {
  readonly id?: string;
  readonly role?: string;
};

export type InitiatedMethodParams<TInitiator = DefaultInitiator> = Prettify<
  Readonly<{
    initiator: TInitiator;
  }>
>;

export type QueryMethodParams<
  TQuery = DefaultQuery,
  TInitiator = OptionalInitiator,
> = Prettify<
  Readonly<
    {
      query: TQuery;
    } & InitiatedMethodParams<TInitiator>
  >
>;

export type DeleteMethodParams<TInitiator = DefaultInitiator> =
  InitiatedMethodParams<TInitiator>;

export type CreateMethodParams<TData, TInitiator = DefaultInitiator> = Prettify<
  Readonly<
    {
      data: TData;
    } & InitiatedMethodParams<TInitiator>
  >
>;

export type UpdateMethodParams<TData, TInitiator = DefaultInitiator> = Prettify<
  Readonly<
    {
      data: TData;
    } & InitiatedMethodParams<TInitiator>
  >
>;
