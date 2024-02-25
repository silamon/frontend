import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators";
import "@material/web/all";
import type { MdDialog } from "@material/web/all";
import { applyThemesOnElement } from "../../../../src/common/dom/apply_themes_on_element";

@customElement("demo-components-ha-m3-components")
export class DemoHaM3Components extends LitElement {
  protected render(): TemplateResult {
    return html`
      ${["light", "dark"].map(
        (mode) => html`
          <div class=${mode} style="padding:10px">
            <h1>Buttons</h1>
            <md-elevated-button>Elevated</md-elevated-button>
            <md-filled-button>Filled</md-filled-button>
            <md-filled-tonal-button>Tonal</md-filled-tonal-button>
            <md-outlined-button>Outlined</md-outlined-button>
            <md-text-button>Text</md-text-button>
            <h1>Checkboxes</h1>
            <md-checkbox touch-target="wrapper"></md-checkbox>
            <md-checkbox touch-target="wrapper" checked></md-checkbox>
            <md-checkbox touch-target="wrapper" indeterminate></md-checkbox>
            <label>
              <md-checkbox touch-target="wrapper"></md-checkbox>
              Checkbox one
            </label>

            <md-checkbox id="checkbox-two" touch-target="wrapper"></md-checkbox>
            <label for="checkbox-two">Checkbox two</label>
            <h1>Chips</h1>
            <md-chip-set>
              <md-assist-chip label="Assist"></md-assist-chip>
              <md-filter-chip label="Filter"></md-filter-chip>
              <md-input-chip label="Input"></md-input-chip>
              <md-suggestion-chip label="Suggestion"></md-suggestion-chip>
            </md-chip-set>
            <h1>Dialogs</h1>
            <md-text-button
              @click=${this.showDialog}
              aria-label="Open an alert dialog"
              >open</md-text-button
            >

            <md-dialog>
              <div slot="headline">Dialog title</div>
              <form slot="content" id="form-id" method="dialog">
                A simple dialog with free-form content.
              </form>
              <div slot="actions">
                <md-text-button form="form-id">Ok</md-text-button>
              </div>
            </md-dialog>
            <h1>Fabs</h1>
            <md-fab aria-label="Edit">
              <md-icon slot="icon">edit</md-icon>
            </md-fab>
            <h1>Icon buttons</h1>
            <md-icon-button>
              <md-icon>check</md-icon>
            </md-icon-button>
            <md-filled-icon-button>
              <md-icon>check</md-icon>
            </md-filled-icon-button>
            <md-filled-tonal-icon-button>
              <md-icon>check</md-icon>
            </md-filled-tonal-icon-button>
            <md-outlined-icon-button>
              <md-icon>check</md-icon>
            </md-outlined-icon-button>
            <h1>Lists</h1>
            <md-list style="max-width: 300px;">
              <md-list-item> Fruits </md-list-item>
              <md-divider></md-divider>
              <md-list-item> Apple </md-list-item>
              <md-list-item> Banana </md-list-item>
              <md-list-item>
                <div slot="headline">Cucumber</div>
                <div slot="supporting-text">
                  Cucumbers are long green fruits that are just as long as this
                  multi-line description
                </div>
              </md-list-item>
              <md-list-item
                interactive
                href="https://google.com/search?q=buy+kiwis&tbm=shop"
                target="_blank"
              >
                <div slot="headline">Shop for Kiwis</div>
                <div slot="supporting-text">
                  This will link you out in a new tab
                </div>
                <md-icon slot="end">open_in_new</md-icon>
              </md-list-item>
            </md-list>
            <h1>Menus</h1>
            <!-- Note the position: relative style -->
            <span style="position: relative">
              <md-filled-button id="usage-anchor"
                >Set with idref</md-filled-button
              >
              <md-menu id="usage-menu" anchor="usage-anchor" open>
                <md-menu-item>
                  <div slot="headline">Apple</div>
                </md-menu-item>
                <md-menu-item>
                  <div slot="headline">Banana</div>
                </md-menu-item>
                <md-menu-item>
                  <div slot="headline">Cucumber</div>
                </md-menu-item>
              </md-menu>
            </span>

            <span style="position: relative">
              <md-filled-button id="usage-anchor-2"
                >Set with element ref</md-filled-button
              >
              <md-menu id="usage-menu-2" open>
                <md-menu-item>
                  <div slot="headline">Apple</div>
                </md-menu-item>
                <md-menu-item>
                  <div slot="headline">Banana</div>
                </md-menu-item>
                <md-menu-item>
                  <div slot="headline">Cucumber</div>
                </md-menu-item>
              </md-menu>
            </span>

            <h1>Progress indicators</h1>
            <md-circular-progress value="0.75"></md-circular-progress>
            <md-circular-progress indeterminate></md-circular-progress>

            <md-linear-progress indeterminate></md-linear-progress>
            <md-linear-progress value="0.5"></md-linear-progress>
            <h1>Radio buttons</h1>
            <form>
              <md-radio name="animals" value="cats"></md-radio>
              <md-radio name="animals" value="dogs"></md-radio>
              <md-radio name="animals" value="birds" checked></md-radio>
            </form>
            <h1>Selects</h1>
            <md-outlined-select>
              <md-select-option aria-label="blank"></md-select-option>
              <md-select-option selected value="apple">
                <div slot="headline">Apple</div>
              </md-select-option>
              <md-select-option value="apricot">
                <div slot="headline">Apricot</div>
              </md-select-option>
            </md-outlined-select>

            <md-filled-select>
              <md-select-option aria-label="blank"></md-select-option>
              <md-select-option value="apple">
                <div slot="headline">Apple</div>
              </md-select-option>
              <md-select-option value="apricot">
                <div slot="headline">Apricot</div>
              </md-select-option>
            </md-filled-select>
            <h1>Slider</h1>
            <md-slider></md-slider>
            <md-slider ticks value="50"></md-slider>
            <md-slider range value-start="25" value-end="75"></md-slider>
            <h1>Switch</h1>
            <md-switch></md-switch>
            <md-switch selected></md-switch>
            <h1>Tabs</h1>
            <md-tabs>
              <md-primary-tab>Video</md-primary-tab>
              <md-primary-tab>Photos</md-primary-tab>
              <md-primary-tab>Audio</md-primary-tab>
            </md-tabs>

            <md-tabs>
              <md-secondary-tab>Birds</md-secondary-tab>
              <md-secondary-tab>Cats</md-secondary-tab>
              <md-secondary-tab>Dogs</md-secondary-tab>
            </md-tabs>
            <h1>Text fields</h1>
            <md-filled-text-field label="Label" value="Value">
            </md-filled-text-field>

            <md-outlined-text-field label="Label" value="Value">
            </md-outlined-text-field>
          </div>
        `
      )}
    `;
  }

  showDialog(event: Event) {
    ((event.target as Element).nextElementSibling as MdDialog)?.show();
  }

  firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    applyThemesOnElement(
      this.shadowRoot!.querySelector(".dark"),
      {
        default_theme: "default",
        default_dark_theme: "default",
        themes: {},
        darkMode: true,
        theme: "default",
      },
      undefined,
      undefined,
      true
    );
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      .dark,
      .light {
        display: block;
        background-color: var(--primary-background-color);
        padding: 0 50px;
      }
      ha-card {
        margin: 24px auto;
      }
      ha-alert {
        display: block;
        margin: 24px 0;
      }
      .condition {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .image {
        display: inline-flex;
        height: 100%;
        align-items: center;
      }
      .dark h1 {
        color: white;
      }
      img {
        max-height: 24px;
        width: 24px;
      }
      mwc-button {
        --mdc-theme-primary: var(--primary-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-components-ha-m3-components": DemoHaM3Components;
  }
}
