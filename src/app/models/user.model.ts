export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  profile_picture_id: string | null;
  cover_photo_id: string | null;
  profile_picture_url?: string;
  cover_photo_url?: string;
  profile_setup_done: boolean;
  created_at: string;
  updated_at: string;
}
