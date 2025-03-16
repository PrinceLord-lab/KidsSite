import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md py-3 px-4 md:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold font-comic">KL</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-blue font-comic">KidLearn</h1>
            </div>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" className="text-primary-blue font-medium">
              Home
            </Button>
          </Link>
          <Link href="/lesson/alphabets/A">
            <Button variant="ghost" className="text-primary-blue font-medium">
              Alphabets
            </Button>
          </Link>
          <Link href="/lesson/numbers/1">
            <Button variant="ghost" className="text-primary-blue font-medium">
              Numbers
            </Button>
          </Link>
          <Link href="/lesson/shapes/circle">
            <Button variant="ghost" className="text-primary-blue font-medium">
              Shapes
            </Button>
          </Link>
        </div>
        
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
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-2 px-4">
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </div>
            </Link>
            <Link href="/lesson/alphabets/A">
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                <i className="fas fa-font"></i>
                <span>Alphabets</span>
              </div>
            </Link>
            <Link href="/lesson/numbers/1">
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                <i className="fas fa-sort-numeric-down"></i>
                <span>Numbers</span>
              </div>
            </Link>
            <Link href="/lesson/shapes/circle">
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                <i className="fas fa-shapes"></i>
                <span>Shapes</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
