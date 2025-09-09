
export const UsersSession = {
  /**
   * Delete existing sessions of a user.
   * @param {Object} user - User object containing cid and kid.
   * @returns {Promise<boolean>} - True if sessions were deleted, otherwise false.
   */
  async delete(kid = 0) {
    try {
      const db = usePostgres()

      const result = await db`
        DELETE FROM users_session 
        WHERE kid = ${kid} 
        RETURNING id
      `

      return result.length > 0
    } catch (error) {
      console.error("SessionModel.delete error:", error)
      throw error
    }
  },

  /**
   * Insert a new session into the database.
   * @param {Object} data - Session data.
   * @returns {Promise<Object|null>} - Inserted session row, or null if insert failed.
   */
  async insert(data) {
    try {
      const db = usePostgres()

      const [row] = await db`
        INSERT INTO users_session (
          kid, guid, osvendor, osmodel, os, osversion,
          device, browser, browserversion, ip, ipcity, ipregion,
          ipcountry, iploc, ipprovider, ippostal, iptimezone
        ) VALUES (
          ${data.kid}, ${data.guid}, ${data.osvendor}, ${data.osmodel}, ${data.os},
          ${data.osversion}, ${data.device}, ${data.browser}, ${data.browserversion}, ${data.ip},
          ${data.ipcity}, ${data.ipregion}, ${data.ipcountry}, ${data.iploc}, ${data.ipprovider},
          ${data.ippostal}, ${data.iptimezone}
        )
        RETURNING *
      `

      return row || null
    } catch (error) {
      console.error("SessionModel.insert error:", error)
      throw error
    }
  }
}