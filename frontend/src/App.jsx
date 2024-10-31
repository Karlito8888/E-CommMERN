import { Outlet } from "react-router-dom";
import Navigation from "./pages/Auth/Navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <ToastContainer autoClose={2000} />
      <Navigation />
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
