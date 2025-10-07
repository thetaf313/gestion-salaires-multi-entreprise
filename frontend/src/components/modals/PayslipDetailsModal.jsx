import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaPlus,
} from "react-icons/fa";
import { paymentService } from "../../services/paymentService";
import { payslipService } from "../../services/payslipService";
import { formatDate } from "../../utils/dateUtils";
import PaymentModal from "./PaymentModal";

const PayslipDetailsModal = ({
  companyId,
  payslip,
  onClose,
  onPaymentCreated,
}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      if (payslip?.id) {
        try {
          setLoading(true);
          const paymentsData = await paymentService.getByPayslip(
            companyId,
            payslip.id
          );
          setPayments(paymentsData.data || paymentsData || []);
        } catch (error) {
          console.error("Erreur lors du chargement des paiements:", error);
          setError("Erreur lors du chargement des paiements");
        } finally {
          setLoading(false);
        }
      }
    };

    loadPayments();
  }, [companyId, payslip?.id]);

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
    return (payslip?.netAmount || 0) - getTotalPaid();
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
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.class}`}
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

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Recharger les paiements
    paymentService
      .getByPayslip(companyId, payslip.id)
      .then((paymentsData) =>
        setPayments(paymentsData.data || paymentsData || [])
      )
      .catch(console.error);

    // Notifier le parent pour actualiser la liste
    if (onPaymentCreated) {
      onPaymentCreated();
    }
  };

  if (!payslip) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          {/* En-tête */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <FaUser className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {payslip.employee?.firstName} {payslip.employee?.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  {payslip.employee?.email}
                </p>
                <p className="text-sm text-gray-500">
                  Bulletin - {payslip.payRun?.period}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Informations du bulletin */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                Informations du bulletin
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Période
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
                    Statut
                  </label>
                  <div className="mt-1">{getStatusBadge(payslip.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Déductions
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
                  <label className="text-sm font-medium text-gray-600">
                    Créé le
                  </label>
                  <div className="text-sm text-gray-900">
                    {formatDate(payslip.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé des paiements */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-blue-600" />
                Résumé des paiements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Montant total
                  </label>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatAmount(payslip.netAmount)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Déjà payé
                  </label>
                  <div className="text-lg font-semibold text-green-600">
                    {formatAmount(getTotalPaid())}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Restant à payer
                  </label>
                  <div className="text-lg font-semibold text-orange-600">
                    {formatAmount(getRemainingAmount())}
                  </div>
                </div>
              </div>

              {getRemainingAmount() > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FaPlus className="text-sm" />
                    Effectuer un paiement
                  </button>
                </div>
              )}
            </div>

            {/* Historique des paiements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-gray-600" />
                Historique des paiements ({payments.length})
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-4">{error}</div>
              ) : payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="bg-white border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FaMoneyBillWave className="text-green-600 text-sm" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatAmount(payment.amount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getPaymentMethodLabel(payment.method)}
                            </div>
                            {payment.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {payment.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.paidAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Paiement #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>Aucun paiement effectué pour ce bulletin</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Effectuer le premier paiement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <PaymentModal
          companyId={companyId}
          payslip={payslip}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default PayslipDetailsModal;
