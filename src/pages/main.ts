import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "../app.js";

@customElement("main-page")
export class MainPage extends BaseElement {
    render() {
        return html`<div>Hello world</div>`;
    }
}
