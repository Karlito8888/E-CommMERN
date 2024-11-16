import { useState, useEffect } from "react";
import { useGetCategoriesQuery } from "../../redux/features/categoriesApiSlice.js";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../redux/features/adminApiSlice.js";
import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";
import AdminMenu from "./AdminMenu";

const CategoryList = () => {
  const {
    data: categories,
    error,
    isLoading,
    refetch,
  } = useGetCategoriesQuery();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  useEffect(() => {
    if (error) {
      toast.error("Erreur lors de l'affichage des catégories");
    }
  }, [error]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    try {
      const result = await createCategory({ name }).unwrap();
      toast.success(`Création de la catégorie "${result.name}".`);
      setName("");
      await refetch();
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!updatingName) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: {
          name: updatingName,
        },
      }).unwrap();

      toast.success(`La mise à jour de ${result.name} a été effectuée!`);
      setSelectedCategory(null);
      setUpdatingName("");
      setModalVisible(false);
      await refetch();
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();
      toast.success(`Suppression de ${selectedCategory.name}, Ok!`);
      setSelectedCategory(null);
      await refetch();
      setModalVisible(false);
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  if (isLoading) {
    return <div aria-live="polite">Loading...</div>;
  }

  return (
    <div className="category-list">
      <AdminMenu />
      <div className="category-content">
        <div className="category-title" id="category-title" tabIndex="0">
          Gestion des Catégories
        </div>
        <CategoryForm
          value={name}
          setValue={setName}
          handleSubmit={handleCreateCategory}
          isLoading={isCreating}
        />
        <br />
        <hr />
        <div
          className="category-buttons"
          role="group"
          aria-labelledby="category-title"
        >
          {categories
            ?.slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => (
              <div key={category._id}>
                <button
                  aria-label={`Sélectionner la catégorie ${category.name}`}
                  className="category-button"
                  onClick={() => {
                    setModalVisible(true);
                    setSelectedCategory(category);
                    setUpdatingName(category.name);
                  }}
                >
                  {category.name}
                </button>
              </div>
            ))}
        </div>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <CategoryForm
            value={updatingName}
            setValue={(value) => setUpdatingName(value)}
            handleSubmit={handleUpdateCategory}
            buttonText="Modifier"
            handleDelete={handleDeleteCategory}
            isLoading={isUpdating || isDeleting}
          />
        </Modal>
      </div>
    </div>
  );
};

export default CategoryList;
