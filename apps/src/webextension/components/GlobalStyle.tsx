import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle<{ backgroundColor?: string }>`
  :root {
    background-color: ${({ backgroundColor }) => backgroundColor ?? '#0c3694'};
  }
  
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
  }
  
  ::-webkit-scrollbar {
    display: none;
  }
  
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
