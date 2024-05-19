import "@material/mwc-list/mwc-list-item";
import { mdiClose } from "@mdi/js";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import type { DataEntryFlowStepMenu } from "../../data/data_entry_flow";
import type { HomeAssistant } from "../../types";
import type { FlowConfig } from "./show-dialog-data-entry-flow";
import "../../components/ha-icon-next";
import { configFlowContentStyles } from "./styles";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-dialog";
import "../../components/ha-dialog-header";
import "../../components/ha-icon-button";
import { computeRTLDirection } from "../../common/util/compute_rtl";


@customElement("step-flow-menu")
class StepFlowMenu extends LitElement {
  @property({ attribute: false }) public flowConfig!: FlowConfig;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public step!: DataEntryFlowStepMenu;

  protected render(): TemplateResult {
    let options: string[];
    let translations: Record<string, string>;

    if (Array.isArray(this.step.menu_options)) {
      options = this.step.menu_options;
      translations = {};
      for (const option of options) {
        translations[option] = this.flowConfig.renderMenuOption(
          this.hass,
          this.step,
          option
        );
      }
    } else {
      options = Object.keys(this.step.menu_options);
      translations = this.step.menu_options;
    }

    const description = this.flowConfig.renderMenuDescription(
      this.hass,
      this.step
    );

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
            ${this.flowConfig.renderMenuHeader(this.hass, this.step)}
          </span>
          <span slot="actionItems">
            <slot name="documentationButton"></slot>
          </span>
        </ha-dialog-header>
        ${description ? html`<div class="content">${description}</div>` : ""}
        <div class="options">
          ${options.map(
            (option) => html`
              <mwc-list-item hasMeta .step=${option} @click=${this._handleStep}>
                <span>${translations[option]}</span>
                <ha-icon-next slot="meta"></ha-icon-next>
              </mwc-list-item>
            `
          )}
        </div>
      </ha-dialog>
    `;
  }

  public closeDialog(): void {
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  private _handleStep(ev) {
    fireEvent(this, "flow-update", {
      stepPromise: this.flowConfig.handleFlowStep(
        this.hass,
        this.step.flow_id,
        {
          next_step_id: ev.currentTarget.step,
        }
      ),
    });
  }

  static styles = [
    configFlowContentStyles,
    css`
      .options {
        margin-top: 20px;
        margin-bottom: 8px;
      }
      .content {
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      .content + .options {
        margin-top: 8px;
      }
      mwc-list-item {
        --mdc-list-side-padding: 24px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "step-flow-menu": StepFlowMenu;
  }
}
