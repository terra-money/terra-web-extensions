import { isObservable, Observable } from 'rxjs';

export type Operator<T, R> = (param: T) => Observable<R> | Promise<R> | R;

export function streamPipe<Params, R1>(
  o1: Operator<Params, R1>,
): (params: Params) => Observable<R1>;

export function streamPipe<Params, R1, R2>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
): (params: Params) => Observable<R1 | R2>;

export function streamPipe<Params, R1, R2, R3>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
  o3: Operator<R2, R3>,
): (params: Params) => Observable<R1 | R2 | R3>;

export function streamPipe<Params, R1, R2, R3, R4>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
  o3: Operator<R2, R3>,
  o4: Operator<R3, R4>,
): (params: Params) => Observable<R1 | R2 | R3 | R4>;

export function streamPipe<Params, R1, R2, R3, R4, R5>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
  o3: Operator<R2, R3>,
  o4: Operator<R3, R4>,
  o5: Operator<R4, R5>,
): (params: Params) => Observable<R1 | R2 | R3 | R4 | R5>;

export function streamPipe<Params, R1, R2, R3, R4, R5, R6>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
  o3: Operator<R2, R3>,
  o4: Operator<R3, R4>,
  o5: Operator<R4, R5>,
  o6: Operator<R5, R6>,
): (params: Params) => Observable<R1 | R2 | R3 | R4 | R5 | R6>;

export function streamPipe<Params, R1, R2, R3, R4, R5, R6, R7>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
  o3: Operator<R2, R3>,
  o4: Operator<R3, R4>,
  o5: Operator<R4, R5>,
  o6: Operator<R5, R6>,
  o7: Operator<R6, R7>,
): (params: Params) => Observable<R1 | R2 | R3 | R4 | R5 | R6 | R7>;

export function streamPipe<Params, R1, R2, R3, R4, R5, R6, R7, R8>(
  o1: Operator<Params, R1>,
  o2: Operator<R1, R2>,
  o3: Operator<R2, R3>,
  o4: Operator<R3, R4>,
  o5: Operator<R4, R5>,
  o6: Operator<R5, R6>,
  o7: Operator<R6, R7>,
  o8: Operator<R7, R8>,
): (params: Params) => Observable<R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8>;

export function streamPipe(
  ...operators: Operator<any, any>[]
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
          const operation = operators[i](input);

          if (isObservable(operation)) {
            let latestValue: any;

            const subscription = operation.subscribe(
              (r) => {
                latestValue = r;
                subscriber.next(r);
              },
              (error) => {
                subscriber.error(error);
                subscription.unsubscribe();
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
