import { customElement } from "lit/decorators";
import { MdTabs } from "@material/web/tabs/tabs";
import { CSSResult, css } from "lit";

@customElement("ha-tabs")
export class HaTabs extends MdTabs {
  protected updated(c) {
    super.updated(c);
    const slider = this.shadowRoot?.querySelector(".tabs");
    let isDown = false;
    let startX;
    let scrollLeft;

    if (!slider) {
      return;
    }
    console.log("adding");

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
      console.log("test?");
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider!.offsetLeft;
      const walk = (x - startX) * 1; //scroll-fast
      var prevScrollLeft = slider!.scrollLeft;
      console.log("setting scrollleft to " + (scrollLeft - walk));
      slider!.scrollLeft = scrollLeft - walk;
    });
  }

  static get styles(): CSSResult[] {
    return [
      ...MdTabs.styles,
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
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-tabs": HaTabs;
  }
}
