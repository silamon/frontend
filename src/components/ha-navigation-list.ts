import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import { navigate } from "../common/navigate";
import type { PageNavigation } from "../layouts/hass-tabs-subpage";
import type { HomeAssistant } from "../types";
import "./ha-icon-next";
import "./ha-list-new";
import "./ha-list-item-new";
import "./ha-svg-icon";

@customElement("ha-navigation-list")
class HaNavigationList extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public pages!: PageNavigation[];

  @property({ type: Boolean }) public hasSecondary = false;

  @property() public label?: string;

  public render(): TemplateResult {
    return html`
      <ha-list-new aria-label=${ifDefined(this.label)}>
        ${this.pages.map(
          (page, idx) => html`
            <ha-list-item-new
              interactive
              type="button"
              @click=${this._handleListAction}
              .idx=${idx}
            >
              <div
                slot="start"
                class=${page.iconColor ? "icon-background" : ""}
                .style="background-color: ${page.iconColor || "undefined"}"
              >
                <ha-svg-icon .path=${page.iconPath}></ha-svg-icon>
              </div>
              <span>${page.name}</span>
              ${this.hasSecondary
                ? html`<span slot="supporting-text">${page.description}</span>`
                : ""}
              ${!this.narrow
                ? html`<ha-icon-next slot="end"></ha-icon-next>`
                : ""}
            </ha-list-item-new>
          `
        )}
      </ha-list-new>
    `;
  }

  private _handleListAction(ev) {
    const item = ev.currentTarget;
    if (item.idx === undefined) {
      return;
    }

    const path = this.pages[item.idx].path;
    if (path.endsWith("#external-app-configuration")) {
      this.hass.auth.external!.fireMessage({ type: "config_screen/show" });
    } else {
      navigate(path);
    }
  }

  static styles: CSSResultGroup = css`
    :host {
      --mdc-list-vertical-padding: 0;
    }
    ha-svg-icon,
    ha-icon-next {
      color: var(--secondary-text-color);
      height: 24px;
      width: 24px;
      display: block;
    }
    ha-svg-icon {
      padding: 8px;
    }
    .icon-background {
      border-radius: 50%;
    }
    .icon-background ha-svg-icon {
      color: #fff;
    }
    ha-list-item-new {
      font-size: var(--navigation-list-item-title-font-size);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-navigation-list": HaNavigationList;
  }
}
