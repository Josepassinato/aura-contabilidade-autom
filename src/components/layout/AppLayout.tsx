import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-background">
            <EnhancedErrorBoundary
              showDetails={true}
              onError={(error, errorInfo) => {
                console.error('Page error:', error, errorInfo);
              }}
            >
              <div className="container max-w-7xl mx-auto p-6">
                {children}
              </div>
            </EnhancedErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}