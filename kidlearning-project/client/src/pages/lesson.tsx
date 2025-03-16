import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";
import { AudioPlayer } from "@/components/ui/audio-player";
import { motion } from "framer-motion";

export default function Lesson() {
  const { category, itemId } = useParams();
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [currentItem, setCurrentItem] = useState<string | null>(itemId || null);
  
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

  // Set first item if none selected
  useEffect(() => {
    if (category && config && !currentItem) {
      setCurrentItem(config.items[0]);
    }
  }, [category, config, currentItem]);

  // Track progress when viewing a lesson
  const progressMutation = useMutation({
    mutationFn: async () => {
      if (!currentItem || !category || !user) return null;
      return await apiRequest("POST", "/api/progress", {
        category,
        itemId: currentItem,
        completed: true,
        score: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      // Create activity record
      activityMutation.mutate();
    }
  });

  // Record activity when completing a lesson
  const activityMutation = useMutation({
    mutationFn: async () => {
      if (!currentItem || !category || !user) return null;
      return await apiRequest("POST", "/api/activities", {
        category,
        itemId: currentItem,
        activity: "lesson",
        score: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    }
  });

  // Mark lesson as viewed/completed
  useEffect(() => {
    if (currentItem && category && user) {
      progressMutation.mutate();
    }
  }, [currentItem, category, user]);

  if (loading || !user || !category || !config || !currentItem) {
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
          <i className={`fas fa-${config.icon} mr-2`}></i> {config.title} Lessons
        </h2>
        <Link href="/home">
          <Button className={`btn-kid ${config.color.bgClass} hover:${config.color.hoverClass} text-white font-bold py-2 px-4 rounded-full text-sm shadow-fun transition-all`}>
            <i className="fas fa-home mr-1"></i> Home
          </Button>
        </Link>
      </div>
      
      {/* Item Display */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="item-display text-center">
            {category === CATEGORIES.ALPHABETS && (
              <AlphabetDisplay letter={currentItem} config={config} />
            )}
            {category === CATEGORIES.NUMBERS && (
              <NumberDisplay number={currentItem} config={config} />
            )}
            {category === CATEGORIES.SHAPES && (
              <ShapeDisplay shape={currentItem} config={config} />
            )}
            <AudioPlayer 
              category={category} 
              itemId={currentItem} 
              className="mt-4"
            />
          </div>
          
          <div className="item-examples flex-grow">
            {category === CATEGORIES.ALPHABETS && (
              <AlphabetExamples letter={currentItem} config={config} />
            )}
            {category === CATEGORIES.NUMBERS && (
              <NumberExamples number={currentItem} config={config} />
            )}
            {category === CATEGORIES.SHAPES && (
              <ShapeExamples shape={currentItem} config={config} />
            )}
          </div>
        </div>
      </div>
      
      {/* Item Navigation */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className={`text-2xl font-comic font-bold mb-6 text-center ${config.color.textClass}`}>
          {category === CATEGORIES.ALPHABETS && "Choose a Letter to Learn"}
          {category === CATEGORIES.NUMBERS && "Choose a Number to Learn"}
          {category === CATEGORIES.SHAPES && "Choose a Shape to Learn"}
        </h3>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2 md:gap-4">
          {config.items.map((item) => (
            <motion.button
              key={item}
              whileTap={{ scale: 0.95 }}
              className={`${config.color.bgPastelClass}${currentItem === item ? '' : '/50'} rounded-lg p-2 hover:${config.color.bgClass} hover:text-white transition-colors`}
              onClick={() => setCurrentItem(item)}
            >
              <span className="text-2xl font-comic font-bold">
                {category === CATEGORIES.SHAPES 
                  ? item.charAt(0).toUpperCase() + item.slice(1, 2)
                  : item}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Quiz Link */}
      <div className="mt-6 text-center">
        <Link href={`/quiz/${category}/${currentItem}`}>
          <Button className={`btn-kid ${config.color.bgClass} hover:${config.color.hoverClass} text-white font-bold py-3 px-6 rounded-full text-lg shadow-fun transition-all`}>
            <i className="fas fa-gamepad mr-2"></i> 
            Try a Quiz for {category === CATEGORIES.ALPHABETS ? `Letter ${currentItem}` : 
                          category === CATEGORIES.NUMBERS ? `Number ${currentItem}` : 
                          `${currentItem.charAt(0).toUpperCase() + currentItem.slice(1)} Shape`}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function AlphabetDisplay({ letter, config }: { letter: string, config: any }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`inline-block ${config.color.bgPastelClass} rounded-2xl w-40 h-40 flex items-center justify-center shadow-md`}
      >
        <span className="text-8xl font-comic font-bold text-primary-red">{letter}</span>
      </motion.div>
      <div className="flex justify-center mt-4 space-x-4">
        <div className={`${config.color.bgPastelClass} rounded-xl p-3 w-20 flex items-center justify-center shadow`}>
          <span className="text-4xl font-comic font-bold text-primary-red">{letter}</span>
        </div>
        <div className={`${config.color.bgPastelClass} rounded-xl p-3 w-20 flex items-center justify-center shadow`}>
          <span className="text-4xl font-comic font-bold text-primary-red">{letter.toLowerCase()}</span>
        </div>
      </div>
    </>
  );
}

function AlphabetExamples({ letter, config }: { letter: string, config: any }) {
  const examples = config.examples[letter] || [];
  
  return (
    <>
      <h3 className={`text-2xl font-comic font-bold mb-4 ${config.color.textClass}`}>
        Words that start with {letter}:
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {examples.map((example: string, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${config.color.bgPastelClass}/50 rounded-xl p-4 text-center`}
          >
            <div className="w-28 h-28 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <i className="fas fa-image text-4xl text-gray-400"></i>
            </div>
            <p className="font-comic font-bold text-xl">{example}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function NumberDisplay({ number, config }: { number: string, config: any }) {
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-block ${config.color.bgPastelClass} rounded-2xl w-40 h-40 flex items-center justify-center shadow-md`}
    >
      <span className="text-8xl font-comic font-bold text-primary-blue">{number}</span>
    </motion.div>
  );
}

function NumberExamples({ number, config }: { number: string, config: any }) {
  const count = parseInt(number);
  
  return (
    <>
      <h3 className={`text-2xl font-comic font-bold mb-4 ${config.color.textClass}`}>
        Count to {number}:
      </h3>
      
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`${config.color.bgPastelClass}/50 rounded-xl p-3 text-center`}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <i className="fas fa-apple-alt text-xl text-gray-500"></i>
            </div>
            <p className="font-comic font-bold mt-1">{index + 1}</p>
          </motion.div>
        ))}
      </div>
      
      {parseInt(number) > 10 && (
        <div className="mt-6">
          <h3 className={`text-2xl font-comic font-bold mb-4 ${config.color.textClass}`}>
            Simple Addition:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`${config.color.bgPastelClass}/50 rounded-xl p-4 text-center`}>
              <p className="font-comic font-bold text-xl">
                {Math.floor(count / 2)} + {count - Math.floor(count / 2)} = {count}
              </p>
            </div>
            <div className={`${config.color.bgPastelClass}/50 rounded-xl p-4 text-center`}>
              <p className="font-comic font-bold text-xl">
                {Math.floor(count / 3)} + {count - Math.floor(count / 3)} = {count}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShapeDisplay({ shape, config }: { shape: string, config: any }) {
  return (
    <motion.div
      initial={{ scale: 0.9, rotate: -5 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.5 }}
      className={`inline-block ${config.color.bgPastelClass} rounded-2xl w-40 h-40 flex items-center justify-center shadow-md`}
    >
      {shape === 'circle' && (
        <div className="w-28 h-28 rounded-full bg-primary-green flex items-center justify-center">
          <span className="text-2xl font-comic font-bold text-white">Circle</span>
        </div>
      )}
      {shape === 'square' && (
        <div className="w-28 h-28 bg-primary-green flex items-center justify-center">
          <span className="text-2xl font-comic font-bold text-white">Square</span>
        </div>
      )}
      {shape === 'triangle' && (
        <div className="w-0 h-0 border-l-[45px] border-r-[45px] border-b-[80px] border-transparent border-b-primary-green relative">
          <span className="text-lg font-comic font-bold text-white absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 whitespace-nowrap">Triangle</span>
        </div>
      )}
      {shape === 'rectangle' && (
        <div className="w-32 h-20 bg-primary-green flex items-center justify-center">
          <span className="text-lg font-comic font-bold text-white">Rectangle</span>
        </div>
      )}
      {shape === 'oval' && (
        <div className="w-32 h-20 rounded-full bg-primary-green flex items-center justify-center">
          <span className="text-2xl font-comic font-bold text-white">Oval</span>
        </div>
      )}
      {shape === 'star' && (
        <div className="text-primary-green">
          <i className="fas fa-star text-6xl"></i>
        </div>
      )}
      {shape === 'heart' && (
        <div className="text-primary-green">
          <i className="fas fa-heart text-6xl"></i>
        </div>
      )}
      {shape === 'diamond' && (
        <div className="w-28 h-28 bg-primary-green transform rotate-45 flex items-center justify-center">
          <span className="text-lg font-comic font-bold text-white transform -rotate-45">Diamond</span>
        </div>
      )}
      {shape === 'pentagon' && (
        <div className="text-primary-green">
          <i className="fas fa-pentagon text-6xl"></i>
          <span className="block text-lg font-comic font-bold mt-2">Pentagon</span>
        </div>
      )}
      {shape === 'hexagon' && (
        <div className="text-primary-green">
          <i className="fas fa-hexagon text-6xl"></i>
          <span className="block text-lg font-comic font-bold mt-2">Hexagon</span>
        </div>
      )}
    </motion.div>
  );
}

function ShapeExamples({ shape, config }: { shape: string, config: any }) {
  const examples = config.realLifeExamples[shape] || [];
  
  return (
    <>
      <h3 className={`text-2xl font-comic font-bold mb-4 ${config.color.textClass}`}>
        {shape.charAt(0).toUpperCase() + shape.slice(1)}s in real life:
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {examples.map((example: string, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${config.color.bgPastelClass}/50 rounded-xl p-4 text-center`}
          >
            <div className="w-28 h-28 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <i className="fas fa-image text-4xl text-gray-400"></i>
            </div>
            <p className="font-comic font-bold text-xl">{example}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
