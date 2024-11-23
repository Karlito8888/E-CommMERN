import Podium from "../components/Podium";
import ProductCarousel from "./Products/ProductCarousel";

const Home = () => {
  return (
    <div className="home-container">
      <Podium />
      <ProductCarousel />
    </div>
  );
};

export default Home;
