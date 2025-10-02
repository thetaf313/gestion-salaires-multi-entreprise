import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const RealTimeChart = ({ title = "Activité en temps réel", height = 300 }) => {
  const [data, setData] = useState([]);
  const [trend, setTrend] = useState("up");

  useEffect(() => {
    // Générer des données initiales
    const initialData = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // Dernières 30 minutes
      initialData.push({
        time: time.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: Math.floor(Math.random() * 100) + 50,
        timestamp: time.getTime(),
      });
    }

    setData(initialData);

    // Simuler des mises à jour en temps réel
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData];
        const now = new Date();
        const lastValue = newData[newData.length - 1]?.value || 50;

        // Générer une nouvelle valeur avec une tendance
        const change = (Math.random() - 0.5) * 20;
        const newValue = Math.max(10, Math.min(150, lastValue + change));

        // Déterminer la tendance
        setTrend(newValue > lastValue ? "up" : "down");

        // Ajouter le nouveau point
        newData.push({
          time: now.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: Math.floor(newValue),
          timestamp: now.getTime(),
        });

        // Garder seulement les 30 derniers points
        return newData.slice(-30);
      });
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue
    ? ((change / previousValue) * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Dernières 30 minutes - Mise à jour toutes les 5 secondes
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentValue}</div>
            <Badge
              variant={trend === "up" ? "default" : "destructive"}
              className="mt-1"
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {changePercent}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <Tooltip
              labelFormatter={(label) => `Heure: ${label}`}
              formatter={(value) => [`${value}`, "Valeur"]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={trend === "up" ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: trend === "up" ? "#10b981" : "#ef4444" }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RealTimeChart;
