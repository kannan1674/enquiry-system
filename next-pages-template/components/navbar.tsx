import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "./theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "./icons";

export const Navbar = () => {
  const searchInput = (
    <div className="relative">
      <input
        aria-label="Search"
        className="w-full px-3 py-2 text-sm bg-gray-100 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Search..."
        type="search"
      />
      <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base text-gray-400 pointer-events-none flex-shrink-0" />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden lg:inline-block">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">K</kbd>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand and Navigation */}
          <div className="flex items-center basis-1/5 sm:basis-full">
            <div className="flex items-center gap-3 max-w-fit">
              <NextLink className="flex justify-start items-center gap-1" href="/">
                <Logo />
                <p className="font-bold text-inherit">ACME</p>
              </NextLink>
            </div>
            <div className="hidden lg:flex gap-4 justify-start ml-2">
              {siteConfig.navItems.map((item) => (
                <div key={item.href} className="flex items-center">
                  <NextLink
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors data-[active=true]:text-blue-600 data-[active=true]:font-medium"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="hidden sm:flex basis-1/5 sm:basis-full justify-end">
            <div className="hidden sm:flex gap-2 items-center">
              <a href={siteConfig.links.twitter} title="Twitter" className="text-gray-500 hover:text-gray-700 transition-colors">
                <TwitterIcon className="text-default-500" />
              </a>
              <a href={siteConfig.links.discord} title="Discord" className="text-gray-500 hover:text-gray-700 transition-colors">
                <DiscordIcon className="text-default-500" />
              </a>
              <a href={siteConfig.links.github} title="GitHub" className="text-gray-500 hover:text-gray-700 transition-colors">
                <GithubIcon className="text-default-500" />
              </a>
              <ThemeSwitch />
            </div>
            <div className="hidden lg:flex ml-4">{searchInput}</div>
            <div className="hidden md:flex ml-4">
              <a
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-normal text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                href={siteConfig.links.sponsor}
              >
                <HeartFilledIcon className="text-red-500" />
                Sponsor
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden basis-1 pl-4 flex items-center gap-2">
            <a href={siteConfig.links.github} className="text-gray-500 hover:text-gray-700 transition-colors">
              <GithubIcon className="text-default-500" />
            </a>
            <ThemeSwitch />
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {searchInput}
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <div key={`${item}-${index}`}>
                <a
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    index === 2
                      ? "text-blue-600 bg-blue-50"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "text-red-600 bg-red-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  href="#"
                >
                  {item.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
