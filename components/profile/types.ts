export interface Profile {
  id: number;
  name: string;
  avatarUrl: string;
  hasPin: boolean;
  movieGenres?: string[];
  tvGenres?: string[];
}

export interface ProfileListResponse {
  profiles?: Profile[];
  activeProfileId?: number;
}
