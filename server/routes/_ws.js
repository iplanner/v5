import { clients } from "../utils/useSocketServer";

export default defineWebSocketHandler({
  async upgrade(request) {
    try {
      await requireUserSession(request);
    } catch (error) {
      throw new Error("Unauthorized WebSocket connection");
    }
  },

  async open(peer) {
    let guid;
    try {
      const { user = {} } = await requireUserSession(peer);
      guid = user?.guid;

      if (!guid) {
        peer.send(
          JSON.stringify({ 
            type: "error",
            user: "server", 
            message: "No GUID provided" 
          })
        );
        peer.close();
        return;
      }

      // Client zur Gruppe hinzufügen
      if (!clients[guid]) {
        clients[guid] = new Set();
      }
      clients[guid].add(peer);

      // Peer mit GUID für spätere Verwendung markieren
      peer.guid = guid;

      // Channel abonnieren
      peer.subscribe(guid);

      // Join-Nachricht an alle Clients in der Gruppe
      peer.publish(
        guid,
        JSON.stringify({ 
          type: "join",
          user: "server", 
          message: `User joined the channel`,
          timestamp: new Date().toISOString()
        })
      );

      console.log(`WebSocket opened for GUID: ${guid}`);
    } catch (error) {
      console.error("WebSocket Open Error:", error);
      peer.send(
        JSON.stringify({
          type: "error",
          user: "server",
          message: "Error initializing session",
        })
      );
      peer.close();
    }
  },

  async message(peer, message) {
    try {
      const msg = message.text();

      // Ping-Pong für Connection Health Check
      if (msg === "ping") {
        peer.send(JSON.stringify({ 
          type: "pong",
          user: "server", 
          message: "pong",
          timestamp: new Date().toISOString()
        }));
        return;
      }

      // GUID aus dem Peer verwenden (wurde beim Open gesetzt)
      const guid = peer.guid;

      if (!guid) {
        peer.send(
          JSON.stringify({
            type: "error",
            user: "server",
            message: "Session not initialized"
          })
        );
        return;
      }

      // Nachricht parsen falls JSON
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(msg);
      } catch {
        parsedMessage = { message: msg };
      }

      // Nachricht an alle Clients in der Gruppe weiterleiten
      peer.publish(
        guid,
        JSON.stringify({ 
          type: "message",
          user: "client", 
          message: parsedMessage.message || msg,
          timestamp: new Date().toISOString(),
          from: guid
        })
      );

    } catch (error) {
      console.error("WebSocket Message Error:", error);
      peer.send(
        JSON.stringify({
          type: "error",
          user: "server",
          message: "Error processing message"
        })
      );
    }
  },

  async close(peer) {
    try {
      const guid = peer.guid;

      if (!guid || !clients[guid]) {
        return;
      }

      // Client aus der Gruppe entfernen
      clients[guid].delete(peer);

      // Leave-Nachricht an verbleibende Clients
      if (clients[guid].size > 0) {
        peer.publish(
          guid,
          JSON.stringify({ 
            type: "leave",
            user: "server", 
            message: `User left the channel`,
            timestamp: new Date().toISOString()
          })
        );
      }

      // Gruppe löschen wenn leer
      if (clients[guid].size === 0) {
        delete clients[guid];
      }

      console.log(`WebSocket closed for GUID: ${guid}`);
    } catch (error) {
      console.error("WebSocket Close Error:", error);
    }
  },
});