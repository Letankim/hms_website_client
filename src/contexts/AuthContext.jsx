import { createContext, useState, useEffect, useCallback } from "react";
import apiAuthService from "services/apiAuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldLogout, setShouldLogout] = useState(false);

  const getTokenExpiration = useCallback((token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000;
    } catch (err) {
      return null;
    }
  }, []);

  const isTokenNearingExpiry = useCallback(
    (token) => {
      const expirationTime = getTokenExpiration(token);
      if (!expirationTime) return true;
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000;
      return expirationTime - currentTime < bufferTime;
    },
    [getTokenExpiration]
  );

  const refreshAccessToken = useCallback(async (currentUser) => {
    if (!currentUser || !currentUser.refreshToken) {
      await logout();
      return null;
    }
    try {
      const response = await apiAuthService.refreshToken(
        currentUser.refreshToken
      );
      if (response.status === "Success") {
        const updatedUser = {
          ...currentUser,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken || currentUser.refreshToken,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser.accessToken;
      } else {
        await logout();
        return null;
      }
    } catch (err) {
      await logout();
      return null;
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (
        parsedUser.accessToken &&
        isTokenNearingExpiry(parsedUser.accessToken)
      ) {
        refreshAccessToken(parsedUser);
      }
    }
    setLoading(false);
  }, [isTokenNearingExpiry, refreshAccessToken]);

  useEffect(() => {
    if (!user || !user.accessToken) return;

    const checkAndRefresh = async () => {
      if (isTokenNearingExpiry(user.accessToken)) {
        await refreshAccessToken(user);
      }
    };

    checkAndRefresh();
    const interval = setInterval(checkAndRefresh, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, isTokenNearingExpiry, refreshAccessToken]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiAuthService.login(email, password);
      if (response.status === "Success") {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setShouldLogout(false);
        return { success: true };
      } else {
        throw new Error(response?.message || "Login failed");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      setShouldLogout(true);
      return { success: false, message: err?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiAuthService.register(email, password);
      if (response.status === "Success") {
        return { success: true };
      } else {
        throw new Error(response.message || "Register failed");
      }
    } catch (err) {
      return { success: false, message: err.message || "Register failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiAuthService.logout();
    } catch (err) {}
    setUser(null);
    localStorage.removeItem("user");
    setShouldLogout(true);
  };

  const googleLogin = async (googleToken) => {
    setLoading(true);
    try {
      const response = await apiAuthService.googleLogin(googleToken);
      if (response.status === "Success") {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setShouldLogout(false);
        return { success: true };
      } else {
        throw new Error(response.message || "Google login failed");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      setShouldLogout(true);
      return { success: false, message: err.message || "Google login failed" };
    } finally {
      setLoading(false);
    }
  };

  const facebookLogin = async (facebookToken) => {
    setLoading(true);
    try {
      const response = await apiAuthService.facebookLogin(facebookToken);
      if (response.status === "Success") {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setShouldLogout(false);
        return { success: true };
      } else {
        throw new Error(response.message || "Facebook login failed");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      setShouldLogout(true);
      return {
        success: false,
        message: err.message || "Facebook login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(permission) || user.roles.includes("Admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        shouldLogout,
        login,
        logout,
        register,
        refreshAccessToken,
        googleLogin,
        facebookLogin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
