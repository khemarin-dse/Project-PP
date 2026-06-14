import { useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { Register, Login, AdminLogin, SALogin } from "./pages/Auth";
import { QuizQuestion, QuizResults, MajorDetail, MyResults } from "./pages/Quiz";
import { AdminDashboard, AdminUsers, AdminSettings } from "./pages/AdminPages";
import AdminChat from "./pages/AdminChat";
import { SADashboard, SAManagement, SAUsers, SAActivityLogs, SASettings } from "./pages/SAPages";
import Notifications from "./pages/Notifications";

const DASH_PAGES = [
  "admin-dashboard","admin-users","admin-settings","admin-chat",
  "sa-dashboard","sa-management","sa-users","sa-activitylogs","sa-settings",
];

export default function App() {
  const { page, isDarkMode } = useApp();

  const renderPage = () => {
    switch(page) {
      case "home":            return <Home />;
      case "about":           return <About />;
      case "contact":         return <Contact />;
      case "register":        return <Register />;
      case "login":           return <Login />;
      case "admin-login":     return <AdminLogin />;
      case "sa-login":        return <SALogin />;
      case "quiz-1":          return <QuizQuestion questionNum={1} />;
      case "quiz-2":          return <QuizQuestion questionNum={2} />;
      case "quiz-3":          return <QuizQuestion questionNum={3} />;
      case "quiz-4":          return <QuizQuestion questionNum={4} />;
      case "quiz-5":          return <QuizQuestion questionNum={5} />;
      case "quiz-results":    return <QuizResults />;
      case "major-detail":    return <MajorDetail />;
      case "my-results":      return <MyResults />;
      case "notifications":   return <Notifications />;
      case "admin-dashboard": return <AdminDashboard />;
      case "admin-users":     return <AdminUsers />;
      case "admin-settings":  return <AdminSettings />;
      case "admin-chat":      return <AdminChat />;
      case "sa-dashboard":    return <SADashboard />;
      case "sa-management":   return <SAManagement />;
      case "sa-users":        return <SAUsers />;
      case "sa-activitylogs": return <SAActivityLogs />;
      case "sa-settings":     return <SASettings />;
      default:                return <Home />;
    }
  };

  const showNav = !DASH_PAGES.includes(page);

  return (
    <div className={isDarkMode ? "" : "light-mode"}>
      {showNav && <Navbar />}
      {renderPage()}
      <Toast />
    </div>
  );
}
