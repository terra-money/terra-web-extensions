import styled from 'styled-components';

export const FormSection = styled.section`
  font-size: 12px;

  header {
    margin-top: -10px;

    h1 {
      font-size: 1.2em;
      text-align: center;

      margin-bottom: 1em;
    }

    margin-bottom: 1em;
  }

  footer {
    margin-top: 2em;

    display: flex;

    > * {
      flex: 1;

      &:not(:first-child) {
        margin-left: 0.5em;
      }
    }
  }
`;
