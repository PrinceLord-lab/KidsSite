import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white shadow-md py-6 px-4 md:px-8 mt-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold font-comic">KL</span>
            </div>
            <h2 className="ml-2 text-xl font-bold text-primary-blue font-comic">KidLearn</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/parent-dashboard">
              <a className="text-primary-blue hover:underline cursor-pointer">Parent Guide</a>
            </Link>
            <a className="text-primary-blue hover:underline cursor-pointer">Privacy Policy</a>
            <a className="text-primary-blue hover:underline cursor-pointer">Contact Us</a>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          &copy; {new Date().getFullYear()} KidLearn. Fun learning for children.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
