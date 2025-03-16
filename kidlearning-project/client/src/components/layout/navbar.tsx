import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md py-3 px-4 md:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <Link href={user ? "/home" : "/"}>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold font-comic">KL</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-blue font-comic">KidLearn</h1>
            </div>
          </Link>
        </div>
        
        {user && (
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 bg-pastel-yellow px-3 py-1 rounded-full">
                  <div 
                    className={`w-8 h-8 ${user.isParent ? 'bg-primary-yellow' : 
                      user.childAvatar === 'red' ? 'bg-primary-red' : 
                      user.childAvatar === 'blue' ? 'bg-primary-blue' : 
                      'bg-primary-green'
                    } rounded-full flex items-center justify-center`}
                  >
                    <i className="fas fa-user text-white"></i>
                  </div>
                  <span className="font-semibold">
                    {user.isParent ? 'Parent' : user.childName}
                  </span>
                  <i className="fas fa-caret-down"></i>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {user.isParent && (
                    <DropdownMenuItem asChild>
                      <Link href="/parent-dashboard">
                        <span className="flex items-center w-full">
                          <i className="fas fa-chart-line mr-2"></i> Dashboard
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={logout}>
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-2xl text-primary-blue"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden pt-4 pb-2 px-4">
          <div className="flex flex-col space-y-2">
            {user.isParent && (
              <Link href="/parent-dashboard">
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                  <i className="fas fa-chart-line"></i>
                  <span>Dashboard</span>
                </div>
              </Link>
            )}
            <button 
              onClick={logout}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-left"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
