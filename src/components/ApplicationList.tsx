export function ApplicationList({ applications, selectedId, onCardClick }) {
  return (
    <div className="space-y-4 p-4">
      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No planning applications found</p>
        </div>
      ) : (
        applications.map(app => (
          <div 
            key={app.id}
            id={`application-${app.id}`}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              app.id === selectedId 
                ? 'border-pink-500 shadow-md bg-pink-50' 
                : 'border-gray-200 hover:border-pink-300'
            }`}
            onClick={() => onCardClick(app.id)}
          >
            <h3 className="font-bold text-lg">{app.address}</h3>
            <p className="text-sm text-gray-500">{app.reference}</p>
            <p className="mt-2">{app.description}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs ${
                app.status === 'Pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : app.status === 'Approved' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {app.status}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(app.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 