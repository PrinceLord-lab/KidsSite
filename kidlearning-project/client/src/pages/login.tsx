import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AvatarSelection from "@/components/ui/avatar-selection";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const parentLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { login, loading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  // Redirect if already logged in
  if (user) {
    setLocation("/home");
    return null;
  }

  const form = useForm<z.infer<typeof parentLoginSchema>>({
    resolver: zodResolver(parentLoginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleParentLogin = async (data: z.infer<typeof parentLoginSchema>) => {
    await login(data.username, data.password, true);
  };

  const handleKidLogin = async () => {
    if (!selectedAvatar) return;
    await login(selectedAvatar);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 text-center">
      <h2 className="text-3xl md:text-4xl font-comic font-bold mb-8 text-primary-blue">Welcome to KidLearn!</h2>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kid Login */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-primary-yellow">
          <h3 className="text-2xl font-comic font-bold mb-6 text-primary-yellow">
            <i className="fas fa-child mr-2"></i>
            Kids Zone
          </h3>
          
          <p className="mb-6 text-lg">Choose your avatar to start learning!</p>
          
          {/* Avatar Selection */}
          <AvatarSelection onSelect={setSelectedAvatar} selectedAvatar={selectedAvatar} />
          
          <Button
            onClick={handleKidLogin}
            disabled={loading || !selectedAvatar}
            className="btn-kid bg-primary-yellow shadow-fun hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-xl transition-all"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading...
              </>
            ) : (
              "Let's Learn!"
            )}
          </Button>
        </div>
        
        {/* Parent/Teacher Login */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-primary-blue">
          <h3 className="text-2xl font-comic font-bold mb-6 text-primary-blue">
            <i className="fas fa-user-tie mr-2"></i>
            Parents & Teachers
          </h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleParentLogin)} className="text-left">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="block text-gray-700 text-lg font-medium mb-2">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        placeholder="parent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="block text-gray-700 text-lg font-medium mb-2">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        placeholder="password123"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between mb-6">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5 text-primary-blue rounded"
                        />
                      </FormControl>
                      <FormLabel className="ml-2 block text-gray-700">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <a href="#" className="text-primary-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="btn-kid bg-primary-blue shadow-fun hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-xl w-full transition-all"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
