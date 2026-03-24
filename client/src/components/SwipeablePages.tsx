import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocation, Switch, Route } from "wouter";
import { Navigation } from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import PetList from "@/pages/PetList";
import PetDetails from "@/pages/PetDetails";
import CalendarPage from "@/pages/CalendarPage";
import SettingsPage from "@/pages/SettingsPage";

const pages = [
  { path: "/", Component: Dashboard },
  { path: "/pets", Component: PetList },
  { path: "/calendar", Component: CalendarPage },
  { path: "/settings", Component: SettingsPage },
];

export function SwipeablePages() {
  const [location, setLocation] = useLocation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: false,
    watchDrag: true,
  });

  const getPageIndex = useCallback((loc: string) => {
    if (loc.startsWith("/pets/")) return -1;
    const idx = pages.findIndex((p) => p.path === loc);
    return idx >= 0 ? idx : -1;
  }, []);

  const isSwipeable = getPageIndex(location) >= 0;

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      const target = pages[idx].path;
      if (location !== target) {
        setLocation(target);
      }
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, location, setLocation]);

  useEffect(() => {
    if (!emblaApi || !isSwipeable) return;
    const idx = getPageIndex(location);
    if (idx >= 0 && idx !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(idx, false);
    }
  }, [emblaApi, location, isSwipeable, getPageIndex]);

  const handleNavigate = useCallback((path: string) => {
    const idx = getPageIndex(path);
    if (idx >= 0 && emblaApi) {
      emblaApi.scrollTo(idx);
    }
    setLocation(path);
  }, [emblaApi, getPageIndex, setLocation]);

  if (!isSwipeable) {
    return (
      <>
        <Switch>
          <Route path="/pets/:id" component={PetDetails} />
        </Switch>
        <Navigation onNavigate={handleNavigate} />
      </>
    );
  }

  return (
    <>
      <div className="h-screen overflow-hidden" ref={emblaRef} data-testid="swipeable-container">
        <div className="flex h-full">
          {pages.map(({ path, Component }) => (
            <div
              key={path}
              className="flex-[0_0_100%] min-w-0 h-full overflow-y-auto"
            >
              <Component />
            </div>
          ))}
        </div>
      </div>
      <Navigation onNavigate={handleNavigate} />
    </>
  );
}
