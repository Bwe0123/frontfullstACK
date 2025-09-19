import React from "react";
import {
  Users,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Zap,
  Activity,
} from "lucide-react";

interface NavigationProps {
  currentView: "leads" | "dashboard" | "analytics";
  setCurrentView: (view: "leads" | "dashboard" | "analytics") => void;
  lastSync: Date;
}

export default function Navigation({
  currentView,
  setCurrentView,
  lastSync,
}: NavigationProps) {
  const navItems = [
    { id: "leads" as const, label: "Лиды", icon: Users },
    { id: "dashboard" as const, label: "Дашборд", icon: BarChart3 },
    { id: "analytics" as const, label: "Аналитика", icon: TrendingUp },
  ];

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-full sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
      {/* Верхняя панель */}
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4">
        {/* Лого + вкладки */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">
              LeadsCRM
            </h1>
          </div>

          {/* Кнопки меню */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 sm:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`btn ${
                    isActive ? "btn-primary" : "btn-secondary"
                  } flex items-center gap-1 px-3 py-1 text-xs sm:text-sm md:text-base`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
</div>
        {/* Статус справа */}
       

      {/* Нижняя статус-панель */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 py-2 border-t border-white/10 bg-white/5 text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-secondary">Система активна</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-secondary">99.9% uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
