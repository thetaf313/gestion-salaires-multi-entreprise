import React from "react";
import {
  LineChart,
  Line,
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

const SalaryChart = ({
  data,
  title = "Évolution des salaires",
  height = 300,
}) => {
  // Données d'exemple si aucune donnée n'est fournie
  const defaultData = [
    { mois: "Jan", salaire: 850000, prime: 100000 },
    { mois: "Fév", salaire: 870000, prime: 120000 },
    { mois: "Mar", salaire: 890000, prime: 110000 },
    { mois: "Avr", salaire: 880000, prime: 130000 },
    { mois: "Mai", salaire: 900000, prime: 125000 },
    { mois: "Juin", salaire: 920000, prime: 140000 },
  ];

  const chartData = data || defaultData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Évolution mensuelle des salaires et primes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="salaire"
              stroke="#8884d8"
              strokeWidth={2}
              name="Salaire de base"
            />
            <Line
              type="monotone"
              dataKey="prime"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Primes"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalaryChart;
