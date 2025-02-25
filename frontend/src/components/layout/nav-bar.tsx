import Logo from "@/components/layout/logo";
import SearchBar from "@/components/search/search-bar";
import { NavBarMobile } from "./nav-bar-mobile";
import NavLinks from "./nav-links";

export default function NavBar() {
  return (
    <nav className="py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center min-h-14">
        {/* Mobile View */}
        <NavBarMobile />

        {/* Desktop View */}
        <div className="hidden lg:flex w-full justify-between items-center">
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
