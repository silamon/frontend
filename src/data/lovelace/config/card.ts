import { LovelaceLayoutOptions } from "../../../panels/lovelace/types";

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  layout_options?: LovelaceLayoutOptions;
  type: string;
  [key: string]: any;
}
