const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-bold mb-2 text-white">Загрузка данных...</h2>
        <p className="text-white/70">Пожалуйста, подождите</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
