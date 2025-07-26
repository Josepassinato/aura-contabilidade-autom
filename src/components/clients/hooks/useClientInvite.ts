
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function useClientInvite() {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const generateClientInvite = async (clientEmail: string) => {
    logger.info('=== Starting invitation generation process ===', undefined, "useClientInvite");
    logger.info('User profile:', userProfile, "useClientInvite");
    logger.info('Client email:', clientEmail, "useClientInvite");
    
    if (!userProfile) {
      logger.error('No user profile available', undefined, "useClientInvite");
      toast({
        title: "Erro",
        description: "Perfil do usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      logger.info('Checking for existing invitation for email:', clientEmail, "useClientInvite");
      
      // Verificar se já existe um convite pendente para este cliente
      const { data: existingInvite, error: checkError } = await supabase
        .from('user_invitations')
        .select('token')
        .eq('email', clientEmail)
        .eq('status', 'pending')
        .maybeSingle();

      logger.info('Existing invite check result:', { data: existingInvite, error: checkError }, "useClientInvite");

      let token;
      if (existingInvite && !checkError) {
        token = existingInvite.token;
        logger.info('Using existing invitation token:', token, "useClientInvite");
        toast({
          title: "Convite existente",
          description: "Já existe um convite pendente para este cliente. Link atualizado.",
        });
      } else {
        logger.info('Creating new invitation', undefined, "useClientInvite");
        // Gerar novo token
        token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expira em 30 dias

        logger.info('Generated token:', token, "useClientInvite");
        logger.info('Expires at:', expiresAt, "useClientInvite");
        
        // Prepare invitation data - handle potentially invalid UUID
        const invitationData: any = {
          email: clientEmail,
          role: 'client',
          token,
          expires_at: expiresAt.toISOString(),
          invited_by_name: userProfile.full_name,
        };

        // Only include invited_by if we have a valid UUID
        if (userProfile.id && isValidUUID(userProfile.id)) {
          invitationData.invited_by = userProfile.id;
          logger.info('Using valid UUID for invited_by:', userProfile.id, "useClientInvite");
        } else {
          logger.info('Skipping invited_by due to invalid UUID format:', userProfile.id, "useClientInvite");
        }
        
        logger.info('Creating invitation with data:', invitationData, "useClientInvite");

        // Criar convite para o cliente
        const { data: insertData, error } = await supabase
          .from('user_invitations')
          .insert(invitationData)
          .select();

        if (error) {
          logger.error('Error creating invitation:', error, "useClientInvite");
          throw error;
        }

        logger.info('Invitation created successfully:', insertData, "useClientInvite");
        toast({
          title: "Convite gerado!",
          description: `Convite foi criado com sucesso`,
        });
      }

      // Gerar link do convite
      const link = `${window.location.origin}/invite-signup?token=${token}`;
      logger.info('Generated invite link:', link, "useClientInvite");
      setInviteLink(link);

      return link;
    } catch (error: any) {
      logger.error('=== Erro ao gerar convite ===', undefined, "useClientInvite");
      logger.error('Error details:', error, "useClientInvite");
      logger.error('Error message:', error.message, "useClientInvite");
      logger.error('Error code:', error.code, "useClientInvite");
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o convite",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetInvite = () => {
    setInviteLink(null);
  };

  return {
    isGenerating,
    inviteLink,
    generateClientInvite,
    resetInvite,
  };
}
