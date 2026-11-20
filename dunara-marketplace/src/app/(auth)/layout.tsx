/**
 * Auth route group layout — minimal chrome (header/footer still from root).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[var(--color-canvas)]">{children}</div>;
}
