import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage pour les logos d'entreprise
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/company-logos");

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique avec timestamp et extension originale
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `company-logo-${uniqueSuffix}${ext}`);
  },
});

// Configuration des filtres pour les types de fichiers
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accepter seulement les images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configuration multer
export const uploadCompanyLogo = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: fileFilter,
});

// Service pour supprimer un ancien logo
export const deleteOldLogo = (logoUrl: string): void => {
  try {
    if (logoUrl && logoUrl.includes("/uploads/")) {
      const filename = path.basename(logoUrl);
      const filePath = path.join(
        __dirname,
        "../../uploads/company-logos",
        filename
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du logo:", error);
  }
};

// Service pour construire l'URL complète du logo
export const buildLogoUrl = (filename: string, req: any): string => {
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/uploads/company-logos/${filename}`;
};
