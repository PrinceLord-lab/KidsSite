import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Fetch available content
  const { data: alphabetsData } = useQuery({
    queryKey: ["/api/content/alphabets"],
  });
  
  const { data: numbersData } = useQuery({
    queryKey: ["/api/content/numbers"],
  });
  
  const { data: shapesData } = useQuery({
    queryKey: ["/api/content/shapes"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8 text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center border-4 border-white shadow-md">
            <i className="fas fa-child text-white text-3xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-comic font-bold text-primary-blue">
              Welcome to KidLearn!
            </h2>
            <p className="text-xl">Start exploring and learning today!</p>
          </div>
        </div>
      </motion.div>
      
      {/* Learning Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alphabets */}
        <LearningCard 
          category={CATEGORIES.ALPHABETS}
          itemCount={alphabetsData?.length || 26}
        />
        
        {/* Numbers */}
        <LearningCard 
          category={CATEGORIES.NUMBERS}
          itemCount={numbersData?.length || 10}
        />
        
        {/* Shapes */}
        <LearningCard 
          category={CATEGORIES.SHAPES}
          itemCount={shapesData?.length || 8}
        />
      </div>
      
      {/* Featured Content */}
      <div className="mt-10 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-comic font-bold mb-6 text-primary-blue">
          <i className="fas fa-star mr-2"></i> Featured Content
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FeaturedItem 
            title="Alphabets A-Z" 
            description="Learn all 26 letters with fun examples"
            icon="font"
            colorClass="bg-primary-blue"
            link="/lesson/alphabets/A"
          />
          <FeaturedItem 
            title="Counting Numbers" 
            description="Count from 1 to 10 with interactive lessons"
            icon="sort-numeric-down"
            colorClass="bg-primary-red"
            link="/lesson/numbers/1"
          />
          <FeaturedItem 
            title="Basic Shapes" 
            description="Discover circles, squares, triangles and more"
            icon="shapes"
            colorClass="bg-primary-green"
            link="/lesson/shapes/circle"
          />
        </div>
      </div>
      
      {/* How It Works */}
      <div className="mt-10 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-comic font-bold mb-6 text-primary-blue">
          <i className="fas fa-question-circle mr-2"></i> How It Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book-open text-white text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-2">1. Learn</h4>
            <p>Explore interactive lessons with colorful examples</p>
          </div>
          
          <div className="p-4">
            <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-gamepad text-white text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-2">2. Practice</h4>
            <p>Take fun quizzes to test your knowledge</p>
          </div>
          
          <div className="p-4">
            <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-white text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-2">3. Master</h4>
            <p>Build your skills through repetition and games</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningCard({ category, itemCount }: { 
  category: string, 
  itemCount: number
}) {
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`learning-card bg-white rounded-2xl shadow-xl overflow-hidden border-b-8 ${config.color.borderClass}`}
    >
      <div className={`${config.color.bgPastelClass} p-6 text-center`}>
        <div className={`w-20 h-20 ${config.color.bgClass} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}>
          <i className={`fas fa-${config.icon} text-white text-3xl`}></i>
        </div>
        <h3 className={`text-2xl font-comic font-bold ${config.color.textClass} mb-2`}>{config.title}</h3>
        <p className="mb-4">
          {category === CATEGORIES.ALPHABETS && "Learn your ABCs with fun!"}
          {category === CATEGORIES.NUMBERS && "Count and learn 1-2-3!"}
          {category === CATEGORIES.SHAPES && "Discover circles, squares & more!"}
        </p>
        
        {/* Items count */}
        <div className={`${config.color.bgClass} text-white py-2 px-4 rounded-full inline-block text-sm font-bold`}>
          {itemCount} {category === CATEGORIES.ALPHABETS ? 'Letters' : category === CATEGORIES.NUMBERS ? 'Numbers' : 'Shapes'}
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 flex justify-between">
        <Link href={`/lesson/${category.toLowerCase()}/${category === CATEGORIES.ALPHABETS ? 'A' : category === CATEGORIES.NUMBERS ? '1' : 'circle'}`}>
          <Button className={`bg-white border-2 ${config.color.borderClass} ${config.color.textClass} hover:${config.color.bgPastelClass} font-bold py-2 px-4 rounded-full text-sm transition-all`}>
            <i className="fas fa-book-open mr-1"></i> Lessons
          </Button>
        </Link>
        <Link href={`/quiz/${category.toLowerCase()}`}>
          <Button className={`${config.color.bgClass} text-white hover:${config.color.hoverClass} font-bold py-2 px-4 rounded-full text-sm shadow-fun transition-all`}>
            <i className="fas fa-gamepad mr-1"></i> Play & Learn
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function FeaturedItem({ title, description, icon, colorClass, link }: { 
  title: string, 
  description: string,
  icon: string,
  colorClass: string,
  link: string
}) {
  return (
    <Link href={link}>
      <motion.div 
        whileHover={{ scale: 1.03 }}
        className="bg-white border border-gray-200 rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="flex items-center mb-3">
          <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center mr-3`}>
            <i className={`fas fa-${icon} text-white`}></i>
          </div>
          <h4 className="font-bold text-lg">{title}</h4>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}
