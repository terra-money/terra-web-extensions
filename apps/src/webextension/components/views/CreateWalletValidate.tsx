import { vibrate } from '@libs/ui';
import { Button } from '@material-ui/core';
import {
  FormLabel,
  FormLayout,
  Layout,
  MiniButton,
  TextInput,
} from '@station/ui';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { CreateWalletResult } from './CreateWallet';

export interface CreateWalletValidateProps {
  createWallet: CreateWalletResult;
  onCancel: () => void;
  onValidate: (result: CreateWalletResult) => void;
  children?: ReactNode;
}

const random = () => Math.random() - Math.random();

export function CreateWalletValidate({
  createWallet,
  onCancel,
  onValidate,
  children,
}: CreateWalletValidateProps) {
  const containerRef = useRef<HTMLElement>(null);

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
  if (failed > 5) {
    return (
      <Layout>
        <FormLayout>
          <p>
            Mnemonic Key 를 확인하지 못하셨습니다. 이 지갑 생성은 취소됩니다.
          </p>
        </FormLayout>

        <footer>
          <Button variant="contained" color="primary" onClick={onCancel}>
            Confirm
          </Button>
        </footer>
      </Layout>
    );
  }

  return (
    <Layout ref={containerRef}>
      {children}

      <Inputs>
        <FormLabel label={`${confirm.q1} word`}>
          <TextInput
            fullWidth
            value={word1}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setWord1(target.value)
            }
          />
        </FormLabel>

        <FormLabel label={`${confirm.q2} word`}>
          <TextInput
            fullWidth
            value={word2}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setWord2(target.value)
            }
          />
        </FormLabel>
      </Inputs>

      <ButtonGrid>
        {confirm.samples.map((word) => (
          <MiniButton
            key={'sample' + word}
            onClick={() => {
              if (word1.length === 0) {
                setWord1(word);
              } else {
                setWord2(word);
              }
            }}
          >
            {word}
          </MiniButton>
        ))}
      </ButtonGrid>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={word1.length === 0 || word2.length === 0}
          onClick={validate}
        >
          Confirm
        </Button>
      </footer>
    </Layout>
  );
}

const Inputs = styled.section`
  display: flex;
  gap: 10px;

  > * {
    flex: 1;
  }
`;

const ButtonGrid = styled.section`
  margin-top: 20px;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 5px;
`;
