import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  render() {
    if (!this.state.err) return this.props.children
    return (
      <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#0F1941' }}>
        <p style={{ fontWeight: 800 }}>Tarteeb hit an error.</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(this.state.err?.message || this.state.err)}</pre>
        <button
          type="button"
          style={{
            marginTop: 16,
            padding: '10px 16px',
            border: 0,
            borderRadius: 12,
            background: '#118BE3',
            color: '#fff',
            fontWeight: 700
          }}
          onClick={() => this.setState({ err: null })}
        >
          Try again
        </button>
      </div>
    )
  }
}
