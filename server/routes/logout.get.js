export default defineEventHandler( async event => {

    const config = useRuntimeConfig(event);
    const { session } = event.context;

    let db;
    try {

        if (!session){
            console.warn('[logout] no session → redirect to /login')
            return sendRedirect(event, "/login", 302);
        }
           
        
        /* db = await useDatabase();

        // delete all sessions in users_session
        const { rows : [deletedSession]} = await db.query(
            `DELETE FROM users_session WHERE cid = $1 AND kid = $2 RETURNING *`,
            [ session.cid, session.kid]
        );
        logSuccess(`Logout : id ${deletedSession?.id} ... killed in users_session `)

        // close Websocket connection for user
        const { close } = websocket( session.guid );
        close();
        logSuccess(`Logout : websocket for ${session.guid} closed... `);

        // clear session cookie
        await clearUserSession(event);
        logSuccess(`Logout : cookie ${config.session.name} cleared...`)
        
        return sendRedirect(event, "/login/notice?reason=logged-out", 302) */

    } catch (error) {

        console.error(error);

        return sendRedirect(event, "/login", 302);
    }
  


})