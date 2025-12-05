import { hideSplashScreen } from "@/src/config/splash-screen";
import { useCheckAuth } from "@/src/http/generated/auth/auth";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { data: checkAuth, isLoading: isLoadingCheckAuth } = useCheckAuth();
  const { data: user, isLoading: isLoadingUser } = useGetAuthenticatedUser({
    query: {
      enabled: checkAuth?.isAuthenticated === true,
    },
  });
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (isLoadingCheckAuth || isLoadingUser) return;

    if (checkAuth?.isAuthenticated) {
      if (user?.data.ambulance) {
        router.replace("/protected/app/chat");
      } else {
        router.replace({
          pathname: "/protected/onboarding",
        });
      }

      hideSplashScreen();
      return;
    }

    router.replace("/public/sign-in");
    hideSplashScreen();
  }, [rootNavigationState?.key, isLoadingCheckAuth, isLoadingUser]);

  return null;
}
