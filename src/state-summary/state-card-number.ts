import type { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
} from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import "../components/ha-slider";
import "../components/ha-textfield";
import { HomeAssistant } from "../types";
import { haStyle } from "../resources/styles";
import { loadPolyfillIfNeeded } from "../resources/resize-observer.polyfill";

@customElement("state-card-number")
class StateCardNumber extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  @property() private min: number = 0;

  @property() private max: number = 100;

  @property() private value!: number;

  @property() private step: number = 1;

  @property() private mode!: string;

  private _hiddenslider: boolean = true;

  private _hiddenbox: boolean = true;

  private _minimalview: boolean = true;

  private _resizeObserver?: ResizeObserver;

  protected render() {
    return html`
      <div class="horizontal justified layout" id="number_card">
        <state-info
          .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <ha-slider
          labeled
          .min=${this.min}
          .max=${this.max}
          .value=${this.value}
          .step=${this.step}
          .hidden=${this._hiddenslider}
          @change=${this._selectedValueChanged}
          @click=${this._stopPropagation}
          id="slider"
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
          @input=${this._onInput}
          @change=${this._selectedValueChanged}
          @click=${this._stopPropagation}
          .hidden=${this._hiddenbox}
        >
        </ha-textfield>
        ${!this._hiddenbox || !this._minimalview
          ? html`<div class="state">
              ${this.stateObj.attributes.unit_of_measurement}
            </div>`
          : nothing}
        ${!this._hiddenslider || !this._minimalview
          ? html` <div class="state">
              ${this.value} ${this.stateObj.attributes.unit_of_measurement}
            </div>`
          : nothing}
      </div>
    `;
  }

  private async _attachObserver(): Promise<void> {
    if (!this._resizeObserver) {
      await loadPolyfillIfNeeded();
      this._resizeObserver = new ResizeObserver(() => {
        this._hiddenState();
      });
    }
    this._resizeObserver.observe(this);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this._attachObserver();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.unobserve(this);
    }
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (changedProp.has("stateObj")) {
      this._stateObjectChanged(this.stateObj);
    }
  }

  private _hiddenState() {
    if (this.mode !== "slider") {
      return;
    }

    const slider = this.shadowRoot!.querySelector("ha-slider");
    if (!slider) {
      return;
    }

    const sliderwidth = slider.offsetWidth;
    if (sliderwidth < 100) {
      this._minimalview = true;
    } else if (sliderwidth >= 145) {
      this._minimalview = false;
    }
  }

  private _stateObjectChanged(newVal) {
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
    this._hiddenbox =
      newVal.attributes.mode === "slider" ||
      (newVal.attributes.mode === "auto" && range <= 256);
    this._hiddenslider =
      newVal.attributes.mode === "box" ||
      (newVal.attributes.mode === "auto" && range > 256);

    if (this.mode === "slider" && prevMode !== "slider") {
      this._hiddenState();
    }
  }

  private _onInput(ev) {
    this.value = ev.target.value;
  }

  private async _selectedValueChanged() {
    if (this.value === Number(this.stateObj.state)) {
      return;
    }
    await this.hass.callService("number", "set_value", {
      value: this.value,
      entity_id: this.stateObj.entity_id,
    });
  }

  private _stopPropagation(ev) {
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
