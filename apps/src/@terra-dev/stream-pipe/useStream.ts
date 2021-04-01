import { useCallback, useRef, useState } from 'react';
import { Observable, Subject, Subscription } from 'rxjs';

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

  const subscriptionRef = useRef<Subscription | undefined>(undefined);
  const subscriberRef = useRef<Subject<Result> | undefined>(undefined);

  const exec = useCallback(
    (params: Params) => {
      const subscriber = new Subject<Result>();

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      if (subscriberRef.current) {
        subscriberRef.current.unsubscribe();
      }

      let latestResult: Result;

      const subscription = fn(params).subscribe(
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

          subscriptionRef.current = undefined;
          subscriberRef.current = undefined;
          subscriber.unsubscribe();
          subscription.unsubscribe();
        },
        () => {
          subscriber.complete();

          setPayload({
            status: StreamStatus.DONE,
            result: latestResult,
            reset: () => setPayload(ready),
          });

          subscriptionRef.current = undefined;
          subscriberRef.current = undefined;
          subscriber.unsubscribe();
          subscription.unsubscribe();
        },
      );

      subscriberRef.current = subscriber;
      subscriptionRef.current = subscription;

      return subscriber.asObservable();
    },
    [fn],
  );

  return [exec, payload];
}
