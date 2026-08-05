export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        <nav className="flex gap-6">
          <a href="#privacy" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#terms" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="#contact" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
