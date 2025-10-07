import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { paymentService } from "../services/paymentService.js";

export default function PaymentsDebug() {
  const { user } = useAuth();
  const { companyId } = useParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("🚀 PaymentsDebug - Composant chargé");
  console.log("👤 User:", user);
  console.log("🏢 CompanyId:", companyId);

  useEffect(() => {
    console.log("🔄 useEffect - Démarrage du chargement");
    loadPayments();
  }, [companyId]);

  const loadPayments = async () => {
    try {
      console.log("📋 loadPayments - Début");
      setLoading(true);
      setError(null);
      
      if (!companyId) {
        console.error("❌ CompanyId manquant");
        setError("ID de l'entreprise manquant");
        return;
      }

      const params = {
        page: 1,
        limit: 100,
      };
      
      console.log("🌐 Appel API avec params:", params);
      const response = await paymentService.getByCompany(companyId, params);
      console.log("📥 Réponse API complète:", response);
      
      if (response && response.success) {
        const paymentsData = response.data?.data || [];
        console.log("✅ Paiements extraits:", paymentsData);
        console.log("🔢 Nombre:", paymentsData.length);
        setPayments(paymentsData);
      } else {
        console.error("❌ Réponse API invalide:", response);
        setError("Erreur dans la réponse de l'API");
        setPayments([]);
      }
    } catch (error) {
      console.error("💥 Erreur loadPayments:", error);
      setError(error.message);
      setPayments([]);
    } finally {
      console.log("🏁 loadPayments - Fin");
      setLoading(false);
    }
  };

  console.log("🎯 Rendu - payments:", payments);
  console.log("🎯 Rendu - loading:", loading);
  console.log("🎯 Rendu - error:", error);

  if (loading) {
    return (
      <div className="p-6">
        <h1>Chargement des paiements...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1>Erreur: {error}</h1>
        <button onClick={loadPayments} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug - Paiements</h1>
      <p>Nombre de paiements: {payments.length}</p>
      
      {payments.length === 0 ? (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p>Aucun paiement trouvé</p>
          <button onClick={loadPayments} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
            Recharger
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Liste des paiements:</h2>
          {payments.map((payment, index) => (
            <div key={payment.id || index} className="mb-2 p-2 border border-gray-300 rounded">
              <p><strong>ID:</strong> {payment.id}</p>
              <p><strong>Montant:</strong> {payment.amount}</p>
              <p><strong>Méthode:</strong> {payment.method}</p>
              <p><strong>Date:</strong> {payment.createdAt}</p>
              {payment.payslip?.employee && (
                <p><strong>Employé:</strong> {payment.payslip.employee.firstName} {payment.payslip.employee.lastName}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}