import { useCallback, useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';

export enum StreamStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
  READY = 'READY',
}

export interface StreamReady {
  status: StreamStatus.READY;
}

export interface StreamInProgress<Result> {
  status: StreamStatus.IN_PROGRESS;
  result: Result;
}

export interface StreamDone<Result> {
  status: StreamStatus.DONE;
  result: Result;
  reset: () => void;
}

export interface StreamError {
  status: StreamStatus.ERROR;
  error: unknown;
  reset: () => void;
}

export type StreamResultPayload<Result> =
  | StreamReady
  | StreamInProgress<Result>
  | StreamDone<Result>
  | StreamError;

export type StreamResult<Params, Result> = [
  (params: Params) => Observable<Result>,
  StreamResultPayload<Result>,
];

const ready: StreamReady = {
  status: StreamStatus.READY,
};

export function useStream<Params, Result>(
  fn: (params: Params) => Observable<Result>,
): StreamResult<Params, Result> {
  const [payload, setPayload] = useState<StreamResultPayload<Result>>(
    () => ready,
  );

  const subscription = useRef<Subscription | undefined>(undefined);

  const exec = useCallback(
    (params: Params) =>
      new Observable<Result>((subscriber) => {
        if (subscription.current) {
          subscription.current.unsubscribe();
        }

        let latestResult: Result;

        subscription.current = fn(params).subscribe(
          (result) => {
            subscriber.next(result);

            latestResult = result;

            setPayload({
              status: StreamStatus.IN_PROGRESS,
              result,
            });
          },
          (error) => {
            subscriber.error(error);

            setPayload({
              status: StreamStatus.ERROR,
              error,
              reset: () => setPayload(ready),
            });
          },
          () => {
            subscriber.complete();

            subscription.current = undefined;
            setPayload({
              status: StreamStatus.DONE,
              result: latestResult,
              reset: () => setPayload(ready),
            });
          },
        );
      }),
    [fn],
  );

  return [exec, payload];
}
