import { easeQuadOut } from 'd3-ease';
import { timer } from 'd3-timer';
import { Observable } from 'rxjs';

interface TweenOptions<T> {
  duration: number;
  interpolation: (t: number) => T;
  ease?: (normalizedTime: number) => number;
}

export function tween<T>({
  interpolation,
  ease = easeQuadOut,
  duration,
}: TweenOptions<T>): Observable<T> {
  return new Observable<T>((subscriber) => {
    const t = timer((elapsed) => {
      const v = interpolation(
        ease(Math.max(Math.min(elapsed / duration, 1), 0)),
      );
      console.log('index.ts..()', v);
      subscriber.next(v);
      if (elapsed >= duration) {
        t.stop();
      }
    });

    return () => {
      t.stop();
    };
  });
}
