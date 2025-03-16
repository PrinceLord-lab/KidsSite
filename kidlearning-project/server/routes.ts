import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProgressSchema, insertActivitySchema } from "@shared/schema";
import session from "express-session";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const MemorySessionStore = MemoryStore(session);
  app.use(
    session({
      secret: "kidlearn-session-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemorySessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );
  
  // Content routes (no authentication required)
  app.get("/api/content/:category", (req, res) => {
    const { category } = req.params;
    
    // Return content based on category (alphabets, numbers, shapes)
    // This is a simplified example of serving content without authentication
    const content = {
      alphabets: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
                  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      shapes: ["circle", "square", "triangle", "rectangle", "oval", "diamond", "star", "heart"]
    };
    
    if (!content[category]) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    return res.json(content[category]);
  });
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, isParent = false } = req.body;
      
      // For child login (avatar-based)
      if (!isParent) {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isParent) {
          return res.status(403).json({ message: "Invalid login type" });
        }
        
        req.session.userId = user.id;
        return res.json({ 
          id: user.id, 
          username: user.username,
          childAvatar: user.childAvatar,
          childName: user.childName,
          isParent: user.isParent
        });
      }
      
      // For parent/teacher login (username/password)
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isParent) {
        return res.status(403).json({ message: "Invalid login type" });
      }
      
      req.session.userId = user.id;
      return res.json({ 
        id: user.id, 
        username: user.username,
        isParent: user.isParent
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Google authentication
  app.post("/api/auth/google-login", async (req, res) => {
    try {
      const { email, displayName, photoURL, uid } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user already exists
      let user = await storage.getUserByUsername(email);
      
      // Create a new user if it doesn't exist
      if (!user) {
        const newUser = {
          username: email,
          email,
          password: `google-${uid}`, // We don't use this for login, but schema requires it
          isParent: true, // Google accounts are considered parent accounts
          childName: displayName || email.split("@")[0],
          childAvatar: photoURL || undefined
        };
        
        user = await storage.createUser(newUser);
      }
      
      req.session.userId = user.id;
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Google login error:", error);
      return res.status(500).json({ message: "Internal server error during Google login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });
  
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });
  
  // Progress routes
  app.get("/api/progress", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const category = req.query.category as string | undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.session.userId;
      
      // If requesting another user's progress, ensure the requester is a parent
      if (userId !== req.session.userId) {
        const requester = await storage.getUser(req.session.userId);
        if (!requester?.isParent) {
          return res.status(403).json({ message: "Permission denied" });
        }
      }
      
      const progress = await storage.getProgress(userId, category);
      return res.json(progress);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/progress", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const data = insertProgressSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const updatedProgress = await storage.updateProgress(data);
      return res.json(updatedProgress);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.session.userId;
      
      // If requesting another user's activities, ensure the requester is a parent
      if (userId !== req.session.userId) {
        const requester = await storage.getUser(req.session.userId);
        if (!requester?.isParent) {
          return res.status(403).json({ message: "Permission denied" });
        }
      }
      
      const activities = await storage.getActivities(userId, limit);
      return res.json(activities);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/activities", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const data = insertActivitySchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const activity = await storage.createActivity(data);
      return res.json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Parent routes
  app.get("/api/parent/children", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isParent) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const children = await storage.getChildrenByParentId(user.id);
      return res.json(children);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
