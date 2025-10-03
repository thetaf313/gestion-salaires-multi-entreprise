import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Clock, LogIn, LogOut, Calendar, User } from "lucide-react";

const QuickAttendanceWidget = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Récupérer le pointage du jour
  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (!user.employeeId) return;

      const response = await fetch(
        `http://localhost:3003/api/attendances/employee/${user.employeeId}/today`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data.data);
      } else if (response.status === 404) {
        // Pas de pointage aujourd'hui, c'est normal
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du pointage:", error);
    }
  };

  // Effectuer un check-in ou check-out
  const handleQuickAttendance = async (action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        "http://localhost:3003/api/attendances/quick",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            notes: notes || undefined,
          }),
        }
      );

      if (response.ok) {
        setNotes("");
        fetchTodayAttendance(); // Recharger les données
        alert(
          `${
            action === "checkin" ? "Check-in" : "Check-out"
          } effectué avec succès !`
        );
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors du pointage:", error);
      alert("Erreur lors du pointage");
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour l'heure courante
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Vérifier si l'utilisateur est un employé
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user?.employeeId) {
    return null; // Ne pas afficher le widget si l'utilisateur n'est pas un employé
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <Clock className="w-5 h-5 mr-2" />
          Pointage Rapide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations actuelles */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{formatCurrentDate()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 font-mono">
              {formatCurrentTime()}
            </div>
          </div>
        </div>

        {/* Statut du pointage d'aujourd'hui */}
        {todayAttendance && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">
              Pointage d'aujourd'hui
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Arrivée:</span>
                <div className="font-medium text-green-600">
                  {formatTime(todayAttendance.checkIn)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Départ:</span>
                <div className="font-medium text-red-600">
                  {formatTime(todayAttendance.checkOut)}
                </div>
              </div>
            </div>
            {todayAttendance.lateMinutes > 0 && (
              <div className="mt-2 text-sm text-yellow-600">
                ⚠️ Retard de {todayAttendance.lateMinutes} minutes
              </div>
            )}
          </div>
        )}

        {/* Zone de notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajouter une note pour ce pointage..."
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Boutons d'action */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleQuickAttendance("checkin")}
            disabled={
              loading ||
              (todayAttendance?.checkIn && !todayAttendance?.checkOut)
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Check-in
          </Button>

          <Button
            onClick={() => handleQuickAttendance("checkout")}
            disabled={
              loading || !todayAttendance?.checkIn || todayAttendance?.checkOut
            }
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Check-out
          </Button>
        </div>

        {/* Messages d'aide */}
        <div className="text-xs text-gray-500 text-center">
          {!todayAttendance?.checkIn &&
            "Cliquez sur Check-in pour enregistrer votre arrivée"}
          {todayAttendance?.checkIn &&
            !todayAttendance?.checkOut &&
            "Cliquez sur Check-out pour enregistrer votre départ"}
          {todayAttendance?.checkIn &&
            todayAttendance?.checkOut &&
            "✅ Pointage complet pour aujourd'hui"}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAttendanceWidget;
