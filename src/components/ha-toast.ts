import { customElement } from "lit/decorators";
import { SnackbarBase } from "@material/mwc-snackbar/mwc-snackbar-base";

@customElement("ha-toast")
export class HaToast extends SnackbarBase {}

declare global {
  interface HTMLElementTagNameMap {
    "ha-toast": HaToast;
  }
}
