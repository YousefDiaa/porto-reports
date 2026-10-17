import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : "https://placeholder-project.supabase.co";

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export type Database = {
  public: {
    Tables: {
      specializations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          title: string;
          content: object;
          content_html: string;
          specialization_id: string | null;
          report_date: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: object;
          content_html: string;
          specialization_id?: string | null;
          report_date: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: object;
          content_html?: string;
          specialization_id?: string | null;
          report_date?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Specialization = Database["public"]["Tables"]["specializations"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"] & {
  specializations?: Specialization;
};
