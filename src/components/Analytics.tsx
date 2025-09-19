import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

export interface AnalyticsData {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  avgDealSize: number;
  leadsToday: number;
  leadsThisWeek: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  leadsByStatus?: { [key: string]: number };
  leadsByHour?: { [hour: number]: number };
}

interface AnalyticsProps {
  analytics: AnalyticsData | null;
  onRefresh: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF0'];

const Analytics: React.FC<AnalyticsProps> = ({ analytics, onRefresh }) => {
  if (!analytics) {
    return <p>Загрузка аналитики...</p>;
  }

  // Подготовка данных для графиков
  const conversionData = [
    { name: 'Высокий', value: analytics.convertedLeads },
    { name: 'Остальные', value: analytics.totalLeads - analytics.convertedLeads },
  ];

  const hoursData = [];
  for (let i = 0; i < 24; i++) {
    hoursData.push({
      hour: `${i}:00`,
      leads: analytics.leadsByHour?.[i] || 0,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Аналитика лидов</h1>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Обновить
        </button>
      </div>

      {/* Конверсия по качеству */}
      <div className="glass-card p-6">
        <h2 className="text-xl mb-4">Конверсия по качеству лидов</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={conversionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {conversionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Распределение по часам */}
      <div className="glass-card p-6">
        <h2 className="text-xl mb-4">Распределение лидов по часам дня</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={hoursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="leads" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Эффективность источников */}
      <div className="glass-card p-6">
        <h2 className="text-xl mb-4">Сравнение источников по эффективности</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.topSources}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value}`} />
            <Bar dataKey="count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
