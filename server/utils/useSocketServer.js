
export const clients = {};

export function useSocketServer(guid) {

  if (!clients[guid]) {
    clients[guid] = new Set();
  }
  
  return {
    close: () => {
      if (clients[guid]) {
        clients[guid].forEach((peer) => peer.close && peer.close());
        delete clients[guid];
      }
    },
    send: (message) => {
      if (clients[guid]) {
        clients[guid].forEach((peer) => {
          if (peer.websocket.readyState) {
            message.client = guid;
            peer.send(JSON.stringify({ user: "server", message }));
          }
        });
      }
    }
  };
}