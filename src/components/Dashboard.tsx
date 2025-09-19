// Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

interface Lead {
  _id: string;
  client_name: string;
  phone: string;
  selected_car: string;
  summary: string;
  lead_quality: string;
  timestamp: string;
  source: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/leads', {
        params: { page: 1, limit: 1000 }
      });
      setLeads(res.data.leads || []);
    } catch (err) {
      console.error('Ошибка получения лидов', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const analytics = useMemo(() => {
    const totalLeads = leads.length;

    const sourceCounts: Record<string, number> = {};
    const qualityCounts: Record<string, number> = {};
    const timeMap: Record<string, number> = {};
    const carCounts: Record<string, number> = {};

    leads.forEach(l => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
      qualityCounts[l.lead_quality] = (qualityCounts[l.lead_quality] || 0) + 1;
      const date = new Date(l.timestamp).toISOString().split('T')[0];
      timeMap[date] = (timeMap[date] || 0) + 1;
      carCounts[l.selected_car] = (carCounts[l.selected_car] || 0) + 1;
    });

    const timeData = Object.entries(timeMap).map(([date, count]) => ({ date, leads: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topCars = Object.entries(carCounts)
      .map(([car, count]) => ({ car, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const highQualityLeads = qualityCounts['Высокий'] || 0;
    const qualityConversionRate = totalLeads > 0 ? (highQualityLeads / totalLeads) * 100 : 0;

    return { totalLeads, sourceCounts, qualityCounts, timeData, topCars, highQualityLeads, qualityConversionRate };
  }, [leads]);

  if (loading) return <div className="text-white text-center p-4">Загрузка...</div>;
  if (leads.length === 0) return <div className="text-white text-center p-4">Нет данных</div>;

  const sourceChartData = ['telegramm', 'AmoLine']
    .map(src => ({ name: src, value: analytics.sourceCounts[src] || 0 }))
    .filter(d => d.value > 0);

  return (
    <div className="container space-y-8 p-4 md:p-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <button
          onClick={fetchLeads}
          className="btn btn-primary"
        >
          🔄 Обновить
        </button>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold">{analytics.totalLeads}</div>
          <div className="text-sm md:text-base">Общее количество лидов</div>
        </div>
        <div className="glass-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-green-400">{analytics.qualityConversionRate.toFixed(1)}%</div>
          <div className="text-sm md:text-base">Конверсия по качеству</div>
          <div className="text-xs md:text-sm mt-1">({analytics.highQualityLeads} из {analytics.totalLeads})</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Источники */}
        <div className="glass-card p-4 md:p-6">
          <h3 className="text-lg md:text-xl mb-2 md:mb-4">Распределение по источникам</h3>
          {sourceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} minHeight={200}>
              <PieChart>
                <Pie
                  data={sourceChartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sourceChartData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-white/50 h-60 flex items-center justify-center">Нет данных по источникам</div>
          )}
        </div>

        {/* Динамика */}
        <div className="glass-card p-4 md:p-6">
          <h3 className="text-lg md:text-xl mb-2 md:mb-4">Динамика лидов по времени</h3>
          {analytics.timeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} minHeight={200}>
              <LineChart data={analytics.timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#ffffff70" tick={{ fontSize: 12 }} />
                <YAxis stroke="#ffffff70" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#8884d8" strokeWidth={2} dot={{ fill: '#8884d8', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-white/50 h-60 flex items-center justify-center">Нет данных за период</div>
          )}
        </div>
      </div>

      {/* Топ-5 авто */}
      <div className="glass-card p-4 md:p-6">
        <h3 className="text-lg md:text-xl mb-2 md:mb-4">Топ-5 популярных моделей автомобилей</h3>
        {analytics.topCars.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {analytics.topCars.map((car, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">
                    {idx + 1}
                  </div>
                  <span className="text-sm md:text-base">{car.car || 'Без названия'}</span>
                </div>
                <div className="text-sm md:text-base">{car.count} лидов</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/50 py-6">Нет данных по популярным моделям</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
