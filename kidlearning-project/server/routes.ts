import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Content routes (no authentication required)
  app.get("/api/content/:category", (req, res) => {
    const { category } = req.params;
    
    // Return content based on category (alphabets, numbers, shapes)
    const content = {
      alphabets: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
                  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      shapes: ["circle", "square", "triangle", "rectangle", "oval", "diamond", "star", "heart"]
    };
    
    if (!content[category as keyof typeof content]) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    return res.json(content[category as keyof typeof content]);
  });
  
  // Lesson content API - get info about a specific item
  app.get("/api/lessons/:category/:item", (req, res) => {
    const { category, item } = req.params;
    
    // Example content structure - in a real app, this would be stored in a database
    const lessonContent = {
      alphabets: {
        A: {
          examples: ["Apple", "Astronaut", "Alligator"],
          description: "The first letter of the alphabet",
          funFact: "A is the most common letter in the English language!"
        },
        B: {
          examples: ["Ball", "Balloon", "Banana"],
          description: "The second letter of the alphabet",
          funFact: "The letter B initially appeared as a pictograph of a house!"
        },
        // Other letters would be defined similarly
      },
      numbers: {
        1: {
          examples: ["One apple", "One finger", "One sun"],
          description: "The first number",
          funFact: "The number 1 is neither prime nor composite!"
        },
        2: {
          examples: ["Two eyes", "Two hands", "Two feet"],
          description: "The second number",
          funFact: "Two is the only even prime number!"
        },
        // Other numbers would be defined similarly
      },
      shapes: {
        circle: {
          examples: ["Sun", "Ball", "Wheel"],
          description: "A round shape with no corners",
          funFact: "A circle has infinite sides!"
        },
        square: {
          examples: ["Checkerboard", "Window", "Picture frame"],
          description: "A shape with four equal sides and four right angles",
          funFact: "A square is a special case of a rectangle where all sides are equal!"
        },
        // Other shapes would be defined similarly
      }
    };
    
    // Check if category exists
    if (!lessonContent[category as keyof typeof lessonContent]) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Check if item exists in category
    const categoryContent = lessonContent[category as keyof typeof lessonContent] as any;
    if (!categoryContent[item]) {
      return res.status(404).json({ message: "Item not found in category" });
    }
    
    // Return lesson content
    return res.json({
      category,
      item,
      content: categoryContent[item]
    });
  });
  
  // Quiz API - get quiz questions for a specific category or item
  app.get("/api/quiz/:category/:item?", (req, res) => {
    const { category, item } = req.params;
    
    // Generate quiz questions based on category/item
    // In a real app, this would be more sophisticated
    let questions = [];
    
    if (category === 'alphabets') {
      if (item) {
        // Quiz for specific letter
        questions = [
          {
            question: `Which word starts with the letter ${item}?`,
            options: ["Apple", "Banana", "Cherry", "Dog"],
            correctAnswer: "Apple" // This would be dynamically generated based on the letter
          },
          {
            question: `What comes after the letter ${item}?`,
            options: ["B", "C", "D", "E"],
            correctAnswer: "B" // This would be dynamically generated based on the letter
          }
        ];
      } else {
        // General alphabet quiz
        questions = [
          {
            question: "Which letter comes first in the alphabet?",
            options: ["B", "A", "C", "D"],
            correctAnswer: "A"
          },
          {
            question: "How many letters are in the English alphabet?",
            options: ["24", "25", "26", "27"],
            correctAnswer: "26"
          }
        ];
      }
    } else if (category === 'numbers') {
      if (item) {
        // Quiz for specific number
        questions = [
          {
            question: `What number comes after ${item}?`,
            options: ["1", "2", "3", "4"],
            correctAnswer: "2" // This would be dynamically generated based on the number
          },
          {
            question: `If you have ${item} apple and get ${item} more, how many do you have?`,
            options: ["1", "2", "3", "4"],
            correctAnswer: "2" // This would be dynamically generated based on the number
          }
        ];
      } else {
        // General number quiz
        questions = [
          {
            question: "Which number is greater: 3 or 5?",
            options: ["3", "5", "They are equal", "Cannot determine"],
            correctAnswer: "5"
          },
          {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4"
          }
        ];
      }
    } else if (category === 'shapes') {
      if (item) {
        // Quiz for specific shape
        questions = [
          {
            question: `How many sides does a ${item} have?`,
            options: ["3", "4", "Many", "0"],
            correctAnswer: item === "circle" ? "0" : (item === "square" ? "4" : "3") // Simplified example
          },
          {
            question: `Which of these is a ${item}?`,
            options: ["Ball", "Box", "Book", "Pencil"],
            correctAnswer: "Ball" // This would be dynamically generated based on the shape
          }
        ];
      } else {
        // General shape quiz
        questions = [
          {
            question: "Which shape has 3 sides?",
            options: ["Circle", "Square", "Triangle", "Rectangle"],
            correctAnswer: "Triangle"
          },
          {
            question: "What shape is a ball?",
            options: ["Sphere", "Cube", "Cone", "Pyramid"],
            correctAnswer: "Sphere"
          }
        ];
      }
    } else {
      return res.status(404).json({ message: "Category not found" });
    }
    
    return res.json({
      category,
      item,
      questions
    });
  });

  const server = createServer(app);
  return server;
}