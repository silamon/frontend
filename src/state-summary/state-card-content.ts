import { LitElement, PropertyValues } from "lit";
import { HassEntity } from "home-assistant-js-websocket";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../types";
import dynamicContentUpdater from "../common/dom/dynamic_content_updater";
import { stateCardType } from "../common/entity/state_card_type";
import "./state-card-alert";
import "./state-card-button";
import "./state-card-climate";
import "./state-card-configurator";
import "./state-card-cover";
import "./state-card-display";
import "./state-card-event";
import "./state-card-humidifier";
import "./state-card-input_button";
import "./state-card-input_number";
import "./state-card-input_select";
import "./state-card-input_text";
import "./state-card-lawn_mower";
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

@customElement("state-card-content")
class StateCardContent extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    this.inputChanged(this.hass, this.inDialog, this.stateObj);
  }

  inputChanged(hass: HomeAssistant, inDialog: boolean, stateObj: HassEntity) {
    let stateCard: string;
    if (!stateObj || !hass) return;
    if (stateObj.attributes && "custom_ui_state_card" in stateObj.attributes) {
      stateCard = stateObj.attributes.custom_ui_state_card;
    } else {
      stateCard = "state-card-" + stateCardType(hass, stateObj);
    }
    dynamicContentUpdater(this, stateCard.toUpperCase(), {
      hass: hass,
      stateObj: stateObj,
      inDialog: inDialog,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-content": StateCardContent;
  }
}
