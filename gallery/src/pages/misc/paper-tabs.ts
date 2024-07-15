import "@material/mwc-button";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators";
import "../../../../src/components/ha-card";
import "../../../../src/components/ha-tab-bar";
import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@polymer/paper-tabs/paper-tab";
import "@polymer/paper-tabs/paper-tabs";

@customElement("demo-misc-paper-tabs")
export class DemoPaperTabs extends LitElement {
  protected render(): TemplateResult {
    return html`
      <paper-tabs selected="0" scrollable fit-container>
        <paper-tab>NUMBER ONE ITEM</paper-tab>
        <paper-tab>ITEM TWO</paper-tab>
        <paper-tab>THE THIRD ITEM</paper-tab>
        <paper-tab>NUMBER ONE ITEM</paper-tab>
        <paper-tab>ITEM TWO</paper-tab>
        <paper-tab>THE THIRD ITEM</paper-tab>
        <paper-tab>NUMBER ONE ITEM</paper-tab>
        <paper-tab>ITEM TWO</paper-tab>
        <paper-tab>THE THIRD ITEM</paper-tab>
        <paper-tab>NUMBER ONE ITEM</paper-tab>
        <paper-tab>ITEM TWO</paper-tab>
        <paper-tab>THE THIRD ITEM</paper-tab>
        <paper-tab>NUMBER ONE ITEM</paper-tab>
        <paper-tab>ITEM TWO</paper-tab>
        <paper-tab>THE THIRD ITEM</paper-tab>
      </paper-tabs>

      <br /><br />

      <mwc-tab-bar>
        <mwc-tab label="Tab one"></mwc-tab>
        <mwc-tab label="Tab two"></mwc-tab>
        <mwc-tab label="Tab three"></mwc-tab>
        <mwc-tab label="Tab four"></mwc-tab>
        <mwc-tab label="Tab five"></mwc-tab>
        <mwc-tab label="Tab six"></mwc-tab>
        <mwc-tab label="Tab seven"></mwc-tab>
        <mwc-tab label="Tab eight"></mwc-tab>
        <mwc-tab label="Tab nine"></mwc-tab>
        <mwc-tab label="Tab ten"></mwc-tab>
        <mwc-tab label="Tab eleven"></mwc-tab>
        <mwc-tab label="Tab twelve"></mwc-tab>
      </mwc-tab-bar>

      <div class="items">
        <div class="item item1"></div>
        <div class="item item2"></div>
        <div class="item item3"></div>
        <div class="item item4"></div>
        <div class="item item5"></div>
        <div class="item item6"></div>
        <div class="item item7"></div>
        <div class="item item8"></div>
        <div class="item item9"></div>
        <div class="item item10"></div>
      </div>
    `;
  }

  protected updated(c) {
    super.updated(c);
    const slider = this.shadowRoot?.querySelector(".items");
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

  static styles = css`
    .items {
      position: relative;
      width: 100%;
      overflow-x: scroll;
      overflow-y: hidden;
      white-space: nowrap;
      transition: all 0.2s;
      transform: scale(0.98);
      will-change: transform;
      user-select: none;
      cursor: pointer;
    }

    .item {
      display: inline-block;
      background: skyblue;
      min-height: 250px;
      min-width: 400px;
      margin: 2em 1em;
    }
    @media screen and (max-width: 500px) {
      .item {
        min-height: 200px;
        min-width: 200px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-misc-paper-tabs": DemoPaperTabs;
  }
}
