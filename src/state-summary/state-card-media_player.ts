import type { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { computeStateDisplay } from "../common/entity/compute_state_display";
import "../components/entity/state-info";
import HassMediaPlayerEntity from "../util/hass-media-player-model";

@customElement("state-card-media_player")
class StateCardMediaPlayer extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  @property({ attribute: false }) public playerObj!: Object;

  protected render() {
    return html`

      <div class="horizontal justified layout">
      <state-info
      .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
    ></state-info>
    <div class="state">
          <div class="main-text" take-height$="[[!playerObj.secondaryTitle]]">
            [[computePrimaryText(localize, playerObj)]]
          </div>
          <div class="secondary-text">[[playerObj.secondaryTitle]]</div>
        </div>
      </div>
    `;
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (changedProp.has("playerObj")) {
      this.computePlayerObj(hass, stateObj);
    }
  }

  computePlayerObj(hass, stateObj) {
    return new HassMediaPlayerEntity(hass, stateObj);
  }

  computePrimaryText(localize, playerObj) {
    return (
      playerObj.primaryTitle ||
      computeStateDisplay(
        localize,
        playerObj.stateObj,
        this.hass.locale,
        this.hass.entities
      )
    );
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
      :host {
        line-height: 1.5;
      }

      .state {
        @apply --paper-font-common-nowrap;
        @apply --paper-font-body1;
        margin-left: 16px;
        text-align: right;
      }

      .main-text {
        @apply --paper-font-common-nowrap;
        color: var(--primary-text-color);
      }

      .main-text[take-height] {
        line-height: 40px;
      }

      .secondary-text {
        @apply --paper-font-common-nowrap;
        color: var(--secondary-text-color);
      }     `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-media_player": StateCardMediaPlayer;
  }
}
