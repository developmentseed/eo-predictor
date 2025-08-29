import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { AboutDialog } from "@/components/About";
import { Satellite } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 gap-2">
          <Satellite />
          <h1 className="text-xl font-bold">EO Predictor</h1>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <AboutDialog>
                <NavigationMenuLink className="cursor-pointer">
                  About
                </NavigationMenuLink>
              </AboutDialog>
            </NavigationMenuItem>
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
