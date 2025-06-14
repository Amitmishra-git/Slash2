import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, ShoppingCart, ChevronDown, ChevronLeft, User, Settings, LogOut, Calendar, Shield, Heart, Package, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { getSavedExperiences } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/components/ui/use-toast';

interface NavbarProps {
  isDarkPageProp?: boolean;
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const Navbar = ({ isDarkPageProp = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, signInWithGoogle, login } = useAuth();
  const { toast } = useToast();
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCredentials, setAdminCredentials] = useState({ id: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      document.body.classList.add('search-overlay-active');
    } else {
      document.body.classList.remove('search-overlay-active');
    }
    return () => {
      document.body.classList.remove('search-overlay-active');
    };
  }, [searchOpen]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const experiences = getSavedExperiences();
    const lowercaseQuery = searchQuery.toLowerCase();
    const results = experiences
      .filter(exp => 
        exp.title.toLowerCase().includes(lowercaseQuery) || 
        exp.description.toLowerCase().includes(lowercaseQuery) ||
        exp.location.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, 5);
    
    setSearchResults(results);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        document.body.style.overflow = '';
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/experiences?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      document.body.style.overflow = '';
    }
  };

  const handleSearchResultClick = (id: string) => {
    setSearchOpen(false);
    navigate(`/experience/${id}`);
  };

  const handleSignIn = () => {
    signInWithGoogle();
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    navigate('/profile');
  };

  const isDarkPage = 
    location.pathname === '/' || 
    location.pathname.includes('/gifting-guide') || 
    location.pathname.includes('/category/') ||
    location.pathname.includes('/experience/') ||
    location.pathname.includes('/gift-personalizer');

  const navbarBgClass = isScrolled || !isDarkPage
    ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
    : "bg-black/30 backdrop-blur-md";
    
  const iconClass = cn(
    "transition-colors",
    isScrolled || !isDarkPage
      ? "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" 
      : "text-white hover:text-gray-200"
  );

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (path: string) => {
    scrollToTop();
    setCompanyDropdownOpen(false);
    setSupportDropdownOpen(false);
    navigate(path);
    setSearchOpen(false);
    document.body.style.overflow = '';
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await login(adminCredentials.id, adminCredentials.password);
      if (success) {
        setShowLoginDropdown(false);
        toast({
          title: "Signed in successfully",
          description: "You have been signed in to your account.",
        });
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error signing in",
        description: "There was a problem signing in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-10 py-4', navbarBgClass)}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 z-10" onClick={scrollToTop}>
            <img src="/lovable-uploads/5c4b2b72-9668-4671-9be9-84c7371c459a.png" alt="Slash logo" className="h-8 w-8" />
            <span className={cn("font-medium text-xl transition-colors", isScrolled || !isDarkPage ? "text-gray-800 dark:text-gray-200" : "text-white")}>
              Slash
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/experiences" className={cn("text-sm font-medium transition-colors", isScrolled || !isDarkPage ? "text-gray-800 dark:text-gray-200" : "text-white")}>
              All Experiences
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("text-sm font-medium transition-colors flex items-center", isScrolled || !isDarkPage ? "text-gray-800 dark:text-gray-200" : "text-white")}>
                  Company
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[400px] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/about-us" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">About Us</div>
                    <p className="text-sm text-muted-foreground">Learn more about our mission and team</p>
                  </Link>
                  <Link to="/how-it-works" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">How It Works</div>
                    <p className="text-sm text-muted-foreground">The process of booking and gifting experiences</p>
                  </Link>
                  <Link to="/testimonials" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Testimonials</div>
                    <p className="text-sm text-muted-foreground">What our customers say about us</p>
                  </Link>
                  <Link to="/careers" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Careers</div>
                    <p className="text-sm text-muted-foreground">Join our growing team</p>
                  </Link>
                  <Link to="/press" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Press</div>
                    <p className="text-sm text-muted-foreground">Media coverage and press releases</p>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("text-sm font-medium transition-colors flex items-center", isScrolled || !isDarkPage ? "text-gray-800 dark:text-gray-200" : "text-white")}>
                  Support
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[400px] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/contact" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Contact Us</div>
                    <p className="text-sm text-muted-foreground">Get in touch with our support team</p>
                  </Link>
                  <Link to="/faq" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">FAQ</div>
                    <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                  </Link>
                  <Link to="/gift-rules" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Gift Rules</div>
                    <p className="text-sm text-muted-foreground">Understanding our gifting policies</p>
                  </Link>
                  <Link to="/shipping" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Shipping</div>
                    <p className="text-sm text-muted-foreground">Information about delivery options</p>
                  </Link>
                  <Link to="/returns" className="block p-3 rounded-md hover:bg-accent">
                    <div className="font-medium">Returns</div>
                    <p className="text-sm text-muted-foreground">Our return and refund policy</p>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/gifting-guide" className={cn("text-sm font-medium transition-colors", isScrolled || !isDarkPage ? "text-gray-800 dark:text-gray-200" : "text-white")}>
              Gifting Guide
            </Link>
            <Link to="/gift-personalizer" className={cn("text-sm font-medium transition-colors", isScrolled || !isDarkPage ? "text-gray-800 dark:text-gray-200" : "text-white")}>
              Gift Personalizer
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSearch}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {isAuthenticated && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className={iconClass}>
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={iconClass}>
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/cart')}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View Cart
                    </DropdownMenuItem>
                    {itemCount > 0 && (
                      <DropdownMenuItem onClick={() => navigate('/checkout')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Checkout
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Please sign in to view your cart</p>
                    <Button onClick={handleSignIn} className="w-full">
                      Sign In
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/host-experience">
              <Button variant="default" className="hidden md:flex">
                Host an Experience
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={iconClass}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/cart')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu open={showLoginDropdown} onOpenChange={setShowLoginDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={iconClass}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleSignIn}>
                    <User className="mr-2 h-4 w-4" />
                    Sign in with Google
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/login')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <div 
        ref={searchRef}
        className={cn(
          "fixed inset-0 bg-white/80 backdrop-blur-sm transition-opacity z-50",
          searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="container max-w-2xl mx-auto pt-28 px-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="search"
              placeholder="Search for experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-12 w-full border border-input bg-white/90 backdrop-blur-sm px-3 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-4 py-6 text-lg rounded-xl"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button 
              type="button" 
              onClick={toggleSearch} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['Hot Air Balloon', 'Dining', 'Yacht', 'Spa Day', 'Adventure'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleNavigation(`/experiences?search=${encodeURIComponent(term)}`);
                  }}
                  className="px-3 py-1.5 bg-gray-100/80 backdrop-blur-sm rounded-full text-sm hover:bg-gray-200/80 cursor-pointer text-gray-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {searchQuery && (
            <div className="mt-8">
              <p className="text-sm text-gray-600 mb-3">Recent Searches</p>
              <div className="space-y-2">
                {['Adventure Tours', 'Luxury Dining', 'Spa Experiences'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleNavigation(`/experiences?search=${encodeURIComponent(term)}`);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100/80 backdrop-blur-sm text-gray-700 flex items-center"
                  >
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
