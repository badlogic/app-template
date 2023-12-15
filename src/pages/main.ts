import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Api } from "../api.js";
import { renderError } from "../app.js";
import { i18n } from "../utils/i18n.js";

@customElement("main-page")
export class MainPage extends LitElement {
    @property()
    isLoading = true;

    @property()
    message?: string;

    @property()
    error?: string;

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        this.load();
    }

    async load() {
        try {
            const result = await Api.hello();
            if (result instanceof Error) throw result;
        } catch (e) {
            this.error = i18n("Couldn't load mesage");
            return;
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        if (this.isLoading) return html`<loading-spinner></loading-spinner>`;
        if (this.error) return renderError(this.error);
        if (!this.message) return renderError(i18n("Couldn't load mesage"));
        return html`<h1>${this.message}</h1>`;
    }
}
