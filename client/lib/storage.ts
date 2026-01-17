import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post, Report, UserProfile } from "@/types/post";

const POSTS_KEY = "@iok_sadaqa_posts";
const USER_KEY = "@iok_sadaqa_user";
const REPORTS_KEY = "@iok_sadaqa_reports";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function getPosts(): Promise<Post[]> {
  try {
    const data = await AsyncStorage.getItem(POSTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function savePost(post: Omit<Post, "id" | "createdAt">): Promise<Post> {
  const posts = await getPosts();
  const newPost: Post = {
    ...post,
    id: generateId(),
    createdAt: Date.now(),
  };
  posts.unshift(newPost);
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  posts[index] = { ...posts[index], ...updates };
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return posts[index];
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(filtered));
  return filtered.length !== posts.length;
}

export async function getUser(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function createDefaultUser(): Promise<UserProfile> {
  const user: UserProfile = {
    id: generateId(),
    displayName: "Community Member",
    communityId: "iok_diamond_bar",
    createdAt: Date.now(),
  };
  await saveUser(user);
  return user;
}

export async function getReports(): Promise<Report[]> {
  try {
    const data = await AsyncStorage.getItem(REPORTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveReport(report: Omit<Report, "id" | "createdAt">): Promise<Report> {
  const reports = await getReports();
  const newReport: Report = {
    ...report,
    id: generateId(),
    createdAt: Date.now(),
  };
  reports.push(newReport);
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  const reportCounts = reports.filter((r) => r.postId === report.postId).length;
  if (reportCounts >= 3) {
    await updatePost(report.postId, { status: "hidden" });
  }
  
  return newReport;
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([POSTS_KEY, USER_KEY, REPORTS_KEY]);
}

export async function seedSamplePosts(): Promise<void> {
  const existingPosts = await getPosts();
  if (existingPosts.length > 0) return;

  const user = await getUser();
  if (!user) return;

  const samplePosts: Omit<Post, "id" | "createdAt">[] = [
    {
      communityId: "iok_diamond_bar",
      type: "request",
      category: "food",
      title: "Need groceries for family of 4",
      description: "Assalamu alaikum, our family is going through a difficult time and we need help with groceries for this week. We have 2 young children. Any help would be greatly appreciated. JazakAllah khair.",
      isAnonymous: false,
      authorId: "sample1",
      authorDisplayName: "Brother Ahmed",
      status: "open",
      urgent: true,
      contactPreference: "in_app",
    },
    {
      communityId: "iok_diamond_bar",
      type: "offer",
      category: "ride",
      title: "Offering rides to Friday prayer",
      description: "I can offer rides to Jummah prayer from the Diamond Bar area. I have space for 3 passengers. Please reach out if you need a ride!",
      isAnonymous: false,
      authorId: "sample2",
      authorDisplayName: "Brother Yusuf",
      status: "open",
      urgent: false,
      contactPreference: "phone",
    },
    {
      communityId: "iok_diamond_bar",
      type: "request",
      category: "baby_supplies",
      title: "Baby clothes needed (0-6 months)",
      description: "We are expecting our first child soon and could use any baby clothes, diapers, or supplies you might have. We would be very grateful for any help.",
      isAnonymous: true,
      authorId: "sample3",
      status: "open",
      urgent: false,
      contactPreference: "in_app",
    },
    {
      communityId: "iok_diamond_bar",
      type: "offer",
      category: "consulting",
      title: "Free tax preparation help",
      description: "I am a certified tax preparer and would like to offer free tax preparation services to community members who need assistance. Available on weekends.",
      isAnonymous: false,
      authorId: "sample4",
      authorDisplayName: "Sister Fatima",
      status: "open",
      urgent: false,
      contactPreference: "email",
    },
  ];

  for (let i = 0; i < samplePosts.length; i++) {
    const post = samplePosts[i];
    const posts = await getPosts();
    const newPost: Post = {
      ...post,
      id: `sample_${i}`,
      createdAt: Date.now() - (i * 3600000),
    };
    posts.push(newPost);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
}
