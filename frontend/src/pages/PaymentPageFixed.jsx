import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { paymentService } from "../services/paymentService";
import { formatDate } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";

const PaymentPageFixed = () => {
  const { companyId } = useParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    method: "all",
    payRunId: "",
    search: "",
  });

  console.log("🚀 PaymentPageFixed - Composant chargé");
  console.log("🏢 CompanyId:", companyId);

  // Fonction pour charger les paiements
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📞 Chargement des paiements...");
      
      const response = await paymentService.getByCompany(companyId, {
        page: 1,
        limit: 100,
        method: filters.method !== "all" ? filters.method : undefined,
        payRunId: filters.payRunId || undefined,
        search: filters.search || undefined,
      });
      
      console.log("📥 Response complète:", response);
      
      if (response && response.success) {
        const paymentsData = response.data?.data || [];
        console.log("✅ Paiements extraits:", paymentsData);
        console.log("🔢 Nombre de paiements:", paymentsData.length);
        setPayments(paymentsData);
      } else {
        console.error("❌ Réponse invalide:", response);
        setPayments([]);
      }
    } catch (err) {
      console.error("💥 Erreur:", err);
      setError(err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, filters.method, filters.payRunId, filters.search]);

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    if (companyId) {
      loadPayments();
    }
  }, [companyId, loadPayments]);

  console.log("🎯 État actuel:");
  console.log("💰 Payments:", payments);
  console.log("🔄 Loading:", loading);
  console.log("❌ Error:", error);

  // Méthodes de paiement disponibles
  const paymentMethods = [
    { value: "all", label: "Toutes les méthodes" },
    { value: "CASH", label: "Espèces" },
    { value: "BANK_TRANSFER", label: "Virement bancaire" },
    { value: "ORANGE_MONEY", label: "Orange Money" },
    { value: "WAVE", label: "Wave" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
    { value: "CHECK", label: "Chèque" },
    { value: "OTHER", label: "Autre" },
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("XOF", "FCFA");
  };

  const getPaymentMethodLabel = (method) => {
    const methodObj = paymentMethods.find(m => m.value === method);
    return methodObj ? methodObj.label : method;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Erreur: {error}</div>
          <button
            onClick={loadPayments}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Paiements ({payments.length})
        </h1>
        <Button
          onClick={loadPayments}
          className="text-white px-4 py-2 rounded-lg"
          variant="default"
        >
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <select
              value={filters.method}
              onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Rechercher par employé..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      {payments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow border">
          <FaMoneyBillWave className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun paiement trouvé
          </h3>
          <p className="text-gray-500">
            Aucun paiement ne correspond aux critères de recherche.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.payslip?.employee?.firstName} {payment.payslip?.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.payslip?.employee?.employeeCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatAmount(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getPaymentMethodLabel(payment.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payslip?.payRun?.title || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPageFixed;