import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { relativeTime } from "../../../common/datetime/relative_time";
import { capitalizeFirstLetter } from "../../../common/string/capitalize-first-letter";
import "../../../components/ha-alert";
import "../../../components/ha-card";
import "../../../components/ha-list-new";
import "../../../components/ha-list-item-new";
import "../../../components/ha-svg-icon";
import {
  fetchRepairsIssueData,
  type RepairsIssue,
} from "../../../data/repairs";
import type { HomeAssistant } from "../../../types";
import { showRepairsFlowDialog } from "./show-dialog-repair-flow";
import { showRepairsIssueDialog } from "./show-repair-issue-dialog";
import { showConfigFlowDialog } from "../../../dialogs/config-flow/show-dialog-config-flow";
import "../../../components/ha-domain-icon";

@customElement("ha-config-repairs")
class HaConfigRepairs extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false })
  public repairsIssues?: RepairsIssue[];

  @property({ type: Number })
  public total?: number;

  protected render() {
    if (!this.repairsIssues?.length) {
      return nothing;
    }

    const issues = this.repairsIssues;
    return html`
      <div class="title">
        ${this.hass.localize("ui.panel.config.repairs.title", {
          count: this.total || this.repairsIssues.length,
        })}
      </div>
      <ha-list-new>
        ${issues.map(
          (issue) => html`
            <ha-list-item-new
              interactive
              type="button"
              .issue=${issue}
              class=${issue.ignored ? "ignored" : ""}
              @click=${this._openShowMoreDialog}
            >
              <span slot="start">
                <ha-domain-icon
                  .hass=${this.hass}
                  .domain=${issue.issue_domain || issue.domain}
                  brandFallback
                ></ha-domain-icon>
              </span>
              <span
                >${this.hass.localize(
                  `component.${issue.domain}.issues.${
                    issue.translation_key || issue.issue_id
                  }.title`,
                  issue.translation_placeholders || {}
                )}</span
              >
              <span slot="supporting-text" class="secondary">
                ${issue.severity === "critical" || issue.severity === "error"
                  ? html`<span class="error"
                      >${this.hass.localize(
                        `ui.panel.config.repairs.${issue.severity}`
                      )}</span
                    >`
                  : ""}
                ${(issue.severity === "critical" ||
                  issue.severity === "error") &&
                issue.created
                  ? " - "
                  : ""}
                ${issue.created
                  ? capitalizeFirstLetter(
                      relativeTime(new Date(issue.created), this.hass.locale)
                    )
                  : ""}
                ${issue.ignored
                  ? ` - ${this.hass.localize(
                      "ui.panel.config.repairs.dialog.ignored_in_version_short",
                      { version: issue.dismissed_version }
                    )}`
                  : ""}
              </span>
              ${!this.narrow
                ? html`<ha-icon-next slot="end"></ha-icon-next>`
                : ""}
            </ha-list-item-new>
          `
        )}
      </ha-list-new>
    `;
  }

  private async _openShowMoreDialog(ev): Promise<void> {
    const issue = ev.currentTarget.issue as RepairsIssue;
    if (issue.is_fixable) {
      showRepairsFlowDialog(this, issue);
    } else if (
      issue.domain === "homeassistant" &&
      issue.translation_key === "config_entry_reauth"
    ) {
      const data = await fetchRepairsIssueData(
        this.hass.connection,
        issue.domain,
        issue.issue_id
      );
      if ("flow_id" in data.issue_data) {
        showConfigFlowDialog(this, {
          continueFlowId: data.issue_data.flow_id as string,
        });
      }
    } else {
      showRepairsIssueDialog(this, {
        issue,
      });
    }
  }

  static styles = css`
    :host {
      --mdc-list-vertical-padding: 0;
    }
    .title {
      font-size: 16px;
      padding: 16px;
      padding-bottom: 0;
    }
    .ignored {
      opacity: var(--light-secondary-opacity);
    }
    button.show-more {
      color: var(--primary-color);
      text-align: left;
      cursor: pointer;
      background: none;
      border-width: initial;
      border-style: none;
      border-color: initial;
      border-image: initial;
      padding: 16px;
      font: inherit;
    }
    button.show-more:focus {
      outline: none;
      text-decoration: underline;
    }
    ha-domain-icon {
      --mdc-icon-size: 40px;
    }
    .error {
      color: var(--error-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-repairs": HaConfigRepairs;
  }
}
