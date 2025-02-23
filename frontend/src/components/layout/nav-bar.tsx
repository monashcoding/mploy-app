// frontend/src/components/layout/nav-bar.tsx
import Logo from "@/components/layout/logo";
import SearchBar from "@/components/search/search-bar";
import {NavLinks, MobileSearch} from "./nav-bar-components";

// Server component
export default function NavBar() {
  return (
    <nav className="py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center min-h-14">
        <div className="lg:hidden w-full">
          <MobileSearch>
            <Logo />
          </MobileSearch>
        </div>
        <div className="hidden lg:flex flex-1 items-center">
          <Logo />
          <div className="w-full mx-52">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <NavLinks />
          </div>
        </div>
      </div>
    </nav>
  );
}
