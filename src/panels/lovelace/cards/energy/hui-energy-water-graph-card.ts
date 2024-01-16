import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ScatterDataPoint,
} from "chart.js";
import { endOfToday, isToday, startOfToday } from "date-fns";
import { HassConfig, UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import {
  hex2rgb,
  lab2rgb,
  rgb2hex,
  rgb2lab,
} from "../../../../common/color/convert-color";
import { labBrighten, labDarken } from "../../../../common/color/lab";
import { formatNumber } from "../../../../common/number/format_number";
import "../../../../components/chart/ha-chart-base";
import "../../../../components/ha-card";
import {
  EnergyData,
  getEnergyDataCollection,
  getEnergyWaterUnit,
  WaterSourceTypeEnergyPreference,
} from "../../../../data/energy";
import {
  getStatisticLabel,
  Statistics,
  StatisticsMetaData,
} from "../../../../data/recorder";
import { FrontendLocaleData } from "../../../../data/translation";
import { SubscribeMixin } from "../../../../mixins/subscribe-mixin";
import { HomeAssistant } from "../../../../types";
import { LovelaceCard } from "../../types";
import { EnergyWaterGraphCardConfig } from "../types";
import { hasConfigChanged } from "../../common/has-changed";
import { getCommonOptions } from "./common/energy-chart-options";

@customElement("hui-energy-water-graph-card")
export class HuiEnergyWaterGraphCard
  extends SubscribeMixin(LitElement)
  implements LovelaceCard
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: EnergyWaterGraphCardConfig;

  @state() private _chartData: ChartData = {
    datasets: [],
  };

  @state() private _start = startOfToday();

  @state() private _end = endOfToday();

  @state() private _compareStart?: Date;

  @state() private _compareEnd?: Date;

  @state() private _unit?: string;

  protected hassSubscribeRequiredHostProps = ["_config"];

  public hassSubscribe(): UnsubscribeFunc[] {
    return [
      getEnergyDataCollection(this.hass, {
        key: this._config?.collection_key,
      }).subscribe((data) => this._getStatistics(data)),
    ];
  }

  public getCardSize(): Promise<number> | number {
    return 3;
  }

  public setConfig(config: EnergyWaterGraphCardConfig): void {
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return (
      hasConfigChanged(this, changedProps) ||
      changedProps.size > 1 ||
      !changedProps.has("hass")
    );
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-card>
        ${this._config.title
          ? html`<h1 class="card-header">${this._config.title}</h1>`
          : ""}
        <div
          class="content ${classMap({
            "has-header": !!this._config.title,
          })}"
        >
          <ha-chart-base
            .hass=${this.hass}
            .data=${this._chartData}
            .options=${this._createOptions(
              this._start,
              this._end,
              this.hass.locale,
              this.hass.config,
              this._unit,
              this._compareStart,
              this._compareEnd
            )}
            chart-type="bar"
          ></ha-chart-base>
          ${!this._chartData.datasets.length
            ? html`<div class="no-data">
                ${isToday(this._start)
                  ? this.hass.localize("ui.panel.lovelace.cards.energy.no_data")
                  : this.hass.localize(
                      "ui.panel.lovelace.cards.energy.no_data_period"
                    )}
              </div>`
            : ""}
        </div>
      </ha-card>
    `;
  }

  private _createOptions = memoizeOne(
    (
      start: Date,
      end: Date,
      locale: FrontendLocaleData,
      config: HassConfig,
      unit?: string,
      compareStart?: Date,
      compareEnd?: Date
    ): ChartOptions => {
      const commonOptions = getCommonOptions(
        start,
        end,
        locale,
        config,
        unit,
        compareStart,
        compareEnd
      );
      const options: ChartOptions = {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            ...commonOptions.plugins!.tooltip,
            callbacks: {
              ...commonOptions.plugins!.tooltip!.callbacks,
              footer: (contexts) => {
                if (contexts.length < 2) {
                  return [];
                }
                let total = 0;
                for (const context of contexts) {
                  total += (context.dataset.data[context.dataIndex] as any).y;
                }
                if (total === 0) {
                  return [];
                }
                return [
                  this.hass.localize(
                    "ui.panel.lovelace.cards.energy.energy_water_graph.total_consumed",
                    { num: formatNumber(total, locale), unit }
                  ),
                ];
              },
            },
          },
        },
      };
      return options;
    }
  );

  private async _getStatistics(energyData: EnergyData): Promise<void> {
    const waterSources: WaterSourceTypeEnergyPreference[] =
      energyData.prefs.energy_sources.filter(
        (source) => source.type === "water"
      ) as WaterSourceTypeEnergyPreference[];

    this._unit = getEnergyWaterUnit(this.hass);

    const datasets: ChartDataset<"bar", ScatterDataPoint[]>[] = [];

    const computedStyles = getComputedStyle(this);
    const waterColor = computedStyles
      .getPropertyValue("--energy-water-color")
      .trim();

    datasets.push(
      ...this._processDataSet(
        energyData.stats,
        energyData.statsMetadata,
        waterSources,
        waterColor,
        computedStyles
      )
    );

    if (energyData.statsCompare) {
      // Add empty dataset to align the bars
      datasets.push({
        order: 0,
        data: [],
      });
      datasets.push({
        order: 999,
        data: [],
        xAxisID: "xAxisCompare",
      });

      datasets.push(
        ...this._processDataSet(
          energyData.statsCompare,
          energyData.statsMetadata,
          waterSources,
          waterColor,
          computedStyles,
          true
        )
      );
    }

    this._start = energyData.start;
    this._end = energyData.end || endOfToday();

    this._compareStart = energyData.startCompare;
    this._compareEnd = energyData.endCompare;

    this._chartData = {
      datasets,
    };
  }

  private _processDataSet(
    statistics: Statistics,
    statisticsMetaData: Record<string, StatisticsMetaData>,
    waterSources: WaterSourceTypeEnergyPreference[],
    waterColor: string,
    computedStyles: CSSStyleDeclaration,
    compare = false
  ) {
    const data: ChartDataset<"bar", ScatterDataPoint[]>[] = [];

    waterSources.forEach((source, idx) => {
      let borderColor = computedStyles
        .getPropertyValue("--energy-water-color-" + idx)
        .trim();
      if (borderColor.length === 0) {
        const modifiedColor =
          idx > 0
            ? this.hass.themes.darkMode
              ? labBrighten(rgb2lab(hex2rgb(waterColor)), idx)
              : labDarken(rgb2lab(hex2rgb(waterColor)), idx)
            : undefined;
        borderColor = modifiedColor
          ? rgb2hex(lab2rgb(modifiedColor))
          : waterColor;
      }

      let prevStart: number | null = null;

      const waterConsumptionData: ScatterDataPoint[] = [];

      // Process water consumption data.
      if (source.stat_energy_from in statistics) {
        const stats = statistics[source.stat_energy_from];
        let end;

        for (const point of stats) {
          if (point.change === null || point.change === undefined) {
            continue;
          }
          if (prevStart === point.start) {
            continue;
          }
          const date = new Date(point.start);
          waterConsumptionData.push({
            x: date.getTime(),
            y: point.change,
          });
          prevStart = point.start;
          end = point.end;
        }
        if (waterConsumptionData.length === 1) {
          waterConsumptionData.push({
            x: end,
            y: 0,
          });
        }
      }

      data.push({
        label: getStatisticLabel(
          this.hass,
          source.stat_energy_from,
          statisticsMetaData[source.stat_energy_from]
        ),
        borderColor: compare ? borderColor + "7F" : borderColor,
        backgroundColor: compare ? borderColor + "32" : borderColor + "7F",
        data: waterConsumptionData,
        order: 1,
        stack: "water",
        xAxisID: compare ? "xAxisCompare" : undefined,
      });
    });
    return data;
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        height: 100%;
      }
      .card-header {
        padding-bottom: 0;
      }
      .content {
        padding: 16px;
      }
      .has-header {
        padding-top: 0;
      }
      .no-data {
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20%;
        margin-left: 32px;
        box-sizing: border-box;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-energy-water-graph-card": HuiEnergyWaterGraphCard;
  }
}
