import styled from 'styled-components';

export const Layout = styled.div`
  > figure {
    display: grid;
    place-content: center;
    height: 70px;

    svg {
      font-size: 50px;
    }
  }

  > h2 {
    font-size: 1.28571429em;
    font-weight: 500;
    text-align: center;

    margin-bottom: 2.85714286em;
  }

  a {
    color: var(--color-paleblue);
  }

  > div {
    margin-bottom: 1.42857143em;
  }

  > button {
    display: block;
    width: 100%;
    max-width: 360px;
    margin: 2.85714286em auto 0 auto;
  }
`;
