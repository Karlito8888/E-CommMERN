import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";
import {
  useCreateProductMutation,
  useUploadImageMutation,
} from "../../redux/features/adminApiSlice";
import { useGetCategoriesQuery } from "../../redux/features/categoriesApiSlice";

const ProductCreate = () => {
  const initialFormValues = {
    image: null,
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    brand: "",
    stock: 0,
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();
  const [uploadProductImage] = useUploadImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useGetCategoriesQuery();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const selectedFile = files[0];
      setFormValues((prev) => ({ ...prev, image: selectedFile }));
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const validateFormValues = () => {
    const { name, price, quantity, category, image } = formValues;
    if (!name || !price || !quantity || !category || !image) {
      toast.error("Veuillez remplir tous les champs.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormValues()) return;

    try {
      const uploadedImageUrl = await uploadImage(formValues.image);
      const productData = { ...formValues, image: uploadedImageUrl };
      const { data } = await createProduct(productData).unwrap();
      toast.success(`${data.name} a bien été créé !`);

      // Réinitialisation du formulaire
      setFormValues(initialFormValues);
      setImageUrl(null);
      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  const uploadImage = async (image) => {
    const imageFormData = new FormData();
    imageFormData.append("image", image);
    const uploadResponse = await uploadProductImage(imageFormData).unwrap();
    return uploadResponse.image; // Obtenez l'URL de l'image
  };

  const handleError = (error) => {
    console.error("Erreur lors de la création du produit :", error);
    toast.error("Échec de la création du produit. Veuillez réessayer.");
    if (error.data) {
      console.error("Détails de l'erreur :", error.data);
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
              <img
                src={imageUrl}
                alt="produit"
                className="product-image"
                loading="lazy"
              />
            </div>
          )}

          <div className="upload-image">
            <label className="upload-label">
              {formValues.image
                ? formValues.image.name
                : "Télécharger une image"}
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
            {["name", "price", "quantity", "brand", "description", "stock"].map(
              (field) => (
                <div className="input-group" key={field}>
                  <label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === "description" ? (
                    <textarea
                      name={field}
                      className="textarea-field"
                      value={formValues[field]}
                      onChange={handleInputChange}
                    ></textarea>
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
                      className="input-field"
                      value={formValues[field]}
                      onChange={handleInputChange}
                      readOnly={field === "stock"}
                    />
                  )}
                </div>
              )
            )}
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
