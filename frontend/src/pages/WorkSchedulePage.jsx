import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Clock, Save, RotateCcw } from "lucide-react";

const WorkSchedulePage = () => {
  const { companyId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dayNames = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  // Récupérer les horaires de travail
  const fetchWorkSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken"); // Correction: utiliser 'authToken' au lieu de 'accessToken'
      const url = companyId
        ? `http://localhost:3003/api/work-schedules?companyId=${companyId}`
        : "http://localhost:3003/api/work-schedules";

      if (!token) {
        console.error("Aucun token d'authentification trouvé");
        return;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des horaires:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les horaires de travail
  const saveWorkSchedules = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("authToken"); // Correction: utiliser 'authToken' au lieu de 'accessToken'
      const url = companyId
        ? `http://localhost:3003/api/work-schedules?companyId=${companyId}`
        : "http://localhost:3003/api/work-schedules";

      if (!token) {
        console.error("Aucun token d'authentification trouvé");
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schedules }),
      });

      if (response.ok) {
        alert("Horaires de travail sauvegardés avec succès !");
        fetchWorkSchedules(); // Recharger les données
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde des horaires");
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour un horaire
  const updateSchedule = (dayOfWeek, field, value) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? { ...schedule, [field]: value }
          : schedule
      )
    );
  };

  // Réinitialiser aux horaires par défaut
  const resetToDefault = () => {
    const defaultSchedules = Array.from({ length: 7 }, (_, index) => ({
      dayOfWeek: index,
      startTime: "08:00",
      endTime: "17:00",
      isWorkingDay: index >= 1 && index <= 5, // Lundi à vendredi
    }));
    setSchedules(defaultSchedules);
  };

  useEffect(() => {
    fetchWorkSchedules();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          Chargement des horaires de travail...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Horaires de Travail
          </h1>
          <p className="text-gray-600">
            Configurez les horaires de travail de votre entreprise
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button
            onClick={saveWorkSchedules}
            disabled={saving}
            className=""
            variant="default"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Configuration des Horaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.dayOfWeek}
                className={`p-4 border rounded-lg ${
                  schedule.isWorkingDay
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20">
                      <span className="font-medium">
                        {dayNames[schedule.dayOfWeek]}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={schedule.isWorkingDay}
                        onCheckedChange={(checked) =>
                          updateSchedule(
                            schedule.dayOfWeek,
                            "isWorkingDay",
                            checked
                          )
                        }
                      />
                      <span className="text-sm text-gray-600">
                        {schedule.isWorkingDay
                          ? "Jour travaillé"
                          : "Jour de repos"}
                      </span>
                    </div>
                  </div>

                  {schedule.isWorkingDay && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Début:</label>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            updateSchedule(
                              schedule.dayOfWeek,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-32"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Fin:</label>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            updateSchedule(
                              schedule.dayOfWeek,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="w-32"
                        />
                      </div>

                      <div className="text-sm text-gray-500">
                        {(() => {
                          const start = new Date(
                            `1970-01-01T${schedule.startTime}:00`
                          );
                          const end = new Date(
                            `1970-01-01T${schedule.endTime}:00`
                          );
                          const diff = (end - start) / (1000 * 60 * 60);
                          return diff > 0 ? `${diff.toFixed(1)}h` : "";
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Informations importantes :
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Les horaires sont utilisés pour calculer automatiquement les
                retards
              </li>
              <li>
                • Les jours de repos n'affectent pas les calculs de présence
              </li>
              <li>
                • Les modifications s'appliquent à tous les employés de
                l'entreprise
              </li>
              <li>• Les heures sont au format 24h (ex: 14:30 pour 2h30 PM)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Résumé des horaires */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la Semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-bold text-green-800">
                {schedules.filter((s) => s.isWorkingDay).length}
              </div>
              <div className="text-sm text-green-600">Jours travaillés</div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-lg font-bold text-blue-800">
                {(() => {
                  const totalHours = schedules
                    .filter((s) => s.isWorkingDay)
                    .reduce((sum, s) => {
                      const start = new Date(`1970-01-01T${s.startTime}:00`);
                      const end = new Date(`1970-01-01T${s.endTime}:00`);
                      return sum + (end - start) / (1000 * 60 * 60);
                    }, 0);
                  return totalHours.toFixed(1);
                })()}
                h
              </div>
              <div className="text-sm text-blue-600">Heures par semaine</div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-lg font-bold text-purple-800">
                {(() => {
                  const workingDays = schedules.filter((s) => s.isWorkingDay);
                  if (workingDays.length === 0) return "0h";

                  const totalHours = workingDays.reduce((sum, s) => {
                    const start = new Date(`1970-01-01T${s.startTime}:00`);
                    const end = new Date(`1970-01-01T${s.endTime}:00`);
                    return sum + (end - start) / (1000 * 60 * 60);
                  }, 0);

                  return (totalHours / workingDays.length).toFixed(1);
                })()}
                h
              </div>
              <div className="text-sm text-purple-600">Moyenne par jour</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkSchedulePage;
