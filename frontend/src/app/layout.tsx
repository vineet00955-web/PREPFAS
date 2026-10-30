import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'PrepFast | Smart Recipe Vault, Meal Planner & Grocery Generator',
  description:
    'Modern culinary assistant with automated recipe scraping, interactive drag-and-drop meal planning, and aisle-categorized grocery list generator with pantry stock deduction.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fdfbf7] text-stone-900 flex antialiased">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <main className="flex-1 pt-16 lg:pt-0 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

