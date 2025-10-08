import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import { paymentService } from "../services/paymentService";
import { payslipService } from "../services/payslipService";
import { formatDate } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";

const PayslipDetailsPage = () => {
  const { companyId, payslipId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [payslip, setPayslip] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  // Fonction pour recharger les données
  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les détails du bulletin
      const payslipData = await payslipService.getById(companyId, payslipId);
      setPayslip(payslipData.data || payslipData);

      // Charger les paiements associés
      const paymentsData = await paymentService.getByPayslip(
        companyId,
        payslipId
      );
      const paymentsResult = paymentsData.data || paymentsData || [];
      setPayments(paymentsResult);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && payslipId) {
      loadData();
    }
  }, [companyId, payslipId]);

  // Recharger les données quand la fenêtre reprend le focus
  useEffect(() => {
    const handleFocus = () => {
      if (companyId && payslipId) {
        loadData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [companyId, payslipId]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "CFA",
      minimumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("CFA", "FCFA");
  };

  const getTotalPaid = () => {
    const total = payments.reduce((total, payment) => total + payment.amount, 0);
    return total;
  };

  const getRemainingAmount = () => {
    // Si le bulletin est marqué comme payé, le montant restant est 0
    if (payslip?.status === 'PAID') {
      return 0;
    }
    return Math.max(0, (payslip?.netAmount || 0) - getTotalPaid());
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { class: "bg-green-100 text-green-800", label: "Payé" },
      PARTIALLY_PAID: {
        class: "bg-yellow-100 text-yellow-800",
        label: "Partiellement payé",
      },
      UNPAID: { class: "bg-red-100 text-red-800", label: "Non payé" },
    };

    const config = statusConfig[status] || {
      class: "bg-gray-100 text-gray-800",
      label: status,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      CASH: "Espèces",
      BANK_TRANSFER: "Virement bancaire",
      ORANGE_MONEY: "Orange Money",
      WAVE: "Wave",
      MOBILE_MONEY: "Mobile Money",
      CHECK: "Chèque",
      OTHER: "Autre",
    };
    return methods[method] || method;
  };

  const handleNewPayment = () => {
    navigate(`/company/${companyId}/payslips/${payslipId}/payment`);
  };

  const handleBack = () => {
    navigate(`/company/${companyId}/payslips`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          {error || "Bulletin de paie non trouvé"}
        </div>
        <button
          onClick={handleBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
        >
          <FaArrowLeft />
          Retour aux bulletins
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
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
            <FaPlus className="text-sm" />
            Effectuer un paiement
          </Button>
        )}
      </div>

      {/* Message d'information */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

      {/* Informations de l'employé */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
          <FaUser className="text-blue-600" />
          Informations de l'employé
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
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Email</label>
            <div className="text-gray-900 mt-1 break-all">{payslip.employee?.email}</div>
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
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Poste</label>
            <div className="text-gray-900 font-medium mt-1">
              {payslip.employee?.position || "Non défini"}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="text-sm font-medium text-green-600 uppercase tracking-wide">
              Salaire de base
            </label>
            <div className="text-gray-900 font-bold text-lg mt-1">
              {formatAmount(payslip.grossAmount || payslip.employee?.baseSalary || payslip.employee?.salary || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Informations du bulletin */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
          <FaCalendarAlt className="text-green-600" />
          Détails du bulletin de paie
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
              Du {formatDate(payslip.payRun?.periodStart)} au {formatDate(payslip.payRun?.periodEnd)}
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
            <div className="text-xs text-red-600 mt-1">Charges sociales, impôts</div>
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
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Statut</label>
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

          {/* Jours travaillés : affiché uniquement si contrat journalier */}
          {payslip.employee?.contractType === 'JOURNALIER' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="text-sm font-medium text-yellow-600 uppercase tracking-wide">
                Jours travaillés
              </label>
              <div className="text-xl font-bold text-yellow-700 mt-1">
                {payslip.workingDays || "N/A"}
              </div>
              <div className="text-xs text-yellow-600 mt-1">Sur la période</div>
            </div>
          )}

          {/* Heures travaillées : affiché uniquement si contrat honoraire */}
          {payslip.employee?.contractType === 'HONORAIRE' && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <label className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                Heures travaillées
              </label>
              <div className="text-xl font-bold text-indigo-700 mt-1">
                {payslip.workingHours || "N/A"}
              </div>
              <div className="text-xs text-indigo-600 mt-1">Heures totales</div>
            </div>
          )}
        </div>
      </div>

      {/* Résumé des paiements */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-blue-100 pb-3">
          <FaMoneyBillWave className="text-blue-600" />
          Résumé des paiements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatAmount(payslip.netAmount)}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">Montant total</div>
            <div className="w-full bg-blue-100 h-2 rounded-full mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="text-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatAmount(getTotalPaid())}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">Déjà payé</div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{
                  width: `${payslip.netAmount > 0 ? (getTotalPaid() / payslip.netAmount) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div className="text-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className={`text-3xl font-bold mb-2 ${getRemainingAmount() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatAmount(getRemainingAmount())}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">Restant à payer</div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getRemainingAmount() > 0 ? 'bg-orange-600' : 'bg-green-600'}`}
                style={{
                  width: `${payslip.netAmount > 0 ? (getRemainingAmount() / payslip.netAmount) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {getRemainingAmount() > 0 ? (
          <div className="mt-6 text-center">
            <button
              onClick={handleNewPayment}
              className="bg-gradient-to-r from-gray-800 to-gray-400 hover:from-gray-700 hover:to-gray-700 text-white px-8 py-4 rounded-lg flex items-center gap-3 mx-auto transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              variant="default"
            >
              <FaPlus className="text-lg" />
              <span className="font-medium">Effectuer un paiement ({formatAmount(getRemainingAmount())})</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-center gap-3 text-green-700 mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <FaMoneyBillWave className="text-green-600 text-xl" />
                </div>
                <span className="font-bold text-lg">Bulletin de paie complètement payé</span>
              </div>
              <p className="text-green-600 text-sm">
                Ce bulletin de paie a été entièrement réglé. Aucun paiement supplémentaire requis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Historique des paiements */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaClock className="text-gray-600" />
            Historique des paiements 
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
                          Par: {payment.processedBy.firstName} {payment.processedBy.lastName}
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
                Ce bulletin de paie n'a pas encore été payé. Cliquez sur le bouton ci-dessus pour effectuer un paiement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailsPage;
