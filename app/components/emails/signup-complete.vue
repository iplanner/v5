<script setup>

const props = defineProps({
    primaryColor : {type : String, default : '#1c72e8'},
    title : {type : String, default : ''},
    text : { type : String, default : ''},
    company : String,
    subdomain : String,
    username : String,
    loginUrl : String,
    indexLink : {type : String, default : 'https://www.i-planner.de'},
    dataProtectionUrl : { type : String, default : 'https://www.i-planner.de/datenschutz'},
    imprintUrl :{ type : String, default : 'https://www.i-planner.de/imprint' }
})

/** new styles */

</script>

<template>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ title }}</title>
</head>
<body>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
        <td>
            <table height="64" width="580" align="center" border="0" cellpadding="0" cellspacing="0">
                <tbody>
                <tr>
                    <td>
                        <table width="560" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                            <tbody>
                            <tr>
                                <td align="center" width="150" height="37" style="padding-right:8px">
                                    <a :href="indexLink" target="_blank" style="text-decoration: none;"><svg width="37" height="37" viewBox="0 0 45 45">
                                        <rect width="45" height="45" rx="9.38" ry="9.38" :fill="primaryColor"></rect>
                                        <path d="M24.51,11H16.92a0.93,0.93,0,0,0-.92.93v4.18a0.93,0.93,0,0,0,.92.93h1.45a0.93,0.93,0,0,0,.92-0.93V14.25H24.5c2.91,0,4,2.22,4,5s-1.06,5-4,5H16.92a0.93,0.93,0,0,0-.92.93v9a0.93,0.93,0,0,0,.92.93h1.45a0.93,0.93,0,0,0,.92-0.93V27.49H24.5c4.86,0,7.49-3.73,7.49-8.24S29.35,11,24.51,11Z" fill="#fff"></path>
                                        <path d="M16.84,22h1.32A0.84,0.84,0,0,0,19,21.16h0V19.84A0.84,0.84,0,0,0,18.16,19H16.84a0.84,0.84,0,0,0-.84.84h0v1.34A0.84,0.84,0,0,0,16.84,22Z" fill="#fff"></path>
                                    </svg></a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
    </tbody>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
    <tbody>
    <tr>
        <td>
            <table width="580" align="center" border="0" cellpadding="0" cellspacing="0">
                <tbody>
                <tr>
                    <td align="center">
                        <table width="560" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #d8d8d8; border-radius:8px; overflow:hidden">
                            <tbody>
                            <tr>
                                <td style="background:#f2f2f2; padding:40px 50px 40px 50px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                        <tbody>
                                        <tr>
                                            <td align="center" style="font-family:helvetica neue,helvetica,sans-serif;font-size:20px;line-height:24px;font-weight:bold;color:#333; padding-bottom:16px;"> {{ title }}</td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:15px;color:#666666;line-height:24px;padding-top:0px" v-html="text"></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family: helvetica neue,helvetica,sans-serif;font-size:15px;color:#333;line-height:24px; font-weight:bold; padding-top:16px;">Firma: <span style="color:#666666; font-weight:normal;">{{company}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:15px;color:#333;line-height:24px;font-weight:bold;">Subdomain: <span style="color:#666666; font-weight:normal;">{{subdomain}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:15px;color:#333;line-height:24px;font-weight:bold;">Benutzername: <span style="color:#666666; font-weight:normal;">{{username}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:15px;color:#333;line-height:24px;font-weight:bold;">Loginadresse: <span style="color:#666666; font-weight:normal;">{{loginUrl}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:14px;color:#666666;line-height:24px;"></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div style="min-height:24px">&nbsp;</div>
                        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <tbody>
                            <tr>
                                <td>
                                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                        <tbody>
                                        <tr>
                                            <td align="center" style="font-family:helvetica neue,helvetica,sans-serif;font-size:11px;color:#999999;line-height:18px;padding:0 50px 0 50px">
                                                Diese E-Mail wurde an <a style="color:#979797;text-decoration:underline;font-weight:bold">{{username}}</a>
                                                gesendet, weil sich jemand mit dieser E-Mail einen Testzugang bei i-Planner angelegt hat.
                                                <br>
                                                &copy; i-Planner GmbH &bull; Alle Rechte vorbehalten &bull;
                                                <a :href="dataProtectionUrl" style="color:#979797;text-decoration:underline;font-weight:bold" target="_blank">Datenschutz</a> &bull;
                                                <a :href="imprintUrl" style="color:#979797;text-decoration:underline;font-weight:bold" target="_blank">Impressum</a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="30"></td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
    </tbody>
</table>
</body>
</html>
</template>