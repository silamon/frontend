import "@material/mwc-button";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { property, state, query } from "lit/decorators";
import { mdiClose } from "@mdi/js";
import { computeRTL } from "../common/util/compute_rtl";
import "../components/ha-toast";
import type { HaToast } from "../components/ha-toast";
import type { HomeAssistant } from "../types";

export interface ShowToastParams {
  message: string;
  action?: ToastActionParams;
  duration?: number;
  dismissable?: boolean;
}

export interface ToastActionParams {
  action: () => void;
  text: string;
}

class NotificationManager extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _parameters?: ShowToastParams;

  @query("ha-toast") private _toast!: HaToast;

  public async showDialog(parameters: ShowToastParams) {
    let toast = this._toast;
    // Can happen on initial load
    if (!toast) {
      await this.updateComplete;
      toast = this._toast;
    }
    toast.close("dismiss");
    this._parameters = parameters;
    if (!this._parameters || this._parameters.duration === 0) {
      return;
    }

    if (
      this._parameters.duration !== undefined &&
      this._parameters.duration > 0 &&
      this._parameters.duration <= 4000
    ) {
      this._parameters.duration = 4000;
    }

    toast.labelText = this._parameters.message;
    toast.timeoutMs = this._parameters.duration!;
    toast.show();
  }

  public shouldUpdate(changedProperties) {
    return !this._toast || changedProperties.has("_parameters");
  }

  protected render(): TemplateResult {
    return html`
      <ha-toast leading dir=${computeRTL(this.hass) ? "rtl" : "ltr"}>
        ${this._parameters?.action
          ? html`
              <mwc-button
                slot="action"
                .label=${this._parameters?.action.text}
                @click=${this.buttonClicked}
              ></mwc-button>
            `
          : nothing}
        ${this._parameters?.dismissable
          ? html`<ha-icon-button
              .label=${this.hass.localize("ui.common.close")}
              .path=${mdiClose}
              dialogAction="close"
              slot="dismiss"
            ></ha-icon-button>`
          : nothing}
      </ha-toast>
    `;
  }

  private buttonClicked() {
    this._toast.close("action");
    if (this._parameters?.action) {
      this._parameters?.action.action();
    }
  }

  static get styles(): CSSResultGroup {
    return css`
      mwc-button {
        color: var(--primary-color);
        font-weight: bold;
        margin-left: 8px;
      }
    `;
  }
}

customElements.define("notification-manager", NotificationManager);

declare global {
  interface HTMLElementTagNameMap {
    "notification-manager": NotificationManager;
  }

  // for fire event
  interface HASSDomEvents {
    "hass-notification": ShowToastParams;
  }
}
