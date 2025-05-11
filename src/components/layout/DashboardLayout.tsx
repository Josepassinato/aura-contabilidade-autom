
import React, { ReactNode, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { VoiceAssistant } from '@/components/dashboard/VoiceAssistant';
import TourController from '@/components/dashboard/TourController';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <div className="sidebar-nav">
          <DashboardSidebar />
        </div>
        
        <main className="flex-1 overflow-auto dashboard-main">
          <DashboardHeader 
            isVoiceActive={isVoiceActive} 
            toggleVoiceAssistant={toggleVoiceAssistant} 
          />
          
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {isVoiceActive && (
          <VoiceAssistant isActive={isVoiceActive} onToggle={toggleVoiceAssistant} />
        )}
        
        <TourController />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
