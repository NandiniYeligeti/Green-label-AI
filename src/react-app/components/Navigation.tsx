import { Home, Search, History, Sparkles, User, ShoppingBasket } from 'lucide-react';
import { useLocation, Link } from 'react-router';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Scan' },
    { path: '/products', icon: Search, label: 'Products' },
    { path: '/basket', icon: ShoppingBasket, label: 'Basket' },
    { path: '/impact', icon: User, label: 'Impact' },
    { path: '/history', icon: History, label: 'History' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="glass-panel rounded-2xl flex justify-around items-center py-3 px-2 shadow-2xl bg-white/90 backdrop-blur-xl border border-white/40">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-300 relative ${isActive(item.path)
                ? 'text-emerald-600 scale-110'
                : 'text-gray-400 hover:text-emerald-500'
                }`}
            >
              <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'fill-current' : ''}`} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-all duration-300 ${isActive(item.path) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute -bottom-2'}`}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass bg-white/80 border-b border-emerald-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg text-white group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
              Green Label AI
            </span>
          </Link>

          <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-medium ${isActive(item.path)
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
