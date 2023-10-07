import "@material/mwc-button";
import type { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { supportsFeature } from "../common/entity/supports-feature";
import "../components/entity/state-info";
import LocalizeMixin from "../mixins/localize-mixin";
import { LockEntityFeature } from "../data/lock";

class StateCardLock extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  @property() public isLocked: Boolean;
  
  @property() public supportsOpen: Boolean;

  protected render() {
    return html`
      <div class="horizontal justified layout">
      <state-info
      .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
    ></state-info>
    <mwc-button
          on-click="_callService"
          data-service="open"
          hidden$="[[!supportsOpen]]"
          >[[localize('ui.card.lock.open')]]</mwc-button
        >
        <mwc-button
          on-click="_callService"
          data-service="unlock"
          hidden$="[[!isLocked]]"
          >[[localize('ui.card.lock.unlock')]]</mwc-button
        >
        <mwc-button
          on-click="_callService"
          data-service="lock"
          hidden$="[[isLocked]]"
          >[[localize('ui.card.lock.lock')]]</mwc-button
        >
      </div>
    `;
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (changedProp.has("stateObj")) {
      this._stateObjChanged(this.stateObj);
    }
  }

  _stateObjChanged(newVal) {
    if (newVal) {
      this.isLocked = newVal.state === "locked";
      this.supportsOpen = supportsFeature(newVal, LockEntityFeature.OPEN);
    }
  }

  _callService(ev) {
    ev.stopPropagation();
    const service = ev.target.dataset.service;
    const data = {
      entity_id: this.stateObj.entity_id,
    };
    this.hass.callService("lock", service, data);
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
      mwc-button {
        top: 3px;
        height: 37px;
        margin-right: -0.57em;
      }
      [hidden] {
        display: none !important;
      }     `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-lock": StateCardLock;
  }
}
