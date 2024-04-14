import "@material/mwc-button/mwc-button";
import { css, CSSResult, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../types";
import "./user/ha-user-badge";
import "./ha-list-item-new";

/* const styles = css`
  .icon {
    height: 24px;
  }
  .user-icon {
    display: inline-flex;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.8);
  }
`; */

@customElement("ha-sidebar-panel-user")
class HaSidebarPanelUser extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public expanded = false;

  @property({ type: Boolean }) public selected = false;

  protected render() {
    return html`<ha-list-item-new
      interactive
      type="button"
      href="/profile"
      aria-current=${this.selected ? "page" : "false"}
      class="item ${this.expanded ? "expanded" : ""}"
    >
      <div class="target"></div>
      <span slot="start" class="icon">
        <span class="user-icon">
          <ha-user-badge
            .user=${this.hass.user}
            .hass=${this.hass}
          ></ha-user-badge>
        </span>
      </span>
      <span class="item-text"
        >${this.hass.user ? this.hass.user.name : nothing}</span
      >
    </ha-list-item-new>`;
  }

  static get styles(): CSSResult[] {
    return [
      css`
        .icon {
          height: 24px;
        }
        .user-icon {bar-try
          display: inline-flex;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(0.8);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-sidebar-panel-user": HaSidebarPanelUser;
  }
}
