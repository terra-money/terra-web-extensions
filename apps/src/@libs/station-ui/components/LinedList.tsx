import styled from 'styled-components';

export const LinedList = styled.ul<{
  iconMarginRight?: `${number}em`;
  firstLetterUpperCase?: boolean;
}>`
  list-style: none;
  padding: 0;

  li {
    height: 2.5em;

    display: flex;
    justify-content: space-between;
    align-items: center;

    &:not(:first-child) {
      border-top: 1px dashed #eeeeee;
    }

    a {
      color: inherit;
    }

    color: #000000;

    &[data-selected='false'] {
      color: #bbbbbb;

      &:hover {
        color: #555555;
      }
    }

    svg {
      font-size: 1.2em;
      transform: translateY(0.17em);
    }

    img {
      width: 1.2em;
      height: 1.2em;
      transform: translateY(0.17em) scale(1.2);
    }

    i {
      margin-right: ${({ iconMarginRight = '0.2em' }) => iconMarginRight};
    }

    span {
      display: inline-block;

      &:first-letter {
        text-transform: ${({ firstLetterUpperCase = true }) =>
          firstLetterUpperCase ? 'uppercase' : 'none'};
      }
    }

    button {
      border: none;
      outline: none;
      background-color: transparent;
      padding: 0;

      cursor: pointer;

      color: #bbbbbb;

      &:hover {
        color: #555555;
      }
    }
  }
`;
