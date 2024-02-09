import { customElement } from "lit/decorators";
import { MdPrimaryTab } from "@material/web/tabs/primary-tab";

@customElement("ha-primary-tab")
export class HaPrimaryTab extends MdPrimaryTab {}

declare global {
  interface HTMLElementTagNameMap {
    "ha-primary-tab": HaPrimaryTab;
  }
}
