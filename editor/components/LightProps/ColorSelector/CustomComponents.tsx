import { styled } from "@mui/system";
import { grey } from "@mui/material/colors";

export const Root = styled("div")`
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  position: relative;
  display: inline-block;
  vertical-align: baseline;
  color: #000;
`;

export const Toggle = styled("div")(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.75rem;
  box-sizing: border-box;
  min-height: 2em;
  width: 5vw;
  background: var(--color, ${
    theme.palette.mode === "dark" ? grey[900] : "#fff"
  });
  border: 1px solid ${theme.palette.mode === "dark" ? grey[800] : grey[300]};
  border-radius: 0.75em;
  margin: 0.2em;
  padding: 5px;
  text-align: left;
  line-height: 1.5;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  & .placeholder {
    opacity: 0.8;
  }
  `
);

export const Listbox = styled("ul")(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.75rem;
  box-sizing: border-box;
  padding: 5px;
  margin: 5px 0 0 0;
  list-style: none;
  position: absolute;
  height: auto;
  transition: opacity 0.1s ease-in-out;
  width: 100%;
  box-shadow: ${
    theme.palette.mode === "dark"
      ? `0 5px 13px -3px rgba(0,0,0,0.4)`
      : `0 5px 13px -3px ${grey[200]}`
  };
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[800] : grey[300]};
  border-radius: 0.75em;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  overflow: auto;
  z-index: 1;
  outline: 0px;
  cursor: pointer;

  &.hidden {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s 0.1s ease, visibility 0.4s 0.1s step-end;
  }

  & > li {
    padding: 8px;
    border-radius: 0.45em;

    &:hover {
      background: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    }

    &[aria-selected='true'] {
      background: ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    }
  }
  `
);
