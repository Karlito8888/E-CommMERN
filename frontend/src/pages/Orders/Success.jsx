import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Success = () => {
  const location = useLocation();

  useEffect(() => {
    // Récupérez l'ID de la session à partir de l'URL
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session_id");

    if (sessionId) {
      // Faites un appel à l'API pour récupérer la session et afficher l'état du paiement
      fetch(`/api/payment/session/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          // Traitez les données de la session ici (par exemple, afficher le succès)
        })
        .catch((error) => console.error(error));
    }
  }, [location]);

  return (
    <div>
      <h1>Payment Successful</h1>
      <p>
        Your payment was successfully processed. Thank you for your purchase!
      </p>
    </div>
  );
};

export default Success;
