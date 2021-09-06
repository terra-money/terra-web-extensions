import { FormSection } from '@station/ui';
import { TxResultRendering } from '@libs/webapp-fns';
import React, { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { useStateRef } from 'use-state-ref';
import { TxRenderer } from 'webextension/components/tx/TxRenderer';

export interface RenderTxProps {
  stream: Observable<TxResultRendering>;
  onComplete: () => void;
}

export function RenderTx({ stream, onComplete }: RenderTxProps) {
  const [result, setResult] = useState<TxResultRendering | null>(null);

  const onCompleteRef = useStateRef(onComplete);

  useEffect(() => {
    if (stream) {
      let timeoutId: any = null;

      const subscription = stream.subscribe({
        next: (r) => {
          setResult(r);
        },
        error: (error) => {
          console.error(error);
          onCompleteRef.current?.();
          setResult(null);
        },
        complete: () => {
          timeoutId = setTimeout(() => {
            onCompleteRef.current?.();
            setResult(null);
          }, 1000 * 30);
        },
      });

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        subscription.unsubscribe();
      };
    }
  }, [onComplete, onCompleteRef, stream]);

  return <FormSection>{result && <TxRenderer result={result} />}</FormSection>;
}
