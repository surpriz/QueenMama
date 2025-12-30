import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '../protected-route';
import { BackToTop } from '../ui/BackToTop';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Mesh gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20 -z-10" />

        {/* Animated floating blobs */}
        <div className="fixed top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float -z-10" />
        <div
          className="fixed bottom-20 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float -z-10"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="fixed top-1/2 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float -z-10"
          style={{ animationDelay: '-5s' }}
        />

        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 relative z-0">
            {children}
          </main>
        </div>
        <BackToTop />
      </div>
    </ProtectedRoute>
  );
}
