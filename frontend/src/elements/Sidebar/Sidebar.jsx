import { ChevronDown, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "../../components/common";
import useSidebar from "../../hooks/sidebar/useSidebar";

export default function Sidebar({ setLogoutPopup }) {
  const {
    items,
    getChildren,
    isActive,
    isDropdownOpen,
    closeSidebar,
    toggleDropdown,
  } = useSidebar();

  return (
    <div className="relative flex h-full w-full flex-col bg-sidebar px-4.5 py-8 text-[#d9e0f3]">
      <div className="flex items-center justify-between px-2 text-white">
        <Logo />
        <button type="button" className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden" onClick={closeSidebar} aria-label="Close navigation">
          <X size={22} />
        </button>
      </div>

      <nav className="scrollbar-thin mt-12 flex-1 space-y-2 overflow-y-auto" aria-label="TaskFlow pages">
        {items.map((item) => {
          const children = getChildren(item);
          const hasDropdown = children.length > 0;
          const active = isActive(item);
          const open = isDropdownOpen(item);

          return (
            <div key={item.name}>
              <NavLink
                to={item.path || "#"}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-4 rounded-[11px] px-4 py-3.75 text-[15px] font-medium transition ${active ? "bg-primary text-white shadow-lg shadow-primary/10" : "hover:bg-white/7"}`}
                onClick={(event) => {
                  if (hasDropdown) {
                    event.preventDefault();
                    toggleDropdown(item.name);
                  } else {
                    closeSidebar();
                  }
                }}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {hasDropdown && <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
              </NavLink>

              {open && children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={closeSidebar}
                  className={({ isActive: childActive }) => `ml-auto flex w-[89%] items-center border-l-2 py-2 pl-4 text-sm transition ${childActive ? "border-primary text-white" : "border-white/15 text-[#aeb8d0] hover:border-white/40 hover:text-white"}`}
                >
                  {child.name}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <button type="button" onClick={() => setLogoutPopup(true)} className="mt-5 flex w-full items-center gap-4 rounded-[11px] px-4 py-3.75 text-left text-[15px] font-medium transition hover:bg-white/7 hover:text-white">
        <LogOut size={19} strokeWidth={1.8} />
        <span>Logout</span>
      </button>
    </div>
  );
}
