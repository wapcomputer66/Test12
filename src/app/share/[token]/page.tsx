'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Key } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface Raiyat {
  raiyatName: string;
  raiyatColor: string;
  totalRecords: number;
  records: LandRecord[];
}

interface LandRecord {
  id: string;
  timestamp: string;
  raiyatName: string;
  raiyatColor: string;
  jamabandiNumber?: string;
  khataNumber?: string;
  khesraNumber: string;
  rakwa?: string;
  uttar?: string;
  dakshin?: string;
  purab?: string;
  paschim?: string;
  remarks?: string;
  createdAt: string;
}

interface OverviewData {
  project: Project;
  statistics: {
    totalRecords: number;
    totalRaiyats: number;
    totalPayments: number;
  };
  paymentSummary: {
    totalAmount: number;
    receivedAmount: number;
    pendingAmount: number;
    paymentStatus: string;
  };
  charts: {
    recordsByRaiyat: Array<{
      name: string;
      color: string;
      count: number;
      percentage: number;
    }>;
    locationSummary: {
      uttar: number;
      dakshin: number;
      purab: number;
      paschim: number;
    };
  };
  recentActivity: {
    records: Array<{
      id: string;
      khesraNumber: string;
      raiyatName: string;
      timestamp: string;
      createdAt: string;
    }>;
    payments: Array<{
      id: string;
      totalAmount: number;
      receivedAmount: number;
      status: string;
      paymentDate: string;
      createdAt: string;
    }>;
  };
  raiyats: Array<{
    name: string;
    color: string;
    recordCount: number;
  }>;
}

export default function ShareView() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [recordsData, setRecordsData] = useState<{
    project: Project;
    raiyats: Raiyat[];
    totalRecords: number;
    allRecords: LandRecord[];
  } | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [activeTab, setActiveTab] = useState('records');
  const [selectedRaiyat, setSelectedRaiyat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if project exists on mount
  useEffect(() => {
    checkProjectExists();
    // Load remembered password if exists
    const rememberedPassword = localStorage.getItem(`remembered_password_${token}`);
    if (rememberedPassword) {
      setPassword(rememberedPassword);
      setRememberPassword(true);
    }
  }, [token]);

  const checkProjectExists = async () => {
    try {
      const response = await fetch(`/api/share/${token}`);
      
      if (response.status === 404) {
        setError('अमान्य शेयर लिंक या लिंक एक्सपायर हो गया है');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else {
        setError('प्रोजेक्ट लोड करने में विफल');
      }
    } catch (error) {
      setError('नेटवर्क त्रुटि');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('पासवर्ड दर्ज करें');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          setIsVerified(true);
          setProject(data.project);
          
          // Save password if remember is checked
          if (rememberPassword) {
            localStorage.setItem(`remembered_password_${token}`, password.trim());
          } else {
            localStorage.removeItem(`remembered_password_${token}`);
          }
          
          await loadProjectData();
          toast({ title: 'सफलता', description: 'प्रोजेक्ट एक्सेस किया गया' });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'गलत पासवर्ड');
      }
    } catch (error) {
      setError('नेटवर्क त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectData = async () => {
    try {
      // Load records data
      const recordsResponse = await fetch(`/api/share/${token}/records`);
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setRecordsData(recordsData);
      }

      // Load overview data
      const overviewResponse = await fetch(`/api/share/${token}/overview`);
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverviewData(overviewData);
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  };

  // Filter records based on selected raiyat and search term
  const getFilteredRecords = () => {
    if (!recordsData) return [];
    
    let filteredRecords = recordsData.allRecords;
    
    // Filter by raiyat
    if (selectedRaiyat !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.raiyatName === selectedRaiyat);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.khesraNumber.toLowerCase().includes(searchLower) ||
        (record.khataNumber && record.khataNumber.toLowerCase().includes(searchLower)) ||
        (record.jamabandiNumber && record.jamabandiNumber.toLowerCase().includes(searchLower)) ||
        (record.rakwa && record.rakwa.toLowerCase().includes(searchLower)) ||
        (record.uttar && record.uttar.toLowerCase().includes(searchLower)) ||
        (record.dakshin && record.dakshin.toLowerCase().includes(searchLower)) ||
        (record.purab && record.purab.toLowerCase().includes(searchLower)) ||
        (record.paschim && record.paschim.toLowerCase().includes(searchLower)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchLower))
      );
    }
    
    return filteredRecords;
  };

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2">लिंक एक्सपायर हो गया</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              होम पेज पर जाएं
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <span>🏠</span>
              <span>प्रोजेक्ट एक्सेस</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project && (
              <div className="text-center">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <p className="text-sm text-gray-600">पासवर्ड दर्ज करें</p>
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="मोबाइल नंबर (पासवर्ड)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-password"
                  checked={rememberPassword}
                  onCheckedChange={(checked) => {
                    setRememberPassword(checked as boolean);
                    if (!checked) {
                      localStorage.removeItem(`remembered_password_${token}`);
                    }
                  }}
                />
                <label
                  htmlFor="remember-password"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  पासवर्ड याद रखें
                </label>
              </div>
              
              {error && (
                <Alert>
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'वेरिफाई हो रहा है...' : 'एक्सेस करें'}
              </Button>
            </form>
            
            <div className="text-xs text-gray-500 text-center">
              <p>प्रोजेक्ट का मोबाइल नंबर पासवर्ड के रूप में उपयोग करें</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project || !recordsData || !overviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                📅 {new Date(project.createdAt).toLocaleDateString('hi-IN')}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 px-3 py-1 text-sm">
              🔓 शेयर किया गया
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="records" className="flex items-center space-x-2 text-sm sm:text-base">
              <span>📋</span>
              <span>Records</span>
              <Badge variant="secondary" className="ml-1">{recordsData.totalRecords}</Badge>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center space-x-2 text-sm sm:text-base">
              <span>📊</span>
              <span>Overview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            {/* Filters Section */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Raiyat Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      रैयत के अनुसार फ़िल्टर करें
                    </label>
                    <select
                      value={selectedRaiyat}
                      onChange={(e) => setSelectedRaiyat(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">सभी रैयत</option>
                      {recordsData?.raiyats.map((raiyat) => (
                        <option key={raiyat.raiyatName} value={raiyat.raiyatName}>
                          {raiyat.raiyatName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Search Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      खोजें (खेसरा, खाता, जमाबंदी, टिप्पणी)
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="खोजने के लिए टाइप करें..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Results Count */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    कुल {getFilteredRecords().length} रिकॉर्ड मिले (सभी मिलाकर {recordsData?.totalRecords || 0})
                  </div>
                  <div className="flex space-x-2">
                    {(searchTerm || selectedRaiyat !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedRaiyat('all');
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        सभी फ़िल्टर साफ़ करें
                      </button>
                    )}
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        खोज साफ़ करें
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unified Records Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>भूमि रिकॉर्ड</span>
                  <Badge variant="outline">{getFilteredRecords().length} रिकॉर्ड</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[100px]">रैयत</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[80px]">खेसरा</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[80px]">खाता</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[80px]">जमाबंदी</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[80px]">रकवा</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[100px]">उत्तर</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[100px]">दक्षिण</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[100px]">पूर्ब</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[100px]">पश्चिम</th>
                        <th className="text-left p-3 font-semibold text-gray-700 min-w-[120px]">टिप्पणी</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredRecords().map((record, index) => (
                        <tr key={record.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: record.raiyatColor }}
                              />
                              <span 
                                className="font-semibold"
                                style={{ color: record.raiyatColor }}
                              >
                                {record.raiyatName}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-gray-900">{record.khesraNumber}</td>
                          <td className="p-3 text-gray-700">{record.khataNumber || '-'}</td>
                          <td className="p-3 text-gray-700">{record.jamabandiNumber || '-'}</td>
                          <td className="p-3 text-gray-700">{record.rakwa || '-'}</td>
                          <td className="p-3 text-gray-700">{record.uttar || '-'}</td>
                          <td className="p-3 text-gray-700">{record.dakshin || '-'}</td>
                          <td className="p-3 text-gray-700">{record.purab || '-'}</td>
                          <td className="p-3 text-gray-700">{record.paschim || '-'}</td>
                          <td className="p-3 text-gray-700">{record.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {getFilteredRecords().length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-600">कोई रिकॉर्ड नहीं मिला</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {searchTerm || selectedRaiyat !== 'all' 
                          ? 'फ़िल्टर बदलें या साफ़ करें' 
                          : 'कोई रिकॉर्ड उपलब्ध नहीं है'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-8">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">कुल रिकॉर्ड</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{overviewData.statistics.totalRecords}</p>
                      <p className="text-xs text-gray-500 mt-1">भूमि रिकॉर्ड</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-2xl">📋</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">कुल रैयत</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{overviewData.statistics.totalRaiyats}</p>
                      <p className="text-xs text-gray-500 mt-1">जमीन मालिक</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">कुल भुगतान</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{overviewData.statistics.totalPayments}</p>
                      <p className="text-xs text-gray-500 mt-1">लेनदेन</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary with Progress */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-6">
                <CardTitle className="text-2xl flex items-center space-x-3">
                  <span className="text-3xl">💰</span>
                  <span>भुगतान विवरण</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Payment Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-600 mb-2">कुल राशि</p>
                        <p className="text-2xl font-bold text-blue-900">₹{overviewData.paymentSummary.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600 mb-2">प्राप्त राशि</p>
                        <p className="text-2xl font-bold text-green-900">₹{overviewData.paymentSummary.receivedAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-orange-600 mb-2">बाकी राशि</p>
                        <p className="text-2xl font-bold text-orange-900">₹{overviewData.paymentSummary.pendingAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">भुगतान प्रगति</span>
                      <span className="text-sm font-bold text-gray-900">
                        {overviewData.paymentSummary.totalAmount > 0 
                          ? Math.round((overviewData.paymentSummary.receivedAmount / overviewData.paymentSummary.totalAmount) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                        style={{ 
                          width: `${overviewData.paymentSummary.totalAmount > 0 
                            ? (overviewData.paymentSummary.receivedAmount / overviewData.paymentSummary.totalAmount) * 100 
                            : 0}%` 
                        }}
                      >
                        <span className="text-xs font-medium text-white">
                          {overviewData.paymentSummary.totalAmount > 0 
                            ? Math.round((overviewData.paymentSummary.receivedAmount / overviewData.paymentSummary.totalAmount) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>₹0</span>
                      <span>₹{overviewData.paymentSummary.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raiyat Distribution - Enhanced PC Style */}
            <Card className="hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-xl flex items-center space-x-3">
                  <div className="bg-purple-500 text-white p-2 rounded-lg">
                    <span>🏷️</span>
                  </div>
                  <span>रैयत वितरण</span>
                  <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700">
                    {overviewData.raiyats.length} रैयत
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {overviewData.raiyats.map((raiyat, index) => (
                    <div key={raiyat.name} className="group">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-6 h-6 rounded-full flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: raiyat.color }}
                          />
                          <div>
                            <span className="font-semibold text-gray-900 text-lg">{raiyat.name}</span>
                            <div className="text-sm text-gray-600">रैयत #{index + 1}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{raiyat.recordCount}</div>
                            <div className="text-sm text-gray-600">रिकॉर्ड</div>
                          </div>
                          <div className="w-48 lg:w-64">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full transition-all duration-500 relative"
                                  style={{ 
                                    width: `${(raiyat.recordCount / overviewData.statistics.totalRecords) * 100}%` 
                                  }}
                                >
                                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right bg-white px-2 py-1 rounded border">
                                {Math.round((raiyat.recordCount / overviewData.statistics.totalRecords) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary Stats */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{overviewData.statistics.totalRecords}</div>
                        <div className="text-xs text-gray-600">कुल रिकॉर्ड</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{overviewData.raiyats.length}</div>
                        <div className="text-xs text-gray-600">कुल रैयत</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {Math.round(overviewData.statistics.totalRecords / overviewData.raiyats.length)}
                        </div>
                        <div className="text-xs text-gray-600">औसत प्रति रैयत</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {Math.max(...overviewData.raiyats.map(r => r.recordCount))}
                        </div>
                        <div className="text-xs text-gray-600">अधिकतम रिकॉर्ड</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <Card className="hover:shadow-lg transition-all duration-300 bg-white">
                <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="bg-orange-500 text-white p-2 rounded-lg">
                      <span>⚡</span>
                    </div>
                    <span>त्वरित कार्य</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      📊 विस्तृत रिपोर्ट डाउनलोड करें
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      📧 ईमेल द्वारा भेजें
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      🖨️ प्रिंट करें
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}