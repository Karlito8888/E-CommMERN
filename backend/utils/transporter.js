// backend/utils/transporter.js

import nodemailer from "nodemailer";

const createTransporter = () => {
  // Configuration du transporteur
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASS,
    },
  });

  // Vérification de la connexion
  transporter.verify((error) => {
    if (error) {
      console.error("Erreur de configuration du transporteur :", error);
    } else {
      console.log("Transporteur prêt à envoyer des emails.");
    }
  });

  return transporter;
};

export default createTransporter;

