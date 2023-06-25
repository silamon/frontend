import { PropertyValues, ReactiveElement } from "lit";
import dynamicContentUpdater from "../common/dom/dynamic_content_updater";
import { stateCardType } from "../common/entity/state_card_type";
import "./state-card-button";
import "./state-card-climate";
import "./state-card-configurator";
import "./state-card-cover";
import "./state-card-display";
import "./state-card-input_button";
import "./state-card-input_number";
import "./state-card-input_select";
import "./state-card-input_text";
import "./state-card-lock";
import "./state-card-media_player";
import "./state-card-number";
import "./state-card-scene";
import "./state-card-script";
import "./state-card-select";
import "./state-card-text";
import "./state-card-timer";
import "./state-card-toggle";
import "./state-card-vacuum";
import "./state-card-water_heater";
import { property } from "lit/decorators";
import { HomeAssistant } from "../types";
import { HassEntityBase } from "home-assistant-js-websocket";

class StateCardContent extends ReactiveElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntityBase;

  @property({ type: Boolean }) public inDialog = false;

  private _detachedChild?: ChildNode;

  protected createRenderRoot() {
    return this;
  }

  // This is not a lit element, but an updating element, so we implement update
  protected update(changedProps: PropertyValues): void {
    super.update(changedProps);

    if (!this.stateObj || !this.hass) {
      if (this.lastChild) {
        this._detachedChild = this.lastChild;
        // Detach child to prevent it from doing work.
        this.removeChild(this.lastChild);
      }
      return;
    }

    if (this._detachedChild) {
      this.appendChild(this._detachedChild);
      this._detachedChild = undefined;
    }

    let stateCard: string | undefined;
    if (
      this.stateObj.attributes &&
      "custom_ui_state_card" in this.stateObj.attributes
    ) {
      stateCard = this.stateObj.attributes.custom_ui_state_card as string;
    } else {
      stateCard = "state-card-" + stateCardType(this.hass, this.stateObj);
    }

    if (!stateCard) {
      if (this.lastChild) {
        this.removeChild(this.lastChild);
      }
      return;
    }

    dynamicContentUpdater(this, stateCard.toUpperCase(), {
      hass: this.hass,
      stateObj: this.stateObj,
      inDialog: this.inDialog,
    });
  }
}

customElements.define("state-card-content", StateCardContent);

declare global {
  interface HTMLElementTagNameMap {
    "state-card-content": StateCardContent;
  }
}
