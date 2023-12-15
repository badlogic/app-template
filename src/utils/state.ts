import { assertNever, formatDate } from "./utils.js";

export interface Events {
    object: string;
    theme: string;
}

export type EventAction = "updated" | "deleted";

export class State {
    static DEBUG = false;
    private static objects: { [K in keyof Events]?: Map<string, Events[K]> } = {};
    private static generalListeners: { [K in keyof Events]?: ((action: EventAction, payload: Events[K]) => void)[] } = {};
    private static idSpecificListeners: { [K in keyof Events]?: Map<string, ((action: EventAction, payload: Events[K]) => void)[]> } = {};

    static subscribe<K extends keyof Events>(event: K, listener: (action: EventAction, payload: Events[K]) => void, id?: string): () => void {
        if (id) {
            this.idSpecificListeners[event] = this.idSpecificListeners[event] || new Map();
            const listeners = this.idSpecificListeners[event]!.get(id) || [];
            listeners.push(listener);
            this.idSpecificListeners[event]!.set(id, listeners);
        } else {
            this.generalListeners[event] = this.generalListeners[event] || [];
            this.generalListeners[event]!.push(listener);
        }

        return () => {
            if (id) {
                const listeners = this.idSpecificListeners[event]?.get(id);
                if (listeners) {
                    this.idSpecificListeners[event]!.set(
                        id,
                        listeners.filter((l) => l !== listener)
                    );
                }
            } else {
                this.generalListeners[event] = this.generalListeners[event]?.filter((l) => l !== listener) || ([] as any);
            }
        };
    }

    static notify<K extends keyof Events>(event: K, action: EventAction, payload: Events[K]) {
        let id: string | undefined;
        let payloadDate: Date | undefined;
        let storedDate: Date | undefined;
        switch (event) {
            case "object": {
                id = "id";
                payloadDate = new Date();
                storedDate = undefined;
                break;
            }
            case "theme":
                break;
            default:
                assertNever(event);
        }

        // Don't notify if we have a newer version of the object
        if (storedDate && payloadDate) {
            if (storedDate.getTime() > payloadDate.getTime()) {
                return;
            }
        }

        this.storeObject(event, payload); // We always store, even in case of a delete
        this.generalListeners[event]?.forEach((listener) => listener(action, payload));

        if (State.DEBUG) console.log(`${formatDate(new Date())} - notify - ${event} ${action} ${id}`, payload);

        if (id) {
            this.idSpecificListeners[event]?.get(id)?.forEach((listener) => listener(action, payload));
        }
    }

    static notifyBatch<K extends keyof Events>(event: K, action: EventAction, payloads: Events[K][]) {
        for (const payload of payloads) {
            this.notify(event, action, payload);
        }
    }

    static storeObject<K extends keyof Events>(event: K, payload: Events[K]) {
        let id: string | undefined;

        switch (event) {
            case "object":
                id = "id";
                break;
            case "theme":
                break;
            default:
                assertNever(event);
        }

        if (id) {
            if (!this.objects[event]) {
                this.objects[event] = new Map();
            }
            this.objects[event]!.set(id, payload);
        }
    }

    static getObject<K extends keyof Events>(event: K, id: string): Events[K] | undefined {
        return this.objects[event]?.get(id);
    }

    static deleteObject<K extends keyof Events>(event: K, id: string) {
        this.objects[event]?.delete(id);
    }
}
