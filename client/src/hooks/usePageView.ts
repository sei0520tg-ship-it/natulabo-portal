import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function usePageView(pageName: string) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const logPageView = trpc.log.pageView.useMutation();

  useEffect(() => {
    if (!isAuthenticated) return;
    logPageView.mutate({ pageName, pageUrl: location });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName, location, isAuthenticated]);
}
