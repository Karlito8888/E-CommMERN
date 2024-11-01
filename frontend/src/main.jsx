import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import './assets/styles/index.css'

import App from './App.jsx'
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import PrivateRoute from './components/PrivateRoute.jsx';
import Profile from './pages/User/Profile.jsx';

import AdminRoute from './pages/Admin/AdminRoute.jsx';
import UserList from './pages/Admin/UserList.jsx';
import CategoryList from './pages/Admin/CategoryList.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Registered users */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        {/* <Route path="/shipping" element={<Shipping />} /> */}
        {/* <Route path="/placeorder" element={<PlaceOrder />} /> */}
        {/* <Route path="/order/:id" element={<Order />} /> */}
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route path="userlist" element={<UserList />} />
        <Route path="categorylist" element={<CategoryList />} />
        {/* <Route path="productlist" element={<ProductList />} /> */}
        {/* <Route path="allproductslist" element={<AllProducts />} /> */}
        {/* <Route path="productlist/:pageNumber" element={<ProductList />} /> */}
        {/* <Route path="product/update/:_id" element={<ProductUpdate />} /> */}
        {/* <Route path="orderlist" element={<OrderList />} /> */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
