import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CombinedChart = ({ data, title = "Analyse complète", height = 400 }) => {
  // Données d'exemple si aucune donnée n'est fournie
  const defaultData = [
    {
      mois: "Jan",
      salaires: 45000000,
      employees: 67,
      heuresSupp: 120,
      tauxAbsenteisme: 5.2,
    },
    {
      mois: "Fév",
      salaires: 47000000,
      employees: 69,
      heuresSupp: 95,
      tauxAbsenteisme: 4.8,
    },
    {
      mois: "Mar",
      salaires: 46000000,
      employees: 71,
      heuresSupp: 110,
      tauxAbsenteisme: 6.1,
    },
    {
      mois: "Avr",
      salaires: 48000000,
      employees: 73,
      heuresSupp: 85,
      tauxAbsenteisme: 4.5,
    },
    {
      mois: "Mai",
      salaires: 49000000,
      employees: 75,
      heuresSupp: 102,
      tauxAbsenteisme: 5.0,
    },
    {
      mois: "Juin",
      salaires: 51000000,
      employees: 78,
      heuresSupp: 118,
      tauxAbsenteisme: 5.7,
    },
  ];

  const chartData = data || defaultData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Vue d'ensemble des métriques RH et financières
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatPercentage}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "salaires") return formatCurrency(value);
                if (name === "tauxAbsenteisme") return formatPercentage(value);
                return value;
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="salaires"
              fill="#8884d8"
              name="Salaires (FCFA)"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="heuresSupp"
              fill="#82ca9d"
              name="Heures supplémentaires"
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="employees"
              stroke="#ff7300"
              strokeWidth={3}
              name="Nombre d'employés"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="tauxAbsenteisme"
              stroke="#ff0000"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Taux d'absentéisme (%)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CombinedChart;
