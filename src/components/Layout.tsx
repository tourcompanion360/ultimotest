import React, { useState, useEffect } from 'react';
import { Aperture, BarChart3, Images, HelpCircle, Settings, FileText, Menu, X, Share2, GraduationCap, User, Bot, LogOut, ChevronLeft, ChevronRight, Home, Grid3X3, FolderOpen, Users, MessageSquare, Headset, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAgency } from '@/contexts/AgencyContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TEXT } from '@/constants/text';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import { ThemeContext } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout = ({
  children,
  currentPage,
  onPageChange
}: LayoutProps) => {
  const { toast } = useToast();
  const { agencySettings } = useAgency();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Apply light theme on component mount
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }, []);

  const navigationItems = [{
    id: 'clients',
    label: 'Clients',
    icon: Users,
    description: 'Manage your clients'
  }, {
    id: 'projects',
    label: TEXT.NAVIGATION.PROJECTS,
    icon: Aperture,
    description: 'Manage your photo projects'
  }, {
    id: 'client-requests',
    label: TEXT.NAVIGATION.CLIENT_REQUESTS,
    icon: FileText,
    description: 'View and manage client requests'
  }, {
    id: 'media-library',
    label: TEXT.NAVIGATION.MEDIA_LIBRARY,
    icon: Images,
    description: 'Browse your media collection'
  }, {
    id: 'chatbots',
    label: 'Chatbots',
    icon: Bot,
    description: 'Configure AI chatbots'
  }, {
    id: 'support',
    label: TEXT.NAVIGATION.SUPPORT,
    icon: Headset,
    description: 'Get help and support'
  }, {
    id: 'settings',
    label: TEXT.NAVIGATION.SETTINGS,
    icon: Settings,
    description: 'Configure your settings'
  }];

  const toggleTheme = () => {
    setIsLightTheme(!isLightTheme);
    if (isLightTheme) {
      // Switch to dark theme
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      // Switch to light theme
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      navigate('/auth');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMobileMenuClick = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <ThemeContext.Provider value={{ isLightTheme, toggleTheme }}>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden bg-sidebar border-b border-sidebar-border">
          {/* Top row with logo and menu */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={agencySettings.agency_logo} 
                alt={`${agencySettings.agency_name} Logo`} 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-primary tracking-tight">{agencySettings.agency_name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-foreground rounded-lg transition-colors flex items-center justify-center hover:bg-accent"
                title={isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
                aria-label={isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
              >
                {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <NotificationBell />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground rounded-lg transition-colors flex items-center justify-center"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="absolute right-0 top-0 w-64 h-full bg-sidebar border-l border-sidebar-border flex flex-col animate-slide-in-right">
              {/* Mobile Logo */}
              <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={agencySettings.agency_logo} 
                    alt={`${agencySettings.agency_name} Logo`} 
                    className="w-8 h-8 object-contain flex-shrink-0"
                  />
                  <h1 className="text-2xl font-bold text-primary tracking-tight">{agencySettings.agency_name}</h1>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-foreground-secondary flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return <button 
                    key={item.id} 
                    onClick={() => handleMobileMenuClick(item.id)} 
                    className={`nav-item w-full flex items-center gap-3 ${currentPage === item.id ? 'active' : ''}`}
                    title={item.description}
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      <Icon size={20} className="flex-shrink-0" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>;
                })}
              </nav>

              {/* Mobile Sign Out */}
              <div className="p-4 border-t border-sidebar-border space-y-3">
                {user && (
                  <div className="px-3 py-2 bg-accent/50 rounded-lg mb-3">
                    <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                  </div>
                )}
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full justify-start text-red-600"
                >
                  <LogOut size={16} className="flex-shrink-0" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop Sidebar */}
          <div
            className={`hidden lg:flex bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
            onMouseEnter={() => setIsSidebarCollapsed(false)}
            onMouseLeave={() => setIsSidebarCollapsed(true)}
          >
            {/* Header Section - Clean and Simple */}
            <div className="p-4 border-b border-sidebar-border relative flex items-center justify-center h-20">
              {/* Logo - Always visible in the same position */}
              <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                <img
                  src={agencySettings.agency_logo}
                  alt={`${agencySettings.agency_name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Agency Name - Only visible when expanded */}
              <div className={`overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>
                <h1 className="text-lg font-bold text-primary tracking-tight whitespace-nowrap">
                  {agencySettings.agency_name}
                </h1>
              </div>
            </div>

            {/* Navigation - LOCKED HEIGHT */}
            <nav className="flex-1 p-3 space-y-1 min-h-0">
              <div className="h-full">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return <button 
                    key={item.id} 
                    onClick={() => onPageChange(item.id)} 
                    className={`nav-item w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentPage === item.id ? 'active' : 'hover:bg-accent/50'}`}
                    title={isSidebarCollapsed ? item.description : ''}
                  >
                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                      <Icon size={18} className="transition-transform group-hover:scale-110" />
                    </div>
                    <span 
                      className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
                        isSidebarCollapsed 
                          ? 'w-0 opacity-0 translate-x-2' 
                          : 'w-auto opacity-100 translate-x-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>;
                })}
              </div>
            </nav>

            {/* Bottom Section - LOCKED POSITION */}
            <div className="border-t border-sidebar-border bg-sidebar">
              {/* RIGID container - absolutely no movement allowed */}
              <div className="p-3 h-40 flex flex-col justify-end space-y-2 overflow-hidden">
                {/* User Info - Fixed position */}
                <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                  {user && (
                    <div className={`px-3 py-2 bg-accent/50 rounded-lg`}>
                      <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                    </div>
                  )}
                </div>
                
                {/* Sign Out - Fixed position */}
                <button 
                  onClick={handleSignOut}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-red-600`}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    <LogOut size={16} />
                  </div>
                  <span className={`font-medium transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
            {/* Desktop Header Bar - Clean */}
            <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-sidebar-border bg-background">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground capitalize">
                  {currentPage.replace('-', ' ')}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-foreground rounded-lg transition-colors flex items-center justify-center hover:bg-accent"
                  title={isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
                  aria-label={isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
                >
                  {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <NotificationBell />
              </div>
            </div>

            <main className="flex-1 p-1 sm:p-2 lg:p-3">
              {children}
            </main>
          </div>
        </div>

        {/* Notification Panel */}
        <NotificationPanel 
          isOpen={isNotificationPanelOpen} 
          onClose={() => setIsNotificationPanelOpen(false)} 
        />
      </div>
    </ThemeContext.Provider>
  );
};

export default Layout;