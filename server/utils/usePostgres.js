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
      POSTGRES_PORT,
      PGBOUNCER_HOST,
      PGBOUNCER_PORT
    } = useRuntimeConfig()

    const isProd = import.meta.prod;

    const host = isProd
      ? (PGBOUNCER_HOST || POSTGRES_HOST)
      : POSTGRES_HOST || 'localhost'

    const port = isProd
      ? Number(PGBOUNCER_PORT || 6432)
      : Number(POSTGRES_PORT || 5432)


    // SSL nur extern erforderlich (z. B. lokal zu Render-DB)
    const ssl = isProd ? undefined : 'require'

    const defaults = {
      host,
      port,
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