import { Observable } from 'rxjs';

export function createTimeline(
  delay: number,
  duration: number,
  repeat: boolean,
): Observable<number> {
  return new Observable<number>((subscriber) => {
    let startTime: number = Date.now();

    let t: number = 0;
    let stop: boolean = false;

    function frame() {
      if (stop) return;

      t = Date.now() - startTime;

      requestAnimationFrame(frame);

      if (t < delay) {
      } else if (t < delay + duration) {
        subscriber.next((t - delay) / duration);
      } else {
        subscriber.next(1);
        if (repeat) {
          startTime = Date.now();
        } else {
          subscriber.complete();
        }
      }
    }

    requestAnimationFrame(frame);

    return () => {
      stop = true;
    };
  });
}
