export type DefaultQuery = { page: number; limit: number };
export type DefaultInitiator = string;

export type QueryMethodParams<
  TQuery = DefaultQuery,
  TInitiator = DefaultInitiator,
> = {
  query: TQuery;
  initiator?: TInitiator;
};

export type DeleteMethodParams<TInitiator = DefaultInitiator> = {
  initiator: TInitiator;
};

export type CreateMethodParams<TData, TInitiator = DefaultInitiator> = {
  data: TData;
  initiator: TInitiator;
};

export type UpdateMethodParams<TData, TInitiator = DefaultInitiator> = {
  data: TData;
  initiator: TInitiator;
};
