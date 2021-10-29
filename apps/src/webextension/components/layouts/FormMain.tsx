import styled from 'styled-components';

export const FormMain = styled.div`
  display: flex;
  flex-direction: column;

  padding: 28px 20px 0 20px;

  max-width: 800px;
  margin: 0 auto;

  > :not(:last-child) {
    margin-bottom: 20px;
  }
`;
