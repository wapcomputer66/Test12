'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  email: string;
  name?: string;
  mobile?: string;
  address?: string;
}

interface Raiyat {
  id: string;
  name: string;
  color?: string;
}

interface LandRecord {
  id: string;
  timestamp: string;
  raiyatId: string;
  raiyatName: string;
  raiyatColor?: string;
  jamabandiNumber?: string;
  khataNumber?: string;
  khesraNumber: string;
  rakwa?: string;
  uttar?: string;
  dakshin?: string;
  purab?: string;
  paschim?: string;
  remarks?: string;
}

interface Project {
  id: string;
  name: string;
  created: string;
  raiyatNames: Raiyat[];
  landRecords: LandRecord[];
  totalPayment?: number;
  receivedPayment?: number;
  pendingPayment?: number;
}

interface Payment {
  id: string;
  projectId: string;
  project?: {
    name: string;
  };
  totalAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  paymentDate: string;
  status: 'pending' | 'partial' | 'completed';
  paymentType?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  // App states
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  
  // Form states
  const [formData, setFormData] = useState({
    raiyatName: '',
    jamabandiNumber: '',
    khataNumber: '',
    khesraNumber: '',
    rakwa: '',
    uttar: '',
    dakshin: '',
    purab: '',
    paschim: '',
    remarks: ''
  });
  
  // Project management
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectMobile, setNewProjectMobile] = useState('');
  const [newRaiyatName, setNewRaiyatName] = useState('');
  
  // UI states
  const [showRecordView, setShowRecordView] = useState(false);
  const [showEditRecord, setShowEditRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  const [currentRaiyatFilter, setCurrentRaiyatFilter] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectMobile, setEditingProjectMobile] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [raiyatToDelete, setRaiyatToDelete] = useState<{id: string, name: string} | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<{id: string, khesraNumber: string} | null>(null);
  const [deletingRaiyatId, setDeletingRaiyatId] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [updatingRecord, setUpdatingRecord] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [addingRaiyat, setAddingRaiyat] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  
  const [syncStatus, setSyncStatus] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: '',
    address: ''
  });
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteAccountEmail, setDeleteAccountEmail] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    projectId: '',
    totalAmount: '',
    receivedAmount: '',
    paymentType: 'cash',
    description: ''
  });
  const [addingPayment, setAddingPayment] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  
  // Edit payment states
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState({
    totalAmount: '',
    receivedAmount: '',
    paymentType: 'cash',
    description: ''
  });
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  
  // Processing modal states
  const [processingModal, setProcessingModal] = useState({
    isOpen: false,
    message: '',
    subMessage: ''
  });

  // Floating form states
  const [showFloatingForm, setShowFloatingForm] = useState(false);
  const [floatingFormData, setFloatingFormData] = useState({
    raiyatName: '',
    jamabandiNumber: '',
    khataNumber: '',
    khesraNumber: '',
    rakwa: '',
    uttar: '',
    dakshin: '',
    purab: '',
    paschim: '',
    remarks: ''
  });

  // Share functionality states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{
    shareUrl: string;
    shareToken: string;
    whatsappMessage: string;
    project: any;
  } | null>(null);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [sharingProjectId, setSharingProjectId] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || null;

  // Load user from localStorage on mount and check auth
  useEffect(() => {
    const initializeApp = async () => {
      const savedUser = localStorage.getItem('user');
      const savedProjectId = localStorage.getItem('currentProjectId');
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          setTimeout(() => {
            setIsInitializing(false);
          }, 2000);
        } catch (error) {
          localStorage.removeItem('user');
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
      
      if (savedProjectId) {
        setCurrentProjectId(savedProjectId);
      }
    };

    initializeApp();
  }, []);

  // Save currentProjectId to localStorage when it changes
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('currentProjectId', currentProjectId);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, [currentProjectId]);

  // Load projects when user changes
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/projects?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const projectsData = data.projects || data;
          console.log('Projects loaded:', projectsData);
          setProjects(projectsData);
          
          if (projectsData.length > 0 && !currentProjectId) {
            setCurrentProjectId(projectsData[0].id);
          }
        }
        
        if (isInitializing) {
          setTimeout(() => {
            setIsInitializing(false);
          }, 500);
        }
        
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    if (user) {
      loadProjects();
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Load payments when user or current project changes
  useEffect(() => {
    const loadPayments = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/payments?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const paymentsData = data.payments || data;
          console.log('Payments loaded:', paymentsData);
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error('Failed to load payments:', error);
      }
    };

    if (user) {
      loadPayments();
    }
  }, [user, currentProjectId]);

  // Auth functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setAuthSuccess('लॉगिन सफल!');
        toast({ title: 'सफलता', description: 'आप सफलतापूर्वक लॉग इन हो गए हैं' });
      } else {
        setAuthError(data.error || 'लॉगिन विफल');
        toast({ title: 'त्रुटि', description: data.error || 'लॉगिन विफल' });
      }
    } catch (error) {
      setAuthError('नेटवर्क त्रुटि');
      toast({ title: 'त्रुटि', description: 'नेटवर्क त्रुटि - कृपया फिर से कोशिश करें' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    if (signupPassword !== signupConfirmPassword) {
      setAuthError('पासवर्ड मेल नहीं खाते हैं');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: signupName, 
          email: signupEmail, 
          mobile: signupMobile,
          address: signupAddress,
          password: signupPassword 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setAuthSuccess('अकाउंट सफलतापूर्वक बनाया गया!');
        toast({ title: 'सफलता', description: 'आपका अकाउंट सफलतापूर्वक बन गया है' });
      } else {
        setAuthError(data.error || 'साइनअप विफल');
        toast({ title: 'त्रुटि', description: data.error || 'साइनअप विफल' });
      }
    } catch (error) {
      setAuthError('नेटवर्क त्रुटि');
      toast({ title: 'त्रुटि', description: 'नेटवर्क त्रुटि - कृपया फिर से कोशिश करें' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setProjects([]);
      setCurrentProjectId(null);
      setPayments([]);
      localStorage.removeItem('user');
      localStorage.removeItem('currentProjectId');
      toast({ title: 'सफलता', description: 'आप सफलतापूर्वक लॉग आउट हो गए हैं' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Processing modal functions
  const showProcessingModal = (message: string, subMessage: string = '') => {
    setProcessingModal({ isOpen: true, message, subMessage });
  };

  const hideProcessingModal = () => {
    setProcessingModal({ isOpen: false, message: '', subMessage: '' });
  };

  // Mock data for demonstration
  useEffect(() => {
    if (!user) return;
    
    // Set mock projects
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'डेमो प्रोजेक्ट',
        created: new Date().toISOString(),
        raiyatNames: [
          { id: '1', name: 'राम लाल', color: '#3b82f6' },
          { id: '2', name: 'श्याम सुंदर', color: '#10b981' }
        ],
        landRecords: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            raiyatId: '1',
            raiyatName: 'राम लाल',
            raiyatColor: '#3b82f6',
            jamabandiNumber: '123/2023',
            khataNumber: '456',
            khesraNumber: '789',
            rakwa: '5.25',
            uttar: 'नदी',
            dakshin: 'सड़क',
            purab: 'श्याम का खेत',
            paschim: 'राम का खेत',
            remarks: 'उपजाऊ भूमि'
          },
          {
            id: '2',
            timestamp: new Date().toISOString(),
            raiyatId: '2',
            raiyatName: 'श्याम सुंदर',
            raiyatColor: '#10b981',
            jamabandiNumber: '124/2023',
            khataNumber: '457',
            khesraNumber: '790',
            rakwa: '3.75',
            uttar: 'नहर',
            dakshin: 'पक्की सड़क',
            purab: 'गांव की ओर',
            paschim: 'जंगल',
            remarks: 'सिंचाई की सुविधा'
          }
        ]
      }
    ];
    
    setProjects(mockProjects);
    
    // Mock payments
    const mockPayments: Payment[] = [
      {
        id: '1',
        projectId: '1',
        project: { name: 'डेमो प्रोजेक्ट' },
        totalAmount: 50000,
        receivedAmount: 25000,
        pendingAmount: 25000,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'partial',
        paymentType: 'cash',
        description: 'आंशिक भुगतान',
        createdAt: new Date().toISOString()
      }
    ];
    
    setPayments(mockPayments);
  }, [user]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="relative z-10 w-full max-w-4xl mx-auto p-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/20 p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">भू</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">भूमि रिकॉर्ड सिस्टम</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">लोड हो रहा है...</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-8 space-y-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">डेटाबेस कनेक्ट हो रहा है</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">सुरक्षित कनेक्शन स्थापित कर रहे हैं</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">भूमि रिकॉर्ड सिस्टम</h1>
              <p className="text-gray-600 dark:text-gray-400">अपना अकाउंट बनाएं या लॉग इन करें</p>
            </div>
            
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 text-center font-medium rounded-l-lg ${
                  authMode === 'login' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setAuthMode('login')}
              >
                लॉगिन
              </button>
              <button
                className={`flex-1 py-2 text-center font-medium rounded-r-lg ${
                  authMode === 'signup' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setAuthMode('signup')}
              >
                साइनअप
              </button>
            </div>

            {authError && (
              <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {authSuccess && (
              <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{authSuccess}</AlertDescription>
              </Alert>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">ईमेल</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">पासवर्ड</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'लॉगिन हो रहा है...' : 'लॉगिन'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="name">नाम</Label>
                  <Input
                    id="name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">ईमेल</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">मोबाइल</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={signupMobile}
                    onChange={(e) => setSignupMobile(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">पता</Label>
                  <Textarea
                    id="address"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">पासवर्ड</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">पासवर्ड की पुष्टि करें</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'अकाउंट बनाया जा रहा है...' : 'अकाउंट बनाएं'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">भूमि रिकॉर्ड सिस्टम</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              स्वागत, {user.name || user.email}
            </span>
            <Button onClick={handleLogout} variant="outline">
              लॉग आउट
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">फॉर्म</TabsTrigger>
            <TabsTrigger value="records">रिकॉर्ड</TabsTrigger>
            <TabsTrigger value="payments">भुगतान</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>नया रिकॉर्ड जोड़ें</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="raiyatName">रैयत नाम</Label>
                    <Input
                      id="raiyatName"
                      value={formData.raiyatName}
                      onChange={(e) => setFormData({...formData, raiyatName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jamabandiNumber">जमाबंदी नंबर</Label>
                    <Input
                      id="jamabandiNumber"
                      value={formData.jamabandiNumber}
                      onChange={(e) => setFormData({...formData, jamabandiNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="khataNumber">खाता नंबर</Label>
                    <Input
                      id="khataNumber"
                      value={formData.khataNumber}
                      onChange={(e) => setFormData({...formData, khataNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="khesraNumber">खेसरा नंबर</Label>
                    <Input
                      id="khesraNumber"
                      value={formData.khesraNumber}
                      onChange={(e) => setFormData({...formData, khesraNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rakwa">रकवा (डिसमिल)</Label>
                    <Input
                      id="rakwa"
                      value={formData.rakwa}
                      onChange={(e) => setFormData({...formData, rakwa: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="uttar">उत्तर</Label>
                    <Input
                      id="uttar"
                      value={formData.uttar}
                      onChange={(e) => setFormData({...formData, uttar: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dakshin">दक्षिण</Label>
                    <Input
                      id="dakshin"
                      value={formData.dakshin}
                      onChange={(e) => setFormData({...formData, dakshin: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purab">पूर्व</Label>
                    <Input
                      id="purab"
                      value={formData.purab}
                      onChange={(e) => setFormData({...formData, purab: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paschim">पश्चिम</Label>
                    <Input
                      id="paschim"
                      value={formData.paschim}
                      onChange={(e) => setFormData({...formData, paschim: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="remarks">रिमार्क्स</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  रिकॉर्ड जोड़ें
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>रिकॉर्ड की सूची</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Records Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-md">
                        <th className="border border-gray-200 p-3 text-left">क्र.</th>
                        <th className="border border-gray-200 p-3 text-left">रैयत नाम</th>
                        <th className="border border-gray-200 p-3 text-left">जमाबंदी नंबर</th>
                        <th className="border border-gray-200 p-3 text-left">खाता नंबर</th>
                        <th className="border border-gray-200 p-3 text-left">खेसरा नंबर</th>
                        <th className="border border-gray-200 p-3 text-left">रकवा</th>
                        <th className="border border-gray-200 p-3 text-left">उत्तर</th>
                        <th className="border border-gray-200 p-3 text-left">दक्षिण</th>
                        <th className="border border-gray-200 p-3 text-left">पूर्व</th>
                        <th className="border border-gray-200 p-3 text-left">पश्चिम</th>
                        <th className="border border-gray-200 p-3 text-left">रिमार्क्स</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProject?.landRecords?.map((record, index) => (
                        <tr key={record.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="border border-gray-200 p-3 font-medium">{index + 1}</td>
                          <td className="border border-gray-200 p-3 font-semibold">
                            <span 
                              className="px-2 py-1 font-bold text-sm"
                              style={{ 
                                color: record.raiyatColor || '#1f2937'
                              }}
                            >
                              {record.raiyatName}
                            </span>
                          </td>
                          <td className="border border-gray-200 p-3">{record.jamabandiNumber || '-'}</td>
                          <td className="border border-gray-200 p-3">{record.khataNumber || '-'}</td>
                          <td className="border border-gray-200 p-3 font-medium">{record.khesraNumber}</td>
                          <td className="border border-gray-200 p-3">{record.rakwa || '0'} डिसमिल</td>
                          <td className="border border-gray-200 p-3">{record.uttar || '-'}</td>
                          <td className="border border-gray-200 p-3">{record.dakshin || '-'}</td>
                          <td className="border border-gray-200 p-3">{record.purab || '-'}</td>
                          <td className="border border-gray-200 p-3">{record.paschim || '-'}</td>
                          <td className="border border-gray-200 p-3">{record.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!currentProject?.landRecords || currentProject.landRecords.length === 0) && (
                    <div className="text-center p-8 text-gray-800">
                      कोई रिकॉर्ड नहीं मिला
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>भुगतान की सूची</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Payment List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">प्रोजेक्ट वार पेमेंट डिटेल्स</h3>
                  {payments.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                      <table className="w-full border-collapse bg-gradient-to-br from-green-50 to-emerald-50">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-md">
                            <th className="border border-gray-200 p-3 text-left font-semibold text-white">प्रोजेक्ट</th>
                            <th className="border border-gray-200 p-3 text-right font-semibold text-white">कुल राशि</th>
                            <th className="border border-gray-200 p-3 text-right font-semibold text-white">प्राप्त राशि</th>
                            <th className="border border-gray-200 p-3 text-right font-semibold text-white">बकाया राशि</th>
                            <th className="border border-gray-200 p-3 text-center font-semibold text-white">स्टेटस</th>
                            <th className="border border-gray-200 p-3 text-center font-semibold text-white">कार्य</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment, index) => (
                            <tr key={payment.id} className={`hover:bg-green-100 transition-colors ${index % 2 === 0 ? 'bg-white/70' : 'bg-green-50/50'}`}>
                              <td className="border border-green-200 p-3 font-medium text-gray-900">{payment.project?.name || 'Unknown Project'}</td>
                              <td className="border border-green-200 p-3 text-right font-semibold text-gray-900">₹{payment.totalAmount.toLocaleString('hi-IN')}</td>
                              <td className="border border-green-200 p-3 text-right font-medium text-green-600">₹{payment.receivedAmount.toLocaleString('hi-IN')}</td>
                              <td className="border border-green-200 p-3 text-right font-bold text-red-600">₹{payment.pendingAmount.toLocaleString('hi-IN')}</td>
                              <td className="border border-green-200 p-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  payment.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                  'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {payment.status === 'completed' ? 'पूर्ण' :
                                   payment.status === 'partial' ? 'आंशिक' : 'बकाया'}
                                </span>
                              </td>
                              <td className="border border-green-200 p-3 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setEditingPayment(payment);
                                      setEditPaymentForm({
                                        totalAmount: payment.totalAmount.toString(),
                                        receivedAmount: payment.receivedAmount.toString(),
                                        paymentType: payment.paymentType || 'cash',
                                        description: payment.description || ''
                                      });
                                      setShowEditPaymentModal(true);
                                    }}
                                  >
                                    एडिट
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setPaymentToDelete(payment);
                                      setShowDeleteConfirm(true);
                                    }}
                                  >
                                    डिलीट
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">💰</div>
                      <p>अभी तक कोई पेमेंट रिकॉर्ड नहीं है</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}