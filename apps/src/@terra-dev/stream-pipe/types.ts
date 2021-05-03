import { ObservableInput } from 'rxjs';

export type OperatorReturn<R> = ObservableInput<R> | R;

export type Operator<T, R> = (params: T) => OperatorReturn<R>;
