import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import "../components/ha-climate-state";
import { ClimateEntity } from "../data/climate";
import { haStyle } from "../resources/styles";
import { HomeAssistant } from "../types";

@customElement("state-card-climate")
class StateCardClimate extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: ClimateEntity;

  @property({ type: Boolean }) public inDialog = false;

  protected render(): TemplateResult {
    return html`
      <div class="horizontal justified layout">
        <state-info
          .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <ha-climate-state
          .hass=${this.hass}
          .stateObj=${this.stateObj}
        ></ha-climate-state>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        :host {
          line-height: 1.5;
        }

        ha-climate-state {
          margin-left: 16px;
          text-align: right;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-climate": StateCardClimate;
  }
}
