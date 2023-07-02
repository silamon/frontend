import { HassConfig } from "home-assistant-js-websocket";
import { ensureArray } from "../common/array/ensure-array";
import { formatDuration } from "../common/datetime/format_duration";
import {
  formatTime,
  formatTimeWithSeconds,
} from "../common/datetime/format_time";
import secondsToDuration from "../common/datetime/seconds_to_duration";
import {
  computeAttributeNameDisplay,
  computeAttributeValueDisplay,
} from "../common/entity/compute_attribute_display";
import { computeStateDisplay } from "../common/entity/compute_state_display";
import { computeStateName } from "../common/entity/compute_state_name";
import "../resources/intl-polyfill";
import type { HomeAssistant } from "../types";
import { Condition, ForDict, Trigger } from "./automation";
import {
  DeviceCondition,
  DeviceTrigger,
  localizeDeviceAutomationCondition,
  localizeDeviceAutomationTrigger,
} from "./device_automation";
import { EntityRegistryEntry } from "./entity_registry";
import { FrontendLocaleData } from "./translation";
import {
  formatListWithAnds,
  formatListWithOrs,
} from "../common/string/format-list";

const triggerTranslationBaseKey =
  "ui.panel.config.automation.editor.triggers.type";

const describeDuration = (forTime: number | string | ForDict) => {
  let duration: string | null;
  if (typeof forTime === "number") {
    duration = secondsToDuration(forTime);
  } else if (typeof forTime === "string") {
    duration = forTime;
  } else {
    duration = formatDuration(forTime);
  }
  return duration;
};

const localizeTimeString = (
  time: string,
  locale: FrontendLocaleData,
  config: HassConfig
) => {
  const chunks = time.split(":");
  if (chunks.length < 2 || chunks.length > 3) {
    return time;
  }
  try {
    const dt = new Date("1970-01-01T" + time);
    if (chunks.length === 2 || Number(chunks[2]) === 0) {
      return formatTime(dt, locale, config);
    }
    return formatTimeWithSeconds(dt, locale, config);
  } catch {
    return time;
  }
};

const ordinalSuffix = (n: number) => {
  n %= 100;
  if ([11, 12, 13].includes(n)) {
    return "th";
  }
  if (n % 10 === 1) {
    return "st";
  }
  if (n % 10 === 2) {
    return "nd";
  }
  if (n % 10 === 3) {
    return "rd";
  }
  return "th";
};

export const describeTrigger = (
  trigger: Trigger,
  hass: HomeAssistant,
  entityRegistry: EntityRegistryEntry[],
  ignoreAlias = false
) => {
  try {
    return tryDescribeTrigger(trigger, hass, entityRegistry, ignoreAlias);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);

    let msg = "Error in describing trigger";
    if (error.message) {
      msg += ": " + error.message;
    }
    return msg;
  }
};

const tryDescribeTrigger = (
  trigger: Trigger,
  hass: HomeAssistant,
  entityRegistry: EntityRegistryEntry[],
  ignoreAlias = false
) => {
  if (trigger.alias && !ignoreAlias) {
    return trigger.alias;
  }

  // Event Trigger
  if (trigger.platform === "event" && trigger.event_type) {
    const eventTypes: string[] = [];

    if (Array.isArray(trigger.event_type)) {
      for (const state of trigger.event_type.values()) {
        eventTypes.push(state);
      }
    } else {
      eventTypes.push(trigger.event_type);
    }

    const eventTypesString = formatListWithOrs(hass.locale, eventTypes);
    return hass.localize(
      `${triggerTranslationBaseKey}.event.description.full`,
      { eventTypes: eventTypesString }
    );
  }

  // Home Assistant Trigger
  if (trigger.platform === "homeassistant" && trigger.event) {
    return hass.localize(
      trigger.event === "start"
        ? `${triggerTranslationBaseKey}.homeassistant.description.started`
        : `${triggerTranslationBaseKey}.homeassistant.description.shutdown`
    );
  }

  // Numeric State Trigger
  if (trigger.platform === "numeric_state" && trigger.entity_id) {
    const stateObj = hass.states[trigger.entity_id];
    const entity = stateObj ? computeStateName(stateObj) : trigger.entity_id;

    let attribute: string | undefined;
    if (trigger.attribute) {
      attribute = computeAttributeNameDisplay(
        hass.localize,
        stateObj,
        hass.entities,
        trigger.attribute
      );
    }

    let above: number | undefined;
    if (trigger.above) {
      above = trigger.above;
    }

    let below: number | undefined;
    if (trigger.below) {
      below = trigger.below;
    }

    let duration: string | null | undefined;
    if (trigger.for) {
      duration = describeDuration(trigger.for);
    }

    return hass.localize(
      `${triggerTranslationBaseKey}.numeric_state.description.full`,
      {
        hasAttribute: attribute !== undefined,
        attribute: attribute,
        entity: entity,
        hasAbove: above !== undefined,
        above: above,
        hasBelow: below !== undefined,
        below: below,
        hasAboveAndBelow: above !== undefined && below !== undefined,
        hasDuration: duration !== undefined && duration !== null,
        duration: duration,
      }
    );
  }

  // State Trigger
  if (trigger.platform === "state") {
    const entities: string[] = [];
    const states = hass.states;

    let attribute: string | undefined;
    if (trigger.attribute) {
      const stateObj = Array.isArray(trigger.entity_id)
        ? hass.states[trigger.entity_id[0]]
        : hass.states[trigger.entity_id];
      attribute = computeAttributeNameDisplay(
        hass.localize,
        stateObj,
        hass.entities,
        trigger.attribute
      );
    }

    if (Array.isArray(trigger.entity_id)) {
      for (const entity of trigger.entity_id.values()) {
        if (states[entity]) {
          entities.push(computeStateName(states[entity]) || entity);
        }
      }
    } else if (trigger.entity_id) {
      entities.push(
        states[trigger.entity_id]
          ? computeStateName(states[trigger.entity_id])
          : trigger.entity_id
      );
    }

    const stateObj =
      hass.states[
        Array.isArray(trigger.entity_id)
          ? trigger.entity_id[0]
          : trigger.entity_id
      ];
    let fromString: string | undefined;
    if (trigger.from !== undefined) {
      const fromValues: string[] = Array.isArray(trigger.from)
        ? Array.from(trigger.from.values())
        : [trigger.from.toString()];
      const from: string[] = [];
      for (const state of fromValues) {
        from.push(
          trigger.attribute
            ? computeAttributeValueDisplay(
                hass.localize,
                stateObj,
                hass.locale,
                hass.config,
                hass.entities,
                trigger.attribute,
                state
              ).toString()
            : computeStateDisplay(
                hass.localize,
                stateObj,
                hass.locale,
                hass.config,
                hass.entities,
                state
              )
        );
      }
      if (from.length !== 0) {
        fromString = formatListWithOrs(hass.locale, from);
      }
    }

    let toString: string | undefined;
    if (trigger.to !== undefined) {
      const toValues: string[] = Array.isArray(trigger.to)
        ? Array.from(trigger.to.values())
        : [trigger.to.toString()];
      const to: string[] = [];
      for (const state of toValues) {
        to.push(
          trigger.attribute
            ? computeAttributeValueDisplay(
                hass.localize,
                stateObj,
                hass.locale,
                hass.config,
                hass.entities,
                trigger.attribute,
                state
              ).toString()
            : computeStateDisplay(
                hass.localize,
                stateObj,
                hass.locale,
                hass.config,
                hass.entities,
                state
              )
        );
      }
      if (to.length !== 0) {
        toString = formatListWithOrs(hass.locale, to);
      }
    }

    let duration: string | null | undefined;
    if (trigger.for) {
      duration = describeDuration(trigger.for);
    }

    let hasAttribute = attribute !== undefined;
    return hass.localize(
      `${triggerTranslationBaseKey}.state.description.full`,
      {
        hasAttribute: hasAttribute,
        attribute: attribute,
        hasEntity: entities.length !== 0,
        entity: formatListWithOrs(hass.locale, entities),
        hasFrom:
          fromString !== undefined
            ? true
            : !hasAttribute && toString === null
            ? "no_attribute"
            : false,
        from: fromString,
        hasTo:
          toString !== undefined
            ? true
            : !hasAttribute && fromString === null
            ? "no_attribute"
            : false,
        to: toString,
        hasDuration: duration !== undefined && duration !== null,
        duration: duration,
        hasNoAttributeNoFromNoTo:
          attribute === undefined &&
          fromString === undefined &&
          toString === undefined,
      }
    );
  }

  // Sun Trigger
  if (trigger.platform === "sun" && trigger.event) {
    let duration = "";
    if (trigger.offset) {
      if (typeof trigger.offset === "number") {
        duration = secondsToDuration(trigger.offset)!;
      } else if (typeof trigger.offset === "string") {
        duration = trigger.offset;
      } else {
        duration = JSON.stringify(trigger.offset);
      }
    }

    return hass.localize(
      trigger.event === "sunset"
        ? `${triggerTranslationBaseKey}.sun.description.sets`
        : `${triggerTranslationBaseKey}.sun.description.rises`,
      { hasDuration: duration !== "", duration: duration }
    );
  }

  // Tag Trigger
  if (trigger.platform === "tag") {
    return hass.localize(`${triggerTranslationBaseKey}.tag.description.full`);
  }

  // Time Trigger
  if (trigger.platform === "time" && trigger.at) {
    const result = ensureArray(trigger.at).map((at) =>
      typeof at !== "string"
        ? at
        : at.includes(".")
        ? `entity ${hass.states[at] ? computeStateName(hass.states[at]) : at}`
        : localizeTimeString(at, hass.locale, hass.config)
    );

    return hass.localize(`${triggerTranslationBaseKey}.time.description.full`, {
      time: formatListWithOrs(hass.locale, result),
    });
  }

  // Time Pattern Trigger
  if (
    trigger.platform === "time_pattern" &&
    (trigger.seconds !== undefined ||
      trigger.minutes !== undefined ||
      trigger.hours !== undefined)
  ) {
    const describeTimePatternTriggerPart = (
      given_value: string | number | undefined,
      min: number,
      max: number
    ) => {
      // gives the friendly description for either seconds, minutes or hours
      let result = "";
      let resultType: "all" | "every_interval" | "number_value" | undefined;
      if (given_value !== undefined) {
        const value_all = given_value === "*";
        const value_interval =
          typeof given_value === "string" && given_value.startsWith("/");
        const value = value_all
          ? 0
          : typeof given_value === "number"
          ? given_value
          : value_interval
          ? parseInt(given_value.substring(1))
          : parseInt(given_value);

        if (
          isNaN(value) ||
          value > max ||
          value < min ||
          (value_interval && value === 0)
        ) {
          throw new Error(
            hass.localize(
              `${triggerTranslationBaseKey}.time_pattern.invalid_time_pattern`
            )
          );
        }

        if (value_all) {
          resultType = "all";
        } else if (value_interval) {
          resultType = "every_interval";
          result = value.toString();
        } else {
          resultType = "number_value";
          result = value.toString() + ordinalSuffix(value);
        }
      }

      return [result, resultType];
    };

    let secondsPart: (string | undefined)[];
    try {
      secondsPart = describeTimePatternTriggerPart(trigger.seconds, 0, 59);
    } catch (error: any) {
      return (
        error.message +
        " " +
        hass.localize(`${triggerTranslationBaseKey}.time_pattern.seconds`)
      );
    }

    let minutesPart: (string | undefined)[];
    try {
      minutesPart = describeTimePatternTriggerPart(trigger.minutes, 0, 59);
    } catch (error: any) {
      return (
        error.message +
        " " +
        hass.localize(`${triggerTranslationBaseKey}.time_pattern.minutes`)
      );
    }

    let hoursPart: (string | undefined)[];
    try {
      hoursPart = describeTimePatternTriggerPart(trigger.hours, 0, 23);
    } catch (error: any) {
      return (
        error.message +
        " " +
        hass.localize(`${triggerTranslationBaseKey}.time_pattern.hours`)
      );
    }

    return hass.localize(
      `${triggerTranslationBaseKey}.time_pattern.description.full`,
      {
        secondsType: secondsPart[1],
        seconds: secondsPart[0],
        hoursType: hoursPart[1],
        hours: hoursPart[0],
        minutesType: minutesPart[1],
        minutes: minutesPart[0],
      }
    );
  }

  // Zone Trigger
  if (trigger.platform === "zone" && trigger.entity_id && trigger.zone) {
    const entities: string[] = [];
    const zones: string[] = [];

    const states = hass.states;

    if (Array.isArray(trigger.entity_id)) {
      for (const entity of trigger.entity_id.values()) {
        if (states[entity]) {
          entities.push(computeStateName(states[entity]) || entity);
        }
      }
    } else {
      entities.push(
        states[trigger.entity_id]
          ? computeStateName(states[trigger.entity_id])
          : trigger.entity_id
      );
    }

    if (Array.isArray(trigger.zone)) {
      for (const zone of trigger.zone.values()) {
        if (states[zone]) {
          zones.push(computeStateName(states[zone]) || zone);
        }
      }
    } else {
      zones.push(
        states[trigger.zone]
          ? computeStateName(states[trigger.zone])
          : trigger.zone
      );
    }

    return hass.localize(`${triggerTranslationBaseKey}.zone.description.full`, {
      entity: formatListWithOrs(hass.locale, entities),
      event: trigger.event.toString(),
      zone: formatListWithOrs(hass.locale, zones),
      numberOfZones: zones.length,
    });
  }

  // Geo Location Trigger
  if (trigger.platform === "geo_location" && trigger.source && trigger.zone) {
    const sources: string[] = [];
    const zones: string[] = [];
    const states = hass.states;

    if (Array.isArray(trigger.source)) {
      for (const source of trigger.source.values()) {
        sources.push(source);
      }
    } else {
      sources.push(trigger.source);
    }

    if (Array.isArray(trigger.zone)) {
      for (const zone of trigger.zone.values()) {
        if (states[zone]) {
          zones.push(computeStateName(states[zone]) || zone);
        }
      }
    } else {
      zones.push(
        states[trigger.zone]
          ? computeStateName(states[trigger.zone])
          : trigger.zone
      );
    }

    return hass.localize(`${triggerTranslationBaseKey}.geo.description.full`, {
      entity: formatListWithOrs(hass.locale, sources),
      event: trigger.event.toString(),
      zone: formatListWithOrs(hass.locale, zones),
      numberOfZones: zones.length,
    });
  }

  // MQTT Trigger
  if (trigger.platform === "mqtt") {
    return hass.localize(`${triggerTranslationBaseKey}.mqtt.description.full`);
  }

  // Template Trigger
  if (trigger.platform === "template") {
    let duration = "";
    if (trigger.for) {
      duration = describeDuration(trigger.for) ?? "";
    }

    return hass.localize(
      `${triggerTranslationBaseKey}.template.description.full`,
      { hasDuration: duration !== "", duration: duration }
    );
  }

  // Webhook Trigger
  if (trigger.platform === "webhook") {
    return hass.localize(
      `${triggerTranslationBaseKey}.webhook.description.full`
    );
  }

  // Conversation Trigger
  if (trigger.platform === "conversation") {
    if (!trigger.command) {
      return hass.localize(
        `${triggerTranslationBaseKey}.conversation.description.empty`
      );
    }

    return hass.localize(
      `${triggerTranslationBaseKey}.conversation.description.full`,
      {
        sentence: formatListWithOrs(
          hass.locale,
          ensureArray(trigger.command).map((cmd) => `'${cmd}'`)
        ),
      }
    );
  }

  // Persistent Notification Trigger
  if (trigger.platform === "persistent_notification") {
    return hass.localize(
      `${triggerTranslationBaseKey}.persistent_notification.description.full`
    );
  }

  // Device Trigger
  if (trigger.platform === "device") {
    if (!trigger.device_id) {
      return "Device trigger";
    }
    const config = trigger as DeviceTrigger;
    const localized = localizeDeviceAutomationTrigger(
      hass,
      entityRegistry,
      config
    );
    if (localized) {
      return localized;
    }
    const stateObj = hass.states[config.entity_id as string];
    return `${stateObj ? computeStateName(stateObj) : config.entity_id} ${
      config.type
    }`;
  }

  return `${
    trigger.platform ? trigger.platform.replace(/_/g, " ") : "Unknown"
  } trigger`;
};

export const describeCondition = (
  condition: Condition,
  hass: HomeAssistant,
  entityRegistry: EntityRegistryEntry[],
  ignoreAlias = false
) => {
  try {
    return tryDescribeCondition(condition, hass, entityRegistry, ignoreAlias);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);

    let msg = "Error in describing condition";
    if (error.message) {
      msg += ": " + error.message;
    }
    return msg;
  }
};

const tryDescribeCondition = (
  condition: Condition,
  hass: HomeAssistant,
  entityRegistry: EntityRegistryEntry[],
  ignoreAlias = false
) => {
  if (condition.alias && !ignoreAlias) {
    return condition.alias;
  }

  if (!condition.condition) {
    const shorthands: Array<"and" | "or" | "not"> = ["and", "or", "not"];
    for (const key of shorthands) {
      if (!(key in condition)) {
        continue;
      }
      if (ensureArray(condition[key])) {
        condition = {
          condition: key,
          conditions: condition[key],
        };
      }
    }
  }

  if (condition.condition === "or") {
    const conditions = ensureArray(condition.conditions);

    if (!conditions || conditions.length === 0) {
      return "Test if any condition matches";
    }
    const count = conditions.length;
    return `Test if any of ${count} condition${count === 1 ? "" : "s"} matches`;
  }

  if (condition.condition === "and") {
    const conditions = ensureArray(condition.conditions);

    if (!conditions || conditions.length === 0) {
      return "Test if multiple conditions match";
    }
    const count = conditions.length;
    return `Test if ${count} condition${count === 1 ? "" : "s"} match${
      count === 1 ? "es" : ""
    }`;
  }

  if (condition.condition === "not") {
    const conditions = ensureArray(condition.conditions);

    if (!conditions || conditions.length === 0) {
      return "Test if no condition matches";
    }
    if (conditions.length === 1) {
      return "Test if 1 condition does not match";
    }
    return `Test if none of ${conditions.length} conditions match`;
  }

  // State Condition
  if (condition.condition === "state") {
    let base = "Confirm";
    if (!condition.entity_id) {
      return `${base} state`;
    }

    if (condition.attribute) {
      const stateObj = Array.isArray(condition.entity_id)
        ? hass.states[condition.entity_id[0]]
        : hass.states[condition.entity_id];
      base += ` ${computeAttributeNameDisplay(
        hass.localize,
        stateObj,
        hass.entities,
        condition.attribute
      )} of`;
    }

    if (Array.isArray(condition.entity_id)) {
      const entities: string[] = [];
      for (const entity of condition.entity_id.values()) {
        if (hass.states[entity]) {
          entities.push(computeStateName(hass.states[entity]) || entity);
        }
      }
      if (entities.length !== 0) {
        const entitiesString =
          condition.match === "any"
            ? formatListWithOrs(hass.locale, entities)
            : formatListWithAnds(hass.locale, entities);
        base += ` ${entitiesString} ${
          condition.entity_id.length > 1 ? "are" : "is"
        }`;
      } else {
        // no entity_id or empty array
        base += " an entity";
      }
    } else if (condition.entity_id) {
      base += ` ${
        hass.states[condition.entity_id]
          ? computeStateName(hass.states[condition.entity_id])
          : condition.entity_id
      } is`;
    }

    const states: string[] = [];
    const stateObj =
      hass.states[
        Array.isArray(condition.entity_id)
          ? condition.entity_id[0]
          : condition.entity_id
      ];
    if (Array.isArray(condition.state)) {
      for (const state of condition.state.values()) {
        states.push(
          condition.attribute
            ? computeAttributeValueDisplay(
                hass.localize,
                stateObj,
                hass.locale,
                hass.config,
                hass.entities,
                condition.attribute,
                state
              ).toString()
            : computeStateDisplay(
                hass.localize,
                stateObj,
                hass.locale,
                hass.config,
                hass.entities,
                state
              )
        );
      }
    } else if (condition.state !== "") {
      states.push(
        condition.attribute
          ? computeAttributeValueDisplay(
              hass.localize,
              stateObj,
              hass.locale,
              hass.config,
              hass.entities,
              condition.attribute,
              condition.state
            ).toString()
          : computeStateDisplay(
              hass.localize,
              stateObj,
              hass.locale,
              hass.config,
              hass.entities,
              condition.state.toString()
            )
      );
    }

    if (states.length === 0) {
      states.push("a state");
    }

    const statesString = formatListWithOrs(hass.locale, states);
    base += ` ${statesString}`;

    if (condition.for) {
      const duration = describeDuration(condition.for);
      if (duration) {
        base += ` for ${duration}`;
      }
    }

    return base;
  }

  // Numeric State Condition
  if (condition.condition === "numeric_state" && condition.entity_id) {
    let base = "Confirm";
    const stateObj = hass.states[condition.entity_id];
    const entity = stateObj ? computeStateName(stateObj) : condition.entity_id;

    if ("attribute" in condition) {
      base += ` ${condition.attribute} from`;
    }

    base += ` ${entity} is`;

    if ("above" in condition) {
      base += ` above ${condition.above}`;
    }

    if ("below" in condition && "above" in condition) {
      base += " and";
    }

    if ("below" in condition) {
      base += ` below ${condition.below}`;
    }

    return base;
  }

  // Time condition
  if (condition.condition === "time") {
    const weekdaysArray = ensureArray(condition.weekday);
    const validWeekdays =
      weekdaysArray && weekdaysArray.length > 0 && weekdaysArray.length < 7;
    if (condition.before || condition.after || validWeekdays) {
      const before =
        typeof condition.before !== "string"
          ? condition.before
          : condition.before.includes(".")
          ? `entity ${
              hass.states[condition.before]
                ? computeStateName(hass.states[condition.before])
                : condition.before
            }`
          : localizeTimeString(condition.before, hass.locale, hass.config);

      const after =
        typeof condition.after !== "string"
          ? condition.after
          : condition.after.includes(".")
          ? `entity ${
              hass.states[condition.after]
                ? computeStateName(hass.states[condition.after])
                : condition.after
            }`
          : localizeTimeString(condition.after, hass.locale, hass.config);

      let result = "Confirm the ";
      if (after || before) {
        result += "time is ";
      }
      if (after) {
        result += "after " + after;
      }
      if (before && after) {
        result += " and ";
      }
      if (before) {
        result += "before " + before;
      }
      if ((after || before) && validWeekdays) {
        result += " and the ";
      }
      if (validWeekdays) {
        const localizedDays = weekdaysArray.map((d) =>
          hass.localize(
            `ui.panel.config.automation.editor.conditions.type.time.weekdays.${d}`
          )
        );
        result += " day is " + formatListWithOrs(hass.locale, localizedDays);
      }

      return result;
    }
  }

  // Sun condition
  if (
    condition.condition === "sun" &&
    ("before" in condition || "after" in condition)
  ) {
    let base = "Confirm";

    if (!condition.after && !condition.before) {
      base += " sun";
      return base;
    }

    base += " sun";

    if (condition.after) {
      let duration = "";

      if (condition.after_offset) {
        if (typeof condition.after_offset === "number") {
          duration = ` offset by ${secondsToDuration(condition.after_offset)!}`;
        } else if (typeof condition.after_offset === "string") {
          duration = ` offset by ${condition.after_offset}`;
        } else {
          duration = ` offset by ${JSON.stringify(condition.after_offset)}`;
        }
      }

      base += ` after ${condition.after}${duration}`;
    }

    if (condition.before) {
      base += ` before ${condition.before}`;
    }

    return base;
  }

  // Zone condition
  if (condition.condition === "zone" && condition.entity_id && condition.zone) {
    const entities: string[] = [];
    const zones: string[] = [];

    const states = hass.states;

    if (Array.isArray(condition.entity_id)) {
      for (const entity of condition.entity_id.values()) {
        if (states[entity]) {
          entities.push(computeStateName(states[entity]) || entity);
        }
      }
    } else {
      entities.push(
        states[condition.entity_id]
          ? computeStateName(states[condition.entity_id])
          : condition.entity_id
      );
    }

    if (Array.isArray(condition.zone)) {
      for (const zone of condition.zone.values()) {
        if (states[zone]) {
          zones.push(computeStateName(states[zone]) || zone);
        }
      }
    } else {
      zones.push(
        states[condition.zone]
          ? computeStateName(states[condition.zone])
          : condition.zone
      );
    }

    const entitiesString = formatListWithOrs(hass.locale, entities);
    const zonesString = formatListWithOrs(hass.locale, zones);
    return `Confirm ${entitiesString} ${
      entities.length > 1 ? "are" : "is"
    } in ${zonesString} ${zones.length > 1 ? "zones" : "zone"}`;
  }

  if (condition.condition === "device") {
    if (!condition.device_id) {
      return "Device condition";
    }
    const config = condition as DeviceCondition;
    const localized = localizeDeviceAutomationCondition(
      hass,
      entityRegistry,
      config
    );
    if (localized) {
      return localized;
    }
    const stateObj = hass.states[config.entity_id as string];
    return `${stateObj ? computeStateName(stateObj) : config.entity_id} ${
      config.type
    }`;
  }

  if (condition.condition === "trigger") {
    if (!condition.id) {
      return "Trigger condition";
    }
    return `When triggered by ${condition.id}`;
  }

  return `${
    condition.condition ? condition.condition.replace(/_/g, " ") : "Unknown"
  } condition`;
};
