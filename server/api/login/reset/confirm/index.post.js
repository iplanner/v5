
import dayjs from 'dayjs';

export default defineEventHandler( async (event) => {

    const config = useRuntimeConfig(event);
    const headers = getRequestHeaders(event);
    const { token } = getQuery(event);

    const url = getRequestURL(event);

    const { password, password2, cid, kid, subdomain } = await readBody(event);
    

    try {

      const db = await useDatabase();

      // 1. Check if passwort is Equal
      if (!isEqual(password, password2)) throw new Error("PASSWORD_NOT_EQUAL");

      // 2. Check if user exist by hidden fields from token ... cid + kid

      const user = await UserModel.get( cid, kid);  
      if (!user) {
        throw new Error("USER_NOT_FOUND_BY_TOKEN");
      }

      // 3. check if new password is equal to the old one
      const isValid = await verifyPassword( user.password, password);
      if (isValid) throw new Error(`PASSWORDS_EQUAL`);

      // 4. update new password
      const hash = await hashPassword(password);
      const update = await db.query(
        `
            UPDATE users
            SET 
                password = $1, 
                updated_at = NOW()
            WHERE cid = $2 AND kid = $3
            RETURNING *;
        `,
        [ hash, cid, kid]
      );


      // 5. send confirmation mail
/*       const title = "Passwort zurückgesetzt!";
      const template = await useCompiler("login-passwort-reset-confirm.vue", {
        props: {
          title,
          text: `Du hast am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format("HH.mm")} Uhr erfolgreich ein neues Passwort festgelegt. Diese E-Mail dient als Bestätigung der erfolgreichen Passwortänderung.`,
          username: user.username,
          subdomain: `${subdomain}.i-planner.cloud`,
        },
      });
      sendMail(user.username, title, template.html); */

      return { path: `${url.origin}/login?reason=password-reset&username=${encodeURIComponent(user.username).replace("%40", "@")}`};

    } catch (error) {

      logError(error);
      
      const response = getLoginErrorHandler(error.message, error.cause);

      throw createError({
        statusCode: 400,
        message: response.title,
        data: response,
      });
      
    } 

})