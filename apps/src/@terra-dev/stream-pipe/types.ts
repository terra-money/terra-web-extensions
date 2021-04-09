import { SubscribableOrPromise } from 'rxjs';

export type OperatorReturn<R> = SubscribableOrPromise<R> | R;

export type Operator<T, R> = (params: T) => OperatorReturn<R>;
