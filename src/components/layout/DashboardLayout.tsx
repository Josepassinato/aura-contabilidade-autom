
import React, { ReactNode, useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { VoiceAssistant } from '@/components/dashboard/VoiceAssistant';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        isVoiceActive={isVoiceActive}
        toggleVoiceAssistant={toggleVoiceAssistant}
      />
      
      <main className="flex-1 overflow-auto">
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
    </div>
  );
}

export default DashboardLayout;
