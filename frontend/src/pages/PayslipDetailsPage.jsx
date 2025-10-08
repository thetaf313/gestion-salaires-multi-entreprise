import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import logoDefault from "../assets/logo-free-sn.jpeg";
import "../print.css";
import { companyService } from "../services/companyService";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaPlus,
} from "react-icons/fa";
import { paymentService } from "../services/paymentService";
import { payslipService } from "../services/payslipService";
import { formatDate } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";
import { PrinterCheck } from "lucide-react";

const PayslipDetailsPage = () => {
  const { companyId, payslipId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const printRef = useRef(null);
  const [printLogo, setPrintLogo] = useState(null);
  const [company, setCompany] = useState(null);
  const [payslip, setPayslip] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      try {
        const data = await companyService.getCompanyById(companyId);
        setCompany(data?.data || data);
      } catch (e) {
        console.error("Erreur chargement entreprise:", e);
        setCompany(null);
      }
    }
    fetchCompany();
  }, [companyId]);

  // Convert image URL to data URL for reliable printing
  const imageUrlToDataUrl = async (url) => {
    if (!url) return null;
    if (typeof url === "string" && url.startsWith("data:")) return url;
    
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) {
        console.warn("Impossible de charger l'image:", url);
        return url;
      }
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => {
          console.error("Erreur de lecture de l'image");
          resolve(url);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Erreur imageUrlToDataUrl:", e);
      return url;
    }
  };

  const handlePrint = useReactToPrint({
    content: () => document.getElementById("payslip-print-root"),
    documentTitle: `Bulletin-${payslip?.employee?.lastName || ""}-${payslip?.payRun?.period || ""}`,
    // onBeforeGetContent removed; inlining handled explicitly in triggerPrint
    onAfterPrint: () => {
      setPrintLogo(null);
      setIsPrinting(false);
    },
  });

  const triggerPrint = async () => {
    if (isPrinting) return;
    
    if (!printRef.current) {
      console.error("printRef non disponible");
      alert("Impossible d'imprimer. Veuillez réessayer.");
      return;
    }

    setIsPrinting(true);
    
    const manualPrint = async () => {
      // 1️⃣ Sélection du conteneur principal à imprimer
      const printable = document.getElementById('payslip-print-root') || document.querySelector('.printable-area');
      if (!printable) {
        console.warn('Aucune zone imprimable trouvée');
        return;
      }

      const clone = printable.cloneNode(true);

      // 2️⃣ Nettoyage : suppression d’éléments non imprimables
      clone.querySelectorAll('button, a, input, textarea, select, .no-print, .print\\:hidden')
           .forEach(el => el.remove());

      // 3️⃣ Récupération des styles actifs de ton app (Tailwind, globales, etc.)
      const styleTags = Array.from(document.querySelectorAll('style'))
        .map(style => style.outerHTML)
        .join('\n');

      const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.outerHTML)
        .join('\n');

      // 4️⃣ Chargement de ton fichier print.css
      let externalPrintCSS = '';
      try {
        const res = await fetch('/print.css');
        if (res.ok) externalPrintCSS = await res.text();
        else console.warn('print.css non trouvé (HTTP ' + res.status + ')');
      } catch (e) {
        console.warn('Erreur lors du chargement de print.css :', e);
      }

      // 5️⃣ Style de secours minimal
      const inlineFallbackStyle = `
        @page { size: A4; margin: 18mm; }
        html, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: #fff !important;
          color: #000 !important;
          font-family: system-ui, sans-serif;
        }
        img { max-width: 100%; height: auto; }
        @media print {
          .no-print, .print\\:hidden { display: none !important; }
        }
      `;

      // 6️⃣ Construction du document HTML pour la fenêtre d’impression
      const html = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <title>Bulletin de paie</title>
            ${linkTags}
            ${styleTags}
            <style>${inlineFallbackStyle}</style>
            <style>${externalPrintCSS}</style>
          </head>
          <body>
            <div id="payslip-print-root">${clone.innerHTML}</div>
          </body>
        </html>
      `;

      // 7️⃣ Ouverture de la fenêtre popup et écriture du contenu
      const printWindow = window.open('', '_blank', 'width=900,height=650');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour pouvoir imprimer.');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // 8️⃣ Attente du rendu avant impression
      printWindow.onload = () => {
        // petit délai pour laisser le temps à Tailwind et au CSS de s’appliquer
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      };
    };

    try {
      // Inline logo first so DOM is ready for react-to-print
      const logoSrc = company?.logo || logoDefault;
      const dataUrl = await imageUrlToDataUrl(logoSrc);
      if (dataUrl) setPrintLogo(dataUrl);
      // allow DOM to update
      await new Promise((r) => setTimeout(r, 150));

      // NOTE: react-to-print was causing intermittent "contentRef" errors in this environment.
      // Use the manual popup print approach for reliability.
      console.debug("Using manual print fallback instead of react-to-print");
      manualPrint();
    } catch (e) {
      console.warn("react-to-print failed, using manual fallback", e);
      manualPrint();
    } finally {
      setIsPrinting(false);
      // cleanup will also run onAfterPrint, but ensure printLogo cleared
      setTimeout(() => setPrintLogo(null), 200);
    }

  };

  const loadData = async () => {
    try {
      setLoading(true);
      const payslipData = await payslipService.getById(companyId, payslipId);
      setPayslip(payslipData.data || payslipData);
      const paymentsData = await paymentService.getByPayslip(companyId, payslipId);
      setPayments(paymentsData.data || paymentsData || []);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && payslipId) loadData();
  }, [companyId, payslipId]);

  useEffect(() => {
    const handleFocus = () => {
      if (companyId && payslipId) loadData();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [companyId, payslipId]);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "CFA",
      minimumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("CFA", "FCFA");

  const getTotalPaid = () => payments.reduce((t, p) => t + (p.amount || 0), 0);

  const getRemainingAmount = () =>
    payslip?.status === "PAID"
      ? 0
      : Math.max(0, (payslip?.netAmount || 0) - getTotalPaid());

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { class: "bg-green-100 text-green-800", label: "Payé" },
      PARTIALLY_PAID: {
        class: "bg-yellow-100 text-yellow-800",
        label: "Partiellement payé",
      },
      UNPAID: { class: "bg-red-100 text-red-800", label: "Non payé" },
    };
    const cfg = statusConfig[status] || {
      class: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.class}`}>
        {cfg.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "CASH":
        return "Espèces";
      case "BANK_TRANSFER":
        return "Virement bancaire";
      case "CHECK":
        return "Chèque";
      case "MOBILE_MONEY":
        return "Mobile Money";
      default:
        return method;
    }
  };

  const handleBack = () => navigate(-1);
  const handleNewPayment = () =>
    navigate(`/company/${companyId}/payslips/${payslipId}/payment`);

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-gray-500 text-lg">Chargement...</span>
      </div>
    );
  
  if (error)
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );
  
  if (!payslip) return null;

  return (
    <div className="space-y-6">
      <div
        id="payslip-print-root"
        ref={printRef}
        className="space-y-6 bg-white rounded-lg shadow-md border border-gray-200 p-8 print:p-0 print:shadow-none print:border-none"
      >
        <header className="payslip-header flex items-center justify-between mb-8 print:mb-4">
          <div className="flex items-center gap-6">
            <img
              src={printLogo || company?.logo || logoDefault}
              alt="Logo entreprise"
              className="h-16 w-16 object-contain rounded print:h-12 print:w-12"
              style={{ background: "#fff" }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 print:text-xl">
                {company?.name || "Entreprise"}
              </h2>
              {company?.address && (
                <div className="text-gray-600 text-sm print:text-xs">
                  {company.address}
                </div>
              )}
            </div>
          </div>

          <div className="print:hidden">
            <button 
              onClick={triggerPrint}
              disabled={isPrinting}
              className={`bg-gray-800 hover:bg-gray-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow transition-colors ${
                isPrinting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PrinterCheck className="w-5 h-5" /> 
              {isPrinting ? 'Préparation...' : 'Imprimer'}
            </button>
          </div>
        </header>

        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Détails du bulletin de paie
              </h1>
              <p className="text-gray-600">
                {payslip.employee?.firstName} {payslip.employee?.lastName} -{" "}
                {payslip.payRun?.period}
              </p>
            </div>
          </div>
          {getRemainingAmount() > 0 && (
            <Button
              onClick={handleNewPayment}
              className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              variant="default"
            >
              <FaPlus className="text-sm" /> Effectuer un paiement
            </Button>
          )}
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
            <div className="flex items-center gap-2 text-blue-700">
              <FaMoneyBillWave className="text-blue-600" />
              <span className="font-medium">Information</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">{message}</p>
            <button
              onClick={() => setMessage("")}
              className="text-blue-500 hover:text-blue-700 text-sm mt-2 underline"
            >
              Masquer
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <FaUser className="text-blue-600" /> Informations de l'employé
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Nom complet
              </label>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {payslip.employee?.firstName} {payslip.employee?.lastName}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <div className="text-gray-900 mt-1 break-all">
                {payslip.employee?.email}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Code employé
              </label>
              <div className="text-gray-900 font-mono text-lg mt-1">
                {payslip.employee?.employeeCode}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Poste
              </label>
              <div className="text-gray-900 font-medium mt-1">
                {payslip.employee?.position || "Non défini"}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="text-sm font-medium text-green-600 uppercase tracking-wide">
                Salaire de base
              </label>
              <div className="text-gray-900 font-bold text-lg mt-1">
                {formatAmount(
                  payslip.grossAmount ||
                    payslip.employee?.baseSalary ||
                    payslip.employee?.salary ||
                    0
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <FaCalendarAlt className="text-green-600" /> Détails du bulletin de paie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <label className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                Période de paie
              </label>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {payslip.payRun?.title || payslip.payRun?.period}
              </div>
              <div className="text-sm text-purple-600 mt-1">
                Du {formatDate(payslip.payRun?.periodStart)} au{" "}
                {formatDate(payslip.payRun?.periodEnd)}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Salaire brut
              </label>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {formatAmount(payslip.grossAmount)}
              </div>
              <div className="text-xs text-blue-600 mt-1">Avant déductions</div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
              <label className="text-sm font-medium text-red-600 uppercase tracking-wide">
                Total déductions
              </label>
              <div className="text-2xl font-bold text-red-600 mt-1">
                -{formatAmount(payslip.totalDeductions)}
              </div>
              <div className="text-xs text-red-600 mt-1">
                Charges sociales, impôts
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <label className="text-sm font-medium text-green-600 uppercase tracking-wide">
                Salaire net
              </label>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {formatAmount(payslip.netAmount)}
              </div>
              <div className="text-xs text-green-600 mt-1">À payer</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Statut
              </label>
              <div className="mt-2">{getStatusBadge(payslip.status)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Date de création
              </label>
              <div className="text-gray-900 mt-1">
                {formatDate(payslip.createdAt)}
              </div>
            </div>
            {payslip.employee?.contractType === "JOURNALIER" && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <label className="text-sm font-medium text-yellow-600 uppercase tracking-wide">
                  Jours travaillés
                </label>
                <div className="text-xl font-bold text-yellow-700 mt-1">
                  {payslip.workingDays || "N/A"}
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Sur la période
                </div>
              </div>
            )}
            {payslip.employee?.contractType === "HONORAIRE" && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <label className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                  Heures travaillées
                </label>
                <div className="text-xl font-bold text-indigo-700 mt-1">
                  {payslip.workingHours || "N/A"}
                </div>
                <div className="text-xs text-indigo-600 mt-1">
                  Heures totales
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-blue-100 pb-3">
            <FaMoneyBillWave className="text-blue-600" /> Résumé des paiements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatAmount(payslip.netAmount)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                Montant total
              </div>
              <div className="w-full bg-blue-100 h-2 rounded-full mt-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatAmount(getTotalPaid())}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                Déjà payé
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      payslip.netAmount > 0
                        ? (getTotalPaid() / payslip.netAmount) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div
                className={`text-3xl font-bold mb-2 ${
                  getRemainingAmount() > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {formatAmount(getRemainingAmount())}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                Restant à payer
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getRemainingAmount() > 0 ? "bg-orange-600" : "bg-green-600"
                  }`}
                  style={{
                    width: `${
                      payslip.netAmount > 0
                        ? (getRemainingAmount() / payslip.netAmount) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
          {getRemainingAmount() > 0 ? (
            <div className="mt-6 text-center print:hidden">
              <button
                onClick={handleNewPayment}
                className="bg-gradient-to-r from-gray-800 to-gray-400 hover:from-gray-700 hover:to-gray-700 text-white px-8 py-4 rounded-lg flex items-center gap-3 mx-auto transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaPlus className="text-lg" />
                <span className="font-medium">
                  Effectuer un paiement ({formatAmount(getRemainingAmount())})
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center gap-3 text-green-700 mb-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                  <span className="font-bold text-lg">
                    Bulletin de paie complètement payé
                  </span>
                </div>
                <p className="text-green-600 text-sm">
                  Ce bulletin de paie a été entièrement réglé. Aucun paiement
                  supplémentaire requis.
                </p>
              </div>
            </div>
          )}
        </div>

  <div className="bg-white rounded-lg shadow-md border border-gray-200 no-print print:hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaClock className="text-gray-600" /> Historique des paiements{" "}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium ml-2">
                {payments.length}
              </span>
            </h2>
          </div>
          <div className="p-6">
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border border-green-200">
                          <FaMoneyBillWave className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <div className="font-bold text-xl text-gray-900">
                            {formatAmount(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-600 font-medium mt-1">
                            {getPaymentMethodLabel(payment.method)}
                          </div>
                          {payment.reference && (
                            <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                              Réf: {payment.reference}
                            </div>
                          )}
                          {payment.notes && (
                            <div className="text-sm text-gray-600 mt-2 italic">
                              "{payment.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {formatDate(payment.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Paiement #{index + 1}
                        </div>
                        {payment.processedBy && (
                          <div className="text-xs text-blue-600 mt-2">
                            Par: {payment.processedBy.firstName}{" "}
                            {payment.processedBy.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <FaMoneyBillWave className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Aucun paiement effectué
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Ce bulletin de paie n'a pas encore été payé. Cliquez sur le
                  bouton ci-dessus pour effectuer un paiement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailsPage;