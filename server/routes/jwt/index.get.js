export default defineEventHandler( async event => {

    const config = useRuntimeConfig(event);

  
    const token = jwt.sign(
    payload,
    config.IP_JWT_SECRET,
    {
        algorithm: "HS256",
    }

   
); 
return token

})