export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      department_contact: {
        Row: {
          cc_emails: string
          department: Database["public"]["Enums"]["department"]
          hotel: Database["public"]["Enums"]["hotel_scope"]
          id: string
          is_active: boolean
          notify_email: string
          phone: string
          public: boolean
          slack_webhook: string
          whatsapp_number: string
        }
        Insert: {
          cc_emails?: string
          department: Database["public"]["Enums"]["department"]
          hotel: Database["public"]["Enums"]["hotel_scope"]
          id?: string
          is_active?: boolean
          notify_email: string
          phone?: string
          public?: boolean
          slack_webhook?: string
          whatsapp_number?: string
        }
        Update: {
          cc_emails?: string
          department?: Database["public"]["Enums"]["department"]
          hotel?: Database["public"]["Enums"]["hotel_scope"]
          id?: string
          is_active?: boolean
          notify_email?: string
          phone?: string
          public?: boolean
          slack_webhook?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      faq_item: {
        Row: {
          answer: string
          id: string
          order: number
          question: string
          section_id: string
        }
        Insert: {
          answer: string
          id?: string
          order?: number
          question: string
          section_id: string
        }
        Update: {
          answer?: string
          id?: string
          order?: number
          question?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_item_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "faq_section"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_section: {
        Row: {
          id: string
          order: number
          title: string
        }
        Insert: {
          id?: string
          order?: number
          title: string
        }
        Update: {
          id?: string
          order?: number
          title?: string
        }
        Relationships: []
      }
      gallery_image: {
        Row: {
          alt: string
          category: Database["public"]["Enums"]["gallery_category"]
          hotel_id: string | null
          id: string
          image: string
          order: number
        }
        Insert: {
          alt?: string
          category?: Database["public"]["Enums"]["gallery_category"]
          hotel_id?: string | null
          id?: string
          image: string
          order?: number
        }
        Update: {
          alt?: string
          category?: Database["public"]["Enums"]["gallery_category"]
          hotel_id?: string | null
          id?: string
          image?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_image_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel: {
        Row: {
          about_image: string | null
          address: string
          banner_image: string | null
          created_at: string
          email: string
          established: string
          fax: string
          google_count: number | null
          google_rating: number | null
          hero_image: string | null
          id: string
          intro_body: string
          intro_heading: string
          location: string
          location_tag: string
          logo: string | null
          name: string
          order: number
          phone: string
          phone_alt: string
          rooms_count: number
          short_name: string
          slug: Database["public"]["Enums"]["hotel_slug"]
          synxis_id: string
          tagline: string
          tripadvisor_count: number | null
          tripadvisor_rating: number | null
          tripadvisor_url: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          about_image?: string | null
          address?: string
          banner_image?: string | null
          created_at?: string
          email?: string
          established?: string
          fax?: string
          google_count?: number | null
          google_rating?: number | null
          hero_image?: string | null
          id?: string
          intro_body?: string
          intro_heading?: string
          location?: string
          location_tag?: string
          logo?: string | null
          name: string
          order?: number
          phone?: string
          phone_alt?: string
          rooms_count?: number
          short_name?: string
          slug: Database["public"]["Enums"]["hotel_slug"]
          synxis_id?: string
          tagline?: string
          tripadvisor_count?: number | null
          tripadvisor_rating?: number | null
          tripadvisor_url?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          about_image?: string | null
          address?: string
          banner_image?: string | null
          created_at?: string
          email?: string
          established?: string
          fax?: string
          google_count?: number | null
          google_rating?: number | null
          hero_image?: string | null
          id?: string
          intro_body?: string
          intro_heading?: string
          location?: string
          location_tag?: string
          logo?: string | null
          name?: string
          order?: number
          phone?: string
          phone_alt?: string
          rooms_count?: number
          short_name?: string
          slug?: Database["public"]["Enums"]["hotel_slug"]
          synxis_id?: string
          tagline?: string
          tripadvisor_count?: number | null
          tripadvisor_rating?: number | null
          tripadvisor_url?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      lead: {
        Row: {
          covers: number | null
          created_at: string
          email: string
          event_type: string
          hotel_interest: Database["public"]["Enums"]["hotel_interest"]
          id: string
          interest: Database["public"]["Enums"]["lead_interest"]
          message: string
          name: string
          page: string
          phone: string
          preferred_date: string | null
          preferred_time: string
          restaurant: string
          routed_to: string
          status: Database["public"]["Enums"]["lead_status"]
          venue: string
        }
        Insert: {
          covers?: number | null
          created_at?: string
          email: string
          event_type?: string
          hotel_interest?: Database["public"]["Enums"]["hotel_interest"]
          id?: string
          interest?: Database["public"]["Enums"]["lead_interest"]
          message?: string
          name: string
          page?: string
          phone?: string
          preferred_date?: string | null
          preferred_time?: string
          restaurant?: string
          routed_to?: string
          status?: Database["public"]["Enums"]["lead_status"]
          venue?: string
        }
        Update: {
          covers?: number | null
          created_at?: string
          email?: string
          event_type?: string
          hotel_interest?: Database["public"]["Enums"]["hotel_interest"]
          id?: string
          interest?: Database["public"]["Enums"]["lead_interest"]
          message?: string
          name?: string
          page?: string
          phone?: string
          preferred_date?: string | null
          preferred_time?: string
          restaurant?: string
          routed_to?: string
          status?: Database["public"]["Enums"]["lead_status"]
          venue?: string
        }
        Relationships: []
      }
      newsletter_subscriber: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      offer: {
        Row: {
          created_at: string
          description: string
          hotel_id: string | null
          id: string
          image: string | null
          min_nights: number | null
          order: number
          promo_code: string
          tag: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          hotel_id?: string | null
          id?: string
          image?: string | null
          min_nights?: number | null
          order?: number
          promo_code?: string
          tag?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          hotel_id?: string | null
          id?: string
          image?: string | null
          min_nights?: number | null
          order?: number
          promo_code?: string
          tag?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["id"]
          },
        ]
      }
      page: {
        Row: {
          created_at: string
          hero_eyebrow: string
          hero_heading: string
          hero_image: string | null
          hero_subheading: string
          hotel_id: string | null
          id: string
          intro_body: string
          kind: Database["public"]["Enums"]["page_kind"]
          meta_description: string
          meta_title: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_eyebrow?: string
          hero_heading?: string
          hero_image?: string | null
          hero_subheading?: string
          hotel_id?: string | null
          id?: string
          intro_body?: string
          kind: Database["public"]["Enums"]["page_kind"]
          meta_description?: string
          meta_title?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_eyebrow?: string
          hero_heading?: string
          hero_image?: string | null
          hero_subheading?: string
          hotel_id?: string | null
          id?: string
          intro_body?: string
          kind?: Database["public"]["Enums"]["page_kind"]
          meta_description?: string
          meta_title?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["id"]
          },
        ]
      }
      page_section: {
        Row: {
          body: string
          cta_label: string
          cta_url: string
          eyebrow: string
          id: string
          image: string | null
          image_alt: string
          kind: Database["public"]["Enums"]["section_kind"]
          order: number
          page_id: string
          title: string
        }
        Insert: {
          body?: string
          cta_label?: string
          cta_url?: string
          eyebrow?: string
          id?: string
          image?: string | null
          image_alt?: string
          kind?: Database["public"]["Enums"]["section_kind"]
          order?: number
          page_id: string
          title?: string
        }
        Update: {
          body?: string
          cta_label?: string
          cta_url?: string
          eyebrow?: string
          id?: string
          image?: string | null
          image_alt?: string
          kind?: Database["public"]["Enums"]["section_kind"]
          order?: number
          page_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "page"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant: {
        Row: {
          created_at: string
          cuisine: string
          description: string
          hero_image: string | null
          hotel_id: string
          id: string
          logo: string | null
          name: string
          order: number
          slug: string
          timing: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuisine?: string
          description?: string
          hero_image?: string | null
          hotel_id: string
          id?: string
          logo?: string | null
          name: string
          order?: number
          slug?: string
          timing?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuisine?: string
          description?: string
          hero_image?: string | null
          hotel_id?: string
          id?: string
          logo?: string | null
          name?: string
          order?: number
          slug?: string
          timing?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_image: {
        Row: {
          alt: string
          id: string
          image: string
          order: number
          restaurant_id: string
        }
        Insert: {
          alt?: string
          id?: string
          image: string
          order?: number
          restaurant_id: string
        }
        Update: {
          alt?: string
          id?: string
          image?: string
          order?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_image_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      room_category: {
        Row: {
          amenities: string
          bed_type: string
          book_url: string
          created_at: string
          description: string
          hero_image: string | null
          hotel_id: string
          id: string
          max_guests: number
          name: string
          order: number
          size_sqft: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          amenities?: string
          bed_type?: string
          book_url?: string
          created_at?: string
          description?: string
          hero_image?: string | null
          hotel_id: string
          id?: string
          max_guests?: number
          name: string
          order?: number
          size_sqft?: number | null
          slug?: string
          updated_at?: string
        }
        Update: {
          amenities?: string
          bed_type?: string
          book_url?: string
          created_at?: string
          description?: string
          hero_image?: string | null
          hotel_id?: string
          id?: string
          max_guests?: number
          name?: string
          order?: number
          size_sqft?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_category_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["id"]
          },
        ]
      }
      room_image: {
        Row: {
          alt: string
          id: string
          image: string
          order: number
          room_id: string
        }
        Insert: {
          alt?: string
          id?: string
          image: string
          order?: number
          room_id: string
        }
        Update: {
          alt?: string
          id?: string
          image?: string
          order?: number
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_image_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_category"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          brand_logo: string | null
          facebook_url: string
          footer_note: string
          id: number
          instagram_url: string
          meta_description: string
          newsletter_description: string
          newsletter_heading: string
          og_image: string | null
          site_title: string
          synxis_chain_id: string
          tagline: string
          tripadvisor_url: string
          updated_at: string
        }
        Insert: {
          brand_logo?: string | null
          facebook_url?: string
          footer_note?: string
          id?: number
          instagram_url?: string
          meta_description?: string
          newsletter_description?: string
          newsletter_heading?: string
          og_image?: string | null
          site_title?: string
          synxis_chain_id?: string
          tagline?: string
          tripadvisor_url?: string
          updated_at?: string
        }
        Update: {
          brand_logo?: string | null
          facebook_url?: string
          footer_note?: string
          id?: number
          instagram_url?: string
          meta_description?: string
          newsletter_description?: string
          newsletter_heading?: string
          og_image?: string | null
          site_title?: string
          synxis_chain_id?: string
          tagline?: string
          tripadvisor_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonial: {
        Row: {
          id: string
          name: string
          order: number
          quote: string
          rating: number
          title: string
        }
        Insert: {
          id?: string
          name: string
          order?: number
          quote: string
          rating?: number
          title?: string
        }
        Update: {
          id?: string
          name?: string
          order?: number
          quote?: string
          rating?: number
          title?: string
        }
        Relationships: []
      }
      venue: {
        Row: {
          area_sqft: number | null
          cap_banquet: number | null
          cap_classroom: number | null
          cap_cocktail: number | null
          cap_theatre: number | null
          cap_ushape: number | null
          ceiling_ft: number | null
          created_at: string
          description: string
          dimensions: string
          full_day_inr: number | null
          guests_max: number | null
          half_day_inr: number | null
          hero_image: string | null
          hotel_id: string
          id: string
          kind: Database["public"]["Enums"]["venue_kind"] | null
          name: string
          order: number
          per_plate_inr: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          area_sqft?: number | null
          cap_banquet?: number | null
          cap_classroom?: number | null
          cap_cocktail?: number | null
          cap_theatre?: number | null
          cap_ushape?: number | null
          ceiling_ft?: number | null
          created_at?: string
          description?: string
          dimensions?: string
          full_day_inr?: number | null
          guests_max?: number | null
          half_day_inr?: number | null
          hero_image?: string | null
          hotel_id: string
          id?: string
          kind?: Database["public"]["Enums"]["venue_kind"] | null
          name: string
          order?: number
          per_plate_inr?: number | null
          slug?: string
          updated_at?: string
        }
        Update: {
          area_sqft?: number | null
          cap_banquet?: number | null
          cap_classroom?: number | null
          cap_cocktail?: number | null
          cap_theatre?: number | null
          cap_ushape?: number | null
          ceiling_ft?: number | null
          created_at?: string
          description?: string
          dimensions?: string
          full_day_inr?: number | null
          guests_max?: number | null
          half_day_inr?: number | null
          hero_image?: string | null
          hotel_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["venue_kind"] | null
          name?: string
          order?: number
          per_plate_inr?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_image: {
        Row: {
          alt: string
          id: string
          image: string
          order: number
          venue_id: string
        }
        Insert: {
          alt?: string
          id?: string
          image: string
          order?: number
          venue_id: string
        }
        Update: {
          alt?: string
          id?: string
          image?: string
          order?: number
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_image_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      department:
        | "reservations"
        | "dining"
        | "sales"
        | "events"
        | "catering"
        | "careers"
        | "general"
      gallery_category: "hotel" | "lobby" | "rooms" | "dining" | "events"
      hotel_interest: "chancery" | "pavilion" | "either"
      hotel_scope: "chancery" | "pavilion" | "both"
      hotel_slug: "chancery" | "pavilion"
      lead_interest:
        | "stay"
        | "dining"
        | "event"
        | "catering"
        | "careers"
        | "other"
      lead_status: "new" | "in_progress" | "resolved"
      page_kind:
        | "home"
        | "rooms"
        | "faq"
        | "careers"
        | "catering"
        | "privacy"
        | "terms"
        | "accessibility"
        | "sitemap"
        | "hotel_home"
        | "accommodation"
        | "dining"
        | "events"
        | "offers"
        | "gallery"
        | "contact"
        | "experience"
        | "destination"
      section_kind: "text" | "text_image" | "image_text" | "callout" | "cta"
      venue_kind:
        | "ballroom"
        | "banquet"
        | "conference"
        | "private_dining"
        | "executive"
        | "al_fresco"
        | "divisible"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      department: [
        "reservations",
        "dining",
        "sales",
        "events",
        "catering",
        "careers",
        "general",
      ],
      gallery_category: ["hotel", "lobby", "rooms", "dining", "events"],
      hotel_interest: ["chancery", "pavilion", "either"],
      hotel_scope: ["chancery", "pavilion", "both"],
      hotel_slug: ["chancery", "pavilion"],
      lead_interest: [
        "stay",
        "dining",
        "event",
        "catering",
        "careers",
        "other",
      ],
      lead_status: ["new", "in_progress", "resolved"],
      page_kind: [
        "home",
        "rooms",
        "faq",
        "careers",
        "catering",
        "privacy",
        "terms",
        "accessibility",
        "sitemap",
        "hotel_home",
        "accommodation",
        "dining",
        "events",
        "offers",
        "gallery",
        "contact",
        "experience",
        "destination",
      ],
      section_kind: ["text", "text_image", "image_text", "callout", "cta"],
      venue_kind: [
        "ballroom",
        "banquet",
        "conference",
        "private_dining",
        "executive",
        "al_fresco",
        "divisible",
      ],
    },
  },
} as const

