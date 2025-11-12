import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
