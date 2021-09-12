import { passwordStrength } from 'check-password-strength';
import { fixHMR } from 'fix-hmr';
import React, { useMemo } from 'react';
import styled from 'styled-components';

export interface PasswordStrengthProps {
  className?: string;
  password: string;
}

function PasswordStrengthBase({ className, password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (password.length === 0) {
      return null;
    }
    return passwordStrength(password);
  }, [password]);

  return strength ? <p>Password strength is "{strength.value}"</p> : null;
}

export const StyledPasswordStrength = styled(PasswordStrengthBase)`
  // TODO
`;

export const PasswordStrength = fixHMR(StyledPasswordStrength);
