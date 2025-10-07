import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { paymentService } from "../services/paymentService";
import { payslipService } from "../services/payslipService";
import { formatDate } from "../utils/dateUtils";
import { useApiPagination } from "../hooks/useApiPagination";
import PaginationControls from "../components/ui/PaginationControls";

const PaymentPage = () => {
  const { companyId } = useParams();
  const [payslips, setPayslips] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    method: "all",
    payRunId: "",
    search: "",
  });

  console.log("🚀 PaymentPage - Composant chargé");
  console.log("🏢 CompanyId:", companyId);
  console.log("🔍 Filters:", filters);

  // Configuration de la pagination avec API
  const {
    data: payments,
    pagination,
    loading,
    error,
    reload,
  } = useApiPagination({
    apiFunction: async (params) => {
      console.log("📞 API Call avec params:", params);
      const response = await paymentService.getByCompany(companyId, {
        page: params.page,
        limit: params.limit,
        method: filters.method !== "all" ? filters.method : undefined,
        payRunId: filters.payRunId || undefined,
        search: filters.search || undefined,
      });
      console.log("� API Response:", response);
      return response;
    },
    dependencies: [companyId, filters],
    defaultLimit: 10,
  });

  console.log("🎯 PaymentPage State:");
  console.log("💰 Payments:", payments);
  console.log("📄 Pagination:", pagination);
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

  // Charger les statistiques et les bulletins disponibles
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, payslipsData] = await Promise.all([
          paymentService.getStats(companyId),
          payslipService.getByCompany(companyId, { page: 1, limit: 1000 }),
        ]);
        setStats(statsData);
        setPayslips(payslipsData.data || payslipsData.payslips || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setPayslips([]); // S'assurer que payslips reste un tableau même en cas d'erreur
      }
    };

    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const getPaymentMethodLabel = (method) => {
    const methodObj = paymentMethods.find((m) => m.value === method);
    return methodObj ? methodObj.label : method;
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
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
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

  if (loading && !payments) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Paiements
          </h1>
          <p className="text-gray-600">
            Consultez l'historique des paiements des salaires de votre
            entreprise
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaMoneyBillWave className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total payé</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatAmount(stats.totalPaid)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCreditCard className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paiements ce mois</p>
                <p className="text-lg font-semibold text-green-600">
                  {stats.paymentsThisMonth || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaCalendarAlt className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {formatAmount(stats.totalPending)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUser className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total paiements</p>
                <p className="text-lg font-semibold text-purple-600">
                  {stats.totalPayments || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher par employé
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Nom de l'employé..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de paiement
            </label>
            <select
              value={filters.method}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle de paie
            </label>
            <select
              value={filters.payRunId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, payRunId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Tous les cycles</option>
              {(Array.isArray(payslips) ? payslips : [])
                .reduce((acc, payslip) => {
                  if (
                    payslip.payRun &&
                    !acc.find((pr) => pr.id === payslip.payRun.id)
                  ) {
                    acc.push(payslip.payRun);
                  }
                  return acc;
                }, [])
                .map((payRun) => (
                  <option key={payRun.id} value={payRun.id}>
                    {payRun.period} - {formatDate(payRun.startDate)} au{" "}
                    {formatDate(payRun.endDate)}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {payments && payments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
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
                      Statut Bulletin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaUser className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.payslip?.employee?.firstName}{" "}
                              {payment.payslip?.employee?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.payslip?.employee?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.payslip?.payRun?.period}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(payment.payslip?.payRun?.startDate)} -{" "}
                          {formatDate(payment.payslip?.payRun?.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(payment.amount)}
                        </div>
                        {payment.payslip &&
                          payment.amount < payment.payslip.netAmount && (
                            <div className="text-xs text-yellow-600">
                              Partiel (
                              {formatAmount(
                                payment.payslip.netAmount - payment.amount
                              )}{" "}
                              restant)
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getPaymentMethodLabel(payment.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.payslip?.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleNewPayment(payment.payslip)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Voir le bulletin"
                        >
                          <FaEye />
                        </button>
                        {payment.payslip?.status === "PARTIALLY_PAID" && (
                          <button
                            onClick={() => handleNewPayment(payment.payslip)}
                            className="text-green-600 hover:text-green-900"
                            title="Compléter le paiement"
                          >
                            <FaPlus />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls pagination={pagination} />
          </>
        ) : (
          <div className="p-8 text-center">
            <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun paiement trouvé
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.method !== "all" || filters.payRunId
                ? "Aucun paiement ne correspond aux critères de recherche."
                : "Les paiements sont effectués depuis les détails des bulletins de paie."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
