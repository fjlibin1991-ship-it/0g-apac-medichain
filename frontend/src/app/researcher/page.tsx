'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEpidemiologyLog } from '@/lib/0g';

interface RegionStat {
  regionCode: number;
  cases: number;
  topSymptoms: string[];
}

interface SymptomStat {
  symptom: string;
  count: number;
  percentage: number;
}

interface AgeGroupStat {
  ageGroup: string;
  count: number;
}

export default function ResearcherPage() {
  const [stats, setStats] = useState<{
    totalCases: number;
    bySymptom: Record<string, number>;
    byAgeGroup: Record<string, number>;
    byRegion: Record<number, number>;
    lastUpdated: number;
  } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  const { getStats, queryData } = useEpidemiologyLog();

  useEffect(() => {
    loadStats();
  }, [selectedRegion]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getStats(selectedRegion || undefined);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAgeGroup = (group: string): string => {
    const labels: Record<string, string> = {
      '0_4': '0-4 years',
      '5_14': '5-14 years',
      '15_24': '15-24 years',
      '25_44': '25-44 years',
      '45_64': '45-64 years',
      '65_plus': '65+ years',
    };
    return labels[group] || group;
  };

  const formatSymptom = (code: string): string => {
    const labels: Record<string, string> = {
      'S001': 'Fever',
      'S002': 'Cough',
      'S003': 'Headache',
      'S004': 'Fatigue',
      'S005': 'Body Aches',
      'S006': 'Sore Throat',
      'S007': 'Congestion',
      'S008': 'Nausea',
      'S009': 'Vomiting',
      'S010': 'Diarrhea',
      'S011': 'Abdominal Pain',
      'S012': 'Chest Pain',
      'S013': 'Shortness of Breath',
      'S014': 'Rash',
      'S015': 'Joint Pain',
      'S016': 'Dizziness',
      'S017': 'Chills',
      'S018': 'Loss of Taste',
      'S019': 'Loss of Smell',
      'S020': 'Eye Redness',
      'S021': 'Swelling',
      'S022': 'Unusual Bleeding',
      'S023': 'Confusion',
      'S024': 'Seizures',
    };
    return labels[code] || code;
  };

  // Calculate top symptoms
  const topSymptoms: SymptomStat[] = stats
    ? Object.entries(stats.bySymptom)
        .map(([symptom, count]) => ({
          symptom,
          count,
          percentage: stats.totalCases > 0 ? (count / stats.totalCases) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : [];

  // Calculate age distribution
  const ageDistribution: AgeGroupStat[] = stats
    ? Object.entries(stats.byAgeGroup)
        .map(([ageGroup, count]) => ({ ageGroup, count }))
        .sort((a, b) => {
          const order = ['0_4', '5_14', '15_24', '25_44', '45_64', '65_plus'];
          return order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup);
        })
    : [];

  // Calculate region distribution
  const regionDistribution: RegionStat[] = stats
    ? Object.entries(stats.byRegion)
        .map(([regionCode, cases]) => ({
          regionCode: parseInt(regionCode),
          cases,
          topSymptoms: topSymptoms.slice(0, 3).map(s => s.symptom)
        }))
        .sort((a, b) => b.cases - a.cases)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-primary-700">MediChain</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Researcher Dashboard</span>
            <Link href="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Epidemiology Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Anonymous, aggregated health data for public health research
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Last 24 Hours</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
              </select>
              <Button variant="outline" onClick={loadStats}>
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-800">Privacy Protected</h3>
              <p className="text-sm text-green-700">
                All data displayed here is anonymized and aggregated. No individual health records 
                or personally identifiable information is accessible through this dashboard.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : stats ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Total Cases</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalCases.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">in selected period</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Active Regions</div>
                  <div className="text-3xl font-bold text-gray-900">{regionDistribution.length}</div>
                  <div className="text-sm text-gray-500 mt-1">reporting data</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Unique Symptoms</div>
                  <div className="text-3xl font-bold text-gray-900">{topSymptoms.length}</div>
                  <div className="text-sm text-gray-500 mt-1">tracked</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                  <div className="text-lg font-bold text-gray-900">
                    {new Date(stats.lastUpdated).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(stats.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Symptoms */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Top Symptoms</h2>
                  <div className="space-y-3">
                    {topSymptoms.map((item) => (
                      <div key={item.symptom}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{formatSymptom(item.symptom)}</span>
                          <span className="text-sm text-gray-500">
                            {item.count} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Age Distribution</h2>
                  <div className="space-y-4">
                    {ageDistribution.map((item) => (
                      <div key={item.ageGroup} className="flex items-center">
                        <div className="w-24 text-sm font-medium">{formatAgeGroup(item.ageGroup)}</div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-secondary-500 h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                              style={{
                                width: `${stats.totalCases > 0 ? (item.count / stats.totalCases) * 100 : 0}%`
                              }}
                            >
                              {stats.totalCases > 0 ? ((item.count / stats.totalCases) * 100).toFixed(1) : 0}%
                            </div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm text-gray-500">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Regional Data */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Regional Distribution</h2>
                {regionDistribution.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No regional data available
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Region</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Cases</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Share</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Top Symptoms</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regionDistribution.map((region) => (
                          <tr key={region.regionCode} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className="font-medium">Region {region.regionCode}</span>
                            </td>
                            <td className="py-3 px-4 text-right">{region.cases.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-gray-500">
                              {stats.totalCases > 0 ? ((region.cases / stats.totalCases) * 100).toFixed(1) : 0}%
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {region.topSymptoms.map((symptom) => (
                                  <span
                                    key={symptom}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {formatSymptom(symptom)}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Data Export */}
              <div className="mt-8 flex justify-end">
                <Button variant="outline">
                  Export Aggregated Data (CSV)
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-gray-500 mb-6">
                Anonymous epidemiology data will appear here as consultations are conducted.
              </p>
              <Button onClick={loadStats}>Refresh</Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white mt-16">
        <div className="container mx-auto max-w-7xl text-center text-gray-500 text-sm">
          <p>MediChain Epidemiology Dashboard | All data is anonymized and aggregated</p>
          <p className="mt-2">Powered by 0G Storage | For public health research purposes only</p>
        </div>
      </footer>
    </div>
  );
}
