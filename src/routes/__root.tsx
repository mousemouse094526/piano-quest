import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  notFoundComponent: () => (
    <p className="m-auto text-muted-foreground">
      ไม่พบหน้านี้ ·{' '}
      <Link to="/" className="underline">
        กลับไปเล่น
      </Link>
    </p>
  ),
  component: () => (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col px-4 py-8">
      <Outlet />
    </main>
  ),
});
