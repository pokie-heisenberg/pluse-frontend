import { mockUsers } from './mockUsers';

export const mockPosts = [
  {
    _id: "post_1",
    author: mockUsers[0],
    content: "Just launched my new project! Really excited to share the frontend layout with everyone. Let me know what you think of the animations! 🚀✨",
    media: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
    likes: 342,
    comments: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isLiked: false
  },
  {
    _id: "post_2",
    author: mockUsers[1],
    content: "Exploring the mountains today. The UI of nature is unmatched. 🏔️",
    media: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
    likes: 1205,
    comments: 112,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isLiked: true
  },
  {
    _id: "post_3",
    author: mockUsers[0],
    content: "Does anyone else prefer Dark Mode over Light Mode? It just feels so much more premium. 🌙",
    media: [],
    likes: 89,
    comments: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isLiked: false
  }
];
