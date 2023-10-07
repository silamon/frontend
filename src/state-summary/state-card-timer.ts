import type { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import { computeDisplayTimer, timerTimeRemaining } from "../data/timer";

@customElement("state-card-timer")
export class StateCardTimer extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  @property() public timeRemaining?: Number;  

  protected render(): TemplateResult {
    return html`
      <div class="horizontal justified layout">
      <state-info
        .hass=${this.hass}
        .state-obj=${this.stateObj}
        .in-dialog=${this.inDialog}
      ></state-info>
        <div class="state">${this._displayState(timeRemaining, stateObj)}</div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startInterval(this.stateObj);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearInterval();
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (changedProp.has("stateObj")) {
      this.startInterval(stateObj);
    }
  }

  clearInterval() {
    if (this._updateRemaining) {
      clearInterval(this._updateRemaining);
      this._updateRemaining = null;
    }
  }

  startInterval(stateObj) {
    this.clearInterval();
    this.calculateRemaining(stateObj);

    if (stateObj.state === "active") {
      this._updateRemaining = setInterval(
        () => this.calculateRemaining(this.stateObj),
        1000
      );
    }
  }

  calculateRemaining(stateObj) {
    this.timeRemaining = timerTimeRemaining(stateObj);
  }

  _displayState(timeRemaining, stateObj) {
    return computeDisplayTimer(this.hass, stateObj, timeRemaining);
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
      .state {
        @apply --paper-font-body1;
        color: var(--primary-text-color);

        margin-left: 16px;
        text-align: right;
        line-height: 40px;
        white-space: nowrap;
      }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-timer": StateCardTimer;
  }
}