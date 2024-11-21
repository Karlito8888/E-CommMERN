import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "../../redux/features/auth/authSlice";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../redux/features/usersApiSlice";
import InputField from "../../components/auth/InputField";
import SubmitButton from "../../components/auth/SubmitButton";

const Profile = () => {
  const { data: userProfile, isLoading: loadingProfile } =
    useGetProfileQuery();
  // console.log("userProfile:", userProfile);
  const [username, setUserName] = useState(userProfile?.user?.username || "");
  const [email, setEmail] = useState(userProfile?.user?.email || "");
  const [password, setPassword] = useState("");
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useUpdateProfileMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (userProfile?.user) {
      setUserName(userProfile.user.username);
      setEmail(userProfile.user.email);
    }
  }, [userProfile]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      // Mettez à jour uniquement le nom d'utilisateur et l'email en vérifiant le mot de passe
      const res = await updateProfile({
        username,
        email,
        password, // Passer le mot de passe pour vérification
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success("Données mises à jour 👌");

      // Réinitialisez le mot de passe après une mise à jour réussie
      setPassword("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="profil-container">
      <div className="form-wrapper">
        <div className="form-container">
          <h2 className="form-title">Mettre à jour vos infos personnelles</h2>
          {loadingProfile ? (
            <div>Loading...</div>
          ) : (
            <form onSubmit={submitHandler}>
              <InputField
                id="username"
                label="Nom"
                type="text"
                placeholder="Votre nom"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                ariaRequired="true"
                ariaInvalid="false"
              />

              <InputField
                id="email"
                label="Adresse e-mail"
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ariaRequired="true"
                ariaInvalid="false"
              />

              <InputField
                id="password"
                label="Mot de passe"
                type="password"
                placeholder="Entrez votre mot de passe pour valider"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ariaRequired="true"
                ariaInvalid="false"
              />
              <p className="password-note">
                Le mot de passe ne peut pas être mis à jour ici.
              </p>

              <div className="form-actions">
                <SubmitButton isLoading={loadingUpdateProfile} text="Ok!" />
                <a href="/user-orders" className="btn-orders">
                  Mes commandes
                </a>
              </div>
              {loadingUpdateProfile && <div>Loading...</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
