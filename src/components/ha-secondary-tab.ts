import { customElement } from "lit/decorators";
import { MdSecondaryTab } from "@material/web/tabs/secondary-tab";

@customElement("ha-secondary-tab")
export class HaSecondaryTab extends MdSecondaryTab {}

declare global {
  interface HTMLElementTagNameMap {
    "ha-secondary-tab": HaSecondaryTab;
  }
}
