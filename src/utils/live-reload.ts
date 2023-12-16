export function setupLiveReload() {
    if (!location.host.includes("localhost")) return;
    var socket = new WebSocket("ws://localhost:3333");
    socket.onmessage = (ev) => {
        location.reload();
    };
}
