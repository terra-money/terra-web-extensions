import { observePasswordStorage } from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';

export function usePasswordSavedAddresses() {
  const [addresses, setAddresses] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    observePasswordStorage().subscribe({
      next: ({ savedPasswords }) => {
        setAddresses(
          new Set(savedPasswords.map(({ terraAddress }) => terraAddress)),
        );
      },
    });
  }, []);

  return addresses;
}
