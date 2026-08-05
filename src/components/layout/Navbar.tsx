import { Link } from "@tanstack/react-router";
import { FileText, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "How it Works", to: "/" as const, hash: "how-it-works" },
  { label: "Features", to: "/" as const, hash: "features" },
  { label: "Pricing", to: "/" as const, hash: "pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </span>
          ResumeAI
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              hash={link.hash}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/dashboard">Get Started</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm">
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
