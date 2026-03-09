export interface Post {
  id: string;
  text: string;
  hashtags?: string[];
  likes: number;
  reposts: number;
  replies: number;
  liked?: boolean;
  reposted?: boolean;
  createdAt: string;
  createdAtRaw?: string;
  parentId?: string | null;
  mediaUrls?: string[];
  author: {
    id?: string | number;
    displayName: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
  };
}
