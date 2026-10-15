export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  seller: string;
  sellerId?: string;
  campus: string;
  condition: string;
  image: string;
  description?: string;
  isSold?: boolean;
};

export type UserRole = "student" | "admin";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  campus: string;
  role: UserRole;
};

export type Tab = "Explore" | "Saved" | "Messages" | "Profile" | "MyListings" | "AdminPanel" | "StudentPanel";
