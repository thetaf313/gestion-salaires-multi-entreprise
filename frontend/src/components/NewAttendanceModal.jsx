import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  QrCode,
  User,
  Calendar,
  Clock,
  Scan,
  StopCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import attendanceService from "../services/attendanceService";
import QrScanner from "qr-scanner";

const NewAttendanceModal = ({ isOpen, onClose, companyId, onSuccess }) => {
  const [employeeCodeOrEmail, setEmployeeCodeOrEmail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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
            setEmployeeCodeOrEmail(result.data);
            setShowQRScanner(false);
            stopQRScanner();
            searchEmployee(result.data);
            setAlert({
              type: "success",
              message: `QR Code scanné: ${result.data}`,
            });
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment", // Caméra arrière
            maxScansPerSecond: 5,
          }
        );

        await qrScannerRef.current.start();
        setAlert({
          type: "success",
          message: "Scanner QR activé. Pointez la caméra vers un QR code.",
        });
      }
    } catch (error) {
      console.error("Erreur démarrage scanner QR:", error);
      setAlert({
        type: "error",
        message:
          "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.",
      });
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

  // Scanner QR Code (simulation - dans un vrai projet, utiliser une librairie comme qr-scanner)
  const scanQRCode = () => {
    // Le scanner est maintenant géré automatiquement par la librairie
    // Cette fonction n'est plus nécessaire mais gardée pour compatibilité
  };

  // Rechercher l'employé par code ou email
  const searchEmployee = async (searchTerm) => {
    if (!searchTerm) {
      setEmployeeInfo(null);
      return;
    }

    try {
      setLoadingEmployee(true);
      console.log("🔍 Frontend - Recherche employé:", {
        companyId,
        searchTerm,
      });

      const result = await attendanceService.searchEmployee(
        companyId,
        searchTerm
      );

      console.log("📋 Frontend - Résultat reçu:", result);

      if (result.success) {
        console.log("✅ Frontend - Données employé:", result.data);
        setEmployeeInfo(result.data);
        setAlert({
          type: "success",
          message: `Employé trouvé: ${result.data.firstName} ${result.data.lastName}`,
        });
      } else {
        console.log("❌ Frontend - Erreur:", result.error);
        setEmployeeInfo(null);
        setAlert({
          type: "error",
          message: result.error || "Employé non trouvé",
        });
      }
    } catch (error) {
      console.error("Erreur recherche employé:", error);
      setEmployeeInfo(null);
      setAlert({
        type: "error",
        message: "Erreur lors de la recherche de l'employé",
      });
    } finally {
      setLoadingEmployee(false);
    }
  };

  // Créer le pointage
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeInfo) {
      setAlert({
        type: "error",
        message: "Veuillez d'abord rechercher un employé valide",
      });
      return;
    }

    if (!date) {
      setAlert({
        type: "error",
        message: "Veuillez sélectionner une date",
      });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);

      const attendanceData = {
        employeeCodeOrEmail: employeeCodeOrEmail,
        date: date,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        notes: notes || undefined,
      };

      const result = await attendanceService.createWithAutoStatus(
        attendanceData
      );

      if (result.success) {
        setAlert({
          type: "success",
          message: `Pointage créé avec succès! Statut: ${result.data.status}`,
        });

        // Reset form
        setEmployeeCodeOrEmail("");
        setDate(new Date().toISOString().split("T")[0]);
        setCheckIn("");
        setCheckOut("");
        setNotes("");
        setEmployeeInfo(null);

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setAlert({
          type: "error",
          message: result.error || "Erreur lors de la création du pointage",
        });
      }
    } catch (error) {
      console.error("Erreur création pointage:", error);
      setAlert({
        type: "error",
        message: "Erreur lors de la création du pointage",
      });
    } finally {
      setLoading(false);
    }
  };

  // Effet pour rechercher l'employé quand le champ change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (employeeCodeOrEmail.trim()) {
        searchEmployee(employeeCodeOrEmail.trim());
      } else {
        setEmployeeInfo(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [employeeCodeOrEmail, companyId]);

  // Nettoyer le scanner quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      stopQRScanner();
      setShowQRScanner(false);
    }

    // Cleanup quand le composant se démonte
    return () => {
      stopQRScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Nouveau Pointage Intelligent
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {alert && (
            <Alert
              className={`mb-4 ${
                alert.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <AlertDescription
                className={
                  alert.type === "error" ? "text-red-700" : "text-green-700"
                }
              >
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Scanner QR */}
          {showQRScanner && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Scanner QR Code
                  </div>
                  <Button
                    onClick={() => {
                      setShowQRScanner(false);
                      stopQRScanner();
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    qrcode.react
                    <StopCircle className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      Pointez la caméra vers un QR code contenant le code
                      employé ou l'email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recherche employé */}
            <div className="space-y-2">
              <Label htmlFor="employee">Code employé ou Email</Label>
              <div className="flex gap-2">
                <Input
                  id="employee"
                  placeholder="Entrez le code employé ou l'email..."
                  value={employeeCodeOrEmail}
                  onChange={(e) => setEmployeeCodeOrEmail(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  onClick={() => {
                    setShowQRScanner(true);
                    startQRScanner();
                  }}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>

              {loadingEmployee && (
                <p className="text-sm text-blue-600">Recherche en cours...</p>
              )}

              {employeeInfo && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium text-green-800">
                          {employeeInfo.firstName} {employeeInfo.lastName}
                        </p>
                        <p className="text-sm text-green-600">
                          Code: {employeeInfo.employeeCode} |{" "}
                          {employeeInfo.email}
                        </p>
                        <p className="text-sm text-green-600">
                          Poste: {employeeInfo.position}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Heures */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Heure d'arrivée</Label>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <Input
                    id="checkIn"
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Heure de départ</Label>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <Input
                    id="checkOut"
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input
                id="notes"
                placeholder="Notes supplémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !employeeInfo}
                className="flex-1"
                variant="default"
              >
                {loading ? "Création..." : "Créer le Pointage"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAttendanceModal;
