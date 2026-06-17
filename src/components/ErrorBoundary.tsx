import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    // Erreurs DOM Framer Motion → récupération silencieuse
    if (error.message?.includes('removeChild') || error.message?.includes('insertBefore') || error.message?.includes('not a child')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error.message?.includes('removeChild') || error.message?.includes('insertBefore') || error.message?.includes('not a child')) {
      console.warn('[LYA] Animation DOM error suppressed:', error.message);
      this.setState({ hasError: false, error: null });
      return;
    }
    console.error(`[LYA] Error in ${this.props.name}:`, error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[400px] flex items-center justify-center p-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Erreur de rendu</h2>
              <p className="text-sm text-on-surface-variant opacity-60">Une erreur s'est produite ({this.props.name}).</p>
            </div>
            <button onClick={this.handleRetry} className="px-8 py-3 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
