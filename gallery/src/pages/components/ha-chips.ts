import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators";
import "../../../../src/components/ha-card";
import "../../../../src/components/ha-chip";
import "../../../../src/components/ha-chip-set";
import "../../../../src/components/ha-svg-icon";
import { mdiHomeAssistant } from "../../../../src/resources/home-assistant-logo-svg";

const chips: {
  icon?: string;
  content?: string;
}[] = [
  {},
  {
    icon: mdiHomeAssistant,
  },
  {
    content: "Content",
  },
  {
    icon: mdiHomeAssistant,
    content: "Content",
  },
];

@customElement("demo-components-ha-chips")
export class DemoHaChips extends LitElement {
  protected render(): TemplateResult {
    return html`
      <ha-card header="ha-chip demo">
        <div class="card-content">
          Assist Chips:
          <ha-chip-set>
            ${chips.map(
              (chip) => html`
                <ha-assist-chip label=${chip.content}>
                  ${chip.icon
                    ? html`<ha-svg-icon slot="icon" .path=${chip.icon}>
                      </ha-svg-icon>`
                    : ""}
                </ha-assist-chip>
              `
            )}
          </ha-chip-set>
          Filter Chips:
          <ha-chip-set>
            ${chips.map(
              (chip) => html`
                <ha-filter-chip label=${chip.content}>
                  ${chip.icon
                    ? html`<ha-svg-icon slot="icon" .path=${chip.icon}>
                      </ha-svg-icon>`
                    : ""}
                </ha-filter-chip>
              `
            )}
          </ha-chip-set>
          Input Chips:
          <ha-chip-set>
            ${chips.map(
              (chip) => html`
                <ha-input-chip label=${chip.content}>
                  ${chip.icon
                    ? html`<ha-svg-icon slot="icon" .path=${chip.icon}>
                      </ha-svg-icon>`
                    : ""}
                </ha-input-chip>
              `
            )}
          </ha-chip-set>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        max-width: 600px;
        margin: 24px auto;
      }
      ha-chip {
        margin-bottom: 4px;
      }
      .card-content {
        display: flex;
        flex-direction: column;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-components-ha-chips": DemoHaChips;
  }
}
