export interface Post {
  id: string;
  text: string;
  image?: string;
  hashtags?: string[];
  likes: number;
  reposts: number;
  replies: number;
  liked?: boolean;
  reposted?: boolean;
  createdAt: string;
  author: {
    displayName: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
  };
}
