import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';

import './editor';

import { BoilerplateCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

import { parseReply } from './bincalendar-parser';

/* eslint no-console: 0 */
console.info(
  `%c  BOILERPLATE-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// TODO Name your custom element
@customElement('bincalendar-card')
export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: BoilerplateCardConfig;
  @property() private data: Promise<{ reply: object }>;
  @property() public date: string;
  @property() public bin_counts: object;

  constructor() {
    super();

    // init
    this.date = '';
    this.bin_counts = [];

    // empty promise initialization
    this.data = new Promise<{ reply: object }>(function(resolve) {
      resolve({
        reply: {},
      });
    });
  }

  public setConfig(config: BoilerplateCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || config.show_error) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      name: 'Boilerplate',
      ...config,
    };

    // check errors in url
    let customUrl = config.url;
    customUrl = customUrl.replace('/:+$/', '');
    customUrl = customUrl.replace('//+$/', '');
    console.log(customUrl);

    // create promise for request
    this.data = new Promise<{ reply: object }>(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', customUrl, true);
      xhr.onload = () => {
        if (xhr.status == 200) {
          // console.log(xhr.responseText);
          const reply: object = JSON.parse(xhr.responseText);
          resolve({
            reply: reply,
          });
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.send(null);
    });

    this.data
      .then(({ reply }) => {
        // custom function to get date and bins
        const parsed_reply: object = parseReply(reply, config.bins);
        const temp: string[] = new Date(String(parsed_reply[0])).toString().split(' ');

        this.date = temp[0] + ' ' + temp[2] + ' ' + temp[1];
        this.bin_counts = parsed_reply[1];
      })
      .catch(({ status, statusText }) => {
        console.log('Something went wrong: ' + status + ' ' + statusText);
      });
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.show_warning')}</div>
        </ha-card>
      `;
    }

    const bins = [] as TemplateResult[];
    for (let i = 0; i < Object.keys(this.bin_counts).length; i++)
      bins.push(
        html`
          <img src=${this._config.images[i]} style="display:${
          this.bin_counts[this._config.bins[i]] == 0 ? 'none' : 'inline'
        };">
          </img>
        `,
      );

      // TODO: if you want to implement an action when pressing on the card
      // @action=${this._handleAction}
      // .actionHandler=${actionHandler({
      //   hasHold: hasAction(this._config.hold_action),
      //   hasDoubleTap: hasAction(this._config.double_tap_action),
      //   repeat: this._config.hold_action ? this._config.hold_action.repeat : undefined,
      // })}
      // TODO: add entity
      // aria-label=${`Boilerplate: ${this._config.entity}`}

    return html`
      <ha-card
        .header=${this._config.name}
        tabindex="0"
      >
        In <br /><b id="city">${this._config.city}</b><br />
        the next emptying<br />
        will be on<br />
        <b id="date">${this.date}</b><br /><br />
        <bins>${bins}</bins>
      </ha-card>
    `;
  }

  // private _handleAction(ev: ActionHandlerEvent): void {
  //   if (this.hass && this._config && ev.detail.action) {
  //     handleAction(this, this.hass, this._config, ev.detail.action);
  //   }
  // }

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      ha-card {
        text-align: left;
      }
      bins img {
        width: 45px;
      }
    `;
  }
}
