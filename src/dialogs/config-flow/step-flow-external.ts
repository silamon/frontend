import "@material/mwc-button";
import { mdiClose } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { DataEntryFlowStepExternal } from "../../data/data_entry_flow";
import { HomeAssistant } from "../../types";
import { FlowConfig } from "./show-dialog-data-entry-flow";
import { configFlowContentStyles } from "./styles";
import { computeRTLDirection } from "../../common/util/compute_rtl";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-dialog";
import "../../components/ha-dialog-header";

@customElement("step-flow-external")
class StepFlowExternal extends LitElement {
  @property({ attribute: false }) public flowConfig!: FlowConfig;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public step!: DataEntryFlowStepExternal;

  protected render(): TemplateResult {
    const localize = this.hass.localize;

    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        scrimClickAction
        escapeKeyAction
        hideActions
      >
        <ha-dialog-header slot="heading">
          <ha-icon-button
            .label=${this.hass.localize("ui.dialogs.generic.close")}
            .path=${mdiClose}
            dialogAction="close"
            slot="navigationIcon"
            dir=${computeRTLDirection(this.hass)}
          ></ha-icon-button>
          <span slot="title">
            >${this.flowConfig.renderExternalStepHeader(this.hass, this.step)}
          </span>
          <span slot="actionItems">
            <slot name="documentationButton"></slot>
          </span>
        </ha-dialog-header>
        <div>
          ${this.flowConfig.renderExternalStepDescription(this.hass, this.step)}
          <div class="open-button">
            <a href=${this.step.url} target="_blank" rel="noreferrer">
              <mwc-button raised>
                ${localize(
                  "ui.panel.config.integrations.config_flow.external_step.open_site"
                )}
              </mwc-button>
            </a>
          </div>
        </div>
      </ha-dialog>
    `;
  }

  public closeDialog(): void {
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    window.open(this.step.url);
  }

  static get styles(): CSSResultGroup {
    return [
      configFlowContentStyles,
      css`
        .open-button {
          text-align: center;
          padding: 24px 0;
        }
        .open-button a {
          text-decoration: none;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "step-flow-external": StepFlowExternal;
  }
}
