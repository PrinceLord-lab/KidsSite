import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Fetch progress data
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities", { limit: 5 }],
    enabled: !!user,
  });

  // Calculate progress percentages
  const calculateProgress = (category: string) => {
    if (!progressData) return 0;
    
    const categoryItems = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG].items.length;
    const completedItems = progressData.filter(
      (item: any) => item.category === category && item.completed
    ).length;
    
    return Math.round((completedItems / categoryItems) * 100);
  };

  if (loading || !user) {
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
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8 text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div 
            className={`w-20 h-20 ${
              user.childAvatar === 'red' ? 'bg-primary-red' : 
              user.childAvatar === 'blue' ? 'bg-primary-blue' : 
              user.childAvatar === 'green' ? 'bg-primary-green' : 
              'bg-primary-yellow'
            } rounded-full flex items-center justify-center border-4 border-white shadow-md`}
          >
            <i className={`fas fa-${user.isParent ? 'user-tie' : 'smile'} text-white text-3xl`}></i>
          </div>
          <div>
            <h2 className="text-3xl font-comic font-bold text-primary-blue">
              Hi {user.isParent ? user.username : user.childName}!
            </h2>
            <p className="text-xl">What would you like to learn today?</p>
          </div>
        </div>
      </motion.div>
      
      {/* Learning Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alphabets */}
        <LearningCard 
          category={CATEGORIES.ALPHABETS}
          progress={calculateProgress(CATEGORIES.ALPHABETS)}
          isLoading={isLoadingProgress}
        />
        
        {/* Numbers */}
        <LearningCard 
          category={CATEGORIES.NUMBERS}
          progress={calculateProgress(CATEGORIES.NUMBERS)}
          isLoading={isLoadingProgress}
        />
        
        {/* Shapes */}
        <LearningCard 
          category={CATEGORIES.SHAPES}
          progress={calculateProgress(CATEGORIES.SHAPES)}
          isLoading={isLoadingProgress}
        />
      </div>
      
      {/* Recent Activities */}
      <div className="mt-10 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-comic font-bold mb-6 text-primary-blue">
          <i className="fas fa-history mr-2"></i> Recent Activities
        </h3>
        
        {isLoadingActivities ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-blue"></div>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <i className="fas fa-info-circle text-3xl mb-2"></i>
            <p>No activities yet. Start learning to see your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LearningCard({ category, progress, isLoading }: { 
  category: string, 
  progress: number,
  isLoading: boolean
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
        
        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
          {isLoading ? (
            <div className="animate-pulse bg-gray-300 h-6 rounded-full"></div>
          ) : (
            <div 
              className={`${config.color.bgClass} h-6 rounded-full text-xs text-white flex items-center justify-center`} 
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 flex justify-between">
        <Link href={`/lesson/${category}`}>
          <Button className={`bg-white border-2 ${config.color.borderClass} ${config.color.textClass} hover:${config.color.bgPastelClass} font-bold py-2 px-4 rounded-full text-sm transition-all`}>
            <i className="fas fa-book-open mr-1"></i> Lessons
          </Button>
        </Link>
        <Link href={`/quiz/${category}`}>
          <Button className={`${config.color.bgClass} text-white hover:${config.color.hoverClass} font-bold py-2 px-4 rounded-full text-sm shadow-fun transition-all`}>
            <i className="fas fa-gamepad mr-1"></i> Play & Learn
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const config = CATEGORY_CONFIG[activity.category as keyof typeof CATEGORY_CONFIG];
  const date = new Date(activity.timestamp);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  
  return (
    <div className={`flex items-center ${config.color.bgPastelClass}/50 p-3 rounded-lg`}>
      <div className={`w-10 h-10 ${config.color.bgClass} rounded-full flex items-center justify-center mr-4`}>
        <i className={`fas fa-${config.icon} text-white`}></i>
      </div>
      <div className="flex-grow">
        <p className="font-medium">
          Completed <span className="font-bold">
            {activity.category === CATEGORIES.ALPHABETS && `Letter ${activity.itemId}`}
            {activity.category === CATEGORIES.NUMBERS && `Number ${activity.itemId}`}
            {activity.category === CATEGORIES.SHAPES && `${activity.itemId.charAt(0).toUpperCase() + activity.itemId.slice(1)} shape`}
          </span> {activity.activity}
        </p>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </div>
      <div className="flex items-center">
        {activity.score !== null && (
          <span className={`${config.color.bgClass} text-white px-2 py-1 rounded-full text-xs`}>
            <i className="fas fa-star mr-1"></i> {activity.score}/5
          </span>
        )}
      </div>
    </div>
  );
}
