import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Video, ImageIcon, FileText, Users, Mail, LogOut, X, MessageSquare, Crown } from 'lucide-react';
import { API_ENDPOINTS } from '../../src/constant/api';

const ADMIN_SIDEBAR_EVENT = 'admin-sidebar:set-open';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      if (typeof customEvent.detail?.open === 'boolean') {
        setIsMobileOpen(customEvent.detail.open);
      }
    };

    window.addEventListener(ADMIN_SIDEBAR_EVENT, handler as EventListener);
    return () => window.removeEventListener(ADMIN_SIDEBAR_EVENT, handler as EventListener);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    if (!isMobileOpen) return;
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      setIsMobileOpen(false);
      navigate('/login');
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Products',
      path: '/admin/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: 'Categories',
      path: '/admin/categories',
      icon: <FolderTree className="w-5 h-5" />,
    },
    {
      title: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      title: 'Videos',
      path: '/admin/vedios',
      icon: <Video className="w-5 h-5" />,
    },
    {
      title: 'Banners',
      path: '/admin/banners',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      title: 'Testimonials',
      path: '/admin/testimonials',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      title: 'Leadership',
      path: '/admin/leaderships',
      icon: <Crown className="w-5 h-5" />,
    },
    {
      title: 'Blogs',
      path: '/admin/blogs',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Messages',
      path: '/admin/messages',
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  const isActive = useMemo(() => {
    const current = location.pathname;
    return (path: string) => current === path || current.startsWith(`${path}/`);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={
          `bg-white text-gray-800 w-72 min-h-screen flex flex-col overflow-y-auto shadow-lg ` +
          `fixed left-0 top-0 bottom-0 z-40 transform transition-transform duration-300 ease-out ` +
          `${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ` +
          `lg:static lg:translate-x-0`
        }
        aria-label="Admin sidebar"
      >
      {/* Logo */}
      <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col items-center justify-center flex-1">
        <img 
          src="/image/logo.png" 
          alt="Hamro Commerce Logo" 
              className="h-16 w-auto object-contain mb-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <div className="logo-fallback hidden flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <span className="text-white font-black text-2xl">HC</span>
          </div>
          <h1 className="text-xl font-bold text-center text-gray-800">Hamro Commerce</h1>
          <p className="text-gray-500 text-xs mt-1">Admin Panel</p>
        </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-base font-semibold ` +
                  (isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                }
              >
                <span className={isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 border-t border-gray-200">
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="truncate">Logout</span>
        </button>
      </div>

      </aside>
    </>
  );
};

export default Sidebar;
