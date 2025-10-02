// client/src/state/auth.js
// If you already have your own auth state, KEEP YOURS and ignore this file.
import React from "react";

const AuthContext = React.createContext({
  token: null,
  user: null,
  login: () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(
    () => localStorage.getItem("auth_token")
  );
  const [user, setUser] = React.useState(() => {
    const raw = localStorage.getItem("me");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem("auth_token", newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem("me", JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const value = React.useMemo(() => ({ token, user, login }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
