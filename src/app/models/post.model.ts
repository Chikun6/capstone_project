export interface Post {
  id: string;
  author: {
    handle: string;
    displayName: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  hashtags?: string[];
  image?: string;
  likes: number;
  reposts: number;
  replies: number;
  createdAt: Date;
  liked: boolean;
  reposted: boolean;
}
