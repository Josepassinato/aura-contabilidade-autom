
import React from "react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarMenu
} from "@/components/ui/sidebar";
import { HeaderSection } from "./sidebar/HeaderSection";
import { CommonSection } from "./sidebar/CommonSection";
import { AccountantSection } from "./sidebar/AccountantSection";
import { FooterSection } from "./sidebar/FooterSection";
import { useSidebarPermissions } from "./sidebar/useSidebarPermissions";

interface DashboardSidebarProps {
  isVoiceActive?: boolean;
  toggleVoiceAssistant?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = () => {
  // Get permissions, with a fallback for when auth context is not available
  const { isAccountantOrAdmin } = useSidebarPermissions();

  return (
    <Sidebar>
      <HeaderSection />

      <SidebarContent className="p-2 flex-1 overflow-auto">
        <SidebarMenu>
          <CommonSection />
          
          {/* Only show accountant section when permissions are available and valid */}
          {isAccountantOrAdmin && (
            <AccountantSection />
          )}
        </SidebarMenu>
      </SidebarContent>

      <FooterSection />
    </Sidebar>
  );
};

export default DashboardSidebar;
