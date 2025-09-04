<script setup>

const props = defineProps({
    primaryColor : {
        type : String,
        default : '#1c72e8'
    },
    title : {
        type : String,
        default : 'Anmeldung bei i-Planner mit einem neuen Gerät!',
    },
    preview : {
        type : String,
        default : '',
    },
    indexLink : {
        type : String,
        default : 'https://www.i-planner.de',
    },
    text : {
        type : String,
        default : 'Du hast dich am 30. Oktober 2023 um 07:09 von einem neuen Gerät aus bei Deinem i-Planner-Konto angemeldet:',
    },
    ipAdress : {
        type : String,
        default : 'ipAdress',
    },
    provider : {
        type : String,
        default : 'provider',
    },
    vendor :{
        type : String,
        default : 'vendor',
    },
    type :{
        type : String,
        default : 'type',
    },
    osName :{
        type : String,
        default : 'osName',
    },
    osVersion :{
        type : String,
        default : 'osVersion',
    },
    browser : {
        type : String,
        default : 'browser',
    },
    authorizeUrl : { type : String, default : '' },
    dataProtectionUrl : { type : String, default : 'https://www.i-planner.de/datenschutz'},
    imprintUrl :{ type : String, default : 'https://www.i-planner.de/imprint' },
    username :{ type : String, default : ''},
    subdomain :{ type : String, default : 'subdomain'}
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
                        <table width="560" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                            <tr>
                                <td style="padding:16px 50px 0px 50px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                        <tbody>
                                        <tr>
                                            <td align="center" style="font-family:helvetica neue,helvetica,sans-serif;font-size:26px;font-weight:bold;color:#222222; padding-bottom:16px;">{{ title }}</td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:16px;color:#64748b;line-height:24px;padding-top:0px">{{text}}</td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family: helvetica neue,helvetica,sans-serif;font-size:16px;color:#333;line-height:24px; font-weight:bold; padding-top:16px;">Provider: <span style="color:#64748b; font-weight:normal;">{{provider}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:16px;color:#333;line-height:24px;font-weight:bold;">IP-Adresse: <span style="color:#64748b; font-weight:normal;">{{ipAdress}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:16px;color:#333;line-height:24px;font-weight:bold;">Anbieter: <span style="color:#64748b; font-weight:normal;">{{vendor}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:16px;color:#333;line-height:24px;font-weight:bold;">System: <span style="color:#64748b; font-weight:normal;">{{osName}} {{osVersion}}  - {{type}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left"  style="font-family:helvetica neue,helvetica,sans-serif;font-size:16px;color:#333;line-height:24px;font-weight:bold;padding-bottom:8px;">Browser: <span style="color:#64748b; font-weight:normal;">{{browser}}</span></td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:16px;color:#64748b;line-height:24px;padding-top:16px">Wenn du die Anmeldung selbst durchgeführt hast, kannst du das neue Gerät jetzt zu deiner Geräteliste hinzufügen und den Zugriff durch Klicken auf den unten stehenden Button autorisieren. Du wirst damit automatisch in dein Konto weitergeleitet.</td>
                                        </tr>
                                        <tr>
                                          <td align="center" cellpadding="10" style="padding: 20px 10px 20px 10px;">
                                              <table cellspacing="0" cellpadding="0" border="0" style="font-family:helvetica neue,helvetica,sans-serif;">
                                                  <tbody>
                                                    <tr>
                                                        <td style="padding:12px 16px;border-radius: 8px;" :style="{ backgroundColor : primaryColor}">
                                                            <a style="font-size:13px;color:white;text-align:center;text-decoration:none" :href="authorizeUrl" target="_blank">Zugriff autorisieren</a>
                                                        </td>
                                                    </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-family:helvetica neue,helvetica,sans-serif;font-size:14px;color:#64748b;line-height:24px;">Falls die Anmeldung nicht von dir stammt, musst du nichts weiter unternehmen, da kein Zugriff stattgefunden hat. Wir empfehlen jedoch, dein Passwort zu ändern und den Administrator zu benachrichtigen, da möglicherweise ein Unbefugter versucht hat, auf dein Konto zuzugreifen.</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div style="min-height:30px">&nbsp;</div>
                        <table width="560" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <tbody>
                            <tr>
                                <td></td>
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
                                            <td align="center" style="font-family:helvetica neue,helvetica,sans-serif;font-size:11px;color:#64748b;line-height:18px;padding:0 50px 0 50px">
                                                Diese E-Mail wurde an <a style="color:#64748b;text-decoration:underline;font-weight:bold">{{username}}</a>
                                                gesendet, weil sich jemand mit diesem Account bei <span style="white-space: nowarp; color:#64748b; font-weight:bold">{{subdomain}}</span>
                                                angemeldet hat. Wenn Du die Anmeldung durchgeführt hast, kannst Du diese Nachricht einfach ignorieren.
                                                <br>
                                                &copy; i-Planner GmbH &bull; Alle Rechte vorbehalten &bull;
                                                <a :href="dataProtectionUrl" style="color:#64748b;text-decoration:underline;font-weight:bold" target="_blank">Datenschutz</a> &bull;
                                                <a :href="imprintUrl" style="color:#64748b;text-decoration:underline;font-weight:bold" target="_blank">Impressum</a>
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