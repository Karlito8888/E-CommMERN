import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des données d'entrée
    if (!name || !price || !quantity || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock);

      const { data } = await createProduct(productData);

      if (data.error) {
        toast.error("Product creation failed. Try again.");
      } else {
        toast.success(`${data.name} has been created`);
        // Réinitialiser le formulaire après la création
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setQuantity("");
        setBrand("");
        setStock(0);
        setImage(null);
        setImageUrl(null);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product creation failed. Try again.");
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <div className="product-list-container">
      <div className="product-list-content">
        <AdminMenu />
        <div className="form-section">
          <h2>Create Product</h2>

          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="product" className="product-image" />
            </div>
          )}

          <div className="upload-image">
            <label className="upload-label">
              {image ? image.name : "Upload Image"}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                className="upload-input"
              />
            </label>
          </div>

          <div className="form-fields">
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                className="input-field"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                className="input-field"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                className="input-field"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <label htmlFor="description">Description</label>
            <textarea
              className="textarea-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <div className="input-group">
              <label htmlFor="stock">Count In Stock</label>
              <input
                type="text"
                className="input-field"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="category">Category</label>
              <select
                className="input-field"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;