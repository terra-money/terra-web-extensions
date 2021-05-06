import { ObservableInput } from 'rxjs';

export type OperatorReturn<R> = ObservableInput<R> | R extends ObservableInput<
  infer U
>
  ? U
  : R;

export type Operator<T, R, ST> = (
  params: T,
  startingParameter: ST,
) => OperatorReturn<R>;

export type StripOperatorResult<T> = T extends ObservableInput<infer U> ? U : T;
