"use client";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { cn } from "@/lib/cn";
import { useLang, setLang } from "@/hooks/use-lang";
import { BsJavascript, BsTypescript } from "react-icons/bs";

const langs = [
  { value: "TypeScript", label: "TypeScript", icon: <BsTypescript /> },
  { value: "JavaScript", label: "JavaScript", icon: <BsJavascript /> },
] as const;

export function LangSelector() {
  const lang = useLang();
  const current = langs.find((l) => l.value === lang)!;
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ color: "secondary", size: "sm" }),
          "gap-2 data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground",
        )}
      >
        {current.icon}
        {lang}
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {langs.map((item) => (
          <button
            key={item.value}
            onClick={() => setLang(item.value)}
            className={cn(
              "text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent",
              lang === item.value && "text-fd-accent-foreground bg-fd-accent",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function TS({ children }: { children: React.ReactNode }) {
  const lang = useLang();
  return lang === "TypeScript" ? <>{children}</> : null;
}

export function JS({ children }: { children: React.ReactNode }) {
  const lang = useLang();
  return lang === "JavaScript" ? <>{children}</> : null;
}