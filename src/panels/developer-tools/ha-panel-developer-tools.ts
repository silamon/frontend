import { mdiDotsVertical } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import type { ActionDetail } from "@material/mwc-list";
import { navigate } from "../../common/navigate";
import "../../components/ha-menu-button";
import "../../components/ha-button-menu";
import "../../components/ha-icon-button";
import "../../components/ha-list-item";
import { haStyle } from "../../resources/styles";
import { HomeAssistant, Route } from "../../types";
import "./developer-tools-router";
import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";

const tabs = [
  { page: "yaml", label: "yaml" },
  { page: "state", label: "states" },
  { page: "action", label: "actions" },
  { page: "template", label: "templates" },
  { page: "event", label: "events" },
  { page: "statistics", label: "statistics" },
  { page: "assist", label: "assist" },
] as const;

@customElement("ha-panel-developer-tools")
class PanelDeveloperTools extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _currTab: (typeof tabs)[number] = tabs[0];

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.hass.loadBackendTranslation("title");
    this._currTab = this._page;
  }

  protected render(): TemplateResult {
    return html`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            slot="navigationIcon"
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">
            ${this.hass.localize("panel.developer_tools")}
          </div>
          <ha-button-menu slot="actionItems" @action=${this._handleMenuAction}>
            <ha-icon-button
              slot="trigger"
              .label=${this.hass.localize("ui.common.menu")}
              .path=${mdiDotsVertical}
            ></ha-icon-button>
            <ha-list-item>
              ${this.hass.localize("ui.panel.developer-tools.tabs.debug.title")}
            </ha-list-item>
          </ha-button-menu>
        </div>

        <mwc-tab-bar
          .activeIndex=${tabs.indexOf(this._currTab)}
          @MDCTabBar:activated=${this._handleTabChanged}
        >
          ${tabs.map(
            (tab) => html`
              <mwc-tab
                .label=${this.hass.localize(
                  `ui.panel.developer-tools.tabs.${tab.label}.title`
                )}
              ></mwc-tab>
            `
          )}
        </mwc-tab-bar>
      </div>
      <developer-tools-router
        .route=${this.route}
        .narrow=${this.narrow}
        .hass=${this.hass}
      ></developer-tools-router>
    `;
  }

  private _handleTabChanged(ev: CustomEvent): void {
    const newTab = tabs[ev.detail.index];
    if (newTab === this._currTab) {
      return;
    }
    this._currTab = newTab;
    navigate(`/developer-tools/${newTab.page}`);
  }

  private async _handleMenuAction(ev: CustomEvent<ActionDetail>) {
    switch (ev.detail.index) {
      case 0:
        navigate(`/developer-tools/debug`);
        break;
    }
  }

  private get _page() {
    const path = this.route.path.substring(1);
    return tabs.find((tab) => tab.page === path) || tabs[0];
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
          display: flex;
          min-height: 100vh;
        }
        .header {
          position: fixed;
          top: 0;
          z-index: 4;
          background-color: var(--app-header-background-color);
          width: var(--mdc-top-app-bar-width, 100%);
          padding-top: env(safe-area-inset-top);
          color: var(--app-header-text-color, white);
          border-bottom: var(--app-header-border-bottom, none);
          -webkit-backdrop-filter: var(--app-header-backdrop-filter, none);
          backdrop-filter: var(--app-header-backdrop-filter, none);
        }
        .toolbar {
          height: var(--header-height);
          display: flex;
          align-items: center;
          font-size: 20px;
          padding: 8px 12px;
          font-weight: 400;
          box-sizing: border-box;
        }
        @media (max-width: 599px) {
          .toolbar {
            padding: 4px;
          }
        }
        .main-title {
          margin: var(--margin-title);
          line-height: 20px;
          flex-grow: 1;
        }
        developer-tools-router {
          display: block;
          padding-top: calc(
            var(--header-height) + 48px + env(safe-area-inset-top)
          );
          padding-bottom: calc(env(safe-area-inset-bottom));
          flex: 1 1 100%;
          max-width: 100%;
        }
        mwc-tab-bar {
          margin-left: max(env(safe-area-inset-left), 24px);
          margin-right: max(env(safe-area-inset-right), 24px);
          margin-inline-start: max(env(safe-area-inset-left), 24px);
          margin-inline-end: max(env(safe-area-inset-right), 24px);
          text-transform: uppercase;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-panel-developer-tools": PanelDeveloperTools;
  }
}
