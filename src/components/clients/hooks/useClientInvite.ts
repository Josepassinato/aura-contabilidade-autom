
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

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
    console.log('=== Starting invitation generation process ===');
    console.log('User profile:', userProfile);
    console.log('Client email:', clientEmail);
    
    if (!userProfile) {
      console.error('No user profile available');
      toast({
        title: "Erro",
        description: "Perfil do usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Checking for existing invitation for email:', clientEmail);
      
      // Verificar se já existe um convite pendente para este cliente
      const { data: existingInvite, error: checkError } = await supabase
        .from('user_invitations')
        .select('token')
        .eq('email', clientEmail)
        .eq('status', 'pending')
        .maybeSingle();

      console.log('Existing invite check result:', { data: existingInvite, error: checkError });

      let token;
      if (existingInvite && !checkError) {
        token = existingInvite.token;
        console.log('Using existing invitation token:', token);
        toast({
          title: "Convite existente",
          description: "Já existe um convite pendente para este cliente. Link atualizado.",
        });
      } else {
        console.log('Creating new invitation');
        // Gerar novo token
        token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expira em 30 dias

        console.log('Generated token:', token);
        console.log('Expires at:', expiresAt);
        
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
          console.log('Using valid UUID for invited_by:', userProfile.id);
        } else {
          console.log('Skipping invited_by due to invalid UUID format:', userProfile.id);
        }
        
        console.log('Creating invitation with data:', invitationData);

        // Criar convite para o cliente
        const { data: insertData, error } = await supabase
          .from('user_invitations')
          .insert(invitationData)
          .select();

        if (error) {
          console.error('Error creating invitation:', error);
          throw error;
        }

        console.log('Invitation created successfully:', insertData);
        toast({
          title: "Convite gerado!",
          description: `Convite foi criado com sucesso`,
        });
      }

      // Gerar link do convite
      const link = `${window.location.origin}/invite-signup?token=${token}`;
      console.log('Generated invite link:', link);
      setInviteLink(link);

      return link;
    } catch (error: any) {
      console.error('=== Erro ao gerar convite ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
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
