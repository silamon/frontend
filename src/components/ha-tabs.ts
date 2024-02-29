import { customElement } from "lit/decorators";
import { MdTabs } from "@material/web/tabs/tabs";
import { CSSResult, css } from "lit";

@customElement("ha-tabs")
export class HaTabs extends MdTabs {
  static get styles(): CSSResult[] {
    return [
      ...MdTabs.styles,
      css`
        .tabs::-webkit-scrollbar {
          width: 0.4rem;
          height: 0.4rem;
        }

        .tabs::-webkit-scrollbar-thumb {
          -webkit-border-radius: 4px;
          border-radius: 4px;
          background: var(--scrollbar-thumb-color);
        }

        .tabs {
          overflow-y: auto;
          scrollbar-color: var(--scrollbar-thumb-color) transparent;
          scrollbar-width: thin;
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
