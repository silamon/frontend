import "element-internals-polyfill";
import { MdInputChip } from "@material/web/chips/input-chip";
import { css } from "lit";
import { customElement } from "lit/decorators";

@customElement("ha-input-chip")
export class HaInputChip extends MdInputChip {
  static override styles = [
    ...super.styles,
    css`
      :host {
        --md-input-chip-container-shape: 16px;
        --md-input-chip-outline-color: var(--outline-color);
        --md-input-chip-selected-container-color: rgba(
          var(--rgb-primary-text-color),
          0.15
        );
      }
      /** Set the size of mdc icons **/
      ::slotted([slot="icon"]) {
        display: flex;
        --mdc-icon-size: var(--md-input-chip-icon-size, 18px);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-input-chip": HaInputChip;
  }
}
