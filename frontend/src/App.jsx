import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./pages/Auth/Navigation";
import Header from "./components/Header";

const App = () => {
  return (
    <>
      <Header />
      <Navigation />
        <main className="main">
          <Outlet />
      </main>
      <ToastContainer autoClose={2000} />
    </>
  );
};

export default App;
