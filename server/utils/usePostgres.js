import postgres from 'postgres'

let sql = null

export default function usePostgres(options = {}) {
  
  const { reset, ...overrides } = options
  if (!sql || reset) {
    const {
      POSTGRES_HOST,
      POSTGRES_USERNAME,
      POSTGRES_PASSWORD,
      POSTGRES_DATABASE,
      PGBOUNCER_HOST,
    } = useRuntimeConfig()

    const isProd = import.meta.prod;

    const host = isProd ? PGBOUNCER_HOST : POSTGRES_HOST;

    if (!host) {

      console.log({
      POSTGRES_HOST,
      POSTGRES_USERNAME,
      POSTGRES_PASSWORD,
      POSTGRES_DATABASE,
      PGBOUNCER_HOST,
    });

      throw new Error(
        `DB host missing. In prod set PGBOUNCER_HOST, in dev set POSTGRES_HOST (got prod=${isProd}).`
      )
    }

    // SSL nur extern erforderlich (z. B. lokal zu Render-DB)
    const ssl = isProd ? undefined : 'require'

    const defaults = {
      host,
      port : 5432,
      database: POSTGRES_DATABASE,
      username: POSTGRES_USERNAME,
      password: POSTGRES_PASSWORD,
      max: 5,
      prepare : isProd ? false : true,
      transform: { undefined: null },
      ...(ssl ? { ssl } : {})
    }

    sql = postgres({ ...defaults, ...overrides })
  }
  return sql
}