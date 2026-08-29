'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_MEGA } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useAppSelector } from '@/lib/store/store';

export function MegaMenu() {
  const pathname = usePathname();
  const { isActive } = useMenu(pathname || '/');
  const roleId = useAppSelector((state) => state.authState.user?.RoleId);
  const isAuthenticated = useAppSelector((state) => state.authState.isAuthenticated);
  const authLoading = useAppSelector((state) => state.authState.loading);
  

  const adminMenu = [
    { title: 'Dashboard', path: '/dashboard' },
    { title: 'User Listing', path: '/users-listing' },
    { title: 'Search Queries', path: '/search-queries' },
  ];

  const homeItem = MENU_MEGA[0];
  const aboutItem = MENU_MEGA[1];
  const howItem = MENU_MEGA[2];
  const contactItem = MENU_MEGA[3];
  const linkClass = `
    text-sm text-secondary-foreground font-medium rounded-none px-2 py-0 border-b border-transparent ml-4
    hover:text-blue-500 hover:bg-transparent 
    focus:text-blue-500 focus:bg-transparent 
    data-[active=true]:text-blue-500 data-[active=true]:border-b-2 data-[active=true]:border-blue-500  data-[active=true]:bg-transparent
    data-[state=open]:text-blue-500 data-[state=open]:bg-transparent
  `;

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/users-listing') || 
                     pathname?.startsWith('/search-queries');

  // Get role from cookies as fallback for new tabs
  const getRoleFromCookies = () => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(cookie => cookie.trim().startsWith('userRoleId='));
    return roleCookie ? parseInt(roleCookie.split('=')[1]) : null;
  };

  // Determine if we should show admin menu
  // Priority: Redux state > Cookie fallback > Admin page detection
  const shouldShowAdminMenu = () => {
    // If we have Redux state and it's loaded, use it
    if (typeof window !== 'undefined' && !authLoading) {
      if (isAuthenticated && roleId === 1) return true;
      if (isAuthenticated && roleId === 2) return false;
    }
    
    // Fallback to cookie check
    const cookieRole = getRoleFromCookies();
    if (cookieRole === 1) return true;
    if (cookieRole === 2) return false;
    
    // Last resort: if we're on an admin page, show admin menu
    if (isAdminPage) return true;
    
    return false;
  };

  const showAdminMenu = shouldShowAdminMenu();

  return (
    <NavigationMenu className="w-full flex justify-center ml-4">
      <NavigationMenuList className="gap-7.5 justify-center w-auto">
        {showAdminMenu ? (
          <>
            {adminMenu.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.path}
                    className={cn(linkClass)}
                    data-active={isActive(item.path) || undefined}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </>
        ) : (
          <>
            {/* Home Item */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href={homeItem.path || '/'}
                  className={cn(linkClass)}
                  data-active={isActive(homeItem.path || '/') || undefined}
                >
                  {homeItem.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {/* About Us Item */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href={aboutItem.path || '/about'}
                  className={cn(linkClass)}
                  data-active={isActive(aboutItem.path || '/about') || undefined}
                >
                  {aboutItem.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {/* How it Will Work Item */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href={howItem.path || '/'}
                  className={cn(linkClass)}
                  data-active={isActive(howItem.path) || undefined}
                >
                  {howItem.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {/* Contact Us Item */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href={contactItem.path || '/'}
                  className={cn(linkClass)}
                  data-active={isActive(contactItem.path) || undefined}
                >
                  {contactItem.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
