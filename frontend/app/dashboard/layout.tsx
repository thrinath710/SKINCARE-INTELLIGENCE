'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  Search,
  FlaskConical,
  CalendarDays,
  ScanLine,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/search',
    label: 'Search',
    icon: Search,
  },
  {
    href: '/dashboard/analyze',
    label: 'Analyze',
    icon: FlaskConical,
  },
  {
    href: '/dashboard/routine',
    label: 'Routine',
    icon: CalendarDays,
  },
  {
    href: '/dashboard/scan',
    label: 'Scan',
    icon: ScanLine,
  },
  {
    href: '/dashboard/progress',
    label: 'Progress',
    icon: TrendingUp,
  },
  {
    href: '/dashboard/assistant',
    label: 'Assistant',
    icon: MessageSquare,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">

        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            SkincareIQ
          </h1>

          <p className="text-xs text-slate-400">
            Ingredient intelligence
          </p>
        </div>

        <nav className="flex flex-col gap-1">

          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {

            const active =
              pathname === href ||
              pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >

                <Icon className="h-4 w-4" />

                {label}

              </Link>
            );
          })}

        </nav>
      </aside>

      {/* Main Content */}
      <main className="pb-24 lg:ml-60 lg:pb-8">

        <div className="mx-auto max-w-4xl px-4 py-6">

          {children}

        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white lg:hidden">

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {

          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                active
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >

              <Icon
                className={`h-5 w-5 ${
                  active ? 'stroke-[2.5px]' : ''
                }`}
              />

              {label}

            </Link>
          );
        })}

      </nav>

    </div>
  );
}