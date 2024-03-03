import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import { mdiClose } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { cache } from "lit/directives/cache";
import { classMap } from "lit/directives/class-map";
import memoize from "memoize-one";
import { fireEvent } from "../../../../common/dom/fire_event";
import { computeDomain } from "../../../../common/entity/compute_domain";
import { computeStateName } from "../../../../common/entity/compute_state_name";
import { DataTableRowData } from "../../../../components/data-table/ha-data-table";
import "../../../../components/ha-dialog";
import "../../../../components/ha-dialog-header";
import {
  isStrategySection,
  LovelaceSectionConfig,
} from "../../../../data/lovelace/config/section";
import type { LovelaceViewConfig } from "../../../../data/lovelace/config/view";
import type { HassDialog } from "../../../../dialogs/make-dialog-manager";
import { haStyleDialog } from "../../../../resources/styles";
import type { HomeAssistant } from "../../../../types";
import {
  computeCards,
  computeSection,
} from "../../common/generate-lovelace-config";
import "./hui-card-picker";
import "./hui-entity-picker-table";
import { CreateCardDialogParams } from "./show-create-card-dialog";
import { showEditCardDialog } from "./show-edit-card-dialog";
import { showSuggestCardDialog } from "./show-suggest-card-dialog";
import {
  findLovelaceContainer,
  parseLovelaceContainerPath,
} from "../lovelace-path";
import "../../../../components/ha-tabs";
import "../../../../components/ha-primary-tab";

declare global {
  interface HASSDomEvents {
    "selected-changed": SelectedChangedEvent;
  }
}

interface SelectedChangedEvent {
  selectedEntities: string[];
}

@customElement("hui-dialog-create-card")
export class HuiCreateDialogCard
  extends LitElement
  implements HassDialog<CreateCardDialogParams>
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _params?: CreateCardDialogParams;

  @state() private _containerConfig!:
    | LovelaceViewConfig
    | LovelaceSectionConfig;

  @state() private _selectedEntities: string[] = [];

  @state() private _currTabIndex = 0;

  public async showDialog(params: CreateCardDialogParams): Promise<void> {
    this._params = params;

    const containerConfig = findLovelaceContainer(
      params.lovelaceConfig,
      params.path
    );

    if ("strategy" in containerConfig) {
      throw new Error("Can't edit strategy");
    }

    this._containerConfig = containerConfig;
  }

  public closeDialog(): boolean {
    this._params = undefined;
    this._currTabIndex = 0;
    this._selectedEntities = [];
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  protected render() {
    if (!this._params) {
      return nothing;
    }

    const title = this._containerConfig.title
      ? this.hass!.localize(
          "ui.panel.lovelace.editor.edit_card.pick_card_title",
          { name: `"${this._containerConfig.title}"` }
        )
      : this.hass!.localize("ui.panel.lovelace.editor.edit_card.pick_card");

    return html`
      <ha-dialog
        open
        scrimClickAction
        @keydown=${this._ignoreKeydown}
        @closed=${this._cancel}
        .heading=${title}
        class=${classMap({ table: this._currTabIndex === 1 })}
      >
        <ha-dialog-header show-border slot="heading">
          <ha-icon-button
            slot="navigationIcon"
            dialogAction="cancel"
            .label=${this.hass.localize("ui.common.close")}
            .path=${mdiClose}
          ></ha-icon-button>
          <span slot="title"> ${title} </span>
          <ha-tabs
            .activeTabIndex=${this._currTabIndex}
            @change=${this._handleTabChanged}
          >
            <ha-primary-tab
              id="tab-by-card"
              aria-controls="panel-by-card"
              dialogInitialFocus
              >${this.hass!.localize(
                "ui.panel.lovelace.editor.cardpicker.by_card"
              )}</ha-primary-tab
            >
            <ha-primary-tab id="tab-by-entity" aria-controls="panel-by-entity"
              >${this.hass!.localize(
                "ui.panel.lovelace.editor.cardpicker.by_entity"
              )}</ha-primary-tab
            >
          </ha-tabs>
        </ha-dialog-header>
        ${cache(
          this._currTabIndex === 0
            ? html`
                <div
                  role="tabpanel"
                  id="panel-by-card"
                  aria-labelledby="tab-by-card"
                >
                  <hui-card-picker
                    .suggestedCards=${this._params.suggestedCards}
                    .lovelace=${this._params.lovelaceConfig}
                    .hass=${this.hass}
                    @config-changed=${this._handleCardPicked}
                  ></hui-card-picker>
                </div>
              `
            : html`
                <div
                  role="tabpanel"
                  id="panel-by-entity"
                  aria-labelledby="tab-by-entity"
                >
                  <hui-entity-picker-table
                    no-label-float
                    .hass=${this.hass}
                    .narrow=${true}
                    .entities=${this._allEntities(this.hass.states)}
                    @selected-changed=${this._handleSelectedChanged}
                  ></hui-entity-picker-table>
                </div>
              `
        )}

        <div slot="primaryAction">
          <mwc-button @click=${this._cancel}>
            ${this.hass!.localize("ui.common.cancel")}
          </mwc-button>
          ${this._selectedEntities.length
            ? html`
                <mwc-button @click=${this._suggestCards}>
                  ${this.hass!.localize("ui.common.continue")}
                </mwc-button>
              `
            : ""}
        </div>
      </ha-dialog>
    `;
  }

  private _ignoreKeydown(ev: KeyboardEvent) {
    ev.stopPropagation();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        @media all and (max-width: 450px), all and (max-height: 500px) {
          /* overrule the ha-style-dialog max-height on small screens */
          ha-dialog {
            --mdc-dialog-max-height: 100%;
            height: 100%;
          }
        }

        @media all and (min-width: 850px) {
          ha-dialog {
            --mdc-dialog-min-width: 845px;
          }
        }

        ha-dialog {
          --mdc-dialog-max-width: 845px;
          --dialog-content-padding: 2px 24px 20px 24px;
          --dialog-z-index: 6;
        }

        ha-dialog.table {
          --dialog-content-padding: 0;
        }

        @media (min-width: 1200px) {
          ha-dialog {
            --mdc-dialog-max-width: calc(100% - 32px);
            --mdc-dialog-min-width: 1000px;
          }
        }

        hui-card-picker {
          --card-picker-search-shape: 0;
          --card-picker-search-margin: -2px -24px 0;
        }
        hui-entity-picker-table {
          display: block;
          height: calc(100vh - 198px);
          --mdc-shape-small: 0;
        }
        @media all and (max-width: 450px), all and (max-height: 500px) {
          hui-entity-picker-table {
            height: calc(100vh - 158px);
          }
        }
      `,
    ];
  }

  private _handleCardPicked(ev) {
    const config = ev.detail.config;
    if (this._params!.entities && this._params!.entities.length) {
      if (Object.keys(config).includes("entities")) {
        config.entities = this._params!.entities;
      } else if (Object.keys(config).includes("entity")) {
        config.entity = this._params!.entities[0];
      }
    }

    showEditCardDialog(this, {
      lovelaceConfig: this._params!.lovelaceConfig,
      saveConfig: this._params!.saveConfig,
      path: this._params!.path,
      cardConfig: config,
    });

    this.closeDialog();
  }

  private _handleTabChanged(ev): void {
    const newTabIndex = ev.target.activeTabIndex;
    if (newTabIndex === this._currTabIndex) {
      return;
    }

    this._currTabIndex = newTabIndex;
    this._selectedEntities = [];
  }

  private _handleSelectedChanged(ev: CustomEvent): void {
    this._selectedEntities = ev.detail.selectedEntities;
  }

  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private _suggestCards(): void {
    const cardConfig = computeCards(
      this.hass.states,
      this._selectedEntities,
      {}
    );

    let sectionOptions: Partial<LovelaceSectionConfig> = {};

    const { sectionIndex } = parseLovelaceContainerPath(this._params!.path);
    const isSection = sectionIndex !== undefined;

    // If we are in a section, we want to keep the section options for the preview
    if (isSection) {
      const containerConfig = findLovelaceContainer(
        this._params!.lovelaceConfig!,
        this._params!.path!
      ) as LovelaceSectionConfig;
      if (!isStrategySection(containerConfig)) {
        const { cards, title, ...rest } = containerConfig;
        sectionOptions = rest;
      }
    }

    const sectionConfig = computeSection(
      this._selectedEntities,
      sectionOptions
    );

    showSuggestCardDialog(this, {
      lovelaceConfig: this._params!.lovelaceConfig,
      saveConfig: this._params!.saveConfig,
      path: this._params!.path as [number],
      entities: this._selectedEntities,
      cardConfig,
      sectionConfig,
    });

    this.closeDialog();
  }

  private _allEntities = memoize((entities) =>
    Object.keys(entities).map((entity) => {
      const stateObj = this.hass.states[entity];
      return {
        icon: "",
        entity_id: entity,
        stateObj,
        name: computeStateName(stateObj),
        domain: computeDomain(entity),
        last_changed: stateObj!.last_changed,
      } as DataTableRowData;
    })
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-create-card": HuiCreateDialogCard;
  }
}
