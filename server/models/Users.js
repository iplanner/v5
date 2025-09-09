export const UserModel = {
  /**
   * Holt einen User inkl. Firmendaten via cid + kid.
   * Gibt {} zurück, wenn nichts gefunden oder Fehler.
   */
  async get(cid = 0, kid = 0) {
    try {
      
      const db = usePostgres()
      const rows = await db`
        SELECT
          u.*,
          c.company,
          c.subdomain,
          c.base_dir,
          c.status
        FROM users u
        INNER JOIN companies c ON u.cid = c.cid
        WHERE u.cid = ${cid}
          AND u.kid = ${kid}
        ORDER BY u.id DESC
        LIMIT 1
      `
      return rows[0] ?? {}
    } catch (err) {
      console.error('[UserModel.get] error:', err)
      return {}
    }
  },

  /**
   * Holt einen User via username.
   * Gibt null zurück, wenn nichts gefunden oder Fehler.
   */
  async getByUsername(username = '') {
    try {
      const db = usePostgres()
      const rows = await db`
        SELECT u.*, c.subdomain
        FROM users u
        INNER JOIN companies c ON u.cid = c.cid
        WHERE u.username = ${username}
          AND c.subdomain = ${subdomain}
        ORDER BY u.id DESC
        LIMIT 1
      `
      return rows[0] ?? null
    } catch (err) {
      console.error('[UserModel.getByUsername] error:', err)
      return null
    }
  },
}