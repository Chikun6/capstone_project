export interface User {
  did: string;
  handle: string;
  displayName: string;
  avatar: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  description?: string;
}
