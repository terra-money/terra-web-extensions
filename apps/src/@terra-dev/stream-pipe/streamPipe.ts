import { isObservable, Observable } from 'rxjs';
import { Operator, StripOperatorResult } from './types';

export function streamPipe<Params, R1>(
  o1: Operator<Params, R1, Params>,
): (params: Params) => Observable<R1>;

export function streamPipe<Params, R1, R2>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
): (
  params: Params,
) => Observable<StripOperatorResult<R1> | StripOperatorResult<R2>>;

export function streamPipe<Params, R1, R2, R3>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
  o3: Operator<StripOperatorResult<R2>, R3, Params>,
): (
  params: Params,
) => Observable<
  StripOperatorResult<R1> | StripOperatorResult<R2> | StripOperatorResult<R3>
>;

export function streamPipe<Params, R1, R2, R3, R4>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
  o3: Operator<StripOperatorResult<R2>, R3, Params>,
  o4: Operator<StripOperatorResult<R3>, R4, Params>,
): (
  params: Params,
) => Observable<
  | StripOperatorResult<R1>
  | StripOperatorResult<R2>
  | StripOperatorResult<R3>
  | StripOperatorResult<R4>
>;

export function streamPipe<Params, R1, R2, R3, R4, R5>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
  o3: Operator<StripOperatorResult<R2>, R3, Params>,
  o4: Operator<StripOperatorResult<R3>, R4, Params>,
  o5: Operator<StripOperatorResult<R4>, R5, Params>,
): (
  params: Params,
) => Observable<
  | StripOperatorResult<R1>
  | StripOperatorResult<R2>
  | StripOperatorResult<R3>
  | StripOperatorResult<R4>
  | StripOperatorResult<R5>
>;

export function streamPipe<Params, R1, R2, R3, R4, R5, R6>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
  o3: Operator<StripOperatorResult<R2>, R3, Params>,
  o4: Operator<StripOperatorResult<R3>, R4, Params>,
  o5: Operator<StripOperatorResult<R4>, R5, Params>,
  o6: Operator<StripOperatorResult<R5>, R6, Params>,
): (
  params: Params,
) => Observable<
  | StripOperatorResult<R1>
  | StripOperatorResult<R2>
  | StripOperatorResult<R3>
  | StripOperatorResult<R4>
  | StripOperatorResult<R5>
  | StripOperatorResult<R6>
>;

export function streamPipe<Params, R1, R2, R3, R4, R5, R6, R7>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
  o3: Operator<StripOperatorResult<R2>, R3, Params>,
  o4: Operator<StripOperatorResult<R3>, R4, Params>,
  o5: Operator<StripOperatorResult<R4>, R5, Params>,
  o6: Operator<StripOperatorResult<R5>, R6, Params>,
  o7: Operator<StripOperatorResult<R6>, R7, Params>,
): (
  params: Params,
) => Observable<
  | StripOperatorResult<R1>
  | StripOperatorResult<R2>
  | StripOperatorResult<R3>
  | StripOperatorResult<R4>
  | StripOperatorResult<R5>
  | StripOperatorResult<R6>
  | StripOperatorResult<R7>
>;

export function streamPipe<Params, R1, R2, R3, R4, R5, R6, R7, R8>(
  o1: Operator<Params, R1, Params>,
  o2: Operator<StripOperatorResult<R1>, R2, Params>,
  o3: Operator<StripOperatorResult<R2>, R3, Params>,
  o4: Operator<StripOperatorResult<R3>, R4, Params>,
  o5: Operator<StripOperatorResult<R4>, R5, Params>,
  o6: Operator<StripOperatorResult<R5>, R6, Params>,
  o7: Operator<StripOperatorResult<R6>, R7, Params>,
  o8: Operator<StripOperatorResult<R7>, R8, Params>,
): (
  params: Params,
) => Observable<
  | StripOperatorResult<R1>
  | StripOperatorResult<R2>
  | StripOperatorResult<R3>
  | StripOperatorResult<R4>
  | StripOperatorResult<R5>
  | StripOperatorResult<R6>
  | StripOperatorResult<R7>
  | StripOperatorResult<R8>
>;

export function streamPipe(
  ...operators: Operator<any, any, any>[]
): (params: any) => Observable<any> {
  return (params: any) =>
    new Observable<any>((subscriber) => {
      let i = -1;

      const run = (input: any) => {
        if (subscriber.closed) {
          return;
        }

        i += 1;

        if (i >= operators.length) {
          subscriber.complete();
        } else {
          const operation = operators[i](input, params);

          if (isObservable(operation)) {
            let latestValue: any;

            operation.subscribe(
              (r) => {
                latestValue = r;
                subscriber.next(r);
              },
              (error) => {
                subscriber.error(error);
              },
              () => {
                run(latestValue);
              },
            );
          } else {
            Promise.resolve(operation)
              .then((value) => {
                subscriber.next(value);
                run(value);
              })
              .catch((error) => {
                subscriber.error(error);
              });
          }
        }
      };

      run(params);
    });
}
