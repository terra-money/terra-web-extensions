import { EmptyNumberInput, vibrate } from '@libs/ui';
import { Button, SingleLineFormContainer } from '@station/ui';
import {
  EncryptedWallet,
  validateMnemonicKey,
  validatePasswordConfirm,
  validateWalletPassword,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PasswordStrength } from 'frame/components/form/PasswordStrength';
import { FormFooter } from 'frame/components/layouts/FormFooter';
import { FormMain } from 'frame/components/layouts/FormMain';
import { BIPWalletInfo } from 'frame/models/BIPWalletInfo';
import { getAvailableBIPWallets } from 'frame/queries/getAvailableBIPWallets';

export interface ResetWalletPasswordResult {
  encryptedWallet: EncryptedWallet;
  bipWallet: BIPWalletInfo;
  password: string;
}

export interface ResetWalletPasswordProps {
  className?: string;
  encryptedWallet: EncryptedWallet;
  onCancel: () => void;
  onUpdate: (result: ResetWalletPasswordResult) => void;
}

export function ResetWalletPassword({
  className,
  encryptedWallet,
  onCancel,
  onUpdate,
}: ResetWalletPasswordProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [mnemonic, setMnemonic] = useState<string>('');
  const [addressIndex, setAddressIndex] = useState<string>('');

  const [nextPassword, setNextPassword] = useState<string>('');
  const [nextPasswordConfirm, setNextPasswordConfirm] = useState<string>('');

  const [mnemonicError, setMnemonicError] = useState<string | null>(null);

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidMnemonic = useMemo(() => {
    return validateMnemonicKey(mnemonic);
  }, [mnemonic]);

  const invalidNextPassword = useMemo(() => {
    return validateWalletPassword(nextPassword);
  }, [nextPassword]);

  const invalidNextPasswordConfirm = useMemo(() => {
    return validatePasswordConfirm(nextPassword, nextPasswordConfirm);
  }, [nextPassword, nextPasswordConfirm]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const updateMnemonic = useCallback(({ currentTarget }) => {
    setMnemonicError(null);
    setMnemonic(currentTarget.value);
  }, []);

  const update = useCallback(async () => {
    try {
      const availableBipWallets = await getAvailableBIPWallets(
        mnemonic,
        addressIndex.length > 0 ? parseInt(addressIndex) : undefined,
      );

      const matchedBipWallet = availableBipWallets.find(({ mk }) => {
        return encryptedWallet.terraAddress === mk.accAddress;
      });

      if (!matchedBipWallet) {
        containerRef.current?.animate(vibrate, { duration: 100 });
        setMnemonicError(`This mnemonic is not for this wallet`);
        return;
      }

      onUpdate({
        encryptedWallet,
        bipWallet: matchedBipWallet,
        password: nextPassword,
      });
    } catch (error) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (error instanceof Error) {
        setMnemonicError(error.message);
      } else {
        setMnemonicError(String(error));
      }
    }
  }, [addressIndex, encryptedWallet, mnemonic, nextPassword, onUpdate]);

  return (
    <div ref={containerRef} className={className}>
      <FormMain>
        <SingleLineFormContainer
          label="Seed phrase"
          invalid={invalidMnemonic ?? mnemonicError}
        >
          <textarea
            placeholder="word1 word2 word3 word4..."
            value={mnemonic}
            onChange={updateMnemonic}
            style={{
              resize: 'none',
              height: 80,
            }}
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer label="Address Index">
          <EmptyNumberInput
            type="integer"
            maxIntegerPoints={7}
            value={addressIndex}
            onChange={setAddressIndex}
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="New password"
          invalid={invalidNextPassword}
          suggest={<PasswordStrength password={nextPassword} />}
        >
          <input
            type="password"
            placeholder="Must be at least 10 characters"
            value={nextPassword}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setNextPassword(target.value)
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Confirm new password"
          invalid={invalidNextPasswordConfirm}
        >
          <input
            type="password"
            placeholder="Confirm your password"
            value={nextPasswordConfirm}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setNextPasswordConfirm(target.value)
            }
          />
        </SingleLineFormContainer>
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          disabled={
            mnemonic.length === 0 ||
            nextPassword.length === 0 ||
            nextPasswordConfirm.length === 0 ||
            !!invalidMnemonic ||
            !!invalidNextPassword ||
            !!invalidNextPasswordConfirm
          }
          onClick={update}
        >
          Change password
        </Button>
      </FormFooter>
    </div>
  );
}
