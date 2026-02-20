import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="h-10 border-t border-border flex items-center justify-between px-6 text-xs text-muted-foreground bg-card/50">
      <div className="flex items-center gap-4">
        <span>Data last updated: Feb 19, 2026 – 11:42 AM</span>
        <span className="text-border">|</span>
        <span>v1.0.0</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Leaf className="w-3 h-3 text-primary" />
        <span>GreenIndex Campus Sustainability OS</span>
        <span className="text-border">|</span>
        <a 
          href="mailto:sustainability@campus.edu" 
          className="hover:text-primary transition-colors cursor-pointer"
        >
          sustainability@campus.edu
        </a>
      </div>
    </footer>
  );
}
