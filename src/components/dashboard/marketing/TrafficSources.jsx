import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Brand colors for charts - following brand kit
const COLORS = ['#4F46E5', '#7C3AED', '#8B5CF6', '#F59E0B', '#10B981'];

export default function TrafficSources({ trafficSources }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
          <h3 className="text-lg font-black text-ink mb-4">Traffic by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="visits"
              >
                {trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
          <h3 className="text-lg font-black text-ink mb-4">Conversion by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trafficSources}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: '#4B5563', fontWeight: 600 }} />
              <YAxis tick={{ fill: '#4B5563', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              />
              <Bar dataKey="questions" fill="#4F46E5" name="Questions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
        <h3 className="text-lg font-black text-ink mb-4">Source Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-canvas">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Visits</th>
                <th className="px-4 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Questions</th>
                <th className="px-4 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Conv. Rate</th>
                <th className="px-4 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trafficSources.map((source, idx) => (
                <tr key={source.name} className="hover:bg-canvas transition-colors duration-fast">
                  <td className="px-4 py-4 flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-bold text-ink capitalize">{source.name}</span>
                  </td>
                  <td className="px-4 py-4 text-ink font-bold">{source.visits}</td>
                  <td className="px-4 py-4 text-ink font-bold">{source.questions}</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-100 text-primary">
                      {((source.questions / source.visits) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-ink font-black">€{source.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}