import "@lrnwebcomponents/simple-tooltip/simple-tooltip";
import "@material/mwc-button";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { mdiClose } from "@mdi/js";
import { customElement, property, state } from "lit/decorators";
import { dynamicElement } from "../../common/dom/dynamic-element-directive";
import { fireEvent } from "../../common/dom/fire_event";
import { isNavigationClick } from "../../common/dom/is-navigation-click";
import "../../components/ha-alert";
import "../../components/ha-circular-progress";
import { computeInitialHaFormData } from "../../components/ha-form/compute-initial-ha-form-data";
import "../../components/ha-form/ha-form";
import type { HaFormSchema } from "../../components/ha-form/types";
import "../../components/ha-markdown";
import { autocompleteLoginFields } from "../../data/auth";
import type { DataEntryFlowStepForm } from "../../data/data_entry_flow";
import type { HomeAssistant } from "../../types";
import type { FlowConfig } from "./show-dialog-data-entry-flow";
import { configFlowContentStyles } from "./styles";
import { haStyle, haStyleDialog } from "../../resources/styles";
import { computeRTLDirection } from "../../common/util/compute_rtl";
import "../../components/ha-dialog";
import "../../components/ha-dialog-header";

@customElement("step-flow-form")
class StepFlowForm extends LitElement {
  @property({ attribute: false }) public flowConfig!: FlowConfig;

  @property({ attribute: false }) public step!: DataEntryFlowStepForm;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _loading = false;

  @state() private _stepData?: Record<string, any>;

  @state() private _errorMsg?: string;

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeyDown);
  }

  protected render(): TemplateResult {
    const step = this.step;
    const stepData = this._stepDataProcessed;

    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        scrimClickAction
        escapeKeyAction
        hideActions
        flexContent
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
            ${this.flowConfig.renderShowFormStepHeader(this.hass, this.step)}
          </span>
          <span slot="actionItems">
            <slot name="documentationButton"></slot>
          </span>
        </ha-dialog-header>
        <div @click=${this._clickHandler}>
          ${this.flowConfig.renderShowFormStepDescription(this.hass, this.step)}
          ${this._errorMsg
            ? html`<ha-alert alert-type="error">${this._errorMsg}</ha-alert>`
            : ""}
          <ha-form
            .hass=${this.hass}
            .data=${stepData}
            .disabled=${this._loading}
            @value-changed=${this._stepDataChanged}
            .schema=${autocompleteLoginFields(step.data_schema)}
            .error=${step.errors}
            .computeLabel=${this._labelCallback}
            .computeHelper=${this._helperCallback}
            .computeError=${this._errorCallback}
            .localizeValue=${this._localizeValueCallback}
          ></ha-form>
        </div>
        ${step.preview
          ? html`<div @set-flow-errors=${this._setError}>
              <h3>
                ${this.hass.localize(
                  "ui.panel.config.integrations.config_flow.preview"
                )}:
              </h3>
              ${dynamicElement(`flow-preview-${this.step.preview}`, {
                hass: this.hass,
                flowType: this.flowConfig.flowType,
                handler: step.handler,
                stepId: step.step_id,
                flowId: step.flow_id,
                stepData,
              })}
            </div>`
          : nothing}
        ${this._loading
          ? html`
              <div slot="primaryAction" class="submit-spinner">
                <ha-circular-progress indeterminate></ha-circular-progress>
              </div>
            `
          : html`
              <mwc-button slot="primaryAction" @click=${this._submitStep}>
                ${this.flowConfig.renderShowFormStepSubmitButton(
                  this.hass,
                  this.step
                )}
              </mwc-button>
            `}
      </ha-dialog>
    `;
  }

  public closeDialog(): void {
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  private _setError(ev: CustomEvent) {
    this.step = { ...this.step, errors: ev.detail };
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    setTimeout(() => this.shadowRoot!.querySelector("ha-form")!.focus(), 0);
    this.addEventListener("keydown", this._handleKeyDown);
  }

  protected willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);
    if (changedProps.has("step") && this.step?.preview) {
      import(`./previews/flow-preview-${this.step.preview}`);
    }
  }

  private _clickHandler(ev: MouseEvent) {
    if (isNavigationClick(ev, false)) {
      fireEvent(this, "flow-update", {
        step: undefined,
      });
    }
  }

  private _handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
      this._submitStep();
    }
  };

  private get _stepDataProcessed() {
    if (this._stepData !== undefined) {
      return this._stepData;
    }

    this._stepData = computeInitialHaFormData(this.step.data_schema);
    return this._stepData;
  }

  private async _submitStep(): Promise<void> {
    const stepData = this._stepData || {};

    const allRequiredInfoFilledIn =
      stepData === undefined
        ? // If no data filled in, just check that any field is required
          this.step.data_schema.find((field) => field.required) === undefined
        : // If data is filled in, make sure all required fields are
          stepData &&
          this.step.data_schema.every(
            (field) =>
              !field.required ||
              !["", undefined].includes(stepData![field.name])
          );

    if (!allRequiredInfoFilledIn) {
      this._errorMsg = this.hass.localize(
        "ui.panel.config.integrations.config_flow.not_all_required_fields"
      );
      return;
    }

    this._loading = true;
    this._errorMsg = undefined;

    const flowId = this.step.flow_id;

    const toSendData = {};
    Object.keys(stepData).forEach((key) => {
      const value = stepData[key];
      const isEmpty = [undefined, ""].includes(value);

      if (!isEmpty) {
        toSendData[key] = value;
      }
    });

    try {
      const step = await this.flowConfig.handleFlowStep(
        this.hass,
        this.step.flow_id,
        toSendData
      );

      // make sure we're still showing the same step as when we
      // fired off request.
      if (!this.step || flowId !== this.step.flow_id) {
        return;
      }

      fireEvent(this, "flow-update", {
        step,
      });
    } catch (err: any) {
      if (err && err.body) {
        if (err.body.message) {
          this._errorMsg = err.body.message;
        }
        if (err.body.errors) {
          this.step = { ...this.step, errors: err.body.errors };
        }
        if (!err.body.message && !err.body.errors) {
          this._errorMsg = "Unknown error occurred";
        }
      } else {
        this._errorMsg = "Unknown error occurred";
      }
    } finally {
      this._loading = false;
    }
  }

  private _stepDataChanged(ev: CustomEvent): void {
    this._stepData = ev.detail.value;
  }

  private _labelCallback = (field: HaFormSchema): string =>
    this.flowConfig.renderShowFormStepFieldLabel(this.hass, this.step, field);

  private _helperCallback = (field: HaFormSchema): string | TemplateResult =>
    this.flowConfig.renderShowFormStepFieldHelper(this.hass, this.step, field);

  private _errorCallback = (error: string) =>
    this.flowConfig.renderShowFormStepFieldError(this.hass, this.step, error);

  private _localizeValueCallback = (key: string) =>
    this.flowConfig.renderShowFormStepFieldLocalizeValue(
      this.hass,
      this.step,
      key
    );

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      haStyleDialog,
      configFlowContentStyles,
      css`
        .error {
          color: red;
        }

        .submit-spinner {
          margin-right: 16px;
          margin-inline-end: 16px;
          margin-inline-start: initial;
        }

        ha-alert,
        ha-form {
          margin-top: 24px;
          display: block;
        }
        h2 {
          word-break: break-word;
          padding-inline-end: 72px;
          direction: var(--direction);
        }
      `,
    ];
  }
}

declare global {
  interface HASSDomEvents {
    "set-flow-errors": { errors: DataEntryFlowStepForm["errors"] };
  }
  interface HTMLElementTagNameMap {
    "step-flow-form": StepFlowForm;
  }
}
