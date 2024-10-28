import { isValidObjectId } from "mongoose";

function checkId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    // Utiliser le code d'état 400 pour une requête invalide
    return res
      .status(400)
      .json({ message: `Invalid Object ID: ${req.params.id}` });
  }
  next();
}

export default checkId;
