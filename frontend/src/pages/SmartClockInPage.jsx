import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import attendanceService from "../services/attendanceService";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";

const SmartClockInPage = () => {
  const { user } = useAuth();
  const [employeeCode, setEmployeeCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Références pour le scanner QR
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Initialiser le scanner QR
  const startQRScanner = async () => {
    try {
      if (videoRef.current && !qrScannerRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            // QR code scanné avec succès
            console.log("QR Code scanné:", result.data);
            setEmployeeCode(result.data);
            setShowQRScanner(false);
            stopQRScanner();
            setError("");
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment", // Caméra arrière
            maxScansPerSecond: 5,
          }
        );

        await qrScannerRef.current.start();
      }
    } catch (error) {
      console.error("Erreur démarrage scanner QR:", error);
      setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
    }
  };

  // Arrêter le scanner QR
  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  // Nettoyer le scanner lors du démontage du composant
  useEffect(() => {
    return () => {
      stopQRScanner();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeCode.trim()) {
      setError("Veuillez saisir un code employé ou email");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("🕐 Tentative de pointage intelligent pour:", employeeCode);
      
      const response = await attendanceService.smartClockIn(employeeCode.trim(), notes.trim());
      
      console.log("📥 Réponse du service:", response);

      if (response.success) {
        setResult(response.data);
        // Réinitialiser le formulaire après succès
        setEmployeeCode("");
        setNotes("");
        
        // Auto-clear result after 5 seconds
        setTimeout(() => {
          setResult(null);
        }, 5000);
      } else {
        setError(response.error || "Erreur lors du pointage");
      }
    } catch (err) {
      console.error("💥 Erreur:", err);
      setError("Erreur lors du pointage intelligent");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    return action === "CHECK_IN" ? "📥" : "📤";
  };

  const getActionColor = (action) => {
    return action === "CHECK_IN" ? "text-green-600" : "text-blue-600";
  };

  const getActionBgColor = (action) => {
    return action === "CHECK_IN" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🕐</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pointage Intelligent
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Scanner ou saisir votre code employé
          </p>
        </div>

        {/* Scanner QR */}
        {showQRScanner && (
          <div className="bg-white rounded-lg shadow border p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-xl mr-2">📷</span>
                <h3 className="text-lg font-medium text-gray-900">Scanner QR Code</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQRScanner(false);
                  stopQRScanner();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                  playsInline
                />
                {/* Overlay de scan */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-blue-500 rounded-lg border-dashed opacity-50"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Pointez la caméra vers un QR code contenant votre code employé ou email
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">
                Code employé ou email
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="employeeCode"
                  name="employeeCode"
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="flex-1 appearance-none relative block px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Entrez votre code employé ou email"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowQRScanner(true);
                    startQRScanner();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  📷 QR
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (optionnel)
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Notes ou justificatifs..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`border rounded-md p-4 ${getActionBgColor(result.action)}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{getActionIcon(result.action)}</span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${getActionColor(result.action)}`}>
                    {result.action === "CHECK_IN" ? "Arrivée enregistrée" : "Départ enregistré"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">{result.message}</p>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    <p><strong>Employé:</strong> {result.attendance.employee.firstName} {result.attendance.employee.lastName}</p>
                    
                    {result.action === "CHECK_IN" && result.isLate && (
                      <p className="text-orange-600">
                        <strong>Retard:</strong> {result.lateMinutes} minutes
                      </p>
                    )}
                    
                    {result.action === "CHECK_OUT" && result.hoursWorked && (
                      <p className="text-blue-600">
                        <strong>Temps travaillé:</strong> {result.hoursWorked}h ({result.totalMinutes} minutes)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              variant="default"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Pointage en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">🕐</span>
                  Pointer
                </div>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            <p className="mb-1">💡 <strong>Comment ça marche ?</strong></p>
            <p>• 📷 Cliquez sur "QR" pour scanner un code QR</p>
            <p>• Premier pointage = Arrivée automatique</p>
            <p>• Deuxième pointage = Départ automatique</p>
            <p>• Calcul automatique des retards et heures travaillées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartClockInPage;