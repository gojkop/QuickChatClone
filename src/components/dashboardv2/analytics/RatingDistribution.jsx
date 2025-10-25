import React from 'react';
import { Star } from 'lucide-react';

function RatingDistribution({ data = [] }) {
  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>No ratings yet</p>
        </div>
      </div>
    );
  }

  const totalRatings = data.reduce((sum, d) => sum + d.count, 0);
  const avgRating = data.reduce((sum, d) => sum + (d.rating * d.count), 0) / totalRatings;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Rating Distribution</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
          <Star size={20} className="text-yellow-500 fill-yellow-500" />
        </div>
      </div>

      <div className="space-y-3">
        {[...data].reverse().map((item) => {
          const percentage = totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;
          
          return (
            <div key={item.rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
              </div>
              
              <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <span className="text-sm font-medium text-gray-600 w-12 text-right">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <span className="font-medium">{totalRatings}</span> total ratings
      </div>
    </div>
  );
}

export default RatingDistribution;