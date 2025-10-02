import React from "react";
import {
  AreaChart,
  Area,
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

const PayrollChart = ({
  data,
  title = "Évolution de la masse salariale",
  height = 300,
}) => {
  // Données d'exemple si aucune donnée n'est fournie
  const defaultData = [
    {
      mois: "Jan",
      masseSalariale: 45000000,
      cotisations: 8000000,
      total: 53000000,
    },
    {
      mois: "Fév",
      masseSalariale: 47000000,
      cotisations: 8200000,
      total: 55200000,
    },
    {
      mois: "Mar",
      masseSalariale: 46000000,
      cotisations: 8100000,
      total: 54100000,
    },
    {
      mois: "Avr",
      masseSalariale: 48000000,
      cotisations: 8400000,
      total: 56400000,
    },
    {
      mois: "Mai",
      masseSalariale: 49000000,
      cotisations: 8600000,
      total: 57600000,
    },
    {
      mois: "Juin",
      masseSalariale: 51000000,
      cotisations: 8900000,
      total: 59900000,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Évolution mensuelle de la masse salariale et cotisations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="masseSalariale"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              name="Masse salariale"
            />
            <Area
              type="monotone"
              dataKey="cotisations"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="Cotisations"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PayrollChart;
