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
          --md-sys-color-primary: var(--primary-color);
          --md-sys-color-secondary: var(--secondary-color);
          --md-sys-color-surface: var(--card-background-color);
          --md-sys-color-on-surface: var(--primary-color);
          --md-sys-color-on-surface-variant: var(--secondary-color);
        }

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
