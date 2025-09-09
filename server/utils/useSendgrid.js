import sendgrid from '@sendgrid/mail'

/**
 * Send email via SendGrid (Dynamic Template only).
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Empfänger
 * @param {string} options.templateId - SendGrid Template ID
 * @param {Object} options.templateData - Daten fürs Template
 * @param {Array}  [options.attachments=[]] - Attachments im SendGrid-Format
 * @param {{name?:string,email:string}} [options.from] - Absender Override
 */
export default async function useSendgrid({
  to,
  templateId,
  dynamicTemplateData,
  attachments = [],
  from,
}) {

  const { SEND_GRID_API_KEY} = useRuntimeConfig()  

  // API-Key prüfen
  const apiKey = SEND_GRID_API_KEY;
  if (!apiKey) {
    throw new Error('SendGrid API key missing (SEND_GRID_API_KEY).')
  }
  sendgrid.setApiKey(apiKey)

  // Empfänger prüfen
  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new Error('`to` is required (string or string[]).')
  }

  // Template-Checks
  if (!templateId || !dynamicTemplateData) {
    throw new Error('`templateId` and `dynamicTemplateData` are required for template rendering.')
  }

  // Message
  const msg = {
    from: from || { name: 'i-Planner', email: 'noreply@i-planner.de' },
    to,
    templateId,
    dynamicTemplateData,
    ...(attachments?.length ? { attachments } : {}),
  }

  try {
    return await sendgrid.send(msg)
  } catch (error) {
    const detail = error?.response?.body || error.message || error
    console.error('SendGrid Error:', detail)
    throw error
  }
}