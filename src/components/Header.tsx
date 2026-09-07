import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { AboutDialog } from "@/components/About";
import { AoiUpload } from "@/components/AoiUpload";
import { Satellite } from "lucide-react";
import type { MapRef } from "react-map-gl/maplibre";

interface HeaderProps {
  mapRef: React.RefObject<MapRef | null>;
}

export function Header({ mapRef }: HeaderProps) {
  return (
    <header className="w-full border-b bg-background px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Satellite />
          <h1 className="text-xl font-bold">EO Predictor</h1>
        </div>
        <div className="flex w-full items-center justify-between gap-3 md:ml-auto md:w-auto md:justify-normal">
          <AoiUpload mapRef={mapRef} />
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
      </div>
    </header>
  );
}
