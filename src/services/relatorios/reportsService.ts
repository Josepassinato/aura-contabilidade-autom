
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface GenerateReportParams {
  title: string;
  description?: string;
  report_type: string;
  client_id?: string;
  file_format?: 'pdf' | 'excel' | 'csv';
  content?: string | Blob;
  tags?: string[];
}

export const reportsService = {
  async generateReport({
    title,
    description,
    report_type,
    client_id,
    file_format = 'pdf',
    content,
    tags
  }: GenerateReportParams) {
    try {
      let file_path: string | null = null;
      let file_size: number | null = null;
      let file_url: string | null = null;

      // If we have content, upload it to storage
      if (content) {
        const fileName = `${report_type.toLowerCase()}-${uuidv4()}.${file_format.toLowerCase()}`;
        const filePath = `reports/${client_id || 'general'}/${fileName}`;
        
        // Upload the file to Supabase Storage
        const { data: fileData, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(filePath, content);
          
        if (uploadError) throw uploadError;
        
        if (fileData) {
          file_path = fileData.path;
          
          if (content instanceof Blob) {
            file_size = content.size;
          }
          
          // Create a public URL if needed
          const { data: urlData } = await supabase.storage
            .from('reports')
            .getPublicUrl(filePath);
            
          if (urlData) {
            file_url = urlData.publicUrl;
          }
        }
      }
      
      // Insert the report record in the database
      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          title,
          description,
          report_type,
          client_id,
          file_format,
          file_path,
          file_url,
          file_size,
          tags,
          created_by: (await supabase.auth.getUser()).data.user?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error generating report:", error);
      return { data: null, error };
    }
  },
  
  async getReports(client_id?: string) {
    try {
      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (client_id) {
        query = query.eq('client_id', client_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { data: null, error };
    }
  },
  
  async getReportById(id: string) {
    try {
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching report:", error);
      return { data: null, error };
    }
  },
  
  async deleteReport(id: string) {
    try {
      // First get the report to check if there's an associated file to delete
      const { data: reportData } = await supabase
        .from('generated_reports')
        .select('file_path')
        .eq('id', id)
        .single();
        
      // If there's a file associated with the report, delete it from storage
      if (reportData?.file_path) {
        await supabase.storage
          .from('reports')
          .remove([reportData.file_path]);
      }
      
      // Delete the report record
      const { error } = await supabase
        .from('generated_reports')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting report:", error);
      return { success: false, error };
    }
  }
};
