import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ContractTypeChart = ({
  data,
  title = "Types de contrats",
  height = 300,
}) => {
  // Données d'exemple si aucune donnée n'est fournie
  const defaultData = [
    { name: "Fixe", value: 45, color: "#0088FE" },
    { name: "Journalier", value: 35, color: "#00C49F" },
    { name: "Honoraire", value: 15, color: "#FFBB28" },
  ];

  // Normalize incoming data: accept enums DAILY/FIXED/HONORARIUM or labels and map to display names/colors
  const normalize = (raw) => {
    if (!raw) return defaultData;
    const mapping = {
      DAILY: { name: 'Journalier', color: '#00C49F' },
      FIXED: { name: 'Fixe', color: '#0088FE' },
      HONORARIUM: { name: 'Honoraire', color: '#FFBB28' },
      JOURNALIER: { name: 'Journalier', color: '#00C49F' },
      FIXE: { name: 'Fixe', color: '#0088FE' },
      HONORAIRE: { name: 'Honoraire', color: '#FFBB28' },
    };

    // only include known mappings (FIXED / DAILY / HONORARIUM and synonyms)
    const acc = [];
    (raw || []).forEach((item) => {
      const key = (item.type || item.name || item.label || '').toString();
      const upper = key.toUpperCase();
      const map = mapping[upper];
      const value = item.count ?? item.value ?? 0;
      if (map && value > 0) {
        acc.push({ name: map.name, value, color: map.color });
      }
      // ignore unknown types to avoid showing 'Autre'
    });
    return acc.length > 0 ? acc : defaultData;
    
  };

  const chartData = normalize(data);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Répartition des employés par type de contrat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ContractTypeChart;
