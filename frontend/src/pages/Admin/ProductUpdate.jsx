// frontend/src/pages/ProductUpdate.jsx

import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/features/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/features/categoriesApiSlice";

const ProductUpdate = () => {
  const { _id: productId } = useParams();
  const navigate = useNavigate();
  const { data: productData } = useGetProductByIdQuery(productId);
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [product, setProduct] = useState({
    image: "",
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    brand: "",
    stock: 0,
  });

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (productData && productData.data) {
      // Vérification additionnelle
      setProduct({
        image: productData.data.image || "",
        name: productData.data.name || "",
        description: productData.data.description || "",
        price: productData.data.price || "",
        category: productData.data.category || "",
        quantity: productData.data.quantity || "",
        brand: productData.data.brand || "",
        stock: productData.data.stock || 0,
      });
    }
  }, [productData]);


  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files) {
      const file = files[0];
      setProduct((prev) => ({ ...prev, image: file }));
      uploadFileHandler(file);
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadFileHandler = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully");
      setProduct((prev) => ({ ...prev, image: res.image }));
    } catch {
      toast.error("Image upload failed. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (value !== "") formData.append(key, value);
    });

    try {
      const data = await updateProduct({ productId, formData });

      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Product successfully updated");
        navigate("/admin/productlist");
      }
    } catch {
      toast.error("Product update failed. Try again.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully.");
      navigate("/admin/productlist");
    } catch {
      toast.error("Delete failed. Try again.");
    }
  };

  return (
    <div className="product-update-container admin-product-update">
      <AdminMenu />
      <div className="update-delete">
        <div className="header">Update / Delete Product</div>

        {product.image && (
          <div className="image-container">
            <img src={product.image} alt="product" />
          </div>
        )}

        <label className="upload-button">
          {product.image?.name || "Upload image"}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
          />
        </label>

        {["name", "price", "quantity", "brand", "description", "stock"].map(
          (field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {field === "description" ? (
                <textarea
                  name={field}
                  value={product[field]}
                  onChange={handleInputChange}
                />
              ) : (
                <input
                  type={
                    field === "price" ||
                    field === "quantity" ||
                    field === "stock"
                      ? "number"
                      : "text"
                  }
                  name={field}
                  value={product[field]}
                  onChange={handleInputChange}
                />
              )}
            </div>
          )
        )}

        <div className="form-group">
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map(({ _id, name }) => (
              <option key={_id} value={_id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleSubmit} className="submit-button">
          Update Product
        </button>
        <button onClick={handleDelete} className="delete-button">
          Delete Product
        </button>
      </div>
    </div>
  );
};

export default ProductUpdate;

