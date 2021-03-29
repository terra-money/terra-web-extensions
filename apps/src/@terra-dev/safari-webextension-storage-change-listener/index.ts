import deepEqual from 'fast-deep-equal';
import { interval, Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';

export function safariWebExtensionStorageChangeListener<T>(
  storageKey: string,
): Observable<T> {
  return new Observable<T>((subscriber) => {
    if (browser.runtime.getURL('').startsWith('safari-web-extension://')) {
      let latestValue: T | null = null;

      const subscription = interval(1000).subscribe(() => {
        browser.storage.local.get(storageKey).then((values) => {
          const value = values[storageKey] as T;

          if (latestValue !== null) {
            if (!deepEqual(latestValue, value)) {
              latestValue = value;
              subscriber.next(value);
            }
          } else {
            latestValue = value;
            subscriber.next(value);
          }
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  });
}
