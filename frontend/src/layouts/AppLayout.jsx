import { Outlet } from "react-router-dom";
import dayjs from "dayjs";
import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Sun,
  LogOut,
  UserRound,
} from "lucide-react";
import { Avatar, ConfirmModal } from "../components/common";
import SearchInput from "../components/SearchInput";
import Sidebar from "../elements/Sidebar";
import useAppLayout from "../hooks/layout/useAppLayout";

export default function AppLayout() {
  const {
    navigate,
    theme,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    logoutPopup,
    setLogoutPopup,
    user,
    notifications,
    noticeOpen,
    setNoticeOpen,
    profileOpen,
    setProfileOpen,
    query,
    setQuery,
    resultsOpen,
    setResultsOpen,
    results,
    unread,
    toggleColorMode,
    readAllNotifications,
    chooseResult,
    handleLogout,
    readNotification,
  } = useAppLayout();
  return (
    <div className="app-shell flex min-h-screen">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-58.75 transform overflow-hidden transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar setLogoutPopup={setLogoutPopup} />
      </aside>
      <div className="min-w-0 flex-1 lg:ml-58.75">
        <header className="topbar sticky top-0 z-30 flex h-22 items-center gap-3 border-b border-[#e7ebf3] bg-white px-4 sm:px-8">
          <button
            className="rounded-lg p-2 hover:bg-[#f3f5fa] lg:hidden"
            onClick={openSidebar}
          >
            <Menu />
          </button>
          <div className="relative w-full max-w-120">
            <SearchInput
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setResultsOpen(true);
              }}
              onFocus={() => setResultsOpen(true)}
              inputClassName="border-0 bg-[#f3f5fa]"
              placeholder="Search tasks, projects, or people..."
            />
            {resultsOpen && query && (
              <div className="surface absolute top-14.5 left-0 w-full overflow-hidden shadow-xl">
                {results.length ? (
                  results.map((r) => (
                    <button
                      key={`${r.kind}-${r.id}`}
                      onClick={() => chooseResult(r)}
                      className="flex w-full items-center justify-between border-b border-[#edf0f5] px-4 py-3 text-left last:border-0 hover:bg-[#f7f8fc]"
                    >
                      <span className="font-semibold">{r.title}</span>
                      <span className="text-xs text-muted">{r.kind}</span>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-sm text-muted">No matches found</p>
                )}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button
              className="rounded-full p-2 text-[#6f7d98] hover:bg-[#f2f4fa]"
              onClick={toggleColorMode}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="relative">
              <button
                className="relative rounded-full p-2 text-[#6f7d98] hover:bg-[#f2f4fa]"
                onClick={() => {
                  setNoticeOpen(!noticeOpen);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff496c]" />
                )}
              </button>
              {noticeOpen && (
                <div className="surface absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))]  shadow-xl">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-bold">Notifications</h3>
                    <button
                      className="text-xs font-semibold text-primary"
                      onClick={readAllNotifications}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="mt-2">
                    {notifications.length ? (
                      notifications.map((n) => (
                        <div
                          onClick={() => readNotification(n.id)}
                          key={n.id}
                          className="border-b border-[#edf0f5] p-4 last:border-0 hover:bg-[#f2f4fa] cursor-pointer"
                        >
                          <div className="flex gap-2">
                            <span
                              className={`mt-1.5 h-2 w-2 rounded-full ${n.read ? "bg-[#cad2e0]" : "bg-primary"}`}
                            />
                            <div>
                              <p className="text-sm font-bold">{n.title}</p>
                              <p className="mt-1 text-xs leading-5 text-muted">
                                {n.message}
                              </p>
                              <p className="mt-1 text-[11px] text-muted">
                                {n.createdAt
                                  ? dayjs(n.createdAt).format(
                                      "MMM D, YYYY h:mm A",
                                    )
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-6 text-center text-sm text-muted">
                        No notifications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-2 text-left"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNoticeOpen(false);
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="h-10 w-10 rounded-full"
                    alt=""
                  />
                ) : (
                  <Avatar
                    member={{
                      name: user?.name,
                      avatar: user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join(""),
                    }}
                    size={44}
                  />
                )}

                <span className="hidden md:block">
                  <strong className="block text-sm">
                    {user?.name || user?.email || ""}
                  </strong>
                  <span className="text-xs text-muted">
                    {user?.role || user?.jobTitle || user?.access || ""}
                  </span>
                </span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="surface absolute right-0 top-14 w-48 p-2 shadow-xl">
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#f3f5fa]"
                    onClick={() => navigate("/profile")}
                  >
                    <UserRound size={16} />
                    My Profile
                  </button>
                  {/* <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#ef476f] hover:bg-[#fff1f4]"
                    onClick={() => setLogoutPopup(true)}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page-bg min-h-[calc(100vh-88px)] p-4 sm:p-7 lg:px-9.5 lg:py-9">
          <Outlet />
        </main>
      </div>
      <ConfirmModal
        open={logoutPopup}
        onClose={() => setLogoutPopup(false)}
        onConfirm={handleLogout}
        title="Are you sure you want to logout?"
        body="You will need to sign in again to access TaskFlow."
        confirmLabel="Logout"
      />
    </div>
  );
}
