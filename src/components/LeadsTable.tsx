import React, { useState, useEffect } from "react";

interface Lead {
  _id: string;
  client_name: string;
  phone: string;
  selected_car: string;
  summary: string;
  lead_quality: "Высокий" | "Хороший" | "Средний" | "Низкий";
  timestamp?: string | null;
  source: string;
}

interface LeadsTableProps {
  onFetchLeads: (params?: any) => Promise<{ leads: Lead[]; total: number }>;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ onFetchLeads }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    search: "",
    car: "",
    lead_quality: "",
    source: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  const cleanValue = (value?: string | null) => {
    if (!value || value.trim() === "") return "-";
    return value.replace(/^"+|"+$/g, "");
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
        sort: sortOrder,
      };
      const result = await onFetchLeads(params);

      let sortedLeads: Lead[] = Array.isArray(result.leads) ? result.leads : [];

      // локальная фильтрация по машине
      if (filters.car) {
        sortedLeads = sortedLeads.filter((lead) =>
          lead.selected_car.toLowerCase().includes(filters.car.toLowerCase())
        );
      }

      if (sortOrder === "asc") {
        sortedLeads = sortedLeads.sort((a, b) =>
          a.selected_car.localeCompare(b.selected_car)
        );
      } else {
        sortedLeads = sortedLeads.sort((a, b) =>
          b.selected_car.localeCompare(a.selected_car)
        );
      }

      setLeads(sortedLeads);
      setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, filters, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // 📄 Экспорт PDF с фильтрами
  const exportWithFilters = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(
        `https://backfullstack.onrender.com/api/export/pdf?${query}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Ошибка при экспорте PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "leads.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Ошибка скачивания PDF:", err);
      alert("Не удалось скачать PDF");
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const leadQualities = ["Высокий", "Хороший", "Средний", "Низкий"];
  const sources = ["AmoLine", "telegramm"];

  return (
    <div className="container space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="header flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Лиды</h1>
        <div className="flex gap-2 md:gap-4">
          <button onClick={fetchLeads} className="btn btn-secondary">
            🔄 Обновить
          </button>
          <button onClick={exportWithFilters} className="btn btn-primary">
            📄 Экспорт
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm text-secondary mb-2 block">Поиск</label>
          <input
            type="text"
            className="input"
            placeholder="Имя или телефон..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-secondary mb-2 block">
            Качество лида
          </label>
          <select
            className="input"
            value={filters.lead_quality}
            onChange={(e) => handleFilterChange("lead_quality", e.target.value)}
          >
            <option value="">Все</option>
            {leadQualities.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-secondary mb-2 block">Источник</label>
          <select
            className="input"
            value={filters.source}
            onChange={(e) => handleFilterChange("source", e.target.value)}
          >
            <option value="">Все</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-secondary mb-2 block">
            Поиск по машине
          </label>
          <input
            type="text"
            className="input"
            placeholder="Модель авто..."
            value={filters.car}
            onChange={(e) => handleFilterChange("car", e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="responsive-table">
        {loading ? (
          <div className="text-center p-6">
            <div className="loading-spinner mb-4"></div>
            <p className="text-secondary">Загрузка лидов...</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Имя клиента</th>
                  <th>Телефон</th>
                  <th>
                    Выбранная модель
                    <button
                      className="ml-2 btn btn-ghost"
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </th>
                  <th>Описание взаимодействия</th>
                  <th>Качество лида</th>
                  <th>Дата и время обращения</th>
                  <th>Источник</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(leads) && leads.length > 0 ? (
                  leads.map((lead, idx) => (
                    <tr key={lead._id || idx}>
                      <td>{cleanValue(lead.client_name)}</td>
                      <td>{cleanValue(lead.phone)}</td>
                      <td>{cleanValue(lead.selected_car)}</td>
                      <td>{cleanValue(lead.summary)}</td>
                      <td>{cleanValue(lead.lead_quality)}</td>
                      <td>{formatDate(lead.timestamp)}</td>
                      <td>{cleanValue(lead.source)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 p-4 border-t border-white/20 mt-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn btn-ghost"
                >
                  ← Назад
                </button>
                <span className="text-sm text-secondary">
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-ghost"
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;
