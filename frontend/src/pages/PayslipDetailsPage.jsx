import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const PayslipDetailsPage = () => {
  const { companyId, payslipId } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        setPayments(paymentsData.data || paymentsData || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (companyId && payslipId) {
      loadData();
    }
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
    return payments.reduce((total, payment) => total + payment.amount, 0);
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
      FREE_MONEY: "Free Money",
      CRYPTO: "Cryptomonnaie",
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
          <button
            onClick={handleNewPayment}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus className="text-sm" />
            Effectuer un paiement
          </button>
        )}
      </div>

      {/* Informations de l'employé */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaUser className="text-blue-600" />
          Informations de l'employé
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Nom complet
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {payslip.employee?.firstName} {payslip.employee?.lastName}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="text-gray-900">{payslip.employee?.email}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Code employé
            </label>
            <div className="text-gray-900">
              {payslip.employee?.employeeCode}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Poste</label>
            <div className="text-gray-900">
              {payslip.employee?.position || "Non défini"}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Département
            </label>
            <div className="text-gray-900">
              {payslip.employee?.department || "Non défini"}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Date d'embauche
            </label>
            <div className="text-gray-900">
              {payslip.employee?.hireDate
                ? formatDate(payslip.employee.hireDate)
                : "Non défini"}
            </div>
          </div>
        </div>
      </div>

      {/* Informations du bulletin */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-green-600" />
          Détails du bulletin de paie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Période de paie
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {payslip.payRun?.period}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(payslip.payRun?.startDate)} -{" "}
              {formatDate(payslip.payRun?.endDate)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Salaire brut
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {formatAmount(payslip.grossAmount)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Total déductions
            </label>
            <div className="text-lg font-semibold text-red-600">
              -{formatAmount(payslip.totalDeductions)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Salaire net
            </label>
            <div className="text-lg font-semibold text-green-600">
              {formatAmount(payslip.netAmount)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Statut</label>
            <div className="mt-1">{getStatusBadge(payslip.status)}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Date de création
            </label>
            <div className="text-gray-900">{formatDate(payslip.createdAt)}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Dernière modification
            </label>
            <div className="text-gray-900">{formatDate(payslip.updatedAt)}</div>
          </div>
        </div>
      </div>

      {/* Résumé des paiements */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaMoneyBillWave className="text-blue-600" />
          Résumé des paiements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(payslip.netAmount)}
            </div>
            <div className="text-sm text-gray-600">Montant total</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(getTotalPaid())}
            </div>
            <div className="text-sm text-gray-600">Déjà payé</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(getRemainingAmount())}
            </div>
            <div className="text-sm text-gray-600">Restant à payer</div>
          </div>
        </div>

        {getRemainingAmount() > 0 ? (
          <div className="mt-4 text-center">
            <button
              onClick={handleNewPayment}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <FaPlus className="text-sm" />
              Effectuer un paiement ({formatAmount(getRemainingAmount())})
            </button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <FaMoneyBillWave className="text-green-600" />
                <span className="font-medium">Bulletin de paie complètement payé</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Ce bulletin de paie a été entièrement réglé.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Historique des paiements */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaClock className="text-gray-600" />
            Historique des paiements ({payments.length})
          </h2>
        </div>

        <div className="p-6">
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <FaMoneyBillWave className="text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {formatAmount(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getPaymentMethodLabel(payment.method)}
                        </div>
                        {payment.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {payment.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(payment.paidAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Paiement #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaMoneyBillWave className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun paiement effectué
              </h3>
              <p className="text-gray-500 mb-4">
                Ce bulletin de paie n'a pas encore été payé.
              </p>
              <button
                onClick={handleNewPayment}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <FaPlus className="text-sm" />
                Effectuer le premier paiement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailsPage;
