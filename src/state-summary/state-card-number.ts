import type { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators";
import "../components/entity/state-info";
import "../components/ha-slider";
import "../components/ha-textfield";
import { HomeAssistant } from "../types";
import { haStyle } from "../resources/styles";

@customElement("state-card-number")
class StateCardNumber extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  @state() private min: number = 0;

  @state() private max: number = 100;

  @state() private maxlength: number = 3;

  @state() private value: number;

  @state() private step: number;

  @state() private mode: string;

  private hiddenslider: boolean = true;

  private hiddenbox: boolean = true;

  protected render() {
    return html`
      <div class="horizontal justified layout" id="number_card">
        <state-info
          .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <ha-slider
          .min=${this.min}
          .max=${this.max}
          .value=${this.value}
          .step=${this.step}
          .hidden=${this.hiddenslider}
          pin
          @change=${this.selectedValueChanged}
          @click=${this.stopPropagation}
          id="slider"
          ignore-bar-touch=""
        >
        </ha-slider>
        <ha-textfield
          auto-validate=""
          pattern="[0-9]+([\\.][0-9]+)?"
          .step=${this.step}
          .min=${this.min}
          .max=${this.max}
          .value=${this.value}
          type="number"
          @input=${this.onInput}
          @change=${this.selectedValueChanged}
          @click=${this.stopPropagation}
          .hidden=${this.hiddenbox}
        >
        </ha-textfield>
        ${this.hiddenbox
          ? html`<div class="state">
              ${this.stateObj.attributes.unit_of_measurement}
            </div>`
          : nothing}
        ${this.hiddenslider
          ? html` <div id="sliderstate" class="state sliderstate">
              ${this.value} ${this.stateObj.attributes.unit_of_measurement}
            </div>`
          : nothing}
      </div>
    `;
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (changedProp.has("stateObj")) {
      this.stateObjectChanged(this.stateObj);
    }
  }

  ready() {
    super.ready();
    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver((entries) => {
        entries.forEach(() => {
          this.hiddenState();
        });
      });
      ro.observe(this.$.number_card);
    } else {
      this.addEventListener("iron-resize", () => this.hiddenState());
    }
  }

  hiddenState() {
    if (this.mode !== "slider") return;
    const sliderwidth = this.$.slider.offsetWidth;
    if (sliderwidth < 100) {
      this.$.sliderstate.hidden = true;
    } else if (sliderwidth >= 145) {
      this.$.sliderstate.hidden = false;
    }
  }

  stateObjectChanged(newVal) {
    const prevMode = this.mode;
    const min = Number(newVal.attributes.min);
    const max = Number(newVal.attributes.max);
    const step = Number(newVal.attributes.step);
    const range = (max - min) / step;

    this.min = min;
    this.max = max;
    this.step = step;
    this.value = Number(newVal.state);
    this.mode = String(newVal.attributes.mode);
    this.maxlength = String(newVal.attributes.max).length;
    this.hiddenbox =
      newVal.attributes.mode === "slider" ||
      (newVal.attributes.mode === "auto" && range <= 256);
    this.hiddenslider =
      newVal.attributes.mode === "box" ||
      (newVal.attributes.mode === "auto" && range > 256);

    if (this.mode === "slider" && prevMode !== "slider") {
      this.hiddenState();
    }
  }

  onInput(ev) {
    this.value = ev.target.value;
  }

  selectedValueChanged() {
    if (this.value === Number(this.stateObj.state)) {
      return;
    }
    this.hass.callService("number", "set_value", {
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
        ha-slider {
          margin-left: auto;
        }
        .state {
          @apply --paper-font-body1;
          color: var(--primary-text-color);

          display: flex;
          align-items: center;
          justify-content: end;
        }
        .sliderstate {
          min-width: 45px;
        }
        [hidden] {
          display: none !important;
        }
        ha-textfield {
          text-align: right;
          margin-left: auto;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-number": StateCardNumber;
  }
}
