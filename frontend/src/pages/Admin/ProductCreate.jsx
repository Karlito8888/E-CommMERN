// frontend/src/pages/ProductCreate.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/features/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/features/categoriesApiSlice";

const ProductCreate = () => {
  const [formValues, setFormValues] = useState({
    image: null,
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    brand: "",
    stock: 0,
  });
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormValues((prev) => ({ ...prev, image: files[0] }));
      uploadFileHandler(files[0]);
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues) {
      toast.error("Les valeurs du formulaire sont indéfinies.");
      return;
    }
    console.log("Valeurs du formulaire avant soumission :", formValues);

    const { name, price, quantity, category, image } = formValues;

    // Validation des données d'entrée
    if (!name || !price || !quantity || !category || !image) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const productData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        productData.append(key, value);
        console.log(`Ajout de ${key} :`, value);
      });

      const { data } = await createProduct(productData).unwrap();
      toast.success(`${data.name} a bien été créé !`);

      // Réinitialisation du formulaire
      setFormValues({
        image: null,
        name: "",
        description: "",
        price: "",
        category: "",
        quantity: "",
        brand: "",
        stock: 0,
      });
      setImageUrl(null);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la création du produit :", error);
      toast.error("Échec de la création du produit. Veuillez réessayer.");
      if (error.data) {
        console.error("Détails de l'erreur :", error.data);
      }
    }
  };

  const uploadFileHandler = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      console.log("Réponse de téléchargement de l'image :", res);
      toast.success(res.message);
      setImageUrl(res.image);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image :", error);
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <div className="product-list-container">
      <div className="product-list-content">
        <AdminMenu />
        <div className="form-section">
          <h2>Créer un produit</h2>

          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="produit" className="product-image" />
            </div>
          )}

          <div className="upload-image">
            <label className="upload-label">
              {formValues.image ? formValues.image.name : "Télécharger une image"}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="upload-input"
              />
            </label>
          </div>

          <div className="form-fields">
            <div className="input-group">
              <label htmlFor="name">Nom</label>
              <input
                type="text"
                name="name"
                className="input-field"
                value={formValues.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="price">Prix</label>
              <input
                type="number"
                name="price"
                className="input-field"
                value={formValues.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="quantity">Quantité</label>
              <input
                type="number"
                name="quantity"
                className="input-field"
                value={formValues.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="brand">Marque</label>
              <input
                type="text"
                name="brand"
                className="input-field"
                value={formValues.brand}
                onChange={handleInputChange}
              />
            </div>
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              className="textarea-field"
              value={formValues.description}
              onChange={handleInputChange}
            ></textarea>
            <div className="input-group">
              <label htmlFor="stock">En stock</label>
              <input
                type="number"
                name="stock"
                className="input-field"
                value={formValues.stock}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="category">Catégorie</label>
              <select
                name="category"
                className="input-field"
                value={formValues.category}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Sélectionner une catégorie
                </option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleSubmit} className="submit-button">
              Soumettre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;
