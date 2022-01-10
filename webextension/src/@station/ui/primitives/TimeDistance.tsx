import { useLocalStorageValue } from '@mantine/hooks';
import React, { useEffect, useMemo, useState } from 'react';

export interface TimeDistanceProps {
  date: Date | number;
}

export function formatDistance(from: Date, to: Date) {
  const sec = Math.floor((to.getTime() - from.getTime()) / 1000);

  if (sec === 1) {
    return sec + ' second ago';
  } else if (sec < 60) {
    return sec + ' seconds ago';
  } else if (sec === 60) {
    return '1 minute ago';
  } else {
    return Math.floor(sec / 60) + ' minutes ago';
  }
}

export function formatLocale(date: Date, locales: string = 'en-US') {
  return (
    date.toLocaleDateString(locales) + ' ' + date.toLocaleTimeString(locales)
  );
}

export function TimeDistance({ date: _date }: TimeDistanceProps) {
  const [style, setStyle] = useLocalStorageValue<'distance' | 'timestamp'>({
    key: '__terra_ui_time_distance_style__',
    defaultValue: 'distance',
  });

  const date = useMemo<Date>(() => {
    return typeof _date === 'number' ? new Date(_date) : _date;
  }, [_date]);

  const [str, setStr] = useState<string>(() => {
    return style === 'distance'
      ? formatDistance(date, new Date())
      : formatLocale(date, 'en-US');
  });

  useEffect(() => {
    function update(now: Date) {
      setStr(
        style === 'distance'
          ? formatDistance(date, now)
          : formatLocale(date, 'en-US'),
      );
    }

    update(new Date());

    if (style === 'distance') {
      const intervalId = setInterval(() => {
        update(new Date());
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [date, style]);

  return (
    <time
      dateTime={date.toISOString()}
      style={{ cursor: 'ew-resize' }}
      onClick={() =>
        setStyle((prev) => (prev === 'distance' ? 'timestamp' : 'distance'))
      }
    >
      {str}
    </time>
  );
}
