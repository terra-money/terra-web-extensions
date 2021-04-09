import { streamPipe } from '@terra-dev/stream-pipe/streamPipe';
import { Observable, of } from 'rxjs';

class StreamRecorder {
  readonly records: unknown[] = [];

  record = (x: unknown) => {
    this.records.push(x);
  };
}

describe('stream-pipe', () => {
  test('simple test', (done) => {
    const fn = streamPipe(
      (n: number) => of(n.toString()),
      (s: string) => Promise.resolve(parseInt(s)),
      (n: number) => n.toString(),
    );

    const recorder = new StreamRecorder();

    fn(10).subscribe(
      recorder.record,
      () => {},
      () => {
        expect(JSON.stringify(recorder.records)).toBe(
          JSON.stringify(['10', 10, '10']),
        );
        done();
      },
    );
  });

  test('async test', (done) => {
    const fn = streamPipe(
      (n: number) =>
        new Observable<number | string>((subscriber) => {
          let i: number = 0;

          function run() {
            setTimeout(() => {
              if (i % 2 === 0) {
                subscriber.next(n * i);
              } else {
                subscriber.next((n * i).toString());
              }

              i += 1;

              if (i > 5) {
                subscriber.complete();
              } else {
                run();
              }
            }, 100);
          }

          run();
        }),
      (s: number | string) =>
        new Promise<string>((resolve) =>
          setTimeout(() => resolve(s + '?'), 1000),
        ),
    );

    const recorder = new StreamRecorder();

    fn(10).subscribe(
      recorder.record,
      () => {},
      () => {
        expect(JSON.stringify(recorder.records)).toBe(
          JSON.stringify([0, '10', 20, '30', 40, '50', '50?']),
        );
        done();
      },
    );
  });

  test('error test', (done) => {
    const fn = streamPipe(
      (n: number) =>
        new Observable<number | string>((subscriber) => {
          let i: number = 0;

          function run() {
            setTimeout(() => {
              if (i % 2 === 0) {
                subscriber.next(n * i);
              } else {
                subscriber.next((n * i).toString());
              }

              i += 1;

              if (i > 5) {
                subscriber.error(new Error('error!'));
              } else {
                run();
              }
            }, 100);
          }

          run();
        }),
      (s: number | string) =>
        new Promise<string>((resolve) =>
          setTimeout(() => resolve(s + '?'), 1000),
        ),
    );

    const recorder = new StreamRecorder();

    fn(10).subscribe(
      recorder.record,
      (error) => {
        expect(JSON.stringify(recorder.records)).toBe(
          JSON.stringify([0, '10', 20, '30', 40, '50']),
        );
        expect(error.message).toBe('error!');
        done();
      },
      () => {
        throw new Error('never come here!');
      },
    );
  });

  test('error test with throw', (done) => {
    const fn = streamPipe(
      (n: number) =>
        new Observable<number | string>((subscriber) => {
          let i: number = 0;

          function run() {
            if (i % 2 === 0) {
              subscriber.next(n * i);
            } else {
              subscriber.next((n * i).toString());
            }

            i += 1;

            if (i > 5) {
              throw new Error('error!');
            } else {
              run();
            }
          }

          run();
        }),
      (s: number | string) =>
        new Promise<string>((resolve) =>
          setTimeout(() => resolve(s + '?'), 1000),
        ),
    );

    const recorder = new StreamRecorder();

    fn(10).subscribe(
      recorder.record,
      (error) => {
        expect(JSON.stringify(recorder.records)).toBe(
          JSON.stringify([0, '10', 20, '30', 40, '50']),
        );
        expect(error.message).toBe('error!');
        done();
      },
      () => {
        throw new Error('never come here!');
      },
    );
  });
});
