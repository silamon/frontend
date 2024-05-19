import "@material/mwc-button";
import { mdiClose } from "@mdi/js";
import { CSSResultGroup, html, LitElement, PropertyValues, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../common/dom/fire_event";
import { DataEntryFlowStepAbort } from "../../data/data_entry_flow";
import { showAddApplicationCredentialDialog } from "../../panels/config/application_credentials/show-dialog-add-application-credential";
import { HomeAssistant } from "../../types";
import { showConfigFlowDialog } from "./show-dialog-config-flow";
import { DataEntryFlowDialogParams } from "./show-dialog-data-entry-flow";
import { configFlowContentStyles } from "./styles";
import { computeRTLDirection } from "../../common/util/compute_rtl";
import "../../components/ha-dialog";
import "../../components/ha-dialog-header";

@customElement("step-flow-abort")
class StepFlowAbort extends LitElement {
  @property({ attribute: false }) public params!: DataEntryFlowDialogParams;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public step!: DataEntryFlowStepAbort;

  @property({ attribute: false }) public domain!: string;

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    if (this.step.reason === "missing_credentials") {
      this._handleMissingCreds();
    }
  }

  protected render() {
    if (this.step.reason === "missing_credentials") {
      return nothing;
    }
    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        scrimClickAction
        escapeKeyAction
        hideActions
        flexContent
        .heading=${this.hass.localize(`component.${this.domain}.title`)}
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
            ${this.hass.localize(`component.${this.domain}.title`)}
          </span>
          <span slot="actionItems">
            <slot name="documentationButton"></slot>
          </span>
        </ha-dialog-header>
        <div>
          ${this.params.flowConfig.renderAbortDescription(this.hass, this.step)}
        </div>
      </ha-dialog>
    `;
  }

  public closeDialog(): void {
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  private async _handleMissingCreds() {
    this._flowDone();
    // Prompt to enter credentials and restart integration setup
    showAddApplicationCredentialDialog(this.params.dialogParentElement!, {
      selectedDomain: this.domain,
      manifest: this.params.manifest,
      applicationCredentialAddedCallback: () => {
        showConfigFlowDialog(this.params.dialogParentElement!, {
          dialogClosedCallback: this.params.dialogClosedCallback,
          startFlowHandler: this.domain,
          showAdvanced: this.hass.userData?.showAdvanced,
        });
      },
    });
  }

  private _flowDone(): void {
    fireEvent(this, "flow-update", { step: undefined });
  }

  static get styles(): CSSResultGroup {
    return configFlowContentStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "step-flow-abort": StepFlowAbort;
  }
}
