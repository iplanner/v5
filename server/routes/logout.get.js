import { useSocketServer } from "../utils/useSocketServer";

export default defineEventHandler( async event => {

    const config = useRuntimeConfig(event);
    const { session } = event.context;

    try {

        if (!session){
            console.warn('[logout] no session → redirect to /login');
            await clearUserSession(event);
            return sendRedirect(event, "/login", 302);
        }
           
        const db = usePostgres();

        const res = await db`
            DELETE FROM users_session
            WHERE id = ${session.id}
            RETURNING id, guid
        `
        const killed = Array.isArray(res) ? res.length : 0
        console.log(`[logout] deleted ${killed} row(s) from users_session`)

        // close Websocket connection for user
        const { close } = useSocketServer( session.guid );
        close();
        console.log(`[logout] : websocket for ${session.guid} closed... `);

        // clear session cookie
        await clearUserSession(event);
        console.log(`Logout : cookie ${config.session.name} cleared...`)
        
        return sendRedirect( event, "/login/notice?reason=logged-out", 302)

    } catch (error) {

        console.error(error);
        return sendRedirect(event, "/login", 302);
    }
  


})