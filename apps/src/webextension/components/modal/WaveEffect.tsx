import { createTimeline } from '@rx-stream/animation';
import { pipe } from '@rx-stream/pipe';
import { easeQuadOut } from 'd3-ease';
import React, { useEffect, useRef } from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

export interface WaveEffectProps {
  className?: string;
  bgFillColor?: string;
  waveStrokeColor?: string;
  waveInterval?: number;
  waveLength?: number;
  enterDelay?: number;
  enterDuration?: number;
  waveDelay?: number;
  waveDuration?: number;
}

function WaveEffectBase({
  className,
  bgFillColor = 'rgba(0, 0, 0, 0.4)',
  waveStrokeColor = 'rgba(255, 255, 255, 0.5)',
  waveInterval = 0.03,
  waveLength = 5,
  enterDelay = 400,
  enterDuration = 1000,
  waveDelay = 2000,
  waveDuration = 3000,
}: WaveEffectProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let w: number = window.innerWidth;
    let h: number = window.innerHeight;
    let w2: number = Math.ceil(window.innerWidth / 2);
    let h2: number = Math.ceil(window.innerHeight / 2);

    const canvas: HTMLCanvasElement = ref.current!;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })!;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      w2 = Math.ceil(window.innerWidth / 2);
      h2 = Math.ceil(window.innerHeight / 2);

      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }

    window.addEventListener('resize', resize);
    resize();

    const subscription = pipe(
      () =>
        createTimeline(enterDelay, enterDuration, false).pipe(
          map((t) => ({ phase: 'enter', t })),
        ),
      () =>
        createTimeline(waveDelay, waveDuration, true).pipe(
          map((t) => ({ phase: 'wave', t })),
        ),
    )(void 0).subscribe(({ phase, t }) => {
      if (phase === 'enter') {
        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.fillStyle = bgFillColor;
        ctx.arc(w2, h2, Math.floor(w * easeQuadOut(t)), 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      } else {
        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.fillStyle = bgFillColor;
        ctx.fillRect(0, 0, w, h);
        ctx.closePath();

        let i: number = waveLength;
        while (--i >= 0) {
          if (t < i * waveInterval) break;

          ctx.beginPath();
          ctx.strokeStyle = waveStrokeColor;
          ctx.lineWidth = 1;
          ctx.arc(
            w2,
            h2,
            Math.floor(w * easeQuadOut(t - waveInterval * i)),
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          ctx.closePath();
        }
      }
    });

    return () => {
      window.removeEventListener('resize', resize);
      subscription.unsubscribe();
    };
  }, [
    bgFillColor,
    enterDelay,
    enterDuration,
    waveDelay,
    waveDuration,
    waveInterval,
    waveLength,
    waveStrokeColor,
  ]);

  return <canvas className={className} ref={ref} />;
}

export const WaveEffect = styled(WaveEffectBase)`
  position: fixed;
  top: 0;
  left: 0;
`;
