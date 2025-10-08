import { Request, Response } from "express";
import { companyService } from "../services/company.service.js";
import { sendResponse } from "../utils/response.js";
import { HttpStatus } from "../constants/httpStatus.js";
import {
  uploadCompanyLogo,
  buildLogoUrl,
  deleteOldLogo,
} from "../services/upload.service.js";

interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  status: "all" | "active" | "inactive";
}

export class CompanyController {
  async getAllCompanies(req: Request, res: Response) {
    try {
      const paginationParams: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder === "asc" ? "asc" : "desc") as
          | "asc"
          | "desc",
        search: (req.query.search as string) || "",
        status:
          (req.query.status as string) === "active" ||
          (req.query.status as string) === "inactive"
            ? (req.query.status as "active" | "inactive")
            : "all",
      };

      const result = await companyService.getAllCompanies(paginationParams);

      sendResponse(
        res,
        HttpStatus.OK,
        "Entreprises récupérées avec succès",
        result
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des entreprises"
      );
    }
  }

  async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      const company = await companyService.getCompanyById(id);

      sendResponse(
        res,
        HttpStatus.OK,
        "Entreprise récupérée avec succès",
        company
      );
    } catch (error: any) {
      if (error.message === "Entreprise non trouvée") {
        sendResponse(res, HttpStatus.NOT_FOUND, error.message);
      } else {
        sendResponse(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error.message || "Erreur lors de la récupération de l'entreprise"
        );
      }
    }
  }

  async createCompany(req: Request, res: Response) {
    try {
      const companyData = req.body;

      if (!companyData.name || !companyData.address) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Le nom et l'adresse de l'entreprise sont obligatoires"
        );
      }

      const company = await companyService.createCompany(companyData);

      sendResponse(
        res,
        HttpStatus.CREATED,
        "Entreprise créée avec succès",
        company
      );
    } catch (error: any) {
      if (error.message.includes("existe déjà")) {
        sendResponse(res, HttpStatus.CONFLICT, error.message);
      } else {
        sendResponse(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error.message || "Erreur lors de la création de l'entreprise"
        );
      }
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      const company = await companyService.updateCompany(id, updateData);

      sendResponse(
        res,
        HttpStatus.OK,
        "Entreprise mise à jour avec succès",
        company
      );
    } catch (error: any) {
      if (error.message === "Entreprise non trouvée") {
        sendResponse(res, HttpStatus.NOT_FOUND, error.message);
      } else {
        sendResponse(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error.message || "Erreur lors de la mise à jour de l'entreprise"
        );
      }
    }
  }

  async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      await companyService.deleteCompany(id);

      sendResponse(res, HttpStatus.OK, "Entreprise supprimée avec succès");
    } catch (error: any) {
      if (error.message === "Entreprise non trouvée") {
        sendResponse(res, HttpStatus.NOT_FOUND, error.message);
      } else {
        sendResponse(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error.message || "Erreur lors de la suppression de l'entreprise"
        );
      }
    }
  }

  async getCompanyStats(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "ID de l'entreprise requis"
        );
      }

      const stats = await companyService.getCompanyStats(id);

      sendResponse(
        res,
        HttpStatus.OK,
        "Statistiques récupérées avec succès",
        stats
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }

  async getMyCompany(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "Accès non autorisé");
      }

      const company = await companyService.getCompanyById(companyId);

      if (!company) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          "Entreprise non trouvée"
        );
      }

      sendResponse(
        res,
        HttpStatus.OK,
        "Entreprise récupérée avec succès",
        company
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération de l'entreprise"
      );
    }
  }

  async updateMyCompany(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { 
        name, 
        address, 
        phone, 
        email, 
        currency, 
        payPeriodType,
        themeType,
        themePreset,
        primaryColor,
        secondaryColor 
      } = req.body;

      if (!companyId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "Accès non autorisé");
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (currency !== undefined) updateData.currency = currency;
      if (payPeriodType !== undefined) updateData.payPeriodType = payPeriodType;
      
      // Champs de thème
      if (themeType !== undefined) updateData.themeType = themeType;
      if (themePreset !== undefined) updateData.themePreset = themePreset;
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
      if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;

      const updatedCompany = await companyService.updateCompany(
        companyId,
        updateData
      );

      sendResponse(
        res,
        HttpStatus.OK,
        "Entreprise mise à jour avec succès",
        updatedCompany
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la mise à jour de l'entreprise"
      );
    }
  }

  async uploadLogo(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "Accès non autorisé");
      }

      if (!req.file) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Aucun fichier fourni"
        );
      }

      // Récupérer l'ancien logo pour le supprimer
      const currentCompany = await companyService.getCompanyById(companyId);
      if (currentCompany?.logo) {
        deleteOldLogo(currentCompany.logo);
      }

      // Construire l'URL du nouveau logo
      const logoUrl = buildLogoUrl(req.file.filename, req);

      // Mettre à jour l'entreprise avec le nouveau logo
      const updatedCompany = await companyService.updateCompanyLogo(
        companyId,
        logoUrl
      );

      sendResponse(res, HttpStatus.OK, "Logo mis à jour avec succès", {
        company: updatedCompany,
        logoUrl: logoUrl,
      });
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de l'upload du logo"
      );
    }
  }
}

export const companyController = new CompanyController();
