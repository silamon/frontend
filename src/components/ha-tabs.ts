import { customElement, property } from "lit/decorators";
import { MdTabs } from "@material/web/tabs/tabs";
import { css, html, nothing } from "lit";
import "./ha-icon-button-prev";
import "./ha-icon-button-next";
import { HomeAssistant } from "../types";

@customElement("ha-tabs")
export class HaTabs extends MdTabs {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public buttons: boolean = false;

  protected render() {
    return html`
      ${this.buttons
        ? html`<ha-icon-button-prev
            .label=${this.hass?.localize(
              "ui.panel.lovelace.components.energy_period_selector.previous"
            ) || "Prev"}
            @click=${this._pickPrevious}
          ></ha-icon-button-prev>`
        : nothing}
      ${super.render()}
      ${this.buttons
        ? html`<ha-icon-button-next
            .label=${this.hass?.localize(
              "ui.panel.lovelace.components.energy_period_selector.next"
            ) || "Next"}
            @click=${this._pickNext}
          ></ha-icon-button-next>`
        : nothing}
    `;
  }

  private _pickPrevious() {
    this.activeTabIndex -= 1;
    this.scrollToTab();
  }

  private _pickNext() {
    this.activeTabIndex += 1;
    this.scrollToTab();
  }

  protected updated(c) {
    super.updated(c);
    const slider = this.shadowRoot?.querySelector(".tabs");
    let isDown = false;
    let startX;
    let scrollLeft;

    if (!slider) {
      return;
    }

    slider!.addEventListener("mousedown", (e) => {
      isDown = true;
      slider!.classList.add("active");
      startX = e.pageX - slider!.offsetLeft;
      scrollLeft = slider!.scrollLeft;
    });

    slider!.addEventListener("mouseleave", () => {
      isDown = false;
      slider!.classList.remove("active");
    });

    slider!.addEventListener("mouseup", () => {
      isDown = false;
      slider!.classList.remove("active");
    });

    slider!.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider!.offsetLeft;
      const walk = (x - startX) * 1; //scroll-fast
      var prevScrollLeft = slider!.scrollLeft;
      slider!.scrollLeft = scrollLeft - walk;
    });
  }

  static override styles = [
    ...super.styles,
    css`
      :host {
        --md-sys-color-primary: var(--primary-color);
        --md-sys-color-secondary: var(--secondary-color);
        --md-sys-color-surface: var(--card-background-color);
        --md-sys-color-on-surface: var(--primary-color);
        --md-sys-color-on-surface-variant: var(--secondary-color);
      }

      /* .tabs::-webkit-scrollbar {
          width: 0.4rem;
          height: 0.4rem;
        }

        .tabs::-webkit-scrollbar-thumb {
          -webkit-border-radius: 4px;
          border-radius: 4px;
          background: var(--scrollbar-thumb-color);
        }

        .tabs {
          overflow-y: auto;
          scrollbar-color: var(--scrollbar-thumb-color) transparent;
          scrollbar-width: thin;
        }*/

      :host {
        display: flex;
        flex-direction: row;
        scroll-behavior: unset;
        scrollbar-width: unset;
      }

      ha-icon-button-prev,
      ha-icon-button-next {
        display: inline;
      }

      ha-icon-button-prev + ha-tabs {
        margin-left: 48px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-tabs": HaTabs;
  }
}
