export default function Modal({ title, onClose, children, sheet = false }) {
  return (
    <div className={`fixed inset-0 z-50 flex justify-center ${sheet ? 'sheet-wrap' : 'items-center p-4'}`}>
      <button className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
      <div className={`card relative w-full max-w-md ${sheet ? 'sheet-card' : 'rounded-xl p-6'}`}>
        <div className="mb-5 flex items-start justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted transition hover:text-ink">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
