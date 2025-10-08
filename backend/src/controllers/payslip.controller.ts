import { Request, Response } from "express";
import { payslipService } from "../services/payslip.service.js";
import { companyService } from "../services/company.service.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";
import { PayslipStatus } from "@prisma/client";
import PDFDocument from "pdfkit";

class PayslipController {
  // Obtenir les bulletins de paie d'une entreprise
  async getByCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      const { page = 1, limit = 10, status, payRunId } = req.query;

      const result = await payslipService.getByCompany(companyId, {
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        payRunId: payRunId as string,
      });

      sendResponse(
        res,
        HttpStatus.OK,
        "Bulletins de paie récupérés avec succès",
        result
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des bulletins:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des bulletins"
      );
    }
  }

  // Télécharger le bulletin au format PDF (généré à la volée)
  async download(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      const payslip = await payslipService.getById(id as string, companyId as string);
      if (!payslip) {
        return sendResponse(res, HttpStatus.NOT_FOUND, "Bulletin de paie non trouvé");
      }

      // Récupérer les infos de l'entreprise (nom + logo)
      let company = null;
      try {
        company = await companyService.getCompanyById(companyId as string);
      } catch (err) {
        // Ne pas bloquer si l'entreprise n'existe pas ou erreur
        company = null;
      }

      // Générer un PDF plus professionnel et inclure le logo si disponible
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=bulletin-${payslip.employee?.firstName || 'employee'}-${payslip.employee?.lastName || ''}.pdf`);

      // pipe before writing
      doc.pipe(res);

      // Header: logo + company name
      if (company?.logo) {
        try {
          const fetchRes = await fetch(company.logo);
          if (fetchRes.ok) {
            const arrayBuffer = await fetchRes.arrayBuffer();
            const imgBuffer = Buffer.from(arrayBuffer);
            // place logo left
            doc.image(imgBuffer, { fit: [80, 80], align: 'left' });
          }
        } catch (err) {
          // Ignore logo fetch errors
        }
      }

      doc.fontSize(18).text(company?.name || 'Entreprise', { align: 'left', continued: false });
      doc.moveDown(0.5);
      doc.fontSize(16).text('Bulletin de paie', { align: 'center' });
      doc.moveDown();

      // Employee & payrun details
      const periodText = payslip.payRun ? `${payslip.payRun.title || ''} (${payslip.payRun.periodStart ? payslip.payRun.periodStart.toISOString().slice(0,10) : ''} - ${payslip.payRun.periodEnd ? payslip.payRun.periodEnd.toISOString().slice(0,10) : ''})` : '';

      doc.fontSize(12).text(`Employé: ${payslip.employee?.firstName || ''} ${payslip.employee?.lastName || ''}`);
      doc.text(`Poste: ${payslip.employee?.position || 'N/A'}`);
      doc.text(`Période: ${periodText}`);
      doc.moveDown();

      // Salary summary
      doc.fontSize(12).text(`Salaire brut: ${payslip.grossAmount || 0}`);
      doc.text(`Total déductions: ${payslip.totalDeductions || 0}`);
      doc.text(`Salaire net: ${payslip.netAmount || 0}`);
      doc.moveDown();

      // Deductions list
      doc.fontSize(12).text('Détails des déductions:', { underline: true });
      (payslip.deductions || []).forEach((d: any) => {
        doc.text(`- ${d.name || 'Deduction'}: ${d.amount || 0}`);
      });

      // Payments history
      doc.moveDown();
      doc.text('Historique des paiements:', { underline: true });
      (payslip.payments || []).forEach((p: any) => {
        doc.text(`- ${p.amount} le ${p.createdAt ? new Date(p.createdAt).toISOString().slice(0,10) : ''}`);
      });

      doc.end();
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du bulletin:', error);
      return sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || 'Erreur lors du téléchargement du bulletin');
    }
  }

  // Obtenir un bulletin de paie par ID
  async getById(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;

      const payslip = await payslipService.getById(
        id as string,
        companyId as string
      );

      if (!payslip) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          "Bulletin de paie non trouvé"
        );
      }

      sendResponse(
        res,
        HttpStatus.OK,
        "Bulletin de paie récupéré avec succès",
        payslip
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération du bulletin:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération du bulletin"
      );
    }
  }

  // Mettre à jour le statut d'un bulletin
  async updateStatus(req: Request, res: Response) {
    try {
      const { id, companyId } = req.params;
      const { status } = req.body;

      if (!Object.values(PayslipStatus).includes(status)) {
        return sendResponse(res, HttpStatus.BAD_REQUEST, "Statut invalide");
      }

      const payslip = await payslipService.updateStatus(
        id as string,
        companyId as string,
        status
      );

      if (!payslip) {
        return sendResponse(
          res,
          HttpStatus.NOT_FOUND,
          "Bulletin de paie non trouvé"
        );
      }

      sendResponse(
        res,
        HttpStatus.OK,
        "Statut mis à jour avec succès",
        payslip
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        error.message || "Erreur lors de la mise à jour du statut"
      );
    }
  }

  // Obtenir les statistiques des bulletins
  async getStats(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId as string;

      const stats = await payslipService.getStats(companyId);
      sendResponse(
        res,
        HttpStatus.OK,
        "Statistiques récupérées avec succès",
        stats
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }
}

export const payslipController = new PayslipController();
