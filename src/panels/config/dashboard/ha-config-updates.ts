import "@material/mwc-button/mwc-button";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../../common/dom/fire_event";
import "../../../components/entity/state-badge";
import "../../../components/ha-alert";
import "../../../components/ha-circular-progress";
import "../../../components/ha-icon-next";
import "../../../components/ha-list-new";
import "../../../components/ha-list-item-new";
import {
  computeDeviceName,
  DeviceRegistryEntry,
  subscribeDeviceRegistry,
} from "../../../data/device_registry";
import {
  EntityRegistryEntry,
  subscribeEntityRegistry,
} from "../../../data/entity_registry";
import type { UpdateEntity } from "../../../data/update";
import { SubscribeMixin } from "../../../mixins/subscribe-mixin";
import type { HomeAssistant } from "../../../types";

@customElement("ha-config-updates")
class HaConfigUpdates extends SubscribeMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public updateEntities?: UpdateEntity[];

  @property({ type: Number }) public total?: number;

  @state() private _devices?: DeviceRegistryEntry[];

  @state() private _entities?: EntityRegistryEntry[];

  public hassSubscribe(): UnsubscribeFunc[] {
    return [
      subscribeDeviceRegistry(this.hass.connection, (entries) => {
        this._devices = entries;
      }),
      subscribeEntityRegistry(this.hass.connection!, (entities) => {
        this._entities = entities.filter((entity) => entity.device_id !== null);
      }),
    ];
  }

  private getDeviceEntry = memoizeOne(
    (deviceId: string): DeviceRegistryEntry | undefined =>
      this._devices?.find((device) => device.id === deviceId)
  );

  private getEntityEntry = memoizeOne(
    (entityId: string): EntityRegistryEntry | undefined =>
      this._entities?.find((entity) => entity.entity_id === entityId)
  );

  protected render() {
    if (!this.updateEntities?.length) {
      return nothing;
    }

    const updates = this.updateEntities;

    return html`
      <div class="title">
        ${this.hass.localize("ui.panel.config.updates.title", {
          count: this.total || this.updateEntities.length,
        })}
      </div>
      <ha-list-new>
        ${updates.map((entity) => {
          const entityEntry = this.getEntityEntry(entity.entity_id);
          const deviceEntry =
            entityEntry && entityEntry.device_id
              ? this.getDeviceEntry(entityEntry.device_id)
              : undefined;

          return html`
            <ha-list-item-new
              interactive
              type="button"
              class=${ifDefined(
                entity.attributes.skipped_version ? "skipped" : undefined
              )}
              .entity_id=${entity.entity_id}
              @click=${this._openMoreInfo}
            >
              <state-badge
                slot="start"
                .title=${entity.attributes.title ||
                entity.attributes.friendly_name}
                .hass=${this.hass}
                .stateObj=${entity}
                class=${ifDefined(
                  this.narrow && entity.attributes.in_progress
                    ? "updating"
                    : undefined
                )}
              ></state-badge>
              ${this.narrow && entity.attributes.in_progress
                ? html`<ha-circular-progress
                    indeterminate
                    slot="start"
                    class="absolute"
                    .ariaLabel=${this.hass.localize(
                      "ui.panel.config.updates.update_in_progress"
                    )}
                  ></ha-circular-progress>`
                : ""}
              <span
                >${deviceEntry
                  ? computeDeviceName(deviceEntry, this.hass)
                  : entity.attributes.friendly_name}</span
              >
              <span slot="supporting-text">
                ${entity.attributes.title} ${entity.attributes.latest_version}
                ${entity.attributes.skipped_version
                  ? `(${this.hass.localize("ui.panel.config.updates.skipped")})`
                  : ""}
              </span>
              ${!this.narrow
                ? entity.attributes.in_progress
                  ? html`<ha-circular-progress
                      indeterminate
                      size="small"
                      slot="end"
                      .ariaLabel=${this.hass.localize(
                        "ui.panel.config.updates.update_in_progress"
                      )}
                    ></ha-circular-progress>`
                  : html`<ha-icon-next slot="end"></ha-icon-next>`
                : ""}
            </ha-list-item-new>
          `;
        })}
      </ha-list-new>
    `;
  }

  private _openMoreInfo(ev: MouseEvent): void {
    fireEvent(this, "hass-more-info", {
      entityId: (ev.currentTarget as any).entity_id,
    });
  }

  static get styles(): CSSResultGroup[] {
    return [
      css`
        :host {
          --mdc-list-vertical-padding: 0;
        }
        .title {
          font-size: 16px;
          padding: 16px;
          padding-bottom: 0;
        }
        .skipped {
          background: var(--secondary-background-color);
        }
        ha-list-item {
          --mdc-list-item-graphic-size: 40px;
        }
        ha-icon-next {
          color: var(--secondary-text-color);
          height: 24px;
          width: 24px;
        }
        button.show-more {
          color: var(--primary-color);
          text-align: left;
          cursor: pointer;
          background: none;
          border-width: initial;
          border-style: none;
          border-color: initial;
          border-image: initial;
          padding: 16px;
          font: inherit;
        }
        button.show-more:focus {
          outline: none;
          text-decoration: underline;
        }
        ha-list-item {
          cursor: pointer;
          font-size: 16px;
        }
        ha-circular-progress.absolute {
          position: absolute;
          width: 40px;
          height: 40px;
        }
        state-badge.updating {
          opacity: 0.5;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-updates": HaConfigUpdates;
  }
}
