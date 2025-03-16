import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";
import useAudio from "@/hooks/use-audio";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  question: string;
  options: string[] | number[];
  correctAnswer: string | number;
  image?: string;
}

export default function Quiz() {
  const { category, itemId } = useParams();
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { play } = useAudio();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  const config = category ? CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] : null;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Redirect to home if invalid category
  useEffect(() => {
    if (!loading && category && !Object.values(CATEGORIES).includes(category)) {
      setLocation("/home");
    }
  }, [category, loading, setLocation]);

  // Generate quiz questions
  useEffect(() => {
    if (category && itemId) {
      const questions = generateQuestions(category, itemId);
      setQuizQuestions(questions);
    } else if (category) {
      // If no specific itemId, generate random questions from the category
      const questions = generateRandomQuestions(category);
      setQuizQuestions(questions);
    }
  }, [category, itemId]);

  // Record progress when completing a quiz
  const progressMutation = useMutation({
    mutationFn: async () => {
      if (!category || !user) return null;
      
      return await apiRequest("POST", "/api/progress", {
        category,
        itemId: itemId || "quiz",
        completed: true,
        score: score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      // Create activity record
      activityMutation.mutate();
    }
  });

  // Record activity when completing a quiz
  const activityMutation = useMutation({
    mutationFn: async () => {
      if (!category || !user) return null;
      
      return await apiRequest("POST", "/api/activities", {
        category,
        itemId: itemId || "quiz",
        activity: "quiz",
        score: score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    }
  });

  const handleAnswer = (answer: string | number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === quizQuestions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      play("correct");
      setScore(score + 1);
      setShowFeedback("correct");
    } else {
      play("incorrect");
      setShowFeedback("incorrect");
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(null);
    } else {
      setQuizComplete(true);
      progressMutation.mutate();
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowFeedback(null);
  };

  if (loading || !user || !category || !config || quizQuestions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-comic font-bold ${config.color.textClass}`}>
          <i className="fas fa-gamepad mr-2"></i> {config.title} Quiz
        </h2>
        <div>
          <Link href={itemId ? `/lesson/${category}/${itemId}` : `/lesson/${category}`}>
            <Button className="btn-kid bg-primary-yellow hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full text-sm shadow-fun transition-all mr-2">
              <i className="fas fa-book-open mr-1"></i> Back to Lessons
            </Button>
          </Link>
          <Link href="/home">
            <Button className={`btn-kid ${config.color.bgClass} hover:${config.color.hoverClass} text-white font-bold py-2 px-4 rounded-full text-sm shadow-fun transition-all`}>
              <i className="fas fa-home mr-1"></i> Home
            </Button>
          </Link>
        </div>
      </div>
      
      {quizComplete ? (
        <QuizResults category={category} score={score} totalQuestions={quizQuestions.length} />
      ) : (
        <>
          {/* Quiz Progress */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">Question <span id="current-question">{currentQuestion + 1}</span> of <span id="total-questions">{quizQuestions.length}</span></p>
              
              <div className="flex items-center">
                <div className="flex space-x-1">
                  {quizQuestions.map((_, index) => (
                    <span 
                      key={index} 
                      className={`w-3 h-3 rounded-full ${index === currentQuestion ? config.color.bgClass : 'bg-gray-300'}`}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quiz Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className={`text-2xl font-comic font-bold mb-6 text-center ${config.color.textClass}`}>
                  {quizQuestions[currentQuestion].question}
                </h3>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                  {/* Quiz Image if available */}
                  {quizQuestions[currentQuestion].image && (
                    <div className={`quiz-image ${config.color.bgPastelClass}/50 p-4 rounded-xl`}>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <i className="fas fa-image text-2xl text-gray-400"></i>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Quiz Options */}
                  <div className="quiz-options">
                    <p className="text-xl font-medium mb-4">
                      {quizQuestions[currentQuestion].question}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {quizQuestions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`btn-kid bg-white border-2 ${config.color.borderClass} ${config.color.textClass} hover:${config.color.bgPastelClass} font-bold py-4 px-6 rounded-2xl text-2xl font-comic transition-all ${
                            selectedAnswer === option &&
                            (showFeedback === "correct" ? "bg-pastel-green text-primary-green" : 
                             showFeedback === "incorrect" ? "bg-pastel-red text-primary-red" : "")
                          }`}
                          onClick={() => handleAnswer(option)}
                          disabled={showFeedback !== null}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Feedback */}
                {showFeedback === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-pastel-green rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-12 h-12 bg-primary-green rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white text-2xl"></i>
                      </div>
                      <h4 className="text-2xl font-comic font-bold text-primary-green">Correct!</h4>
                    </div>
                    <p className="mb-4">Great job! That's the right answer.</p>
                    <Button 
                      onClick={handleNext}
                      className="btn-kid bg-primary-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-lg shadow-fun transition-all"
                    >
                      {currentQuestion < quizQuestions.length - 1 ? (
                        <>Next Question <i className="fas fa-arrow-right ml-1"></i></>
                      ) : (
                        <>Finish Quiz <i className="fas fa-flag-checkered ml-1"></i></>
                      )}
                    </Button>
                  </motion.div>
                )}
                
                {showFeedback === "incorrect" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-pastel-red rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center">
                        <i className="fas fa-times text-white text-2xl"></i>
                      </div>
                      <h4 className="text-2xl font-comic font-bold text-primary-red">Try again!</h4>
                    </div>
                    <p className="mb-4">Let's think about this one more time.</p>
                    <Button 
                      onClick={handleRetry}
                      className="btn-kid bg-primary-red hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full text-lg shadow-fun transition-all"
                    >
                      Try Again <i className="fas fa-redo ml-1"></i>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

function QuizResults({ category, score, totalQuestions }: { 
  category: string, 
  score: number, 
  totalQuestions: number 
}) {
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  const percentage = Math.round((score / totalQuestions) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 border-white shadow-md mb-4"
        style={{ backgroundColor: percentage >= 80 ? '#2ecc71' : percentage >= 50 ? '#f1c40f' : '#e74c3c' }}
      >
        <span className="text-3xl font-bold text-white">{percentage}%</span>
      </div>
      
      <h3 className="text-3xl font-comic font-bold mb-4">
        {percentage >= 80 ? 'Great job!' : percentage >= 50 ? 'Good effort!' : 'Keep practicing!'}
      </h3>
      
      <p className="text-xl mb-6">
        You got <span className="font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span> questions correct!
      </p>
      
      <div className="w-full bg-gray-200 rounded-full h-6 mb-6">
        <div 
          className="h-6 rounded-full text-xs text-white flex items-center justify-center"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: percentage >= 80 ? '#2ecc71' : percentage >= 50 ? '#f1c40f' : '#e74c3c'
          }}
        >
          {percentage}%
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Link href={`/lesson/${category}`}>
          <Button className={`btn-kid ${config.color.bgClass} hover:${config.color.hoverClass} text-white font-bold py-3 px-6 rounded-full text-lg shadow-fun transition-all`}>
            <i className="fas fa-book-open mr-2"></i> Back to Lessons
          </Button>
        </Link>
        
        <Link href={`/quiz/${category}`}>
          <Button className="btn-kid bg-primary-yellow hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-full text-lg shadow-fun transition-all">
            <i className="fas fa-redo mr-2"></i> Try Another Quiz
          </Button>
        </Link>
        
        <Link href="/home">
          <Button className="btn-kid bg-primary-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-fun transition-all">
            <i className="fas fa-home mr-2"></i> Go Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

// Helper functions to generate quiz questions
function generateQuestions(category: string, itemId: string): QuizQuestion[] {
  if (category === CATEGORIES.ALPHABETS) {
    return generateAlphabetQuestions(itemId);
  } else if (category === CATEGORIES.NUMBERS) {
    return generateNumberQuestions(itemId);
  } else if (category === CATEGORIES.SHAPES) {
    return generateShapeQuestions(itemId);
  }
  return [];
}

function generateRandomQuestions(category: string): QuizQuestion[] {
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  const items = config.items;
  const randomItems = shuffleArray([...items]).slice(0, 5);
  
  let allQuestions: QuizQuestion[] = [];
  randomItems.forEach(item => {
    const questions = generateQuestions(category, item);
    if (questions.length > 0) {
      allQuestions.push(questions[0]);
    }
  });
  
  return allQuestions;
}

function generateAlphabetQuestions(letter: string): QuizQuestion[] {
  const config = CATEGORY_CONFIG[CATEGORIES.ALPHABETS];
  const examples = config.examples[letter] || [];
  
  const questions: QuizQuestion[] = [
    {
      question: `Which word starts with the letter ${letter}?`,
      options: generateOptions(letter, config.examples),
      correctAnswer: examples[0] || "",
    },
    {
      question: `Find the uppercase letter ${letter}`,
      options: shuffleArray([letter, letter.toLowerCase(), getRandomLetter(), getRandomLetter()]),
      correctAnswer: letter,
    },
    {
      question: `Find the lowercase letter ${letter}`,
      options: shuffleArray([letter.toLowerCase(), letter, getRandomLetter().toLowerCase(), getRandomLetter().toLowerCase()]),
      correctAnswer: letter.toLowerCase(),
    }
  ];
  
  return shuffleArray(questions);
}

function generateNumberQuestions(number: string): QuizQuestion[] {
  const num = parseInt(number);
  
  const questions: QuizQuestion[] = [
    {
      question: `How many objects are there?`,
      options: shuffleArray([num, num + 1, num - 1, num + 2].filter(n => n > 0)),
      correctAnswer: num,
      image: "counting"
    },
    {
      question: `Which number comes after ${num - 1}?`,
      options: shuffleArray([num, num + 1, num - 1, num + 2].filter(n => n > 0)),
      correctAnswer: num,
    },
    {
      question: `Which number comes before ${num + 1}?`,
      options: shuffleArray([num, num + 1, num - 1, num + 2].filter(n => n > 0)),
      correctAnswer: num,
    }
  ];
  
  // Add addition/subtraction questions for numbers > 5
  if (num > 5) {
    const addend1 = Math.floor(num / 2);
    const addend2 = num - addend1;
    
    questions.push({
      question: `What is ${addend1} + ${addend2}?`,
      options: shuffleArray([num, num + 1, num - 1, addend1]),
      correctAnswer: num,
    });
    
    questions.push({
      question: `What is ${num} - ${addend2}?`,
      options: shuffleArray([addend1, addend1 + 1, addend1 - 1, addend2]),
      correctAnswer: addend1,
    });
  }
  
  return shuffleArray(questions).slice(0, 3);
}

function generateShapeQuestions(shape: string): QuizQuestion[] {
  const config = CATEGORY_CONFIG[CATEGORIES.SHAPES];
  const examples = config.realLifeExamples[shape] || [];
  const allShapes = config.items;
  
  const questions: QuizQuestion[] = [
    {
      question: `What shape is this?`,
      options: shuffleArray(generateShapeOptions(shape, allShapes)),
      correctAnswer: shape.charAt(0).toUpperCase() + shape.slice(1),
      image: shape
    },
    {
      question: `Which object is shaped like a ${shape}?`,
      options: shuffleArray([
        examples[0] || "",
        getRandomExample(shape, config.realLifeExamples) || "",
        getRandomExample(shape, config.realLifeExamples) || "",
        getRandomExample(shape, config.realLifeExamples) || ""
      ]),
      correctAnswer: examples[0] || "",
    }
  ];
  
  return shuffleArray(questions);
}

// Helper utility functions
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getRandomLetter(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters.charAt(Math.floor(Math.random() * letters.length));
}

function generateOptions(letter: string, examples: any): string[] {
  const correctExample = examples[letter]?.[0] || "";
  const otherLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".replace(letter, "").split("");
  const shuffledLetters = shuffleArray(otherLetters).slice(0, 3);
  
  const otherOptions = shuffledLetters.map(l => {
    return examples[l]?.[0] || getRandomWord(l);
  });
  
  return shuffleArray([correctExample, ...otherOptions]);
}

function getRandomWord(startingLetter: string): string {
  const wordsByLetter: Record<string, string[]> = {
    'A': ['Apple', 'Ant', 'Airplane'],
    'B': ['Ball', 'Bear', 'Balloon'],
    'C': ['Cat', 'Car', 'Cookie'],
    // ... other letters
  };
  
  const words = wordsByLetter[startingLetter] || [`${startingLetter}ord`];
  return words[Math.floor(Math.random() * words.length)];
}

function generateShapeOptions(shape: string, allShapes: string[]): string[] {
  const correctOption = shape.charAt(0).toUpperCase() + shape.slice(1);
  const otherShapes = allShapes.filter(s => s !== shape);
  const shuffledShapes = shuffleArray(otherShapes).slice(0, 3);
  
  const otherOptions = shuffledShapes.map(s => 
    s.charAt(0).toUpperCase() + s.slice(1)
  );
  
  return [correctOption, ...otherOptions];
}

function getRandomExample(excludeShape: string, examples: any): string {
  const shapes = Object.keys(examples).filter(s => s !== excludeShape);
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  const shapeExamples = examples[randomShape] || [];
  return shapeExamples[Math.floor(Math.random() * shapeExamples.length)] || "";
}
