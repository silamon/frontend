import "@material/mwc-button/mwc-button";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "./ha-svg-icon";
import "./ha-icon";
import "./ha-list-item-new";

const styles = css`
  .item.expanded {
    width: 100%;
  }
  .count {
    margin-left: auto;
  }
`;

@customElement("ha-sidebar-panel")
class HaSidebarPanel extends LitElement {
  @property() public path = "";

  @property() public name = "";

  @property() public icon = "";

  @property() public iconPath = "";

  @property({ type: Boolean }) public expanded = false;

  @property({ type: Boolean }) public selected = false;

  protected render() {
    return html`<ha-list-item-new
      interactive
      type="button"
      href="/${this.path}"
      aria-current=${this.selected ? "page" : "false"}
      aria-label=${this.name}
      class="item ${this.expanded ? "expanded" : ""}"
    >
      <div class="target"></div>
      <span class="icon">
        ${this.iconPath
          ? html`<ha-svg-icon .path=${this.iconPath}></ha-svg-icon>`
          : html`<ha-icon .icon=${this.icon}></ha-icon>`}
      </span>
      <span class="name">${this.name}</span>
    </ha-list-item-new>`;
  }

  static styles = [styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-sidebar-panel": HaSidebarPanel;
  }
}
