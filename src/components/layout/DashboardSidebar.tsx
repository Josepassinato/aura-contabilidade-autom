
import React from "react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarMenu
} from "@/components/ui/sidebar";
import { HeaderSection } from "./sidebar/HeaderSection";
import { CommonSection } from "./sidebar/CommonSection";
import { AccountantSection } from "./sidebar/AccountantSection";
import { AdminSection } from "./sidebar/AdminSection";
import { FooterSection } from "./sidebar/FooterSection";
import { useSidebarPermissions } from "./sidebar/useSidebarPermissions";

interface DashboardSidebarProps {
  isVoiceActive?: boolean;
  toggleVoiceAssistant?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isVoiceActive,
  toggleVoiceAssistant
}) => {
  // Get permissions, with a fallback for when auth context is not available
  const { isAdmin, isAccountant } = useSidebarPermissions();

  return (
    <Sidebar data-tour="dashboard-sidebar">
      <HeaderSection />

      <SidebarContent className="p-2 flex-1 overflow-auto">
        <SidebarMenu>
          {isAdmin ? (
            // Show admin-specific section for admin users
            <AdminSection />
          ) : (
            // Show common sections for non-admin users
            <>
              <CommonSection />
              
              {/* Show accountant section for users with accountant permissions */}
              {isAccountant && (
                <AccountantSection />
              )}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <FooterSection />
    </Sidebar>
  );
};

export default DashboardSidebar;
