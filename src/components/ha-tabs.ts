import { customElement } from "lit/decorators";
import { MdTabs } from "@material/web/tabs/tabs";
import { CSSResult, css } from "lit";

@customElement("ha-tabs")
export class HaTabs extends MdTabs {
  static get styles(): CSSResult[] {
    return [
      ...MdTabs.styles,
      css`
        :host {
        }
        .tabs {
          // overflow: hidden;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-tabs": HaTabs;
  }
}
