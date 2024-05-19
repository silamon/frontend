import "@material/mwc-button";
import { mdiClose } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../../components/ha-circular-progress";
import { DataEntryFlowStepProgress } from "../../data/data_entry_flow";
import { HomeAssistant } from "../../types";
import { FlowConfig } from "./show-dialog-data-entry-flow";
import { configFlowContentStyles } from "./styles";
import { computeRTLDirection } from "../../common/util/compute_rtl";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-dialog";
import "../../components/ha-dialog-header";

@customElement("step-flow-progress")
class StepFlowProgress extends LitElement {
  @property({ attribute: false })
  public flowConfig!: FlowConfig;

  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ attribute: false })
  public step!: DataEntryFlowStepProgress;

  protected render(): TemplateResult {
    return html`<ha-dialog
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
          ${this.flowConfig.renderShowFormProgressHeader(this.hass, this.step)}
        </span>
        <span slot="actionItems">
          <slot name="documentationButton"></slot>
        </span>
      </ha-dialog-header>
      <div>
        <ha-circular-progress indeterminate></ha-circular-progress>
        ${this.flowConfig.renderShowFormProgressDescription(
          this.hass,
          this.step
        )}
      </div>
    </ha-dialog> `;
  }

  public closeDialog(): void {
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  static get styles(): CSSResultGroup {
    return [
      configFlowContentStyles,
      css`
        .content {
          padding: 50px 100px;
          text-align: center;
        }
        ha-circular-progress {
          margin-bottom: 16px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "step-flow-progress": StepFlowProgress;
  }
}
