import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { customElement, property, query } from "lit/decorators";
import "./ha-button";
import "./ha-tabs";
import "./ha-primary-tab";
import "./ha-icon-button-prev";
import "./ha-icon-button-next";
import { HomeAssistant } from "../types";
import type { HaTabs } from "./ha-tabs";

@customElement("ha-tab-bar")
export class HaTabBar extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public buttons: boolean = false;

  @property({ attribute: false }) public activeTabIndex: number = 0;

  @query("#tabs", true) private _tabs?: HaTabs;

  protected render(): TemplateResult {
    return html`
      <span class="tabbar">
        ${this.buttons
          ? html`<ha-icon-button-prev
              .label=${this.hass?.localize(
                "ui.panel.lovelace.components.energy_period_selector.previous"
              ) || "Prev"}
              @click=${this._pickPrevious}
            ></ha-icon-button-prev>`
          : nothing}
        <ha-tabs
          id="tabs"
          class="scrolling"
          .activeTabIndex=${this.activeTabIndex}
          @click=${this.onClick}
          @change=${this.onChange}
        >
          <slot></slot>
        </ha-tabs>
        ${this.buttons
          ? html`<ha-icon-button-next
              .label=${this.hass?.localize(
                "ui.panel.lovelace.components.energy_period_selector.next"
              ) || "Next"}
              @click=${this._pickNext}
            ></ha-icon-button-next>`
          : nothing}</span
      >
    `;
  }

  private _pickPrevious() {
    this.activeTabIndex -= 1;
    this._tabs?.scrollToTab();
  }

  private _pickNext() {
    this.activeTabIndex += 1;
    this._tabs?.scrollToTab();
  }

  private onClick(event) {
    this.dispatchEvent(new CustomEvent("click", { detail: { event } }));
  }

  private onChange(event) {
    this.dispatchEvent(new CustomEvent("change", { detail: { event } }));
  }

  static get styles(): CSSResultGroup {
    return [css``];
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "ha-tab-bar": HaTabBar;
  }
}
