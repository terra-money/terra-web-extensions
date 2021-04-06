import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle<{ backgroundColor?: string }>`
  :root {
    background-color: ${({ backgroundColor }) => backgroundColor ?? '#0c3694'};
    
    html {
      font-family: 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    }
  }
  
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    font-family: 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
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
