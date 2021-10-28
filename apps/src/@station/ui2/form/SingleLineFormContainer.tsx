import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

export interface SingleLineFormContainerProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  label?: ReactNode;
  suggest?: ReactNode;

  leftSection?: ReactNode;
  rightSection?: ReactNode;

  disabled?: boolean;
  readOnly?: boolean;
  invalid?: ReactNode;
}

function Component({
  label,
  suggest,
  leftSection,
  rightSection,
  disabled,
  readOnly,
  invalid,
  children,
  ...divProps
}: SingleLineFormContainerProps) {
  return (
    <div
      {...divProps}
      aria-invalid={!!invalid}
      aria-readonly={readOnly}
      aria-disabled={disabled}
    >
      {(!!label || !!suggest) && (
        <header>
          <div className="label-wrapper">{label}</div>
          <div className="suggest-wrapper">{suggest}</div>
        </header>
      )}

      <main>
        <div className="left-section-wrapper">{leftSection}</div>
        <div className="form-wrapper">{children}</div>
        <div className="right-section-wrapper">{rightSection}</div>
      </main>

      <footer>
        <div className="invalid-wrapper">{invalid}</div>
      </footer>
    </div>
  );
}

const StyledComponent = styled(Component)`
  position: relative;

  --background-color: var(--color-form-background);
  --border-color: var(--color-form-border);
  --text-color: var(--color-form-text);
  --label-color: var(--color-form-label);

  &:focus-within {
    --background-color: var(--color-form-background-focused);
    --border-color: var(--color-form-border-focused);
    --text-color: var(--color-form-text-focused);
  }

  &[aria-invalid='true'] {
    --background-color: var(--color-form-background-invalid);
    --border-color: var(--color-form-border-invalid);
    --text-color: var(--color-form-text-invalid);
    --label-color: var(--color-form-label-invalid);
  }

  &[aria-readonly='true'],
  &[aria-disabled='true'] {
    --background-color: var(--color-form-background-readonly);
    --border-color: var(--color-form-border-readonly);
    --text-color: var(--color-form-text-readonly);

    input,
    textarea {
      pointer-events: none;
    }
  }

  &[aria-disabled='true'] {
    header {
      .suggest-wrapper {
        opacity: var(--opacity-disabled);
      }
    }

    main {
      opacity: var(--opacity-disabled);
    }

    footer {
      opacity: var(--opacity-disabled);
    }
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label-wrapper {
      font-size: 14px;
      font-weight: 500;
      color: var(--label-color);

      line-height: 1.5;
    }

    margin-bottom: 5px;
  }

  main {
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    border-radius: 8px;

    display: flex;

    .left-section-wrapper,
    .right-section-wrapper {
      display: grid;
      place-content: center;

      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);

      &:empty {
        display: none;
      }
    }

    .left-section-wrapper {
      border-right: 1px solid var(--border-color);
    }

    .right-section-wrapper {
      border-left: 1px solid var(--border-color);
    }

    .form-wrapper {
      flex: 1;

      input,
      textarea {
        border: none;
        outline: none;
        background-color: transparent;

        width: 100%;

        color: var(--text-color);

        &::placeholder {
          color: var(--text-color);
          opacity: 0.5;
        }
      }

      input {
        font-size: 14px;
        height: 45px;
        padding: 0 12px;
      }

      textarea {
        font-size: 12px;
        padding: 15px 12px;
      }
    }
  }

  footer {
    position: absolute;

    font-size: 12px;

    right: 0;
    bottom: -1.5em;

    .invalid-wrapper {
      color: var(--color-form-label-invalid);
    }
  }
`;

export const SingleLineFormContainer = fixHMR(StyledComponent);
