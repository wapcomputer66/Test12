'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface BeautifulChartProps {
  data: ChartData[];
  onRaiyatClick?: (raiyatName: string) => void;
}

export default function BeautifulChart({ data, onRaiyatClick }: BeautifulChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleRaiyatClick = (raiyatName: string) => {
    if (onRaiyatClick) {
      onRaiyatClick(raiyatName);
    }
  };

  const totalRakwa = data.reduce((sum, item) => sum + item.value, 0);

  // Vibrant color palette matching the examples
  const vibrantColors = [
    '#ef4444', // Red
    '#22c55e', // Green  
    '#a16207', // Dark brown/amber
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Orange
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f97316', // Dark orange
    '#6366f1', // Indigo
    '#84cc16', // Lime
  ];

  // Get color for each raiyat
  const getColorForRaiyat = (index: number, raiyatColor?: string) => {
    // Use raiyat's assigned color if available, otherwise use vibrant colors
    return raiyatColor || vibrantColors[index % vibrantColors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const chartData = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{chartData.name}</p>
          <p className="text-sm text-gray-600">
            {chartData.value.toFixed(2)} डिसमिल ({chartData.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          कोई डेटा उपलब्ध नहीं है
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer transition-all duration-300 border-l-4 ${
              hoveredIndex === index 
                ? 'transform -translate-y-1 shadow-lg border-blue-500' 
                : 'shadow hover:shadow-md border-gray-300'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleRaiyatClick(entry.name)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: getColorForRaiyat(index, entry.color) }}
              />
              <span className="font-medium" style={{ color: getColorForRaiyat(index, entry.color) }}>
                {entry.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {entry.value.toFixed(2)} डिसमिल
              </span>
              <Badge 
                variant="secondary" 
                className={`transition-all duration-300 ${
                  hoveredIndex === index ? 'bg-blue-100 text-blue-800' : ''
                }`}
              >
                {entry.percentage}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {data.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart Container */}
              <div className="bg-gray-50 rounded-lg p-3 shadow-inner">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        innerRadius={48} // 60% cutout
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getColorForRaiyat(index, entry.color)}
                            stroke="#ffffff"
                            strokeWidth={2}
                            style={{
                              filter: hoveredIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => handleRaiyatClick(entry.name)}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend Container */}
              <div className="bg-gray-50 rounded-lg p-3 shadow-inner">
                <h3 className="text-base font-semibold mb-3 text-gray-800 text-center">रैयत विवरण</h3>
                <div className="max-h-60 overflow-y-auto">
                  <CustomLegend />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg">कोई डेटा उपलब्ध नहीं है</p>
                <p className="text-gray-400 text-sm mt-2">
                  रिकॉर्ड जोड़ने के लिए फॉर्म टैब पर जाएं
                </p>
              </div>
            </div>
          )}

          {data.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">कुल रकवा:</span>
                <Badge variant="default" className="text-lg px-4 py-1 bg-transparent border-2 border-gray-800 text-black font-bold">
                  {totalRakwa.toFixed(2)} डिसमिल
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}