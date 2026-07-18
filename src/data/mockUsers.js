export const mockUsers = [
  {
    _id: "user_1",
    name: "Aman Yadav",
    email: "aman@example.com",
    role: "admin",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    followers: 1205,
    following: 340,
    location: "New York, USA"
  },
  {
    _id: "user_2",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    role: "user",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    followers: 8900,
    following: 120,
    location: "San Francisco, CA"
  }
];

export const mockCurrentUser = mockUsers[0];
