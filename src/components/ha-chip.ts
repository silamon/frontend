import { MdAssistChip } from "@material/web/chips/assist-chip";
import { MdFilterChip } from "@material/web/chips/filter-chip";
import { MdInputChip } from "@material/web/chips/input-chip";
import { css, CSSResult } from "lit";
import { customElement } from "lit/decorators";

@customElement("ha-assist-chip")
export class HaAssistChip extends MdAssistChip {}

@customElement("ha-filter-chip")
export class HaFilterChip extends MdFilterChip {}

@customElement("ha-input-chip")
export class HaInputChip extends MdInputChip {}

declare global {
  interface HTMLElementTagNameMap {
    "ha-assist-chip": HaAssistChip;
    "ha-filter-chip": HaFilterChip;
    "ha-input-chip": HaInputChip;
  }
}
