import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export function Header() {
  return (
    <header className="w-full border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">EO Predictor</h1>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="https://github.com/developmentseed/eo-predictor"
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
