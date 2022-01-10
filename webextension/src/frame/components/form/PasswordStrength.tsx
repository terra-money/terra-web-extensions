import { passwordStrength } from 'check-password-strength';
import React, { CSSProperties, useMemo } from 'react';

export interface PasswordStrengthProps {
  className?: string;
  style?: CSSProperties;
  password: string;
}

export function PasswordStrength({
  className,
  style,
  password,
}: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (password.length === 0) {
      return null;
    }
    return passwordStrength(password);
  }, [password]);

  return strength ? (
    <span className={className} style={style}>
      {strength.value}
    </span>
  ) : null;
}
