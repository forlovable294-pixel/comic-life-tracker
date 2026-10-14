export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_events: {
        Row: {
          created_at: string
          due_at: string | null
          event_type: string
          id: string
          notes: string | null
          status: string
          subject_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          status?: string
          subject_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          status?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_events_subject_id_user_id_fkey"
            columns: ["subject_id", "user_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "academic_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          key: string
          name: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          key: string
          name: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          key?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      cardio_sessions: {
        Row: {
          activity_type: string
          average_heart_rate: number | null
          calories_kcal: number | null
          created_at: string
          distance_meters: number | null
          duration_minutes: number
          id: string
          notes: string | null
          source: string
          started_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          average_heart_rate?: number | null
          calories_kcal?: number | null
          created_at?: string
          distance_meters?: number | null
          duration_minutes: number
          id?: string
          notes?: string | null
          source?: string
          started_at: string
          user_id: string
        }
        Update: {
          activity_type?: string
          average_heart_rate?: number | null
          calories_kcal?: number | null
          created_at?: string
          distance_meters?: number | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          source?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          cardio_minutes: number
          created_at: string
          energy: number | null
          focus_minutes: number
          highlight: string | null
          id: string
          journal: string | null
          learning_minutes: number
          lessons: string | null
          log_date: string
          mood: number | null
          next_day_priorities: string | null
          reflection: string | null
          related_project_ids: string[]
          related_task_ids: string[]
          sleep_hours: number | null
          steps: number
          updated_at: string
          user_id: string
          wins: string | null
          workout_done: boolean
        }
        Insert: {
          cardio_minutes?: number
          created_at?: string
          energy?: number | null
          focus_minutes?: number
          highlight?: string | null
          id?: string
          journal?: string | null
          learning_minutes?: number
          lessons?: string | null
          log_date: string
          mood?: number | null
          next_day_priorities?: string | null
          reflection?: string | null
          related_project_ids?: string[]
          related_task_ids?: string[]
          sleep_hours?: number | null
          steps?: number
          updated_at?: string
          user_id: string
          wins?: string | null
          workout_done?: boolean
        }
        Update: {
          cardio_minutes?: number
          created_at?: string
          energy?: number | null
          focus_minutes?: number
          highlight?: string | null
          id?: string
          journal?: string | null
          learning_minutes?: number
          lessons?: string | null
          log_date?: string
          mood?: number | null
          next_day_priorities?: string | null
          reflection?: string | null
          related_project_ids?: string[]
          related_task_ids?: string[]
          sleep_hours?: number | null
          steps?: number
          updated_at?: string
          user_id?: string
          wins?: string | null
          workout_done?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          category_id: string | null
          created_at: string
          duration_minutes: number
          ended_at: string
          id: string
          notes: string | null
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          duration_minutes: number
          ended_at: string
          id?: string
          notes?: string | null
          started_at: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          duration_minutes?: number
          ended_at?: string
          id?: string
          notes?: string | null
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "focus_sessions_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "focus_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category_id: string | null
          created_at: string
          end_date: string | null
          id: string
          metric_key: string
          start_date: string
          status: string
          target_value: number
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          metric_key: string
          start_date?: string
          status?: string
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          metric_key?: string
          start_date?: string
          status?: string
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          habit_id: string
          id: string
          log_date: string
          notes: string | null
          user_id: string
          value: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          habit_id: string
          id?: string
          log_date: string
          notes?: string | null
          user_id: string
          value?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          habit_id?: string
          id?: string
          log_date?: string
          notes?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_user_id_fkey"
            columns: ["habit_id", "user_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      habits: {
        Row: {
          category_id: string | null
          color: string
          created_at: string
          frequency_rule: Json
          id: string
          is_active: boolean
          target_value: number
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          color?: string
          created_at?: string
          frequency_rule?: Json
          id?: string
          is_active?: boolean
          target_value?: number
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          color?: string
          created_at?: string
          frequency_rule?: Json
          id?: string
          is_active?: boolean
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_daily_summaries: {
        Row: {
          active_calories_kcal: number | null
          distance_meters: number | null
          id: string
          local_date: string
          recorded_at: string
          source_device: string | null
          source_provider: string
          steps_count: number | null
          synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_calories_kcal?: number | null
          distance_meters?: number | null
          id?: string
          local_date: string
          recorded_at?: string
          source_device?: string | null
          source_provider?: string
          steps_count?: number | null
          synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_calories_kcal?: number | null
          distance_meters?: number | null
          id?: string
          local_date?: string
          recorded_at?: string
          source_device?: string | null
          source_provider?: string
          steps_count?: number | null
          synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_sync_connections: {
        Row: {
          created_at: string
          id: string
          last_error_code: string | null
          last_error_message: string | null
          last_success_at: string | null
          last_sync_at: string | null
          permission_scopes: Json
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error_code?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          last_sync_at?: string | null
          permission_scopes?: Json
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error_code?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          last_sync_at?: string | null
          permission_scopes?: Json
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_sync_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      life_categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_embeds: {
        Row: {
          created_at: string
          embed_url: string
          id: string
          is_favorite: boolean
          provider: string
          sort_order: number
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          embed_url: string
          id?: string
          is_favorite?: boolean
          provider: string
          sort_order?: number
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          embed_url?: string
          id?: string
          is_favorite?: boolean
          provider?: string
          sort_order?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_embeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_activities: {
        Row: {
          activity_type: string
          category_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          rating: number | null
          started_at: string
          title: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          category_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          started_at?: string
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          category_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          started_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_activities_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "personal_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_applications: {
        Row: {
          applied_at: string | null
          company: string
          created_at: string
          id: string
          job_url: string | null
          next_event_at: string | null
          notes: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          created_at?: string
          id?: string
          job_url?: string | null
          next_event_at?: string | null
          notes?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          created_at?: string
          id?: string
          job_url?: string | null
          next_event_at?: string | null
          notes?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          preferences: Json
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          preferences?: Json
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          project_id: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          project_id: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          project_id?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          links: Json
          manual_progress: number | null
          priority: number
          progress_method: string
          project_type: string
          start_date: string | null
          status: string
          target_date: string | null
          tech_stack: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          links?: Json
          manual_progress?: number | null
          priority?: number
          progress_method?: string
          project_type?: string
          start_date?: string | null
          status?: string
          target_date?: string | null
          tech_stack?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          links?: Json
          manual_progress?: number | null
          priority?: number
          progress_method?: string
          project_type?: string
          start_date?: string | null
          status?: string
          target_date?: string | null
          tech_stack?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_items: {
        Row: {
          authors: string | null
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          published_at: string | null
          reading_status: string
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          authors?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          published_at?: string | null
          reading_status?: string
          source_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          authors?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          published_at?: string | null
          reading_status?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_items_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "research_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          academic_year: string | null
          created_at: string
          id: string
          name: string
          semester: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          id?: string
          name: string
          semester?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          id?: string
          name?: string
          semester?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          bucket: string
          category: string
          category_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          done: boolean
          due_at: string | null
          due_date: string
          estimate_minutes: number | null
          estimated_minutes: number | null
          id: string
          notes: string | null
          priority: number
          project_id: string | null
          scheduled_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket?: string
          category?: string
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          due_at?: string | null
          due_date?: string
          estimate_minutes?: number | null
          estimated_minutes?: number | null
          id?: string
          notes?: string | null
          priority?: number
          project_id?: string | null
          scheduled_date?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket?: string
          category?: string
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          due_at?: string | null
          due_date?: string
          estimate_minutes?: number | null
          estimated_minutes?: number | null
          id?: string
          notes?: string | null
          priority?: number
          project_id?: string | null
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_fk"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_project_fk"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          sort_order: number
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          sort_order?: number
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          sort_order?: number
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_user_id_fkey"
            columns: ["workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          reps: number | null
          rpe: number | null
          set_number: number
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          reps?: number | null
          rpe?: number | null
          set_number: number
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number | null
          rpe?: number | null
          set_number?: number
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_user_id_fkey"
            columns: ["exercise_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          source: string
          updated_at: string
          user_id: string
          workout_date: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          source?: string
          updated_at?: string
          user_id: string
          workout_date: string
          workout_type?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          source?: string
          updated_at?: string
          user_id?: string
          workout_date?: string
          workout_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          event_type: string
          id: string
          idempotency_key: string
          occurred_at: string
          points: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          event_type: string
          id?: string
          idempotency_key: string
          occurred_at?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          event_type?: string
          id?: string
          idempotency_key?: string
          occurred_at?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: {
          _key: string
          _points: number
          _ref: string
          _ref_type: string
          _type: string
          _user: string
        }
        Returns: undefined
      }
      seed_categories: { Args: { _user: string }; Returns: undefined }
      unlock: { Args: { _key: string; _user: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
