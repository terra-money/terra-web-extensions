import { vibrate } from '@libs/ui';
import { Button, Message, SingleLineFormContainer } from '@station/ui2';
import React, {
  ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { NewWalletResult } from 'webextension/components/views/NewWallet';
import { FormFooter } from '../layouts/FormFooter';
import { FormMain } from '../layouts/FormMain';

export interface ConfirmYourSeedProps {
  className?: string;
  createWallet: NewWalletResult;
  onCancel: () => void;
  onValidate: (result: NewWalletResult) => void;
}

const random = () => Math.random() - Math.random();

const MAX_FAILED = 3;

export function ConfirmYourSeed({
  className,
  createWallet,
  onCancel,
  onValidate,
}: ConfirmYourSeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const confirm = useMemo(() => {
    const words = createWallet.mk.mnemonic.split(' ');

    const q1 = Math.floor((Math.random() * words.length) / 2);
    const q2 = Math.floor(Math.random() * (words.length - q1)) + q1;

    const word1 = words[q1];
    const word2 = words[q2];

    const samples = words
      .sort(random)
      .filter((word) => word !== word1 && word !== word2)
      .slice(0, 4)
      .concat([word1, word2])
      .sort(random);

    return { words, q1, q2, word1, word2, samples };
  }, [createWallet.mk.mnemonic]);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [word1, setWord1] = useState<string>('');
  const [word2, setWord2] = useState<string>('');

  const [failed, setFailed] = useState<number>(0);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const validate = useCallback(() => {
    if (word1 === confirm.word1 && word2 === confirm.word2) {
      onValidate(createWallet);
    } else {
      containerRef.current?.animate(vibrate, { duration: 100 });

      setWord1('');
      setWord2('');
      setFailed((prev) => prev + 1);
    }
  }, [confirm.word1, confirm.word2, createWallet, onValidate, word1, word2]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (failed > MAX_FAILED) {
    return (
      <div className={className}>
        <FormMain>
          <Message variant="danger">
            Mnemonic Key 를 확인하지 못하셨습니다. 이 지갑 생성은 취소됩니다.
          </Message>
        </FormMain>

        <FormFooter>
          <Button variant="danger" size="large" onClick={onCancel}>
            Confirm
          </Button>
        </FormFooter>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <FormMain>
        <Inputs>
          <SingleLineFormContainer label={`${ord(confirm.q1 + 1)} word`}>
            <input
              type="text"
              placeholder="Select or type"
              value={word1}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
                setWord1(target.value)
              }
            />
          </SingleLineFormContainer>

          <SingleLineFormContainer label={`${ord(confirm.q2 + 1)} word`}>
            <input
              type="text"
              placeholder="Select or type"
              value={word2}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
                setWord2(target.value)
              }
            />
          </SingleLineFormContainer>
        </Inputs>

        <ButtonGrid>
          {confirm.samples.map((word) => (
            <Button
              key={'sample' + word}
              size="medium"
              variant="dim"
              onClick={() => {
                if (word1.length === 0) {
                  setWord1(word);
                } else {
                  setWord2(word);
                }
              }}
              style={{
                borderRadius: 5,
              }}
            >
              {word}
            </Button>
          ))}
        </ButtonGrid>
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          disabled={word1.length === 0 || word2.length === 0}
          onClick={validate}
        >
          Confirm
        </Button>
      </FormFooter>
    </div>
  );
}

function ord(n: number) {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const mod100 = n % 100;
  return n + (suffix[(mod100 - 20) % 10] || suffix[mod100] || suffix[0]);
}

const Inputs = styled.section`
  display: flex;
  gap: 10px;

  > * {
    flex: 1;
  }
`;

const ButtonGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 5px;
`;
