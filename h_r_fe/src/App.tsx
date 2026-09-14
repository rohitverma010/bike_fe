import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Homestays from "./pages/Homestays";
import HomestayDetail from "./pages/HomestayDetail";
import Bikes from "./pages/Bikes";
import BikeDetail from "./pages/BikeDetail";
import BookHomestay from "./pages/BookHomestay";
import BookBike from "./pages/BookBike";
import Confirmation from "./pages/Confirmation";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="homestays" element={<Homestays />} />
            <Route path="homestay/:id" element={<HomestayDetail />} />
            <Route path="bikes" element={<Bikes />} />
            <Route path="bike/:id" element={<BikeDetail />} />

            <Route
              path="book/homestay/:id"
              element={
                <RequireAuth>
                  <BookHomestay />
                </RequireAuth>
              }
            />
            <Route
              path="book/bike/:id"
              element={
                <RequireAuth>
                  <BookBike />
                </RequireAuth>
              }
            />
            <Route
              path="confirmation/:id"
              element={
                <RequireAuth>
                  <Confirmation />
                </RequireAuth>
              }
            />
            <Route
              path="my-bookings"
              element={
                <RequireAuth>
                  <MyBookings />
                </RequireAuth>
              }
            />

            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
