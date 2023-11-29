import { ComboBoxLitRenderer } from "@vaadin/combo-box/lit";
import { HassEntity } from "home-assistant-js-websocket";
import { LitElement, PropertyValues, TemplateResult, html } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../common/dom/fire_event";
import { computeDomain } from "../../common/entity/compute_domain";
import { stringCompare } from "../../common/string/compare";
import {
  ScorableTextItem,
  fuzzyFilterSort,
} from "../../common/string/filter/sequence-matching";
import { AreaRegistryEntry } from "../../data/area_registry";
import {
  DeviceEntityDisplayLookup,
  DeviceRegistryEntry,
  computeDeviceName,
  getDeviceEntityDisplayLookup,
} from "../../data/device_registry";
import { EntityRegistryDisplayEntry } from "../../data/entity_registry";
import { HomeAssistant, ValueChangedEvent } from "../../types";
import "../ha-combo-box";
import type { HaComboBox } from "../ha-combo-box";
import "../ha-list-item";

interface Device {
  name: string;
  area: string;
  id: string;
}

type ScorableDevice = ScorableTextItem & Device;

export type HaDevicePickerDeviceFilterFunc = (
  device: DeviceRegistryEntry
) => boolean;

export type HaDevicePickerEntityFilterFunc = (entity: HassEntity) => boolean;

const rowRenderer: ComboBoxLitRenderer<Device> = (item) =>
  html`<ha-list-item .twoline=${!!item.area}>
    <span>${item.name}</span>
    <span slot="secondary">${item.area}</span>
  </ha-list-item>`;

@customElement("ha-device-picker")
export class HaDevicePicker extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public label?: string;

  @property() public value?: string;

  @property() public helper?: string;

  /**
   * Show only devices with entities from specific domains.
   * @type {Array}
   * @attr include-domains
   */
  @property({ type: Array, attribute: "include-domains" })
  public includeDomains?: string[];

  /**
   * Show no devices with entities of these domains.
   * @type {Array}
   * @attr exclude-domains
   */
  @property({ type: Array, attribute: "exclude-domains" })
  public excludeDomains?: string[];

  /**
   * Show only devices with entities of these device classes.
   * @type {Array}
   * @attr include-device-classes
   */
  @property({ type: Array, attribute: "include-device-classes" })
  public includeDeviceClasses?: string[];

  /**
   * List of devices to be excluded.
   * @type {Array}
   * @attr exclude-devices
   */
  @property({ type: Array, attribute: "exclude-devices" })
  public excludeDevices?: string[];

  @property() public deviceFilter?: HaDevicePickerDeviceFilterFunc;

  @property() public entityFilter?: HaDevicePickerEntityFilterFunc;

  @property({ type: Boolean }) public disabled?: boolean;

  @property({ type: Boolean }) public required?: boolean;

  @state() private _opened?: boolean;

  @query("ha-combo-box", true) public comboBox!: HaComboBox;

  private _init = false;

  private _getDevices = memoizeOne(
    (
      devices: DeviceRegistryEntry[],
      areas: AreaRegistryEntry[],
      entities: EntityRegistryDisplayEntry[],
      includeDomains: this["includeDomains"],
      excludeDomains: this["excludeDomains"],
      includeDeviceClasses: this["includeDeviceClasses"],
      deviceFilter: this["deviceFilter"],
      entityFilter: this["entityFilter"],
      excludeDevices: this["excludeDevices"]
    ): ScorableDevice[] => {
      if (!devices.length) {
        return [
          {
            id: "no_devices",
            area: "",
            name: this.hass.localize("ui.components.device-picker.no_devices"),
            strings: [],
          },
        ];
      }

      let deviceEntityLookup: DeviceEntityDisplayLookup = {};

      if (
        includeDomains ||
        excludeDomains ||
        includeDeviceClasses ||
        entityFilter
      ) {
        deviceEntityLookup = getDeviceEntityDisplayLookup(entities);
      }

      const areaLookup = areas;

      let inputDevices = devices.filter(
        (device) => device.id === this.value || !device.disabled_by
      );

      if (includeDomains) {
        inputDevices = inputDevices.filter((device) => {
          const devEntities = deviceEntityLookup[device.id];
          if (!devEntities || !devEntities.length) {
            return false;
          }
          return deviceEntityLookup[device.id].some((entity) =>
            includeDomains.includes(computeDomain(entity.entity_id))
          );
        });
      }

      if (excludeDomains) {
        inputDevices = inputDevices.filter((device) => {
          const devEntities = deviceEntityLookup[device.id];
          if (!devEntities || !devEntities.length) {
            return true;
          }
          return entities.every(
            (entity) =>
              !excludeDomains.includes(computeDomain(entity.entity_id))
          );
        });
      }

      if (excludeDevices) {
        inputDevices = inputDevices.filter(
          (device) => !excludeDevices!.includes(device.id)
        );
      }

      if (includeDeviceClasses) {
        inputDevices = inputDevices.filter((device) => {
          const devEntities = deviceEntityLookup[device.id];
          if (!devEntities || !devEntities.length) {
            return false;
          }
          return deviceEntityLookup[device.id].some((entity) => {
            const stateObj = this.hass.states[entity.entity_id];
            if (!stateObj) {
              return false;
            }
            return (
              stateObj.attributes.device_class &&
              includeDeviceClasses.includes(stateObj.attributes.device_class)
            );
          });
        });
      }

      if (entityFilter) {
        inputDevices = inputDevices.filter((device) => {
          const devEntities = deviceEntityLookup[device.id];
          if (!devEntities || !devEntities.length) {
            return false;
          }
          return devEntities.some((entity) => {
            const stateObj = this.hass.states[entity.entity_id];
            if (!stateObj) {
              return false;
            }
            return entityFilter(stateObj);
          });
        });
      }

      if (deviceFilter) {
        inputDevices = inputDevices.filter(
          (device) =>
            // We always want to include the device of the current value
            device.id === this.value || deviceFilter!(device)
        );
      }

      const outputDevices = inputDevices.map((device) => {
        const name = computeDeviceName(
          device,
          this.hass,
          deviceEntityLookup[device.id]
        );

        return {
          id: device.id,
          name: name,
          area:
            device.area_id && areaLookup[device.area_id]
              ? areaLookup[device.area_id].name
              : this.hass.localize("ui.components.device-picker.no_area"),
          strings: [name || ""],
        };
      });
      if (!outputDevices.length) {
        return [
          {
            id: "no_devices",
            area: "",
            name: this.hass.localize("ui.components.device-picker.no_match"),
            strings: [],
          },
        ];
      }
      if (outputDevices.length === 1) {
        return outputDevices;
      }
      return outputDevices.sort((a, b) =>
        stringCompare(a.name || "", b.name || "", this.hass.locale.language)
      );
    }
  );

  public async open() {
    await this.updateComplete;
    await this.comboBox?.open();
  }

  public async focus() {
    await this.updateComplete;
    await this.comboBox?.focus();
  }

  protected updated(changedProps: PropertyValues) {
    if (
      (!this._init && this.hass) ||
      (this._init && changedProps.has("_opened") && this._opened)
    ) {
      this._init = true;
      const devices = this._getDevices(
        Object.values(this.hass.devices),
        Object.values(this.hass.areas),
        Object.values(this.hass.entities),
        this.includeDomains,
        this.excludeDomains,
        this.includeDeviceClasses,
        this.deviceFilter,
        this.entityFilter,
        this.excludeDevices
      );
      this.comboBox.items = devices;
      this.comboBox.filteredItems = devices;
    }
  }

  protected render(): TemplateResult {
    return html`
      <ha-combo-box
        .hass=${this.hass}
        .label=${this.label === undefined && this.hass
          ? this.hass.localize("ui.components.device-picker.device")
          : this.label}
        .value=${this._value}
        .helper=${this.helper}
        .renderer=${rowRenderer}
        .disabled=${this.disabled}
        .required=${this.required}
        item-id-path="id"
        item-value-path="id"
        item-label-path="name"
        @opened-changed=${this._openedChanged}
        @value-changed=${this._deviceChanged}
        @filter-changed=${this._filterChanged}
      ></ha-combo-box>
    `;
  }

  private get _value() {
    return this.value || "";
  }

  private _filterChanged(ev: CustomEvent): void {
    const target = ev.target as HaComboBox;
    const filterString = ev.detail.value.toLowerCase();
    target.filteredItems = filterString.length
      ? fuzzyFilterSort<ScorableDevice>(filterString, target.items || [])
      : target.items;
  }

  private _deviceChanged(ev: ValueChangedEvent<string>) {
    ev.stopPropagation();
    let newValue = ev.detail.value;

    if (newValue === "no_devices") {
      newValue = "";
    }

    if (newValue !== this._value) {
      this._setValue(newValue);
    }
  }

  private _openedChanged(ev: ValueChangedEvent<boolean>) {
    this._opened = ev.detail.value;
  }

  private _setValue(value: string) {
    this.value = value;
    setTimeout(() => {
      fireEvent(this, "value-changed", { value });
      fireEvent(this, "change");
    }, 0);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-device-picker": HaDevicePicker;
  }
}
