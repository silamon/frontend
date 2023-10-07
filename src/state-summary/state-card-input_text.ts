/* eslint-plugin-disable lit */
import type { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import "../components/ha-textfield";

@customElement("state-card-input_text")
class StateCardInputText extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  @property() public pattern: String;

  @property() public value: string;

  protected render() {
    return html`
      <div class="horizontal justified layout">
      <state-info
      .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
    ></state-info><ha-textfield
          minlength="[[stateObj.attributes.min]]"
          maxlength="[[stateObj.attributes.max]]"
          value="[[value]]"
          auto-validate="[[stateObj.attributes.pattern]]"
          pattern="[[stateObj.attributes.pattern]]"
          type="[[stateObj.attributes.mode]]"
          on-input="onInput"
          on-change="selectedValueChanged"
          on-click="stopPropagation"
          placeholder="(empty value)"
        >
        </ha-textfield>
      </div>
    `;
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (changedProp.has("stateObj")) {
      this.stateObjectChanged(this.stateObj);
    }
  }

  stateObjectChanged(newVal) {
    this.value = newVal.state;
  }

  onInput(ev) {
    this.value = ev.target.value;
  }

  selectedValueChanged() {
    if (this.value === this.stateObj.state) {
      return;
    }
    this.hass.callService("input_text", "set_value", {
      value: this.value,
      entity_id: this.stateObj.entity_id,
    });
  }

  stopPropagation(ev) {
    ev.stopPropagation();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
      ha-textfield {
        margin-left: 16px;
      }    `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-input_text": StateCardInputText;
  }
}
