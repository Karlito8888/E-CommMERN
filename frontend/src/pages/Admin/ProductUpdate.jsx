import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

const AdminProductUpdate = () => {
  const params = useParams();
  const { data: productData } = useGetProductByIdQuery(params._id);
  console.log(productData);

  const [product, setProduct] = useState({
    image: "",
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    brand: "",
    stock: "",
  });

  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (productData) {
      setProduct({
        image: productData.image,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category?._id,
        quantity: productData.quantity,
        brand: productData.brand,
        stock: productData.countInStock,
      });
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully");
      setProduct((prev) => ({ ...prev, image: res.image }));
    } catch (err) {
      toast.error("Image upload failed. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting product update:", product);

    try {
      if (!product.name || !product.price || !product.category) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const data = await updateProduct({
        productId: params._id,
        formData: product,
      }).unwrap();
      console.log("Update response:", data);

      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Product successfully updated");
        navigate("/admin/allproductslist");
      }
    } catch (err) {
      console.error("Update error:", err); 
      toast.error(err?.data?.message || "Product update failed. Try again.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const { data } = await deleteProduct(params._id).unwrap();
      if (data && data.name) {
        toast.success(`"${data.name}" is deleted`); // Utilisez le nom du produit s'il est disponible
      } else {
        toast.success("Product deleted successfully.");
      }
      navigate("/admin/allproductslist");
    } catch (err) {
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
          {product.image.name || "Upload image"}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={uploadFileHandler}
          />
        </label>

        <div className="form-group half-width">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
        </div>

        <div className="form-group half-width">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
        </div>

        <div className="form-group half-width">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            min="1"
            value={product.quantity}
            onChange={(e) =>
              setProduct({ ...product, quantity: e.target.value })
            }
          />
        </div>

        <div className="form-group half-width">
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            value={product.brand}
            onChange={(e) => setProduct({ ...product, brand: e.target.value })}
          />
        </div>

        <label htmlFor="">Description</label>
        <textarea
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />

        <div className="form-group half-width">
          <label htmlFor="stock">Count In Stock</label>
          <input
            type="text"
            value={product.stock}
            onChange={(e) => setProduct({ ...product, stock: e.target.value })}
          />
        </div>

        <div className="form-group half-width">
          <label htmlFor="">Category</label>
          <select
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
          >
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="buttons">
          <button onClick={handleSubmit} className="update">
            Update
          </button>
          <button onClick={handleDelete} className="delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductUpdate;
