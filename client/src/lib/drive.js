const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email'
const SCOPE = `${DRIVE_SCOPE} ${EMAIL_SCOPE}`
const FILE_PREFIX = 'tarteeb-backup'
const FOLDER_NAME = 'Tarteeb Backups'
const EMAIL_KEY = 'tarteeb-google-email'

const CLIENT_ID_KEY = 'tarteeb-google-client-id'

export function googleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem(CLIENT_ID_KEY) || ''
}

export function saveGoogleClientId(id) {
  const value = String(id || '').trim()
  if (value) localStorage.setItem(CLIENT_ID_KEY, value)
  else localStorage.removeItem(CLIENT_ID_KEY)
  return value
}

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google)
      return
    }
    const existing = document.querySelector('script[data-gis]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google))
      existing.addEventListener('error', () => reject(new Error('Could not load Google login')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.dataset.gis = 'true'
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Could not load Google login'))
    document.head.appendChild(script)
  })
}

export function requestDriveToken(selectAccount = true) {
  const clientId = googleClientId()
  if (!clientId) {
    return Promise.reject(new Error('Google Drive is not configured for this app yet'))
  }
  return loadGis().then((google) => new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (response) => {
        if (response.error) reject(new Error(response.error))
        else resolve(response.access_token)
      }
    })
    client.requestAccessToken({ prompt: selectAccount ? 'select_account' : '' })
  }))
}

export async function getGoogleEmail(token) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('Could not read Gmail account')
  const data = await response.json()
  const email = data.email || ''
  if (email) localStorage.setItem(EMAIL_KEY, email)
  return { email, name: data.name || '' }
}

export function savedGoogleEmail() {
  return localStorage.getItem(EMAIL_KEY) || ''
}

export async function revokeGoogle(token) {
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {})
  }
  localStorage.removeItem(EMAIL_KEY)
}

async function driveJson(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  })
  if (!response.ok) throw new Error('Google Drive request failed')
  if (response.status === 204) return null
  return response.json()
}

export async function getBackupFolderId(token) {
  const query = encodeURIComponent(
    `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  )
  const listed = await driveJson(
    token,
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`
  )
  if (listed.files?.[0]?.id) return listed.files[0].id
  const created = await driveJson(token, 'https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })
  return created.id
}

export async function uploadBackupToDrive(token, backup) {
  const folderId = await getBackupFolderId(token)
  const name = `${FILE_PREFIX}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
  const metadata = JSON.stringify({
    name,
    mimeType: 'application/json',
    parents: [folderId]
  })
  const media = JSON.stringify(backup)
  const boundary = 'tarteeb_backup_boundary'
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${media}\r\n` +
    `--${boundary}--`
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  })
  if (!response.ok) throw new Error('Google Drive upload failed')
  return response.json()
}

export async function listDriveBackups(token) {
  const folderId = await getBackupFolderId(token)
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const data = await driveJson(
    token,
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)`
  )
  return data.files || []
}

export async function downloadDriveBackup(token, fileId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!response.ok) throw new Error('Could not download backup')
  return response.json()
}
