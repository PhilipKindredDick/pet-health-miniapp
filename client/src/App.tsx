import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { SwipeablePages } from "@/components/SwipeablePages";
import bgImage from "@assets/c6f0cfbb-fa57-44f4-9ee8-af7405cefbc5_1774177102133.jpg";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            minHeight: "100dvh",
            width: "100%",
          }}
        >
          <SwipeablePages />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
