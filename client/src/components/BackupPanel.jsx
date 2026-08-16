import { useState } from 'react'
import { exportBackup, restoreBackup } from '../lib/api.js'
import {
  downloadDriveBackup, getGoogleEmail, googleClientId, listDriveBackups,
  requestDriveToken, revokeGoogle, saveGoogleClientId, savedGoogleEmail, uploadBackupToDrive
} from '../lib/drive.js'

export default function BackupPanel({ onRestored }) {
  const [status, setStatus] = useState('')
  const [files, setFiles] = useState([])
  const [token, setToken] = useState('')
  const [email, setEmail] = useState(savedGoogleEmail)
  const [clientId, setClientId] = useState(googleClientId)
  const [clientIdDraft, setClientIdDraft] = useState(googleClientId)

  async function withGoogle(selectAccount = false) {
    const access = await requestDriveToken(selectAccount || !token)
    setToken(access)
    const user = await getGoogleEmail(access)
    setEmail(user.email)
    const listed = await listDriveBackups(access)
    setFiles(listed)
    return { access, email: user.email }
  }

  async function downloadFile() {
    setStatus('Preparing backup…')
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tarteeb-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    localStorage.setItem('tarteeb-last-backup', new Date().toISOString())
    setStatus('Backup downloaded to this device')
  }

  async function restoreFromObject(payload) {
    if (!window.confirm('Restore will replace current transactions, goals, budgets, and profile. Continue?')) {
      return
    }
    setStatus('Restoring…')
    await restoreBackup(payload)
    localStorage.setItem('tarteeb-last-backup', payload.exported_at || new Date().toISOString())
    setStatus('Data restored')
    onRestored?.()
  }

  function restoreFromFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const payload = JSON.parse(String(reader.result))
        await restoreFromObject(payload)
      } catch {
        setStatus('That file is not a valid Tarteeb backup')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  async function connectGmail() {
    setStatus('Choose your Gmail account…')
    const { email: signedIn } = await withGoogle(true)
    setStatus(`Connected as ${signedIn || 'your Gmail'}`)
  }

  async function disconnectGmail() {
    await revokeGoogle(token)
    setToken('')
    setEmail('')
    setFiles([])
    setStatus('Gmail disconnected. Sign in again when you need backup.')
  }

  async function backupToDrive() {
    setStatus('Saving to your Google Drive…')
    const session = token ? { access: token, email } : await withGoogle(false)
    const backup = await exportBackup()
    backup.google_email = session.email || email || savedGoogleEmail()
    await uploadBackupToDrive(session.access, backup)
    const listed = await listDriveBackups(session.access)
    setFiles(listed)
    localStorage.setItem('tarteeb-last-backup', new Date().toISOString())
    setStatus(`Saved to ${email || 'your'} Drive folder “Tarteeb Backups”`)
  }

  async function restoreDriveFile(fileId) {
    setStatus('Restoring from your Google Drive…')
    const session = token ? { access: token, email } : await withGoogle(false)
    const payload = await downloadDriveBackup(session.access, fileId)
    if (payload.google_email && email && payload.google_email !== email) {
      const ok = window.confirm(`This backup belongs to ${payload.google_email}. Restore it into this app anyway?`)
      if (!ok) {
        setStatus('Restore cancelled')
        return
      }
    }
    await restoreFromObject(payload)
  }

  const last = localStorage.getItem('tarteeb-last-backup')

  return (
    <section className="card rounded-2xl p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-ink">Backup</h3>
      {last && (
        <p className="mt-2 text-xs text-muted">Last backup: {new Date(last).toLocaleString()}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => downloadFile().catch(() => setStatus('Download failed'))} className="rounded-full bg-app px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line">
          Download
        </button>
        <label className="cursor-pointer rounded-full bg-app px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line">
          Restore
          <input type="file" accept="application/json,.json" className="hidden" onChange={restoreFromFile} />
        </label>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-semibold text-ink">Drive</p>
        {email ? (
          <p className="mt-2 text-sm text-ink">{email}</p>
        ) : (
          <p className="mt-2 text-sm text-muted">Gmail</p>
        )}

        {!clientId ? (
          <p className="mt-2 text-sm text-muted">Soon</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => connectGmail().catch((err) => setStatus(err.message))} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">
              {email ? 'Switch Gmail' : 'Sign in with Gmail'}
            </button>
            {email && (
              <>
                <button type="button" onClick={() => backupToDrive().catch((err) => setStatus(err.message))} className="rounded-full bg-app px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line">
                  Save to my Drive
                </button>
                <button type="button" onClick={() => disconnectGmail().catch((err) => setStatus(err.message))} className="rounded-full px-4 py-2 text-sm font-semibold text-muted">
                  Sign out
                </button>
              </>
            )}
          </div>
        )}

        {email && files.length === 0 && (
          <p className="mt-4 text-sm text-muted">No Tarteeb backups in this Gmail yet. Click Save to my Drive.</p>
        )}
        {files.length > 0 && (
          <ul className="mt-4 divide-y divide-line rounded-xl ring-1 ring-line">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{file.name}</span>
                  {file.modifiedTime && (
                    <span className="text-xs text-muted">{new Date(file.modifiedTime).toLocaleString()}</span>
                  )}
                </span>
                <button type="button" className="shrink-0 font-semibold text-brand" onClick={() => restoreDriveFile(file.id).catch((err) => setStatus(err.message))}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {status && <p className="mt-4 text-sm text-muted">{status}</p>}
    </section>
  )
}
