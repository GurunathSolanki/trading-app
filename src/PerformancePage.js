import PerformanceChart from "./PerformanceChart";

export default function PerformancePage({ trades }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white fw-semibold">
        Performance Comparison
      </div>
      <div className="card-body">
        <PerformanceChart trades={trades} />
      </div>
    </div>
  );
}