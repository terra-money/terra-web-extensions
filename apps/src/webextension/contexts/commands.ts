import { isAllowedCommandId } from '@terra-dev/web-extension-backend';
import { useEffect } from 'react';

import { useHistory } from 'react-router-dom';

export function useAllowedCommandId(id: string | undefined, to: string) {
  const history = useHistory();

  useEffect(() => {
    if (!id) {
      return;
    }

    isAllowedCommandId(id).then((allowed) => {
      if (!allowed) {
        history.push(to);
      }
    });
  }, [history, id, to]);
}
