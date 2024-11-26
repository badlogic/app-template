import { LitElement, TemplateResult, render } from "lit";

export function dom(template: TemplateResult, container?: HTMLElement | DocumentFragment): HTMLElement[] {
    if (container) {
        render(template, container);
        return [];
    }

    const div = document.createElement(`div`);
    render(template, div);
    const children: Element[] = [];
    for (let i = 0; i < div.children.length; i++) {
        children.push(div.children[i]);
    }
    return children as HTMLElement[];
}

export function onVisibleOnce(target: Element, callback: () => void, rootMargin = "200px", threshold = 0.01) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback();
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            rootMargin,
            threshold,
        }
    );
    observer.observe(target);
}

export function onVisibilityChange(target: Element, onVisible: () => void, onInvisible: () => void) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    onVisible();
                } else {
                    onInvisible();
                }
            });
        },
        {
            root: null,
            rootMargin: "200px",
            threshold: 0.01,
        }
    );
    observer.observe(target);
    return observer;
}

export function waitForNavigation(): Promise<void> {
    return new Promise((resolve) => {
        window.addEventListener("popstate", function onPopState() {
            window.removeEventListener("popstate", onPopState);
            resolve();
        });
    });
}

export function getScrollParent(parent: HTMLElement | Node | null) {
    while (parent) {
        if (parent instanceof HTMLElement && parent.classList.contains("overflow-auto")) return parent as HTMLElement;
        if (parent == document.documentElement) return parent as HTMLElement;
        parent = parent.parentNode;
    }
    return undefined;
}

export class BaseElement extends LitElement {
    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }
}

export class SubscribedElement extends BaseElement {
    readonly subscriptions: (() => void)[] = [];

    disconnectedCallback(): void {
        super.disconnectedCallback();
        for (const subscription of this.subscriptions) {
            subscription();
        }
    }
}