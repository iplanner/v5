
export default defineEventHandler(async (event) => {
  try {


    const es = useElastic();
    const index = 'crm_customers'

    /* const exists = await es.indices.exists({ index })
    if (exists.body) {
      await es.indices.delete({ index })
    }

    await es.indices.create({
      index,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              name_autocomplete: {
                type: 'custom',
                tokenizer: 'edge_ngram_tokenizer',
                filter: ['lowercase', 'asciifolding']
              }
            },
            tokenizer: {
              edge_ngram_tokenizer: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20,
                token_chars: ['letter','digit']
              }
            },
            normalizer: {
              lc_keyword: {
                type: 'custom',
                filter: ['lowercase', 'asciifolding']
              }
            }
          }
        },
        mappings: {
          properties: {
            // Such-relevante Felder
            full_name:      { type: 'text', analyzer: 'name_autocomplete', fields: { kw: { type: 'keyword', normalizer: 'lc_keyword' } } },
            first_name:     { type: 'text', analyzer: 'name_autocomplete', fields: { kw: { type: 'keyword', normalizer: 'lc_keyword' } } },
            last_name:      { type: 'text', analyzer: 'name_autocomplete', fields: { kw: { type: 'keyword', normalizer: 'lc_keyword' } } },

            // Weitere CRM-Felder
            email:          { type: 'keyword', normalizer: 'lc_keyword' },
            phone:          { type: 'keyword' },
            company:        { type: 'text', analyzer: 'standard', fields: { kw: { type: 'keyword', normalizer: 'lc_keyword' } } },
            city:           { type: 'text', analyzer: 'standard', fields: { kw: { type: 'keyword', normalizer: 'lc_keyword' } } },
            country:        { type: 'keyword', normalizer: 'lc_keyword' },
            tags:           { type: 'keyword' },

            // Metadaten
            created_at:     { type: 'date' },
            updated_at:     { type: 'date' }
          }
        }
      }
    })

    return { ok: true, index } */

    
    const db = usePostgres();
    const { send } = useSocketServer('d8b0622f-15c0-4c09-be65-c024d4fae680');

    send({
          action: "SESSION_LOGOUT",
          payload: {
            show: true,
            title: "Sitzung beendet!",
            body: "Du hast dich auf einem anderen Gerät angemeldet. Aus Sicherheitsgründen wurde deine Sitzung auf diesem Gerät beendet.",
            error: true,
            closeOnOutsideClick: false,
            buttons: [{ value: "/login", display: "Zurück zum Login" }],
          },
        });

    const start = Date.now()
    const rows = await db`select * from organizations`
    const durationSec = (Date.now() - start) / 1000 // Dauer in Sekunden

    return {
      duration: durationSec, // Dauer in Sekunden im JSON
      rows
    }
  } catch (err) {
    console.error('[organisations] query failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'DB query failed' })
  }
})
