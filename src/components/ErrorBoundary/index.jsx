import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="d-flex flex-column align-items-center justify-content-center p-5">
            <h4 className="text-danger">Đã xảy ra lỗi hiển thị</h4>
            <p className="text-muted">Vui lòng tải lại trang hoặc liên hệ quản trị viên.</p>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Thử lại
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
