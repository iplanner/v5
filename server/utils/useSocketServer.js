export const clients = {};

export function useSocketServer(guid) {
  if (!guid) {
    console.warn("useSocketServer: No GUID provided");
    return {
      close: () => {},
      send: () => {},
      broadcast: () => {},
      getClientCount: () => 0
    };
  }

  // Sicherstellen dass die Gruppe existiert
  if (!clients[guid]) {
    clients[guid] = new Set();
  }

  return {
    /**
     * Schließt alle Verbindungen für diese GUID
     */
    close: () => {
      if (clients[guid]) {
        clients[guid].forEach((peer) => {
          try {
            if (peer.websocket?.readyState === 1) { // OPEN state
              peer.close();
            }
          } catch (error) {
            console.error("Error closing peer:", error);
          }
        });
        delete clients[guid];
        console.log(`All connections closed for GUID: ${guid}`);
      }
    },

    /**
     * Sendet eine Nachricht an alle Clients einer GUID
     */
    send: (message, messageType = "broadcast") => {
      if (!clients[guid] || clients[guid].size === 0) {
        console.warn(`No active connections for GUID: ${guid}`);
        return false;
      }

      const messageData = {
        type: messageType,
        user: "server",
        message: typeof message === "string" ? message : message,
        timestamp: new Date().toISOString(),
        client: guid
      };

      let successCount = 0;
      const deadConnections = new Set();

      clients[guid].forEach((peer) => {
        try {
          // Prüfe WebSocket State
          if (peer.websocket?.readyState === 1) { // OPEN
            peer.send(JSON.stringify(messageData));
            successCount++;
          } else {
            // Markiere tote Verbindungen zum Entfernen
            deadConnections.add(peer);
          }
        } catch (error) {
          console.error("Error sending to peer:", error);
          deadConnections.add(peer);
        }
      });

      // Tote Verbindungen entfernen
      deadConnections.forEach(peer => {
        clients[guid].delete(peer);
      });

      // Gruppe löschen wenn alle Verbindungen tot sind
      if (clients[guid].size === 0) {
        delete clients[guid];
      }

      console.log(`Message sent to ${successCount}/${clients[guid]?.size || 0} clients for GUID: ${guid}`);
      return successCount > 0;
    },

    /**
     * Broadcast an alle verbundenen Clients (alle GUIDs)
     */
    broadcast: (message, messageType = "broadcast") => {
      const allGuids = Object.keys(clients);
      let totalSent = 0;

      allGuids.forEach(currentGuid => {
        const server = useSocketServer(currentGuid);
        if (server.send(message, messageType)) {
          totalSent++;
        }
      });

      console.log(`Broadcast sent to ${totalSent} groups`);
      return totalSent;
    },

    /**
     * Gibt die Anzahl aktiver Verbindungen für diese GUID zurück
     */
    getClientCount: () => {
      return clients[guid]?.size || 0;
    },

    /**
     * Prüft ob eine GUID aktive Verbindungen hat
     */
    hasActiveConnections: () => {
      return clients[guid] && clients[guid].size > 0;
    },

    /**
     * Gibt alle aktiven GUIDs zurück
     */
    getActiveGuids: () => {
      return Object.keys(clients).filter(guid => clients[guid].size > 0);
    }
  };
}

/**
 * Globale Statistiken
 */
export function getSocketStats() {
  const stats = {
    totalGroups: Object.keys(clients).length,
    totalConnections: 0,
    groups: {}
  };

  Object.entries(clients).forEach(([guid, connections]) => {
    stats.totalConnections += connections.size;
    stats.groups[guid] = connections.size;
  });

  return stats;
}

/**
 * Cleanup-Funktion für tote Verbindungen
 */
export function cleanupDeadConnections() {
  Object.entries(clients).forEach(([guid, connections]) => {
    const deadConnections = new Set();
    
    connections.forEach(peer => {
      if (peer.websocket?.readyState !== 1) { // Nicht OPEN
        deadConnections.add(peer);
      }
    });

    deadConnections.forEach(peer => {
      connections.delete(peer);
    });

    if (connections.size === 0) {
      delete clients[guid];
    }
  });
}

// Optional: Automatische Cleanup alle 5 Minuten
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupDeadConnections, 5 * 60 * 1000);
}