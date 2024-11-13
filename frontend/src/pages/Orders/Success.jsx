import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGetSessionQuery } from "../../redux/features/services/paymentService";
import { useDispatch } from "react-redux";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const Success = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Récupère l'ID de la session depuis l'URL
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  // Utilise l'API pour récupérer les informations de la session
  const { data, error, isLoading } = useGetSessionQuery(sessionId, {
    skip: !sessionId, // Ne lance la requête que si le sessionId est disponible
  });

  // Efface les éléments du panier après un achat réussi
  useEffect(() => {
    if (data && !isLoading) {
      dispatch(clearCartItems());
    }
    if (error) {
      console.error("Erreur lors de la récupération de la session :", error);
    }
  }, [data, error, isLoading, dispatch]);

  // Affichage pendant le chargement des données
  if (isLoading) {
    return <p>Chargement des informations de paiement...</p>;
  }

  // Accéder aux informations de la session depuis l'objet data
  const totalPrice = data?.amount_total / 100; // Le total est en centimes, donc diviser par 100
  const customerName = data?.customer_details?.name;
  const customerEmail = data?.customer_email;
  const shippingAddress = data?.metadata?.shippingAddress
    ? JSON.parse(data.metadata.shippingAddress)
    : null;
  const sessionCreationDate = data?.created;

  // Formater la date de création de la session
  const formattedDate = sessionCreationDate
    ? new Date(sessionCreationDate * 1000).toLocaleString()
    : null;

  return (
    <section>
      <header>
        <h1>La transaction a bien été effectuée !</h1>
      </header>
      <br />
      <article>
        {data ? (
          <>
            <p>
              <strong>Date de la transaction :</strong> {formattedDate}
            </p>
            <br />
            <div>
              <p>
                Votre paiement a été traité avec succès. Merci pour votre achat
                !
              </p>
              <br />
              <p>
                <strong>Prix total :</strong> {totalPrice} EUR
              </p>
              <br />
              <p>
                <strong>Votre email :</strong> {customerEmail}
              </p>

              <p>
                Un mail de confirmation ainsi que votre facture vont vous être
                envoyés.
              </p>
              <br />
              <div>
                <strong>Adresse de livraison :</strong>
                <p>{customerName}</p>
                {shippingAddress ? (
                  <address>
                    <p>{shippingAddress.address}</p>
                    <p>
                      {shippingAddress.postalCode}, {shippingAddress.city}
                    </p>
                    <p>{shippingAddress.country}</p>
                  </address>
                ) : (
                  <p>Aucune adresse de livraison fournie.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>
            Désolé, nous n'avons pas pu récupérer les détails de votre paiement.
          </p>
        )}
      </article>
    </section>
  );
};

export default Success;
