import "@material/mwc-button/mwc-button";
import { mdiBell } from "@mdi/js";
import { css, CSSResult, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import { fireEvent } from "../common/dom/fire_event";
import {
  PersistentNotification,
  subscribeNotifications,
} from "../data/persistent_notification";
import { HomeAssistant } from "../types";
import "./ha-svg-icon";
import "@material/web/labs/item/item";
import "./ha-list-item-new";

@customElement("ha-sidebar-panel-notifications")
class HaSidebarPanelNotifications extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public expanded = false;

  @state() private _notifications?: PersistentNotification[];

  protected render() {
    const notificationCount = this._notifications
      ? this._notifications.length
      : 0;
    return html`<ha-list-item-new
      .isListItem=${false}
      interactive
      type="button"
      class="item ${this.expanded ? "expanded" : ""}"
      @click=${this._showNotifications}
    >
      <div class="target"></div>
      <span slot="start" style="position:relative">
        <ha-svg-icon .path=${mdiBell}></ha-svg-icon>
        ${!this.expanded && notificationCount > 0
          ? html`<span class="badge">${notificationCount}</span>`
          : nothing}
      </span>
      <span class="item-text"
        >${this.hass.localize("ui.notification_drawer.title")}</span
      >
      ${this.expanded && notificationCount > 0
        ? html`<span slot="end" class="count">${notificationCount}</span>`
        : nothing}
    </ha-list-item-new>`;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    subscribeNotifications(this.hass.connection, (notifications) => {
      this._notifications = notifications;
    });
  }

  private _showNotifications() {
    fireEvent(this, "hass-show-notifications");
  }

  static get styles(): CSSResult[] {
    return [
      css`
        .badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 16px;
          height: 16px;
          transform: translateX(50%);
          border-radius: 8px;
          background-color: var(--accent-color);
          color: var(--text-accent-color, var(--text-primary-color));
          font-weight: 500;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .count {
          margin-inline-start: auto;
          margin-inline-end: -9px;
          background-color: var(--accent-color);
          color: var(--text-accent-color, var(--text-primary-color));
          padding: 0 6px;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          box-sizing: border-box;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-sidebar-panel-notifications": HaSidebarPanelNotifications;
  }
}
