import { OperatorReturn, streamPipe } from '@terra-dev/stream-pipe';
import { Observable, of } from 'rxjs';

describe('stream-pipe', () => {
  test('typing test - empty params', () => {
    const o = streamPipe(
      (_: void) => of({ x: 1 }),
      ({ x }) => Promise.resolve({ y: x + 1 }),
      ({ y }) => ({ z: y + 1 }),
    );

    const s: Observable<{ x: number } | { y: number } | { z: number }> = o();

    s.subscribe((result) => {
      expect(
        'x' in result
          ? result.x === 1
          : 'y' in result
          ? result.y === 2
          : result.z === 3,
      ).toBeTruthy();
    });
  });

  test('typing test - if statement with type or', () => {
    const o = streamPipe(
      (a: number) => of({ x: a * 2 }),
      ({ x }) =>
        (x > 10 ? of({ y1: x * 100 }) : { y2: 0 }) as OperatorReturn<
          { y1: number } | { y2: number }
        >,
      (result) => ('y1' in result ? { z: true } : { z: false }),
    );

    const s: Observable<
      { x: number } | { y1: number } | { y2: number } | { z: boolean }
    > = o(10);

    s.subscribe((result) => {
      expect(
        'x' in result
          ? result.x === 20
          : 'y1' in result
          ? result.y1 === 200
          : 'z' in result
          ? result.z
          : false,
      ).toBeTruthy();
    });

    o(1).subscribe((result) => {
      expect(
        'x' in result
          ? result.x === 2
          : 'y2' in result
          ? result.y2 === 0
          : 'z' in result
          ? result.z === false
          : false,
      ).toBeTruthy();
    });
  });
});
