import "@material/mwc-button/mwc-button";
import { mdiCellphoneCog } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "./ha-icon";
import "./ha-svg-icon";
import { HomeAssistant } from "../types";

const styles = css`
  .item {
    width: 100%;
  }
`;

@customElement("ha-sidebar-panel-ext-config")
class HaSidebarPanelExtConfig extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public name = "";

  @property({ type: Boolean }) public expanded = false;

  protected render() {
    return html`<ha-list-item-new
      class="item ${this.expanded ? "expanded" : ""}"
      aria-label=${this.name}
      @click=${this._showConfig}
    >
      <div class="target"></div>
      <span class="icon">
        <ha-svg-icon .path=${mdiCellphoneCog}></ha-svg-icon>
      </span>
      <span class="name">${this.name}</span>
    </ha-list-item-new>`;
  }

  private _showConfig() {
    this.hass.auth.external!.fireMessage({
      type: "config_screen/show",
    });
  }

  static styles = [styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-sidebar-panel-ext-config": HaSidebarPanelExtConfig;
  }
}
