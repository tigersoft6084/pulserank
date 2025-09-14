"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Filter out Intercom-related errors to prevent unnecessary error states
    if (
      error.message.includes("Intercom") ||
      error.message.includes("location")
    ) {
      console.warn("Intercom error caught and handled:", error.message);
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log Intercom errors but don't treat them as critical
    if (
      error.message.includes("Intercom") ||
      error.message.includes("location")
    ) {
      console.warn("Intercom error during language switch:", error.message);
      return;
    }

    console.error("Critical error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center">
            <p>Something went wrong. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
