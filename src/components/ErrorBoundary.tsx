
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.name || 'component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-12 bg-surface-dim border border-white/10 rounded-3xl m-8">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">View Rendering Error</h2>
              <p className="text-sm text-on-surface-variant opacity-60">Something went wrong while rendering this section ({this.props.name}).</p>
            </div>
            {(this.state.error?.message.includes('ASSERTION FAILED') || 
              this.state.error?.message.includes('Quota limit exceeded') || 
              this.state.error?.message.includes('resource_exhausted') ||
              this.state.error?.message.includes('ca9') ||
              this.state.error?.message.includes('b815')) && (
              <div className="px-4 py-3 bg-accent-gold/10 border border-accent-gold/20 rounded-xl mb-4">
                <p className="text-[10px] font-black text-accent-gold uppercase tracking-widest text-center">
                  ⚠️ Database Quota Limit Reached (Firestore)
                </p>
                <p className="text-[9px] text-on-surface-variant mt-1 text-center font-bold">
                  The application is in degraded mode because the free-tier infrastructure quota has been exceeded. 
                </p>
              </div>
            )}
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
               <p className="text-[10px] font-mono text-rose-400/80 break-words line-clamp-3">
                 {this.state.error?.message}
               </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
