import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getUser } from "../../redux/user";

// Shared across consumers so several mounted components trigger a single fetch
let profileRequest = null;

/**
 * Authenticated profile from the store, fetched once if it is not loaded yet.
 */
export const useCurrentUser = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);
  const profileReady = Boolean(userData?.roles);

  useEffect(() => {
    if (profileReady || profileRequest) return;

    profileRequest = Promise.resolve(dispatch(getUser())).finally(() => {
      profileRequest = null;
    });
  }, [dispatch, profileReady]);

  return { userData, profileReady };
};

export const useIsAdmin = () => {
  const { userData, profileReady } = useCurrentUser();

  return {
    isAdmin: userData?.roles?.[0]?.name === "admin",
    profileReady,
  };
};
