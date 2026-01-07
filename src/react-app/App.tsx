import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import Products from "@/react-app/pages/Products";
import History from "@/react-app/pages/History";
import ProductDetail from "@/react-app/pages/ProductDetail";

import Impact from "@/react-app/pages/Impact";
import ShoppingBasket from "@/react-app/pages/ShoppingBasket";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/basket" element={<ShoppingBasket />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/history" element={<History />} />
        <Route path="/product/:barcode" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}
