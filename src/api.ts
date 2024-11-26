import { error } from "./utils/utils.js";

export interface JsonValue {
    [key: string]: any;
}

function apiBaseUrl() {
    if (typeof location === "undefined") return "http://localhost:3333/api/";
    return location.href.includes("localhost") || location.href.includes("192.168.1") ? `http://${location.hostname}:3333/api/` : "/api/";
}

export async function apiGet<T>(endpoint: string) {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return (await result.json()) as T;
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export async function apiGetText(endpoint: string): Promise<string | Error> {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return await result.text();
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export async function apiGetBlob(endpoint: string): Promise<Blob | Error> {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return await result.blob();
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export async function apiGetArrayBuffer(endpoint: string): Promise<ArrayBuffer | Error> {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return await result.arrayBuffer();
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
 }

export async function apiPost<T>(
    endpoint: string,
    params: URLSearchParams | FormData | JsonValue | Blob | ArrayBuffer,
    contentType?: string
) {
    let headers: HeadersInit = {};
    let body: string | FormData | Blob | ArrayBuffer;

    if (params instanceof URLSearchParams) {
        headers = { "Content-Type": "application/x-www-form-urlencoded" };
        body = params.toString();
    } else if (params instanceof FormData) {
        body = params;
    } else if (params instanceof Blob || params instanceof ArrayBuffer) {
        // Handle binary data
        if (contentType) {
            headers = { "Content-Type": contentType };
        } else if (params instanceof Blob) {
            headers = { "Content-Type": params.type || "application/octet-stream" };
        } else {
            headers = { "Content-Type": "application/octet-stream" };
        }
        body = params;
    } else {
        // Handle JSON data
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify(params);
    }

    try {
        const result = await fetch(apiBaseUrl() + endpoint, {
            method: "POST",
            headers: headers,
            body: body,
        });
        if (!result.ok) throw new Error();
        return (await result.json()) as T;
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export class Api {
    static async hello() {
        return apiGet<{ message: string }>("hello");
    }
}
