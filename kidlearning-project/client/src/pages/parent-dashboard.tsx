import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  // Redirect if not authenticated or not a parent
  useEffect(() => {
    if (!loading && (!user || !user.isParent)) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Fetch children
  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["/api/parent/children"],
    enabled: !!user && user.isParent,
  });

  // Set first child as selected by default when data loads
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  // Fetch selected child's progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/progress", { userId: selectedChild }],
    enabled: !!selectedChild,
  });

  // Fetch selected child's activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities", { userId: selectedChild, limit: 10 }],
    enabled: !!selectedChild,
  });

  // Calculate progress percentages for each category
  const calculateProgress = (category: string) => {
    if (!progressData) return 0;
    
    const categoryItems = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG].items.length;
    const completedItems = progressData.filter(
      (item: any) => item.category === category && item.completed
    ).length;
    
    return Math.round((completedItems / categoryItems) * 100);
  };

  if (loading || isLoadingChildren || !user) {
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
        <h2 className="text-3xl font-comic font-bold text-primary-blue">
          <i className="fas fa-chart-line mr-2"></i> Parent Dashboard
        </h2>
        <div>
          <Link href="/home">
            <Button className="btn-kid bg-primary-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-fun transition-all">
              <i className="fas fa-home mr-1"></i> Home
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Child Selection */}
      {children && children.length > 0 ? (
        <Card className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold mb-4">Select Child</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
              {children.map((child: any) => (
                <motion.button
                  key={child.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`btn-kid ${
                    selectedChild === child.id ? 
                    (child.childAvatar === 'red' ? 'bg-pastel-red' : 
                     child.childAvatar === 'blue' ? 'bg-pastel-blue' : 
                     'bg-pastel-green') : 
                    'bg-white border-2 border-gray-200'
                  } hover:bg-gray-100 rounded-xl px-4 py-2 flex items-center min-w-max transition-all`}
                  onClick={() => setSelectedChild(child.id)}
                >
                  <div className={`w-10 h-10 ${
                    child.childAvatar === 'red' ? 'bg-primary-red' : 
                    child.childAvatar === 'blue' ? 'bg-primary-blue' : 
                    'bg-primary-green'
                  } rounded-full flex items-center justify-center mr-2`}>
                    <i className="fas fa-smile text-white"></i>
                  </div>
                  <span className="font-medium">{child.childName}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500">No children accounts found. Create a child account to get started.</p>
          </CardContent>
        </Card>
      )}
      
      {selectedChild && (
        <>
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Alphabets Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-red">
                  <i className="fas fa-font mr-2"></i> Alphabets
                </h3>
                <span className="bg-pastel-red px-3 py-1 rounded-full text-primary-red font-bold">
                  {isLoadingProgress ? "..." : `${calculateProgress(CATEGORIES.ALPHABETS)}%`}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
                {isLoadingProgress ? (
                  <div className="animate-pulse bg-gray-300 h-6 rounded-full"></div>
                ) : (
                  <div 
                    className="bg-primary-red h-6 rounded-full" 
                    style={{ width: `${calculateProgress(CATEGORIES.ALPHABETS)}%` }}
                  ></div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {isLoadingProgress ? "Loading..." : (
                  `${progressData.filter((p: any) => p.category === CATEGORIES.ALPHABETS && p.completed).length}/${CATEGORY_CONFIG[CATEGORIES.ALPHABETS].items.length} letters mastered`
                )}
              </p>
            </motion.div>
            
            {/* Numbers Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-blue">
                  <i className="fas fa-sort-numeric-down mr-2"></i> Numbers
                </h3>
                <span className="bg-pastel-blue px-3 py-1 rounded-full text-primary-blue font-bold">
                  {isLoadingProgress ? "..." : `${calculateProgress(CATEGORIES.NUMBERS)}%`}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
                {isLoadingProgress ? (
                  <div className="animate-pulse bg-gray-300 h-6 rounded-full"></div>
                ) : (
                  <div 
                    className="bg-primary-blue h-6 rounded-full" 
                    style={{ width: `${calculateProgress(CATEGORIES.NUMBERS)}%` }}
                  ></div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {isLoadingProgress ? "Loading..." : (
                  `${progressData.filter((p: any) => p.category === CATEGORIES.NUMBERS && p.completed).length}/${CATEGORY_CONFIG[CATEGORIES.NUMBERS].items.length} numbers mastered`
                )}
              </p>
            </motion.div>
            
            {/* Shapes Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-green">
                  <i className="fas fa-shapes mr-2"></i> Shapes
                </h3>
                <span className="bg-pastel-green px-3 py-1 rounded-full text-primary-green font-bold">
                  {isLoadingProgress ? "..." : `${calculateProgress(CATEGORIES.SHAPES)}%`}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
                {isLoadingProgress ? (
                  <div className="animate-pulse bg-gray-300 h-6 rounded-full"></div>
                ) : (
                  <div 
                    className="bg-primary-green h-6 rounded-full" 
                    style={{ width: `${calculateProgress(CATEGORIES.SHAPES)}%` }}
                  ></div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {isLoadingProgress ? "Loading..." : (
                  `${progressData.filter((p: any) => p.category === CATEGORIES.SHAPES && p.completed).length}/${CATEGORY_CONFIG[CATEGORIES.SHAPES].items.length} shapes mastered`
                )}
              </p>
            </motion.div>
          </div>
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            
            {isLoadingActivities ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
                    <div className="flex-grow">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activities && activities.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-100 text-left rounded-l-lg">Date & Time</th>
                        <th className="py-3 px-4 bg-gray-100 text-left">Section</th>
                        <th className="py-3 px-4 bg-gray-100 text-left">Activity</th>
                        <th className="py-3 px-4 bg-gray-100 text-left rounded-r-lg">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity: any) => (
                        <tr key={activity.id} className="border-b">
                          <td className="py-3 px-4">
                            {new Date(activity.timestamp).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 ${
                              activity.category === CATEGORIES.ALPHABETS ? 'bg-pastel-red/50 rounded text-primary-red' : 
                              activity.category === CATEGORIES.NUMBERS ? 'bg-pastel-blue/50 rounded text-primary-blue' : 
                              'bg-pastel-green/50 rounded text-primary-green'
                            }`}>
                              {CATEGORY_CONFIG[activity.category as keyof typeof CATEGORY_CONFIG].title}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            Completed {activity.activity === 'lesson' ? 'lesson' : 'quiz'} on {' '}
                            {activity.category === CATEGORIES.ALPHABETS && `Letter ${activity.itemId}`}
                            {activity.category === CATEGORIES.NUMBERS && `Number ${activity.itemId}`}
                            {activity.category === CATEGORIES.SHAPES && 
                              (activity.itemId === 'quiz' ? 'shapes' : `${activity.itemId.charAt(0).toUpperCase() + activity.itemId.slice(1)} shape`)}
                          </td>
                          <td className="py-3 px-4">
                            {activity.score !== null ? (
                              <span className={`${
                                activity.category === CATEGORIES.ALPHABETS ? 'bg-primary-red' : 
                                activity.category === CATEGORIES.NUMBERS ? 'bg-primary-blue' : 
                                'bg-primary-green'
                              } text-white px-2 py-1 rounded-full text-xs`}>
                                <i className="fas fa-star"></i> {activity.score}/5
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <i className="fas fa-info-circle text-3xl mb-2"></i>
                    <p>No activities recorded yet.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
          
          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">Recommendations</h3>
            
            {isLoadingProgress ? (
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mt-1 mr-4"></div>
                    <div className="flex-grow">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {progressData && (
                  <>
                    {calculateProgress(CATEGORIES.ALPHABETS) < 30 && (
                      <div className="flex items-start p-4 bg-pastel-yellow/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary-yellow rounded-full flex items-center justify-center mt-1 mr-4">
                          <i className="fas fa-lightbulb text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-bold">Alphabet Practice Needed</h4>
                          <p className="text-gray-700">
                            {children.find((c: any) => c.id === selectedChild)?.childName} needs more practice with letters. Consider spending extra time on alphabet lessons.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {calculateProgress(CATEGORIES.NUMBERS) > 50 && (
                      <div className="flex items-start p-4 bg-pastel-blue/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center mt-1 mr-4">
                          <i className="fas fa-award text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-bold">Great Progress in Numbers!</h4>
                          <p className="text-gray-700">
                            {children.find((c: any) => c.id === selectedChild)?.childName} has shown excellent progress in learning numbers. Consider introducing simple addition concepts.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {calculateProgress(CATEGORIES.SHAPES) < 40 && (
                      <div className="flex items-start p-4 bg-pastel-green/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center mt-1 mr-4">
                          <i className="fas fa-shapes text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-bold">Focus on Shapes</h4>
                          <p className="text-gray-700">
                            {children.find((c: any) => c.id === selectedChild)?.childName} could benefit from more practice with shapes. Try the shape quizzes to improve recognition.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {calculateProgress(CATEGORIES.ALPHABETS) > 70 && 
                     calculateProgress(CATEGORIES.NUMBERS) > 70 &&
                     calculateProgress(CATEGORIES.SHAPES) > 70 && (
                      <div className="flex items-start p-4 bg-pastel-purple/50 rounded-lg">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mt-1 mr-4">
                          <i className="fas fa-trophy text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-bold">Outstanding Progress!</h4>
                          <p className="text-gray-700">
                            {children.find((c: any) => c.id === selectedChild)?.childName} is doing amazing in all subjects! Consider introducing more advanced concepts or new learning areas.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* If no specific recommendations apply */}
                    {!progressData.length && (
                      <div className="flex items-start p-4 bg-gray-100 rounded-lg">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mt-1 mr-4">
                          <i className="fas fa-info text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-bold">Get Started with Learning</h4>
                          <p className="text-gray-700">
                            No learning activity detected yet. Encourage {children.find((c: any) => c.id === selectedChild)?.childName} to start exploring the lessons and quizzes.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
