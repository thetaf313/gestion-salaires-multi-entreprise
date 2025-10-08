import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaMoneyBillWave,
  FaCreditCard,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { paymentService } from "../services/paymentService";
import { payslipService } from "../services/payslipService";
import { formatDate } from "../utils/dateUtils";

const CreatePaymentPage = () => {
  const { companyId, payslipId } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [existingPayments, setExistingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    method: "CASH",
    description: "",
  });

  // Méthodes de paiement disponibles
  const paymentMethods = [
    {
      value: "CASH",
      label: "Espèces",
      icon: "💵",
      description: "Paiement en liquide",
    },
    {
      value: "BANK_TRANSFER",
      label: "Virement bancaire",
      icon: "🏦",
      description: "Transfert bancaire",
    },
    {
      value: "ORANGE_MONEY",
      label: "Orange Money",
      icon: "🟠",
      description: "Mobile money Orange",
    },
    {
      value: "WAVE",
      label: "Wave",
      icon: "🌊",
      description: "Mobile money Wave",
    },
    {
      value: "MOBILE_MONEY",
      label: "Mobile Money",
      icon: "�",
      description: "Autres mobile money",
    },
    {
      value: "CHECK",
      label: "Chèque",
      icon: "📝",
      description: "Paiement par chèque",
    },
    {
      value: "OTHER",
      label: "Autre",
      icon: "💳",
      description: "Autre méthode de paiement",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger les détails du bulletin
        const payslipData = await payslipService.getById(companyId, payslipId);
        const payslipResult = payslipData.data || payslipData;
        setPayslip(payslipResult);

        // Rediriger si le bulletin est déjà complètement payé
        if (payslipResult.status === 'PAID') {
          navigate(`/company/${companyId}/payslips/${payslipId}`, {
            replace: true,
            state: { message: 'Ce bulletin de paie est déjà complètement payé.' }
          });
          return;
        }

        // Charger les paiements existants
        const paymentsData = await paymentService.getByPayslip(
          companyId,
          payslipId
        );
        const payments = paymentsData.data || paymentsData || [];
        setExistingPayments(payments);

        // Définir le montant par défaut (montant restant)
        const totalPaid = payments.reduce(
          (total, payment) => total + payment.amount,
          0
        );
        const remainingAmount = (payslipResult.netAmount || 0) - totalPaid;
        setFormData((prev) => ({
          ...prev,
          amount: remainingAmount > 0 ? remainingAmount.toString() : "",
        }));
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
    return existingPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
  };

  const getRemainingAmount = () => {
    // Si le bulletin est marqué comme payé, le montant restant est 0
    if (payslip?.status === 'PAID') {
      return 0;
    }
    return Math.max(0, (payslip?.netAmount || 0) - getTotalPaid());
  };

  const isPartialPayment = () => {
    if (!payslip || !formData.amount) return false;
    const amount = parseFloat(formData.amount);
    const remainingAmount = getRemainingAmount();
    return amount < remainingAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Vérification côté frontend avant envoi
      if (payslip?.status === 'PAID') {
        throw new Error("Ce bulletin de paie est déjà complètement payé");
      }

      // Validation
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
        payslipId: payslipId,
        amount,
        method: formData.method,
        notes: formData.description || undefined,
      });

      setSuccess(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate(`/company/${companyId}/payslips/${payslipId}`);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      
      // Gestion spécifique pour les bulletins déjà payés
      if (error.message?.includes("déjà entièrement payé") || error.message?.includes("déjà complètement payé")) {
        // Rediriger vers la page de détails avec un message
        navigate(`/company/${companyId}/payslips/${payslipId}`, {
          replace: true,
          state: { message: "Ce bulletin de paie est déjà complètement payé." }
        });
        return;
      }
      
      setError(error.message || "Erreur lors de la création du paiement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/company/${companyId}/payslips/${payslipId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Bulletin de paie non trouvé</div>
        <button
          onClick={() => navigate(`/company/${companyId}/payslips`)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
        >
          <FaArrowLeft />
          Retour aux bulletins
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Paiement effectué avec succès !
        </h2>
        <p className="text-gray-600 mb-4">
          Le paiement a été enregistré et le bulletin mis à jour.
        </p>
        <div className="text-sm text-gray-500">Redirection en cours...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Effectuer un paiement
          </h1>
          <p className="text-gray-600">
            {payslip.employee?.firstName} {payslip.employee?.lastName} -{" "}
            {payslip.payRun?.period}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Informations du bulletin */}
        <div className="space-y-6">
          {/* Informations de l'employé */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Employé
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <FaUser className="text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {payslip.employee?.firstName} {payslip.employee?.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payslip.employee?.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payslip.employee?.employeeCode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails du bulletin */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              Bulletin de paie
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Période:</span>
                  <div className="font-medium">{payslip.payRun?.period}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(payslip.payRun?.startDate)} -{" "}
                    {formatDate(payslip.payRun?.endDate)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Salaire brut:</span>
                  <div className="font-medium text-gray-900">
                    {formatAmount(payslip.grossAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Déductions:</span>
                  <div className="font-medium text-red-600">
                    -{formatAmount(payslip.totalDeductions)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Salaire net:</span>
                  <div className="font-medium text-green-600">
                    {formatAmount(payslip.netAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des paiements */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé des paiements
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total:</span>
                <span className="font-semibold text-blue-600">
                  {formatAmount(payslip.netAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déjà payé:</span>
                <span className="font-semibold text-green-600">
                  {formatAmount(getTotalPaid())}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-gray-900">
                  Restant à payer:
                </span>
                <span className="font-bold text-orange-600">
                  {formatAmount(getRemainingAmount())}
                </span>
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
          </div>
        </div>

        {/* Colonne droite - Formulaire de paiement */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaCreditCard className="text-purple-600" />
              Nouveau paiement
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à payer *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    required
                    min="1"
                    max={getRemainingAmount()}
                    step="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-16 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Montant en FCFA"
                  />
                  <span className="absolute right-3 top-3 text-gray-500 text-sm">
                    FCFA
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: getRemainingAmount().toString(),
                      }))
                    }
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
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
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    50% ({formatAmount(Math.floor(getRemainingAmount() / 2))})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: Math.floor(getRemainingAmount() / 4).toString(),
                      }))
                    }
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    25% ({formatAmount(Math.floor(getRemainingAmount() / 4))})
                  </button>
                </div>

                {isPartialPayment() && (
                  <div className="mt-2 flex items-center gap-2 text-yellow-600 text-sm">
                    <FaExclamationTriangle />
                    <span>Ce sera un paiement partiel</span>
                  </div>
                )}
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Méthode de paiement *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
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
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-gray-500">
                            {method.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
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
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || getRemainingAmount() <= 0}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentPage;
