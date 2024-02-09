import "@material/mwc-button";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators";
import "../../../../src/components/ha-card";
import "../../../../src/components/ha-tab-bar";

@customElement("demo-misc-paper-tabs")
export class DemoPaperTabs extends LitElement {
  protected render(): TemplateResult {
    return html` <ha-tab-bar></ha-tab-bar> `;
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-misc-paper-tabs": DemoPaperTabs;
  }
}
