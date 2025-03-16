import { 
  users, activities, progress,
  type User, type InsertUser, 
  type Progress, type InsertProgress,
  type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChildrenByParentId(parentId: number): Promise<User[]>;
  
  // Progress methods
  getProgress(userId: number, category?: string): Promise<Progress[]>;
  updateProgress(progress: InsertProgress): Promise<Progress>;
  getProgressByItem(userId: number, category: string, itemId: string): Promise<Progress | undefined>;
  
  // Activity methods
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progress: Map<number, Progress>;
  private activities: Map<number, Activity>;
  private userId: number;
  private progressId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.activities = new Map();
    this.userId = 1;
    this.progressId = 1;
    this.activityId = 1;
    
    // Create default admin user
    this.createUser({
      username: "parent",
      password: "password123",
      isParent: true
    });
    
    // Create default child users
    const childAvatars = ["red", "blue", "green"];
    childAvatars.forEach(avatar => {
      this.createUser({
        username: avatar,
        childAvatar: avatar,
        childName: avatar.charAt(0).toUpperCase() + avatar.slice(1),
        parentId: 1,
        isParent: false
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getChildrenByParentId(parentId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.parentId === parentId
    );
  }
  
  async getProgress(userId: number, category?: string): Promise<Progress[]> {
    const userProgress = Array.from(this.progress.values()).filter(
      (p) => p.userId === userId && (category ? p.category === category : true)
    );
    return userProgress;
  }
  
  async updateProgress(insertProgress: InsertProgress): Promise<Progress> {
    const existingProgress = await this.getProgressByItem(
      insertProgress.userId, 
      insertProgress.category, 
      insertProgress.itemId
    );
    
    if (existingProgress) {
      const updatedProgress: Progress = {
        ...existingProgress,
        ...insertProgress,
        completedAt: new Date()
      };
      this.progress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    }
    
    const id = this.progressId++;
    const newProgress: Progress = {
      ...insertProgress,
      id,
      completedAt: new Date()
    };
    this.progress.set(id, newProgress);
    return newProgress;
  }
  
  async getProgressByItem(userId: number, category: string, itemId: string): Promise<Progress | undefined> {
    return Array.from(this.progress.values()).find(
      (p) => p.userId === userId && p.category === category && p.itemId === itemId
    );
  }
  
  async getActivities(userId: number, limit = 10): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);
      
    return userActivities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      timestamp: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
