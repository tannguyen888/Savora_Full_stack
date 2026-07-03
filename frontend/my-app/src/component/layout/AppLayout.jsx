import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import BottomNav from "./BottonNav";
import PageTransition from "@/components/PageTransition";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background" style={{ overscrollBehavior: "none" }}>
      <AppHeader />
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8"
        style={{ overscrollBehavior: "none" }}
      >
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}