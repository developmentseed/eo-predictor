import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  lastUpdated?: string;
}

function formatLastUpdated(lastUpdated: string): string {
  const date = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    return "Less than 1 hour ago";
  }
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="w-full border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">EO Predictor</h1>
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#about">About</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
