import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@vueuse/core'

export function useSocketClient() {
  const message = ref({})
  const connectionState = ref('disconnected')
  const lastError = ref(null)

  const { status, data, send, open, close } = useWebSocket('/_ws', {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.error('WebSocket auto-reconnect failed after 3 attempts')
        connectionState.value = 'failed'
      }
    },
    heartbeat: { 
      message: "ping", 
      interval: 30000, // alle 30 Sekunden Ping
      pongTimeout: 5000 
    },
    immediate: false,
    onConnected() {
      console.log('WebSocket connected successfully')
      connectionState.value = 'connected'
      lastError.value = null
    },
    onDisconnected() {
      console.log('WebSocket disconnected')
      connectionState.value = 'disconnected'
    },
    onError(event) {
      console.error('WebSocket error:', event)
      lastError.value = event
      connectionState.value = 'error'
    }
  })

  const isConnected = computed(() => status.value === 'OPEN')
  const isConnecting = computed(() => status.value === 'CONNECTING')
  const isDisconnected = computed(() => status.value === 'CLOSED')

  // Status-Überwachung
  watch(status, (newStatus) => {
    console.log("WEBSOCKET STATUS CHANGED:", newStatus)
    switch(newStatus) {
      case 'CONNECTING': connectionState.value = 'connecting'; break
      case 'OPEN': connectionState.value = 'connected'; break
      case 'CLOSING': connectionState.value = 'disconnecting'; break
      case 'CLOSED': connectionState.value = 'disconnected'; break
    }
  }, { immediate: true })

  // Nachrichten-Handler
  watchEffect(async () => {
    if (!data.value) return
    try {
      const text = data.value instanceof Blob ? await data.value.text() : data.value
      const parsedData = JSON.parse(text)
      const { type, user, message: msg } = parsedData || {}

      if (type === 'pong') {
        console.log('Heartbeat pong received')
        return
      }

      if (type === 'error') {
        console.error("Server Error:", msg)
        lastError.value = msg
        return
      }

      // letzte Nachricht speichern
      message.value = {
        ...parsedData,
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        clientTimestamp: new Date().toISOString()
      }
      console.log("Message received:", message.value)

    } catch (error) {
      console.error("Error parsing WebSocket data:", error, data.value)
      lastError.value = "Failed to parse message"
    }
  })

  // Nachrichten senden
  function sendMessage(payload) {
    if (!isConnected.value) {
      console.warn('Cannot send message: WebSocket not connected')
      return false
    }
    try {
      send(typeof payload === 'string' ? payload : JSON.stringify(payload))
      return true
    } catch (error) {
      console.error('Error sending message:', error)
      lastError.value = 'Failed to send message'
      return false
    }
  }

  // Reconnect
  function reconnect() {
    if (isConnected.value) return console.warn('Already connected')
    console.log('Attempting to reconnect...')
    connectionState.value = 'connecting'
    close()
    setTimeout(open, 1000)
  }

  // Lifecycle
  onMounted(() => {
    console.log('WebSocket client mounted, attempting connection...')
    open()
  })

  onUnmounted(() => {
    console.log('WebSocket client unmounted, closing connection...')
    close()
  })

  return {
    message,
    connectionState,
    lastError,
    isConnected,
    isConnecting,
    isDisconnected,
    send: sendMessage,
    reconnect,
    close,
    status
  }
}