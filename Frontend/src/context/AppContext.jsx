import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getToken, setToken, clearToken, authApi } from "../data/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode]   = useState(true);
  const [toast, setToast]             = useState({ msg:"", type:"success", show:false });
  const [page, setPage]               = useState("home");
  const [quizAnswers, setQuizAnswers] = useState({1:0,2:0,3:0,4:0,5:0});
  const [loading, setLoading]         = useState(true);

  // On app load, restore session from saved token
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(user => setCurrentUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type, show:true });
    setTimeout(() => setToast(t => ({ ...t, show:false })), 3000);
  }, []);

  const login = useCallback((user, token) => {
    setToken(token);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch(_) {}
    clearToken();
    setCurrentUser(null);
  }, []);

  const toggleTheme = () => setIsDarkMode(d => !d);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",
      fontFamily:"'Space Grotesk',sans-serif",color:"rgba(255,255,255,0.5)",background:"#0f0a1e"}}>
      Loading…
    </div>
  );

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, login, logout,
      isDarkMode, toggleTheme,
      toast, showToast,
      page, setPage,
      quizAnswers, setQuizAnswers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
