import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserByIdMutation,
  // useGetUserByIdQuery,
} from "../../redux/features/adminApiSlice.js";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const UserList = () => {
  const { data: userData, refetch, isLoading, error } = useGetUsersQuery();
  // const { data: users = [], refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [updateUser] = useUpdateUserByIdMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteHandler = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ?")) {
      try {
        await deleteUser(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const toggleEdit = (id, username, email) => {
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    try {
      await updateUser({
        id,
        username: editableUserName,
        email: editableUserEmail,
      });
      setEditableUserId(null);
      toast.success("Utilisateur mis à jour avec succès!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="user-list-container">
      <h1 className="user-list-title">Users</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="user-list-content">
          <AdminMenu />
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>ADMIN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userData?.users?.length > 0 ? (
                userData.users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>
                      {editableUserId === user._id ? (
                        <div className="input-group">
                          <input
                            type="text"
                            value={editableUserName}
                            onChange={(e) =>
                              setEditableUserName(e.target.value)
                            }
                            className="input-field"
                          />
                          <button
                            onClick={() => updateHandler(user._id)}
                            className="confirm-button"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      ) : (
                        <div className="user-info">
                          {user.username}{" "}
                          <button
                            onClick={() =>
                              toggleEdit(user._id, user.username, user.email)
                            }
                          >
                            <FaEdit className="edit-icon" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editableUserId === user._id ? (
                        <div className="input-group">
                          <input
                            type="text"
                            value={editableUserEmail}
                            onChange={(e) =>
                              setEditableUserEmail(e.target.value)
                            }
                            className="input-field"
                          />
                          <button
                            onClick={() => updateHandler(user._id)}
                            className="confirm-button"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      ) : (
                        <div className="user-info">
                          <a href={`mailto:${user.email}`}>{user.email}</a>{" "}
                          <button
                            onClick={() =>
                              toggleEdit(user._id, user.username, user.email)
                            }
                          >
                            <FaEdit className="edit-icon" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <FaCheck className="admin-true" />
                      ) : (
                        <FaTimes className="admin-false" />
                      )}
                    </td>
                    <td>
                      {!user.isAdmin && (
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className="delete-button"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;