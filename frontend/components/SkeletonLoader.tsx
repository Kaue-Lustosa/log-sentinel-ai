/**
 * Componente SkeletonLoader - Animação de carregamento
 * Simula o layout dos cards de resultado durante o loading
 */
export default function SkeletonLoader() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando análise...">
      {/* Skeleton Card 1 */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
          <div className="w-32 h-5 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-4/5 h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-3/5 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Skeleton Card 2 */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
          <div className="w-28 h-5 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="w-20 h-6 bg-gray-700 rounded-full animate-pulse" />
      </div>

      {/* Skeleton Card 3 */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
          <div className="w-48 h-5 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="bg-gray-900 p-3 rounded border border-gray-600">
            <div className="w-full h-4 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="bg-gray-900 p-3 rounded border border-gray-600">
            <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Skeleton Card 4 */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
          <div className="w-32 h-5 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-5/6 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
