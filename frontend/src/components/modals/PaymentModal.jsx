import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaMoneyBillWave,
  FaCreditCard,
  FaExclamationTriangle,
} from "react-icons/fa";
import { paymentService } from "../../services/paymentService";
import { payslipService } from "../../services/payslipService";
import { formatDate } from "../../utils/dateUtils";

const PaymentModal = ({ companyId, payslip, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    payslipId: payslip?.id || "",
    amount: "",
    method: "CASH",
    description: "",
  });
  const [availablePayslips, setAvailablePayslips] = useState([]);
  const [selectedPayslipData, setSelectedPayslipData] = useState(payslip);
  const [existingPayments, setExistingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Méthodes de paiement disponibles
  const paymentMethods = [
    { value: "CASH", label: "Espèces", icon: "💵" },
    { value: "BANK_TRANSFER", label: "Virement bancaire", icon: "🏦" },
    { value: "ORANGE_MONEY", label: "Orange Money", icon: "🟠" },
    { value: "WAVE", label: "Wave", icon: "🌊" },
    { value: "MOBILE_MONEY", label: "Mobile Money", icon: "�" },
    { value: "CHECK", label: "Chèque", icon: "📝" },
    { value: "OTHER", label: "Autre", icon: "💳" },
  ];

  // Charger les bulletins disponibles si aucun n'est sélectionné
  useEffect(() => {
    const loadPayslips = async () => {
      if (!payslip) {
        try {
          const response = await payslipService.getByCompany(companyId, {
            page: 1,
            limit: 1000,
            status: "UNPAID,PARTIALLY_PAID",
          });
          setAvailablePayslips(response.data || response.payslips || []);
        } catch (error) {
          console.error("Erreur lors du chargement des bulletins:", error);
        }
      }
    };

    loadPayslips();
  }, [companyId, payslip]);

  // Charger les paiements existants pour le bulletin sélectionné
  useEffect(() => {
    const loadExistingPayments = async () => {
      if (selectedPayslipData?.id) {
        try {
          const payments = await paymentService.getByPayslip(
            companyId,
            selectedPayslipData.id
          );
          setExistingPayments(payments.data || payments || []);
        } catch (error) {
          console.error(
            "Erreur lors du chargement des paiements existants:",
            error
          );
          setExistingPayments([]);
        }
      }
    };

    loadExistingPayments();
  }, [companyId, selectedPayslipData?.id]);

  // Gérer le changement de bulletin de paie
  const handlePayslipChange = (payslipId) => {
    const selected = availablePayslips.find((p) => p.id === payslipId);
    setSelectedPayslipData(selected);
    setFormData((prev) => ({
      ...prev,
      payslipId,
      amount: selected ? selected.netAmount.toString() : "",
    }));
  };

  // Calculer le montant déjà payé et le montant restant
  const getTotalPaid = () => {
    return existingPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
  };

  const getRemainingAmount = () => {
    if (!selectedPayslipData) return 0;
    // Si le bulletin est marqué comme payé, le montant restant est 0
    if (selectedPayslipData.status === 'PAID') {
      return 0;
    }
    return Math.max(0, selectedPayslipData.netAmount - getTotalPaid());
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "CFA",
      minimumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("CFA", "FCFA");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!formData.payslipId) {
        throw new Error("Veuillez sélectionner un bulletin de paie");
      }

      // Vérifier si le bulletin est déjà payé
      if (selectedPayslipData?.status === 'PAID') {
        throw new Error("Ce bulletin de paie est déjà complètement payé");
      }

      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        throw new Error("Veuillez saisir un montant valide");
      }

      const remainingAmount = getRemainingAmount();
      if (remainingAmount <= 0) {
        throw new Error("Ce bulletin de paie est déjà complètement payé");
      }

      if (amount > remainingAmount) {
        throw new Error(
          `Le montant ne peut pas dépasser ${formatAmount(remainingAmount)}`
        );
      }

      // Créer le paiement
      await paymentService.create(companyId, {
        payslipId: formData.payslipId,
        amount,
        method: formData.method,
        notes: formData.description || undefined,
      });

      onSuccess();
    } catch (error) {
      setError(error.message || "Erreur lors de la création du paiement");
    } finally {
      setLoading(false);
    }
  };

  const isPartialPayment = () => {
    if (!selectedPayslipData || !formData.amount) return false;
    const amount = parseFloat(formData.amount);
    const remainingAmount = getRemainingAmount();
    return amount < remainingAmount;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaMoneyBillWave className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {payslip ? "Effectuer un paiement" : "Nouveau paiement"}
              </h2>
              <p className="text-sm text-gray-600">
                {payslip
                  ? `Paiement pour ${payslip.employee?.firstName} ${payslip.employee?.lastName}`
                  : "Créer un nouveau paiement de salaire"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection du bulletin de paie */}
          {!payslip && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulletin de paie *
              </label>
              <select
                value={formData.payslipId}
                onChange={(e) => handlePayslipChange(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez un bulletin</option>
                {availablePayslips.map((payslip) => (
                  <option key={payslip.id} value={payslip.id}>
                    {payslip.employee?.firstName} {payslip.employee?.lastName} -{" "}
                    {payslip.payRun?.period} - {formatAmount(payslip.netAmount)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Informations du bulletin sélectionné */}
          {selectedPayslipData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <FaUser className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedPayslipData.employee?.firstName}{" "}
                    {selectedPayslipData.employee?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPayslipData.employee?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Période:</span>
                  <div className="font-medium">
                    {selectedPayslipData.payRun?.period}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(selectedPayslipData.payRun?.startDate)} -{" "}
                    {formatDate(selectedPayslipData.payRun?.endDate)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Salaire net:</span>
                  <div className="font-medium text-green-600">
                    {formatAmount(selectedPayslipData.netAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Déjà payé:</span>
                  <div className="font-medium text-blue-600">
                    {formatAmount(getTotalPaid())}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Restant à payer:</span>
                  <div className="font-medium text-orange-600">
                    {formatAmount(getRemainingAmount())}
                  </div>
                </div>
              </div>

              {/* Paiements existants */}
              {existingPayments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Paiements précédents:
                  </h4>
                  <div className="space-y-1">
                    {existingPayments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="flex justify-between text-xs bg-white p-2 rounded"
                      >
                        <span>
                          {formatDate(payment.paidAt)} - {payment.method}
                        </span>
                        <span className="font-medium">
                          {formatAmount(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message pour bulletin déjà payé */}
              {selectedPayslipData?.status === 'PAID' && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <FaMoneyBillWave className="text-green-600" />
                    <span className="font-medium">Bulletin complètement payé</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Ce bulletin de paie a été entièrement réglé. Aucun paiement supplémentaire n'est nécessaire.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Montant */}
          {selectedPayslipData?.status !== 'PAID' && getRemainingAmount() > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à payer *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
                min="1"
                max={selectedPayslipData ? getRemainingAmount() : undefined}
                step="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Montant en FCFA"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                FCFA
              </span>
            </div>

            {selectedPayslipData && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: getRemainingAmount().toString(),
                    }))
                  }
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  Montant total ({formatAmount(getRemainingAmount())})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: Math.floor(getRemainingAmount() / 2).toString(),
                    }))
                  }
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  50% ({formatAmount(Math.floor(getRemainingAmount() / 2))})
                </button>
              </div>
            )}

            {isPartialPayment() && (
              <div className="mt-2 flex items-center gap-2 text-yellow-600 text-sm">
                <FaExclamationTriangle />
                <span>Ce sera un paiement partiel</span>
              </div>
            )}
          </div>
          )}

          {/* Méthode de paiement */}
          {selectedPayslipData?.status !== 'PAID' && getRemainingAmount() > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    formData.method === method.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.value}
                    checked={formData.method === method.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        method: e.target.value,
                      }))
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          )}

          {/* Description */}
          {selectedPayslipData?.status !== 'PAID' && getRemainingAmount() > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ajoutez une note sur ce paiement..."
            />
          </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedPayslipData?.status === 'PAID' ? 'Fermer' : 'Annuler'}
            </button>
            {selectedPayslipData?.status !== 'PAID' && getRemainingAmount() > 0 && (
              <button
                type="submit"
                disabled={loading || !selectedPayslipData}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Effectuer le paiement
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
