// TODO Add your configuration elements here for type-checking
import { ActionConfig } from 'custom-card-helpers';

export interface BoilerplateCardConfig {
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  type: string;
  city: string;
  url: string;
  bins: object;
  images: object;
}
