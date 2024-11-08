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
  const navigate = useNavigate();
  const { _id: productId } = useParams();
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
      toast.success("Image téléchargée avec succès");
      setProduct((prev) => ({ ...prev, image: res.image }));
    } catch {
      toast.error("Échec du téléchargement de l'image. Veuillez réessayer.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.category) {
      toast.error("Veuillez remplir tous les champs requis.");
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
        toast.success("Produit mis à jour avec succès");
        navigate("/admin/productlist");
      }
    } catch {
      toast.error("Échec de la mise à jour du produit. Veuillez réessayer.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;

    try {
      deleteProduct(productId).unwrap();
      toast.success("Produit supprimé avec succès.");
      navigate("/admin/productlist");
    } catch {
      toast.error("Échec de la suppression. Veuillez réessayer.");
    }
  };

  return (
    <div className="product-update-container admin-product-update">
      <AdminMenu />
      <div className="update-delete">
        <div className="header">Mettre à jour / Supprimer le produit</div>
        {product.image && (
          <div className="image-container">
            <img src={product.image} alt="produit" loading="lazy" />
          </div>
        )}
        <label className="upload-button">
          {product.image?.name || "Télécharger une image"}
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
                {field === "name"
                  ? "Nom"
                  : field === "price"
                  ? "Prix"
                  : field === "quantity"
                  ? "Quantité"
                  : field === "brand"
                  ? "Marque"
                  : field === "description"
                  ? "Description"
                  : "Stock"}
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
                  readOnly={field === "stock"}
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
              Sélectionner une catégorie
            </option>
            {categories.map(({ _id, name }) => (
              <option key={_id} value={_id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleSubmit} className="submit-button">
          Mettre à jour
        </button>
        <button onClick={handleDelete} className="delete-button">
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default ProductUpdate;