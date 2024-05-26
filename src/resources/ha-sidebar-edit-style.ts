import { css } from "lit";

export const sidebarEditStyle = css`
  .reorder-list ha-list-item-new:nth-of-type(2n) {
    animation-name: keyframes1;
    animation-iteration-count: infinite;
    transform-origin: 50% 10%;
    animation-delay: -0.75s;
    animation-duration: 0.25s;
  }

  .reorder-list ha-list-item-new:nth-of-type(2n-1) {
    animation-name: keyframes2;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    transform-origin: 30% 5%;
    animation-delay: -0.5s;
    animation-duration: 0.33s;
  }

  .reorder-list ha-list-item-new {
    display: flex;
  }

  .reorder-list {
    outline: none;
    display: block !important;
  }

  .hidden-panel {
    display: flex !important;
  }

  @keyframes keyframes1 {
    0% {
      transform: rotate(-1deg);
      animation-timing-function: ease-in;
    }

    50% {
      transform: rotate(1.5deg);
      animation-timing-function: ease-out;
    }
  }

  @keyframes keyframes2 {
    0% {
      transform: rotate(1deg);
      animation-timing-function: ease-in;
    }

    50% {
      transform: rotate(-1.5deg);
      animation-timing-function: ease-out;
    }
  }

  .show-panel,
  .hide-panel {
    display: none;
    --mdc-icon-button-size: 40px;
  }

  :host([expanded]) .hide-panel {
    display: block;
  }

  :host([expanded]) .show-panel {
    display: inline-flex;
  }

  ha-list-item-new.hidden-panel,
  ha-list-item-new.hidden-panel span,
  ha-list-item-new.hidden-panel ha-icon[slot="start"] {
    color: var(--secondary-text-color);
    cursor: pointer;
  }
`;
