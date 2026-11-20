import React from 'react';
import type { Language } from '../types/game';

interface ErrorBoundaryProps {
  lang: Language;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Unexpected error' };
  }

  render() {
    if (this.state.hasError) {
      const isAr = this.props.lang === 'ar';
      return (
        <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-6 space-y-4 text-center">
            <h1 className="font-display text-xl font-bold">
              {isAr ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
            </h1>
            <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-10 px-5 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold tactile-btn cursor-pointer"
            >
              {isAr ? 'إعادة تحميل الصفحة' : 'Reload Application'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
