import React from "react";
import {
  BarChart,
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

const EmployeeChart = ({
  data,
  title = "Répartition des employés",
  height = 300,
}) => {
  // Données d'exemple si aucune donnée n'est fournie
  const defaultData = [
    { departement: "IT", actifs: 15, inactifs: 2 },
    { departement: "RH", actifs: 8, inactifs: 1 },
    { departement: "Finance", actifs: 12, inactifs: 0 },
    { departement: "Marketing", actifs: 10, inactifs: 3 },
    { departement: "Commercial", actifs: 20, inactifs: 4 },
  ];

  const chartData = data || defaultData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Nombre d'employés actifs et inactifs par département
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="departement" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="actifs"
              fill="#10b981"
              name="Employés actifs"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="inactifs"
              fill="#ef4444"
              name="Employés inactifs"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EmployeeChart;
