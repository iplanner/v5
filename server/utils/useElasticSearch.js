import { Client } from '@elastic/elasticsearch'

let client
export function useElastic() {
  if (!client) {
    const { ELASTIC_URL } = useRuntimeConfig()
    client = new Client({ node: ELASTIC_URL })
  }
  return client
}