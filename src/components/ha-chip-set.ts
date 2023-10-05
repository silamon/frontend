import { MdChipSet } from "@material/web/chips/chip-set";
import { css, CSSResult } from "lit";
import { customElement } from "lit/decorators";

@customElement("ha-chip-set")
export class HaChipSet extends MdChipSet {
  static get styles(): CSSResult[] {
    return MdChipSet.styles.concat(css`
      :host {
        --md-sys-color-primary: #191c1c;
      }
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-chip-set": HaChipSet;
  }
}
