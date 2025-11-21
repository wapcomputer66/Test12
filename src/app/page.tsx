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
import BeautifulChart from '@/components/BeautifulChart';
import { Spinner } from '@/components/ui/spinner';
import ProcessingModal from '@/components/ui/processing-modal';
import AppLoadingPage from '@/components/ui/app-loading-page';


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
  const [isInitializing, setIsInitializing] = useState(true); // New state for page load
  const [loadingCounter, setLoadingCounter] = useState(0); // Track loading operations
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
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProjectDropdown) {
        const target = event.target as Element;
        if (!target.closest('.project-dropdown-container')) {
          setShowProjectDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

  // Load user from localStorage on mount and check auth
  useEffect(() => {
    const initializeApp = async () => {
      const savedUser = localStorage.getItem('user');
      const savedProjectId = localStorage.getItem('currentProjectId');
      
      // Show brief loading only if we need to initialize from server
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

  // Handle page refresh with AppLoadingPage
  useEffect(() => {
    // Check if page is being refreshed
    const isPageRefresh = sessionStorage.getItem('isPageRefresh');
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Mark that page is being refreshed
      sessionStorage.setItem('isPageRefresh', 'true');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden (refresh, tab close, etc.)
        sessionStorage.setItem('isPageRefresh', 'true');
      }
    };

    // Handle keyboard shortcuts for refresh
    const handleKeyDown = (e: KeyboardEvent) => {
      // F5 or Ctrl+R / Cmd+R
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        setIsInitializing(true);
        setTimeout(() => {
          setIsInitializing(false);
        }, 2000);
      }
    };

    // Handle navigation events (refresh button clicks)
    const handleNavigation = (e: PopStateEvent) => {
      // This handles browser back/forward buttons and refresh
      if (isPageRefresh === 'true') {
        setIsInitializing(true);
        setTimeout(() => {
          setIsInitializing(false);
          sessionStorage.removeItem('isPageRefresh');
        }, 2000);
      }
    };

    // Listen for page refresh events
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handleNavigation);

    // Clear the refresh flag after a short delay
    const clearFlag = setTimeout(() => {
      sessionStorage.removeItem('isPageRefresh');
    }, 1000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handleNavigation);
      clearTimeout(clearFlag);
    };
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
    showProcessingModal('लॉगिन हो रहा है...', 'कृपया प्रतीक्षा करें');
    
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
      hideProcessingModal();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    showProcessingModal('अकाउंट बनाया जा रहा है...', 'कृपया प्रतीक्षा करें');
    
    if (signupPassword !== signupConfirmPassword) {
      setAuthError('पासवर्ड मेल नहीं खाते हैं');
      hideProcessingModal();
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
      hideProcessingModal();
    }
  };

  const handleLogout = async () => {
    showProcessingModal('Logging out...', 'Please wait');
    
    // Simulate logout process for better UX
    setTimeout(() => {
      setUser(null);
      setCurrentProjectId(null);
      setProjects([]);
      setAuthError('');
      setAuthSuccess('');
      localStorage.removeItem('user');
      localStorage.removeItem('currentProjectId');
      hideProcessingModal();
      toast({ title: 'Success', description: 'You have been successfully logged out' });
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast({ title: 'त्रुटि', description: 'आप लॉगिन नहीं हैं' });
      return;
    }

    // Validate email
    if (deleteAccountEmail !== user.email) {
      setDeleteAccountError('ईमेल ID मेल नहीं खाता। कृपया अपना सही ईमेल ID दर्ज करें।');
      return;
    }

    setShowDeleteAccountDialog(false);
    showProcessingModal('खाता डिलीट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (response.ok) {
        // Clear all local data
        setUser(null);
        setCurrentProjectId(null);
        setProjects([]);
        setAuthError('');
        setAuthSuccess('');
        localStorage.removeItem('user');
        localStorage.removeItem('currentProjectId');
        
        hideProcessingModal();
        toast({ 
          title: 'खाता डिलीट हो गया', 
          description: 'आपका खाता और सभी डेटा सफलतापूर्वक डिलीट हो गया है' 
        });
      } else {
        const data = await response.json();
        hideProcessingModal();
        
        // Handle specific error cases
        if (response.status === 404) {
          toast({ 
            title: 'त्रुटि', 
            description: 'यूजर नहीं मिला - कृपया फिर से लॉगिन करें' 
          });
          // Force logout user
          setUser(null);
          localStorage.removeItem('user');
        } else {
          toast({ 
            title: 'त्रुटि', 
            description: data.error || 'खाता डिलीट करने में विफल' 
          });
        }
        
        // Reset dialog state
        setDeleteAccountEmail('');
        setDeleteAccountError('');
      }
    } catch (error) {
      hideProcessingModal();
      toast({ 
        title: 'त्रुटि', 
        description: 'नेटवर्क त्रुटि - कृपया फिर से कोशिश करें' 
      });
    }
  };

  // Handle chart click to filter records
  const handleRaiyatChartClick = (raiyatName: string) => {
    setCurrentRaiyatFilter(raiyatName);
    setActiveTab('records'); // Switch to records tab
    toast({ 
      title: 'फिल्टर लागू', 
      description: `${raiyatName} के रिकॉर्ड दिखा रहे हैं` 
    });
  };

  // Helper function to show processing modal
  const showProcessingModal = (message: string, subMessage?: string) => {
    setLoadingCounter(prev => prev + 1);
    setProcessingModal({
      isOpen: true,
      message,
      subMessage: subMessage || ''
    });
  };

  // Helper function to hide processing modal
  const hideProcessingModal = () => {
    setLoadingCounter(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setProcessingModal({
          isOpen: false,
          message: '',
          subMessage: ''
        });
        return 0;
      }
      return newCount;
    });
  };

  // Tab switching function with loading animation
  const handleTabSwitch = async (tabName: string) => {
    if (isTabSwitching || tabName === activeTab) return;
    
    setIsTabSwitching(true);
    
    // Get tab name in Hindi for better UX
    const getTabNameHindi = (tab: string) => {
      switch(tab) {
        case 'projects': return 'प्रोजेक्ट';
        case 'form': return 'फॉर्म';
        case 'records': return 'रिकॉर्ड';
        case 'admin': return 'सेटिंग';
        case 'dashboard': return 'डैशबोर्ड';
        default: return tab;
      }
    };
    
    // Show loading popup with tab-specific message
    showProcessingModal(
      `Loading...`, 
      ''
    );
    
    // Simulate loading time for smooth transition
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setActiveTab(tabName);
    setIsTabSwitching(false);
    
    // Hide loading popup
    hideProcessingModal();
  };

  // Project functions
  const createProject = async () => {
    if (!newProjectName.trim() || !user) {
      if (!newProjectName.trim()) {
        toast({ title: 'त्रुटि', description: 'कृपया प्रोजेक्ट का नाम दर्ज करें' });
      }
      return;
    }

    if (!newProjectMobile.trim()) {
      toast({ title: 'त्रुटि', description: 'कृपया मोबाइल नंबर दर्ज करें' });
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(newProjectMobile.trim())) {
      toast({ title: 'त्रुटि', description: 'कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें' });
      return;
    }
    
    setCreatingProject(true);
    showProcessingModal('प्रोजेक्ट बनाया जा रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProjectName, 
          mobileNumber: newProjectMobile,
          userId: user.id 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects([...projects, data.project]);
        setCurrentProjectId(data.project.id);
        setNewProjectName('');
        setNewProjectMobile('');
        setSyncStatus('🔄 सिंक हो रहा है...');
        setTimeout(() => {
          setSyncStatus('✅ सिंक हो गया');
          setLastSyncTime(new Date());
        }, 1000);
        toast({ title: 'सफलता', description: 'नया प्रोजेक्ट बनाया गया' });
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'प्रोजेक्ट बनाने में विफल' });
      }
    } catch (error) {
      console.error('Project creation error:', error);
      toast({ title: 'त्रुटि', description: 'प्रोजेक्ट बनाने में विफल' });
    } finally {
      setCreatingProject(false);
      hideProcessingModal();
    }
  };

  const updateProject = async (projectId: string, newName: string, newMobile: string) => {
    if (!newName.trim()) return;
    
    if (!newMobile.trim()) {
      toast({ title: 'त्रुटि', description: 'कृपया मोबाइल नंबर दर्ज करें' });
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(newMobile.trim())) {
      toast({ title: 'त्रुटि', description: 'कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें' });
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName,
          mobileNumber: newMobile
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === projectId ? data.project : p
        ));
        setEditingProjectId(null);
        setEditingProjectName('');
        setEditingProjectMobile('');
        toast({ title: 'सफलता', description: 'प्रोजेक्ट अपडेट किया गया' });
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'प्रोजेक्ट अपडेट करने में विफल' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'प्रोजेक्ट अपडेट करने में विफल' });
    }
  };

  const deleteProject = async (projectId: string) => {
    if (projects.length <= 1) {
      toast({ title: 'त्रुटि', description: 'कम से कम एक प्रोजेक्ट होना चाहिए' });
      return;
    }
    
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) {
      toast({ title: 'त्रुटि', description: 'प्रोजेक्ट नहीं मिला' });
      return;
    }
    
    setProjectToDelete(projectId);
  };

  // Share functionality
  const generateShareLink = async (projectId: string) => {
    console.log('Generating share link for project:', projectId);
    setGeneratingShare(true);
    setSharingProjectId(projectId);
    showProcessingModal('शेयर लिंक बनाया जा रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Share API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Share API response data:', data);
        
        setShareData(data);
        setShowShareModal(true);
        toast({ title: 'सफलता', description: 'शेयर लिंक बन गया है' });
      } else {
        const errorData = await response.json();
        console.error('Share API error:', errorData);
        toast({ title: 'त्रुटि', description: errorData.error || 'शेयर लिंक बनाने में विफल' });
      }
    } catch (error) {
      console.error('Share link generation error:', error);
      toast({ title: 'त्रुटि', description: 'शेयर लिंक बनाने में विफल' });
    } finally {
      setGeneratingShare(false);
      setSharingProjectId(null);
      hideProcessingModal();
    }
  };

  const shareOnWhatsApp = () => {
    if (!shareData) return;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyShareLink = () => {
    if (!shareData) return;
    
    navigator.clipboard.writeText(shareData.shareUrl);
    toast({ title: 'सफलता', description: 'लिंक कॉपी हो गया है' });
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setShareData(null);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    showProcessingModal('प्रोजेक्ट डिलीट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const updatedProjects = projects.filter(p => p.id !== projectToDelete);
        setProjects(updatedProjects);
        if (projectToDelete === currentProjectId) {
          const newProjectId = updatedProjects[0]?.id || null;
          setCurrentProjectId(newProjectId);
        }
        setSyncStatus('🔄 सिंक हो रहा है...');
        setTimeout(() => {
          setSyncStatus('✅ सिंक हो गया');
          setLastSyncTime(new Date());
        }, 1000);
        toast({ title: 'सफलता', description: 'प्रोजेक्ट डिलीट किया गया' });
        setProjectToDelete(null);
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'प्रोजेक्ट डिलीट करने में विफल' });
        setProjectToDelete(null);
      }
    } catch (error) {
      console.error('Project deletion error:', error);
      toast({ title: 'त्रुटि', description: 'प्रोजेक्ट डिलीट करने में विफल' });
      setProjectToDelete(null);
    } finally {
      hideProcessingModal();
    }
  };

  const switchToProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    localStorage.setItem('currentProjectId', projectId);
    setActiveTab('form');
    // Clear all filters when project changes
    setCurrentRaiyatFilter(null);
  };

  // Raiyat functions
  const addRaiyat = async () => {
    if (!newRaiyatName.trim() || !currentProjectId) return;
    
    setAddingRaiyat(true);
    showProcessingModal('रैयत जोड़ा जा रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/raiyat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRaiyatName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        setNewRaiyatName('');
        toast({ title: 'सफलता', description: 'रैयत नाम जोड़ा गया' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'रैयत नाम जोड़ने में विफल' });
    } finally {
      setAddingRaiyat(false);
      hideProcessingModal();
    }
  };

  // Auto-assign colors to raiyats without colors
  const autoAssignColors = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/auto-colors`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === projectId ? data.project : p
        ));
      }
    } catch (error) {
      // Silent fail - don't show error for auto-assignment
    }
  };

  const deleteRaiyat = async (raiyatId: string, raiyatName: string) => {
    setRaiyatToDelete({ id: raiyatId, name: raiyatName });
  };

  // Land record functions
  const submitLandRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProjectId || !formData.raiyatName || !formData.khesraNumber) {
      toast({ title: 'त्रुटि', description: 'कृपया सभी आवश्यक फील्ड्स भरें' });
      return;
    }
    
    setSubmittingRecord(true);
    showProcessingModal('रिकॉर्ड सेव हो रहा है...', 'भूमि रिकॉर्ड को सेव किया जा रहा है');
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        setSyncStatus('🔄 सिंक हो रहा है...');
        setTimeout(() => {
          setSyncStatus('✅ सिंक हो गया');
          setLastSyncTime(new Date());
        }, 1000);
        toast({ title: 'सफलता', description: 'रिकॉर्ड सफलतापूर्वक सेव हो गया' });
        setFormData({
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
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'रिकॉर्ड सेव करने में विफल' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'नेटवर्क त्रुटि' });
    } finally {
      setSubmittingRecord(false);
      hideProcessingModal();
    }
  };

  // Floating form submit function
  const submitFloatingForm = async () => {
    if (!currentProjectId || !floatingFormData.raiyatName || !floatingFormData.khesraNumber) {
      toast({ title: 'त्रुटि', description: 'कृपया सभी आवश्यक फील्ड्स भरें (रैयत का नाम और खेसरा नंबर)' });
      return;
    }
    
    showProcessingModal('रिकॉर्ड सेव हो रहा है...', 'भूमि रिकॉर्ड को सेव किया जा रहा है');
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(floatingFormData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        setSyncStatus('🔄 सिंक हो रहा है...');
        setTimeout(() => {
          setSyncStatus('✅ सिंक हो गया');
          setLastSyncTime(new Date());
        }, 1000);
        toast({ title: 'सफलता', description: 'LRMS सफलतापूर्वक सेव हो गया!' });
        setShowFloatingForm(false);
        setFloatingFormData({ 
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
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'रिकॉर्ड सेव करने में विफल' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'नेटवर्क त्रुटि - कृपया फिर से कोशिश करें' });
    } finally {
      hideProcessingModal();
    }
  };

  const deleteRecord = async (recordId: string, khesraNumber: string) => {
    setRecordToDelete({ id: recordId, khesraNumber });
  };

  const confirmDeleteRaiyat = async () => {
    if (!raiyatToDelete || !currentProjectId) return;
    
    setDeletingRaiyatId(raiyatToDelete.id);
    showProcessingModal('रैयत डिलीट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/raiyat/${raiyatToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        toast({ title: 'सफलता', description: 'रैयत नाम डिलीट किया गया' });
        setRaiyatToDelete(null);
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'रैयत नाम डिलीट करने में विफल' });
        setRaiyatToDelete(null);
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'रैयत नाम डिलीट करने में विफल' });
      setRaiyatToDelete(null);
    } finally {
      setDeletingRaiyatId(null);
      hideProcessingModal();
    }
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete || !currentProjectId) return;
    
    setDeletingRecordId(recordToDelete.id);
    showProcessingModal('रिकॉर्ड डिलीट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/records/${recordToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        setShowRecordView(false);
        setShowEditRecord(false);
        setSelectedRecord(null);
        toast({ title: 'सफलता', description: 'रिकॉर्ड डिलीट किया गया' });
        setRecordToDelete(null);
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'रिकॉर्ड डिलीट करने में विफल' });
        setRecordToDelete(null);
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'रिकॉर्ड डिलीट करने में विफल' });
      setRecordToDelete(null);
    } finally {
      setDeletingRecordId(null);
      hideProcessingModal();
    }
  };

  const updateRecord = async (updatedData: Partial<LandRecord>) => {
    if (!currentProjectId || !selectedRecord) return;
    
    setUpdatingRecord(true);
    showProcessingModal('रिकॉर्ड अपडेट हो रहा है...', 'भूमि रिकॉर्ड को अपडेट किया जा रहा है');
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/records/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        setShowEditRecord(false);
        setShowRecordView(false);
        toast({ title: 'सफलता', description: 'रिकॉर्ड अपडेट किया गया' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'रिकॉर्ड अपडेट करने में विफल' });
    } finally {
      setUpdatingRecord(false);
      hideProcessingModal();
    }
  };

  // Export function for actual records
  const exportRecords = async () => {
    if (!currentProject || !currentProject.landRecords || currentProject.landRecords.length === 0) {
      toast({ title: 'त्रुटि', description: 'एक्सपोर्ट करने के लिए कोई रिकॉर्ड नहीं है' });
      return;
    }

    setExportingData(true);
    showProcessingModal('डेटा एक्सपोर्ट हो रहा है...', 'CSV फाइल तैयार की जा रही है');

    try {
      // Get filtered records based on current filter
      const recordsToExport = currentProject.landRecords.filter(record => 
        !currentRaiyatFilter || record.raiyatName === currentRaiyatFilter
      );

      if (recordsToExport.length === 0) {
        toast({ title: 'त्रुटि', description: 'इस फिल्टर के लिए कोई रिकॉर्ड नहीं मिला' });
        return;
      }

    let csvContent = "रैयत नाम,जमाबंदी नंबर,खाता नंबर,खेसरा नंबर,रकवा,उत्तर,दक्षिण,पूर्व,पश्चिम,रिमार्क्स\n";
      
      recordsToExport.forEach(record => {
        const row = [
          `"${record.raiyatName || ''}"`,
          `"${record.jamabandiNumber || ''}"`,
          `"${record.khataNumber || ''}"`,
          `"${record.khesraNumber || ''}"`,
          `"${record.rakwa || ''}"`,
          `"${record.uttar || ''}"`,
          `"${record.dakshin || ''}"`,
          `"${record.purab || ''}"`,
          `"${record.paschim || ''}"`,
          `"${record.remarks || ''}"`
        ].join(',');
        csvContent += row + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const projectName = currentProject.name.replace(/[^a-zA-Z0-9ऀ-ॿ]/g, '_');
      const filterSuffix = currentRaiyatFilter ? `_${currentRaiyatFilter.replace(/[^a-zA-Z0-9ऀ-ॿ]/g, '_')}` : '';
      const fileName = `${projectName}${filterSuffix}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const filterText = currentRaiyatFilter ? ` (फिल्टर: ${currentRaiyatFilter})` : '';
      toast({ 
        title: 'सफलता', 
        description: `${recordsToExport.length} रिकॉर्ड ${fileName} में एक्सपोर्ट हो गए${filterText}` 
      });
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'एक्सपोर्ट करने में विफल' });
    } finally {
      setExportingData(false);
      hideProcessingModal();
    }
  };

  const handleFileImport = async () => {
    if (!importFile || !currentProjectId) return;
    
    setIsImporting(true);
    showProcessingModal('फाइल इंपोर्ट हो रही है...', 'Excel/CSV डेटा को प्रोसेस किया जा रहा है');
    
    try {
      const data = await importFile.arrayBuffer();

      const workbook = XLSX.read(data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Skip header row and map data
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];
      
      console.log('Headers found:', headers);
      console.log('Total rows:', rows.length);
      
      // Create column mapping
      const columnMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header?.toString().toLowerCase().trim();
        if (normalizedHeader?.includes('रैयत') || normalizedHeader?.includes('raiyat')) {
          columnMap.raiyatName = index;
        } else if (normalizedHeader?.includes('जमाबंदी') || normalizedHeader?.includes('jamabandi')) {
          columnMap.jamabandiNumber = index;
        } else if (normalizedHeader?.includes('खाता') || normalizedHeader?.includes('khata')) {
          columnMap.khataNumber = index;
        } else if (normalizedHeader?.includes('खेसरा') || normalizedHeader?.includes('khesra')) {
          columnMap.khesraNumber = index;
        } else if (normalizedHeader?.includes('रकवा') || normalizedHeader?.includes('rakwa')) {
          columnMap.rakwa = index;
        } else if (normalizedHeader?.includes('उत्तर') || normalizedHeader?.includes('uttar')) {
          columnMap.uttar = index;
        } else if (normalizedHeader?.includes('दक्षिण') || normalizedHeader?.includes('dakshin')) {
          columnMap.dakshin = index;
        } else if (normalizedHeader?.includes('पूर्व') || normalizedHeader?.includes('purab')) {
          columnMap.purab = index;
        } else if (normalizedHeader?.includes('पश्चिम') || normalizedHeader?.includes('paschim')) {
          columnMap.paschim = index;
        } else if (normalizedHeader?.includes('रिमार्क') || normalizedHeader?.includes('remarks') || normalizedHeader?.includes('टिप्पणी')) {
          columnMap.remarks = index;
        }
      });
      
      console.log('Column mapping:', columnMap);
      
      // Map rows to records
      const records = rows.map((row, index) => {
        const record: any = {};
        
        record.raiyatName = row[columnMap.raiyatName]?.toString().trim() || '';
        record.jamabandiNumber = row[columnMap.jamabandiNumber]?.toString().trim() || '';
        record.khataNumber = row[columnMap.khataNumber]?.toString().trim() || '';
        record.khesraNumber = row[columnMap.khesraNumber]?.toString().trim() || '';
        record.rakwa = row[columnMap.rakwa]?.toString().trim() || '';
        record.uttar = row[columnMap.uttar]?.toString().trim() || '';
        record.dakshin = row[columnMap.dakshin]?.toString().trim() || '';
        record.purab = row[columnMap.purab]?.toString().trim() || '';
        record.paschim = row[columnMap.paschim]?.toString().trim() || '';
        record.remarks = row[columnMap.remarks]?.toString().trim() || '';
        
        return record;
      }).filter(record => {
        const isValid = record.raiyatName && record.khesraNumber;
        if (!isValid) {
          console.log('Filtered out invalid record:', record);
        }
        return isValid;
      });
      
      console.log('Valid records to import:', records.length);
      console.log('Sample record:', records[0]);
      
      if (records.length === 0) {
        toast({ title: 'त्रुटि', description: 'कोई वैध रिकॉर्ड नहीं मिला। कृपया फाइल प्रारूप जांचें।' });
        return;
      }

      const response = await fetch(`/api/projects/${currentProjectId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => 
          p.id === currentProjectId ? data.project : p
        ));
        
        toast({ 
          title: 'इंपोर्ट सफल', 
          description: `${data.createdCount} रिकॉर्ड इंपोर्ट हुए, ${data.errorCount} त्रुटियां` 
        });
        
        if (data.errors.length > 0) {
          console.log('Import errors:', data.errors);

          data.errors.forEach((error: string, index: number) => {
            setTimeout(() => {
              toast({ 
                title: `इंपोर्ट त्रुटि ${index + 1}`, 
                description: error,
                variant: 'destructive'
              });
            }, index * 1000);
          });
        }
        
        setImportFile(null);
        setShowImportPopup(false); // Auto-close popup on success

      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'इंपोर्ट विफल' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'फाइल पढ़ने में विफल' });

    } finally {
      setIsImporting(false);
      hideProcessingModal();
    }
  };


  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validTypes.includes(fileExtension)) {
        setImportFile(file);
      } else {
        toast({ 
          title: 'त्रुटि', 
          description: 'कृपया वैध फाइल प्रारूप (.xlsx, .xls, .csv) का उपयोग करें',
          variant: 'destructive'
        });
      }
    }
  };

  

  // Payment Management Functions
  const addPayment = async () => {
    console.log('addPayment function called');
    console.log('Current payment form:', paymentForm);
    console.log('Current user:', user);
    
    if (!paymentForm.projectId || !paymentForm.totalAmount || !user) {
      console.log('Validation failed:', { 
        hasProjectId: !!paymentForm.projectId, 
        hasTotalAmount: !!paymentForm.totalAmount, 
        hasUser: !!user 
      });
      toast({ 
        title: 'त्रुटि', 
        description: 'कृपया प्रोजेक्ट चुनें और कुल राशि दर्ज करें' 
      });
      return;
    }

    const totalAmount = parseFloat(paymentForm.totalAmount);
    const receivedAmount = parseFloat(paymentForm.receivedAmount) || 0;

    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast({ 
        title: 'त्रुटि', 
        description: 'कुल राशि एक वैध धनात्मक संख्या होनी चाहिए' 
      });
      return;
    }

    if (isNaN(receivedAmount) || receivedAmount < 0) {
      toast({ 
        title: 'त्रुटि', 
        description: 'प्राप्त राशि एक वैध ऋणात्मक नहीं संख्या होनी चाहिए' 
      });
      return;
    }

    if (receivedAmount > totalAmount) {
      toast({ 
        title: 'त्रुटि', 
        description: 'प्राप्त राशि कुल राशि से अधिक नहीं हो सकती' 
      });
      return;
    }
    
    setAddingPayment(true);
    showProcessingModal('पेमेंट जोड़ा जा रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      console.log('Adding payment with data:', {
        projectId: paymentForm.projectId,
        totalAmount: totalAmount,
        receivedAmount: receivedAmount,
        paymentType: paymentForm.paymentType,
        description: paymentForm.description
      });

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: paymentForm.projectId,
          totalAmount: totalAmount,
          receivedAmount: receivedAmount,
          paymentType: paymentForm.paymentType,
          description: paymentForm.description
        })
      });
      
      console.log('Payment API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Payment created successfully:', data);
        
        // Add the new payment with project data from API
        setPayments([data.payment, ...payments]);
        setPaymentForm({
          projectId: currentProjectId || '',
          totalAmount: '',
          receivedAmount: '',
          paymentType: 'cash',
          description: ''
        });
        setShowPaymentModal(false);
        toast({ title: 'सफलता', description: 'पेमेंट सफलतापूर्वक जोड़ा गया' });
      } else {
        const errorData = await response.json();
        console.error('Payment API error:', errorData);
        toast({ title: 'त्रुटि', description: errorData.error || 'पेमेंट जोड़ने में विफल' });
      }
    } catch (error) {
      console.error('Payment request failed:', error);
      toast({ title: 'त्रुटि', description: 'पेमेंट जोड़ने में विफल' });
    } finally {
      setAddingPayment(false);
      hideProcessingModal();
    }
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(payments.map(p => p.id === paymentId ? data.payment : p));
        toast({ title: 'सफलता', description: 'पेमेंट अपडेट किया गया' });
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'पेमेंट अपडेट करने में विफल' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'पेमेंट अपडेट करने में विफल' });
    }
  };

  const handleEditPayment = async () => {
    if (!editingPayment || !editPaymentForm.totalAmount) {
      toast({ 
        title: 'त्रुटि', 
        description: 'कृपया कुल राशि दर्ज करें' 
      });
      return;
    }

    const totalAmount = parseFloat(editPaymentForm.totalAmount);
    const receivedAmount = parseFloat(editPaymentForm.receivedAmount) || 0;

    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast({ 
        title: 'त्रुटि', 
        description: 'कुल राशि एक वैध धनात्मक संख्या होनी चाहिए' 
      });
      return;
    }

    if (isNaN(receivedAmount) || receivedAmount < 0) {
      toast({ 
        title: 'त्रुटि', 
        description: 'प्राप्त राशि एक वैध ऋणात्मक नहीं संख्या होनी चाहिए' 
      });
      return;
    }

    if (receivedAmount > totalAmount) {
      toast({ 
        title: 'त्रुटि', 
        description: 'प्राप्त राशि कुल राशि से अधिक नहीं हो सकती' 
      });
      return;
    }
    
    setUpdatingPayment(true);
    showProcessingModal('पेमेंट अपडेट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const updates = {
        totalAmount: totalAmount,
        receivedAmount: receivedAmount,
        paymentType: editPaymentForm.paymentType,
        description: editPaymentForm.description
      };
      
      await updatePayment(editingPayment.id, updates);
      setShowEditPaymentModal(false);
      setEditingPayment(null);
      setEditPaymentForm({
        totalAmount: '',
        receivedAmount: '',
        paymentType: 'cash',
        description: ''
      });
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setUpdatingPayment(false);
      hideProcessingModal();
    }
  };

  const deletePayment = async (paymentId: string) => {
    setDeletingPaymentId(paymentId);
    showProcessingModal('पेमेंट डिलीट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPayments(payments.filter(p => p.id !== paymentId));
        toast({ title: 'सफलता', description: 'पेमेंट डिलीट किया गया' });
      } else {
        const errorData = await response.json();
        toast({ title: 'त्रुटि', description: errorData.error || 'पेमेंट डिलीट करने में विफल' });
      }
    } catch (error) {
      toast({ title: 'त्रुटि', description: 'पेमेंट डिलीट करने में विफल' });
    } finally {
      setDeletingPaymentId(null);
      hideProcessingModal();
    }
  };

  // Delete confirmation functions
  const handleDeleteClick = (payment: any) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete.id);
      setShowDeleteConfirm(false);
      setPaymentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPaymentToDelete(null);
  };

  // WhatsApp Share Function
  const shareRecordOnWhatsApp = (record: LandRecord) => {
    const project = projects.find(p => p.id === currentProjectId);
    const message = `🌾 *LRMS रिकॉर्ड* 🌾

📋 *प्रोजेक्ट:* ${project?.name || 'अज्ञात'}
👤 *रैयत:* ${record.raiyatName}
📅 *तारीख:* ${record.timestamp}
🔢 *जमाबंदी नंबर:* ${record.jamabandiNumber || 'नहीं दिया'}
📋 *खाता नंबर:* ${record.khataNumber || 'नहीं दिया'}
🏷️ *खेसरा नंबर:* ${record.khesraNumber}
📏 *रकवा:* ${record.rakwa || '0'} डिसमिल

🗺️ *चौहद्दी:*
• उत्तर: ${record.uttar || 'नहीं दिया'}
• दक्षिण: ${record.dakshin || 'नहीं दिया'}
• पूरब: ${record.purab || 'नहीं दिया'}
• पश्चिम: ${record.paschim || 'नहीं दिया'}

💬 *टिप्पणी:* ${record.remarks || 'कोई टिप्पणी नहीं'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    toast({ 
      title: 'शेयर हो गया', 
      description: 'रिकॉर्ड WhatsApp पर शेयर कर दिया गया है' 
    });
  };

  // Edit payment functions
  const openEditPaymentModal = (payment: Payment) => {
    setEditingPayment(payment);
    setEditPaymentForm({
      totalAmount: payment.totalAmount.toString(),
      receivedAmount: payment.receivedAmount.toString(),
      paymentType: payment.paymentType || 'cash',
      description: payment.description || ''
    });
    setShowEditPaymentModal(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    
    setUpdatingPayment(true);
    showProcessingModal('पेमेंट अपडेट हो रहा है...', 'कृपया प्रतीक्षा करें');
    
    try {
      await updatePayment(editingPayment.id, {
        totalAmount: parseFloat(editPaymentForm.totalAmount) || editingPayment.totalAmount,
        receivedAmount: parseFloat(editPaymentForm.receivedAmount) || editingPayment.receivedAmount,
        paymentType: editPaymentForm.paymentType,
        description: editPaymentForm.description
      });
      
      setShowEditPaymentModal(false);
      setEditingPayment(null);
      setEditPaymentForm({
        totalAmount: '',
        receivedAmount: '',
        paymentType: 'cash',
        description: ''
      });
    } catch (error) {
      // Error is already handled in updatePayment function
    } finally {
      setUpdatingPayment(false);
      hideProcessingModal();
    }
  };

  


  // Calculate stats
  const totalProjects = projects.length;
  const totalRaiyats = projects.reduce((sum, p) => sum + (p.raiyatNames?.length || 0), 0);
  const totalRecords = projects.reduce((sum, p) => sum + (p.landRecords?.length || 0), 0);
  const totalRakwa = projects.reduce((sum, p) => {
    return sum + (p.landRecords?.reduce((raiyatSum, r) => {
      return raiyatSum + (parseFloat(r.rakwa || '0') || 0);
    }, 0) || 0);
  }, 0);

  
  const calculateStats = () => {
    if (!currentProject || !currentProject.landRecords) return { totalRaiyat: 0, totalRecords: 0, totalArea: 0 };
    
    const records = currentProject.landRecords || [];
    const totalRecords = records.length;
    const totalArea = records.reduce((sum, record) => sum + (parseFloat(record.rakwa || '0')), 0);
    const totalRaiyat = new Set(records.map(record => record.raiyatName).filter(name => name)).size;
    
    return { totalRaiyat, totalRecords, totalArea };
  };

  const stats = calculateStats();

  // Generate chart data for circle chart
  const getChartData = () => {
    if (!currentProject || !currentProject.landRecords || !currentProject.raiyatNames) return [];
    
    const raiyatData: Record<string, { value: number; color?: string }> = {};
    currentProject.landRecords.forEach(record => {
      if (record.raiyatName && record.rakwa) {
        const rakwa = parseFloat(record.rakwa) || 0;
        if (!raiyatData[record.raiyatName]) {
          const raiyat = currentProject.raiyatNames.find(r => r && r.name === record.raiyatName);
          raiyatData[record.raiyatName] = { value: 0, color: raiyat?.color };
        }
        raiyatData[record.raiyatName].value += rakwa;
      }
    });
    
    const totalRakwa = Object.values(raiyatData).reduce((sum, data) => sum + data.value, 0);
    
    return Object.entries(raiyatData).map(([name, data], index) => ({
      name,
      value: data.value,
      color: data.color,
      percentage: totalRakwa > 0 ? Math.round((data.value / totalRakwa) * 100) : 0
    }));
  };

  const chartData = getChartData();

  // If not logged in, show auth screen (but not during initialization)
  if (!user && !isInitializing) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-3">🌾</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-black">LRMS</h1>
              <p className="text-orange-100 text-sm sm:text-base">Land Record Management System</p>
            </div>
            
            <div className="flex bg-orange-50 border-b-2 border-orange-200">
              <button
                className={`flex-1 py-4 font-semibold transition-all ${authMode === 'login' ? 'bg-white text-orange-600 border-b-3 border-orange-600' : 'text-gray-800'}`}
                onClick={() => setAuthMode('login')}
              >
                लॉगिन
              </button>
              <button
                className={`flex-1 py-4 font-semibold transition-all ${authMode === 'signup' ? 'bg-white text-orange-600 border-b-3 border-orange-600' : 'text-gray-800'}`}
                onClick={() => setAuthMode('signup')}
              >
                साइन अप
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {authError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{authError}</AlertDescription>
                </Alert>
              )}
              
              {authSuccess && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{authSuccess}</AlertDescription>
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
                  <Button type="submit" className="w-full transition-all duration-300 hover:scale-105" disabled={isLoading}>
                    {isLoading ? (
                      <div className="mr-2">
                        <div className="relative w-4 h-4">
                          <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                          <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                        </div>
                      </div>
                    ) : null}
                    लॉगिन
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">नाम</Label>
                    <Input
                      id="signup-name"
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
                    <Label htmlFor="signup-mobile">मोबाइल</Label>
                    <Input
                      id="signup-mobile"
                      type="tel"
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-address">पता</Label>
                    <Textarea
                      id="signup-address"
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
                    <Label htmlFor="signup-confirm-password">पासवर्ड की पुष्टि करें</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full transition-all duration-300 hover:scale-105" disabled={isLoading}>
                    {isLoading ? (
                      <div className="mr-2">
                        <div className="relative w-4 h-4">
                          <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                          <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                        </div>
                      </div>
                    ) : null}
                    साइन अप
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <AppLoadingPage 
        isLoading={isInitializing}
        onComplete={() => setIsInitializing(false)}
      />
    );
  }

  // Show auth form if no user
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-3">🌾</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-black">LRMS</h1>
              <p className="text-orange-100 text-sm sm:text-base">Land Record Management System</p>
            </div>
            
            <div className="flex bg-orange-50 border-b-2 border-orange-200">
              <button
                className={`flex-1 py-4 font-semibold transition-all ${authMode === 'login' ? 'bg-white text-orange-600 border-b-3 border-orange-600' : 'text-gray-800'}`}
                onClick={() => setAuthMode('login')}
              >
                लॉगिन
              </button>
              <button
                className={`flex-1 py-4 font-semibold transition-all ${authMode === 'signup' ? 'bg-white text-orange-600 border-b-3 border-orange-600' : 'text-gray-800'}`}
                onClick={() => setAuthMode('signup')}
              >
                साइन अप
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {authError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{authError}</AlertDescription>
                </Alert>
              )}
              
              {authSuccess && (
                <Alert className="mb-4 border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-700">{authSuccess}</AlertDescription>
                </Alert>
              )}
              
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="loginEmail">ईमेल एड्रेस</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="loginPassword">पासवर्ड</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" disabled={isLoading}>
                    {isLoading ? 'लोड हो रहा है...' : 'लॉगिन करें'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="signupName">पूरा नाम</Label>
                    <Input
                      id="signupName"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="आपका पूरा नाम"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupEmail">ईमेल एड्रेस</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupMobile">मोबाइल नंबर</Label>
                    <Input
                      id="signupMobile"
                      type="tel"
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupAddress">पता</Label>
                    <Textarea
                      id="signupAddress"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      placeholder="आपका पूरा पता"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupPassword">पासवर्ड</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="कम से कम 6 अक्षर"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupConfirmPassword">पासवर्ड पुष्टि करें</Label>
                    <Input
                      id="signupConfirmPassword"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="पासवर्ड दोबारा दर्ज करें"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" disabled={isLoading}>
                    {isLoading ? 'लोड हो रहा है...' : 'अकाउंट बनाएं'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* Processing Modal for Auth */}
        <ProcessingModal 
          isOpen={processingModal.isOpen}
          message={processingModal.message}
          subMessage={processingModal.subMessage}
        />
      </>
    );
  }

  // Main app UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100/50">
      {/* Website Header - Sticky on PC only */}
      <div className="bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 text-black shadow-2xl border-b border-orange-300 sticky top-0 z-50 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-1 sm:py-2">
            <div className="flex justify-between items-center">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div>
                  <h1 className="xl:text-2xl font-bold tracking-tight text-center text-black">LRMS</h1>
                  <p className="text-gray-600 text-xs sm:text-sm hidden xs:block">Land Record Management System</p>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                {/* Navigation Buttons - Only on PC - Stylish Design */}
                <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 backdrop-blur-sm rounded-2xl border border-orange-300 p-2 shadow-2xl">
                  {/* Projects Button - Blue Theme */}
                  <button
                    onClick={() => handleTabSwitch('projects')}
                    disabled={isTabSwitching}
                    className={`group relative px-3 py-2 rounded-lg text-sm font-bold transition-all duration-500 flex items-center justify-center min-w-[80px] ${
                      activeTab === 'projects'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105 transform'
                        : 'text-black/80 hover:text-black hover:bg-gradient-to-r hover:from-blue-400/20 hover:to-blue-500/20 hover:scale-105 transform'
                    } ${isTabSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg opacity-0 group-hover:opacity-40 transition-all duration-500 blur"></div>
                    <div className="relative flex items-center justify-center">
                      {isTabSwitching && activeTab === 'projects' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                          </div>
                          <span className="font-semibold">Loading</span>
                        </div>
                      ) : (
                        <span className={`font-semibold transition-all duration-300 ${activeTab === 'projects' ? 'animate-pulse' : ''}`}>प्रोजेक्ट्स</span>
                      )}
                    </div>
                  </button>

                  {/* Form Button - Green Theme */}
                  <button
                    onClick={() => handleTabSwitch('form')}
                    disabled={isTabSwitching}
                    className={`group relative px-3 py-2 rounded-lg text-sm font-bold transition-all duration-500 flex items-center justify-center min-w-[80px] ${
                      activeTab === 'form'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-105 transform'
                        : 'text-black/80 hover:text-black hover:bg-gradient-to-r hover:from-green-400/20 hover:to-emerald-500/20 hover:scale-105 transform'
                    } ${isTabSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg opacity-0 group-hover:opacity-40 transition-all duration-500 blur"></div>
                    <div className="relative flex items-center justify-center">
                      {isTabSwitching && activeTab === 'form' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                          </div>
                          <span className="font-semibold">Loading</span>
                        </div>
                      ) : (
                        <span className={`font-semibold transition-all duration-300 ${activeTab === 'form' ? 'animate-pulse' : ''}`}>फॉर्म</span>
                      )}
                    </div>
                  </button>

                  {/* Records Button - Orange Theme */}
                  <button
                    onClick={() => handleTabSwitch('records')}
                    disabled={isTabSwitching}
                    className={`group relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 flex items-center justify-center min-w-[90px] ${
                      activeTab === 'records'
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105 transform'
                        : 'text-black/80 hover:text-black hover:bg-gradient-to-r hover:from-orange-400/20 hover:to-orange-500/20 hover:scale-105 transform'
                    } ${isTabSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl opacity-0 group-hover:opacity-40 transition-all duration-500 blur"></div>
                    <div className="relative flex items-center justify-center">
                      {isTabSwitching && activeTab === 'records' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                          </div>
                          <span className="font-semibold">Loading</span>
                        </div>
                      ) : (
                        <span className={`font-semibold transition-all duration-300 ${activeTab === 'records' ? 'animate-pulse' : ''}`}>रिकॉर्ड्स</span>
                      )}
                    </div>
                  </button>

                  {/* Admin Button - Purple Theme */}
                  <button
                    onClick={() => handleTabSwitch('admin')}
                    disabled={isTabSwitching}
                    className={`group relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 flex items-center justify-center min-w-[90px] ${
                      activeTab === 'admin'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-105 transform'
                        : 'text-black/80 hover:text-black hover:bg-gradient-to-r hover:from-purple-400/20 hover:to-pink-500/20 hover:scale-105 transform'
                    } ${isTabSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-600 rounded-xl opacity-0 group-hover:opacity-40 transition-all duration-500 blur"></div>
                    <div className="relative flex items-center justify-center">
                      {isTabSwitching && activeTab === 'admin' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                          </div>
                          <span className="font-semibold">Loading</span>
                        </div>
                      ) : (
                        <span className={`font-semibold transition-all duration-300 ${activeTab === 'admin' ? 'animate-pulse' : ''}`}>एडमिन</span>
                      )}
                    </div>
                  </button>

                  {/* Dashboard Button - Indigo Theme */}
                  <button
                    onClick={() => handleTabSwitch('dashboard')}
                    disabled={isTabSwitching}
                    className={`group relative px-3 py-2 rounded-lg text-sm font-bold transition-all duration-500 flex items-center justify-center min-w-[80px] ${
                      activeTab === 'dashboard'
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 scale-105 transform'
                        : 'text-black/80 hover:text-black hover:bg-gradient-to-r hover:from-indigo-400/20 hover:to-cyan-500/20 hover:scale-105 transform'
                    } ${isTabSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-40 transition-all duration-500 blur"></div>
                    <div className="relative flex items-center justify-center">
                      {isTabSwitching && activeTab === 'dashboard' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                          </div>
                          <span className="font-semibold">Loading</span>
                        </div>
                      ) : (
                        <span className={`font-semibold transition-all duration-300 ${activeTab === 'dashboard' ? 'animate-pulse' : ''}`}>डैशबोर्ड</span>
                      )}
                    </div>
                  </button>
                </div>

                {/* Status Indicator - HIDDEN */}
                {/* <div className={`hidden md:flex items-center space-x-2 px-2 sm:px-3 py-1.5 backdrop-blur-sm rounded-full border transition-all duration-300 ${
                  isOnline 
                    ? 'bg-gradient-to-r from-orange-400/25 to-orange-500/25 border-orange-300/30' 
                    : 'bg-red-500/20 border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isOnline 
                      ? 'bg-green-400' 
                      : 'bg-red-500'
                  }`}></div>
                  <span className={`text-xs sm:text-sm font-medium ${
                    isOnline ? 'text-black' : 'text-red-600'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div> */}

                {/* Project Selector - Only on PC */}
                {projects.length > 0 && (
                  <div className="hidden lg:block relative project-dropdown-container">
                    <div 
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 backdrop-blur-sm rounded-lg border border-orange-300 cursor-pointer hover:bg-gradient-to-r hover:from-orange-200 hover:via-orange-300 hover:to-orange-400 transition-all duration-200"
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 rounded flex items-center justify-center">
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-black truncate max-w-[150px]">
                          {currentProject?.name || 'कोई प्रोजेक्ट नहीं'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {stats.totalRecords} records
                        </div>
                      </div>
                      <span className={`text-black transition-transform duration-200 text-xs ${showProjectDropdown ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                    
                    {/* Dropdown Menu */}
                    {showProjectDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="max-h-80 overflow-y-auto">
                          {projects.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => {
                                switchToProject(project.id);
                                setShowProjectDropdown(false);
                              }}
                              className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                                currentProject?.id === project.id
                                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 border-l-4 border-l-yellow-500'
                                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                                    currentProject?.id === project.id 
                                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                  }`}>
                                  </div>
                                  <div>
                                    <div className={`font-semibold text-sm ${
                                      currentProject?.id === project.id ? 'text-yellow-800' : 'text-gray-800'
                                    }`}>
                                      {project.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {project.landRecords?.length || 0} records
                                    </div>
                                  </div>
                                </div>
                                {currentProject?.id === project.id && (
                                  <span className="text-yellow-600 text-lg font-bold">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Profile */}
                <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4 border-l border-white/20">
                  <div className="hidden sm:block">
                    <div className="font-semibold text-xs sm:text-sm text-black">{user.name || user.email}</div>
                  </div>
                </div>

                {/* Logout Button - Custom Icon */}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Website Header - Now with Navigation on Mobile and Small Tablet */}
      <div className="bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 text-black shadow-2xl border-b border-orange-300 lg:hidden sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-1 sm:py-2">
            {/* Top Row - Logo and User Actions */}
            <div className="flex justify-between items-center mb-3">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div>
                  <h1 className="xl:text-2xl font-bold tracking-tight text-center text-black">LRMS</h1>
                  <p className="text-gray-600 text-xs sm:text-sm hidden xs:block">Land Record Management System</p>
                </div>
              </div>

              {/* User Section - Mobile/Tablet */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Project Dropdown - Mobile/Tablet */}
                {projects.length > 0 && (
                  <div className="relative project-dropdown-container">
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 backdrop-blur-sm rounded-lg border border-orange-300 hover:bg-gradient-to-r hover:from-orange-200 hover:via-orange-300 hover:to-orange-400 transition-all duration-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 rounded flex items-center justify-center">
                      </div>
                      <div className="hidden sm:block min-w-0">
                        <div className="text-sm font-semibold text-black truncate max-w-[120px]">
                          {currentProject?.name || 'कोई प्रोजेक्ट नहीं'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {stats.totalRecords} records
                        </div>
                      </div>
                      <div className="sm:hidden min-w-0">
                        <div className="text-xs font-semibold text-black truncate max-w-[60px]">
                          {currentProject?.name || 'Project'}
                        </div>
                      </div>
                      <span className={`text-black transition-transform duration-200 text-xs ${showProjectDropdown ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showProjectDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="max-h-80 overflow-y-auto">
                          {projects.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => {
                                switchToProject(project.id);
                                setShowProjectDropdown(false);
                              }}
                              className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                                currentProject?.id === project.id
                                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 border-l-4 border-l-yellow-500'
                                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                                    currentProject?.id === project.id 
                                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                  }`}>
                                  </div>
                                  <div>
                                    <div className={`font-semibold text-sm ${
                                      currentProject?.id === project.id ? 'text-yellow-800' : 'text-gray-800'
                                    }`}>
                                      {project.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {project.landRecords?.length || 0} records
                                    </div>
                                  </div>
                                </div>
                                {currentProject?.id === project.id && (
                                  <span className="text-yellow-600 text-lg font-bold">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* User Profile - Tablet and Above */}
              <div className="hidden sm:block">
                <div className="font-semibold text-xs sm:text-sm">{user.name || user.email}</div>
              </div>

              

              {/* User Profile - Mobile Only */}
              <div className="sm:hidden">
                <div className="font-semibold text-xs text-black truncate max-w-[80px]">{user.name?.split(' ')[0] || user.email?.split('@')[0]}</div>
              </div>

              

              {/* Logout Button */}
              <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Navigation Row - Removed from Tablet Header, moving to side panel */}
          </div>
        </div>
      </div>

    

      {/* Mobile & Tablet Floating Action Button - Hidden when on form tab */}
      {activeTab !== 'form' && (
        <button
          onClick={() => handleTabSwitch('form')}
          className="fixed bottom-32 right-4 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 z-40 lg:hidden group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-20"></div>
        </button>
      )}

  

      {/* Mobile Bottom Navigation - Card Style with Header Theme */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 border-t border-orange-300 shadow-2xl z-50 lg:hidden backdrop-blur-lg">
        <div className="max-w-lg mx-auto p-3">
          <div className="bg-gradient-to-r from-orange-300 via-orange-200 to-orange-100 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200 p-2">
            <div className="grid grid-cols-5 gap-1 relative">
              {/* Active Tab Indicator */}
              <div 
                className="absolute top-1 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl shadow-lg transition-all duration-500 ease-out"
                style={{
                  width: 'calc(20% - 4px)',
                  left: activeTab === 'projects' ? '2px' : 
                       activeTab === 'form' ? 'calc(20% + 2px)' : 
                       activeTab === 'records' ? 'calc(40% + 2px)' : 
                       activeTab === 'admin' ? 'calc(60% + 2px)' : 
                       'calc(80% + 2px)',
                  transform: activeTab ? 'scale(1)' : 'scale(0.95)'
                }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-xl"></div>
              </div>
              
              <button
                onClick={() => handleTabSwitch('projects')}
                disabled={isTabSwitching}
                className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 z-10 rounded-xl ${
                  activeTab === 'projects' 
                    ? 'text-white transform scale-105' 
                    : 'text-gray-600 hover:text-orange-600 transform hover:scale-105'
                } ${isTabSwitching ? 'opacity-50' : ''}`}
              >
                {isTabSwitching && activeTab === 'projects' ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className={`text-lg transition-all duration-300 ${activeTab === 'projects' ? 'animate-bounce' : ''}`}>📁</div>
                )}
                <span className={`text-xs font-bold transition-all duration-300 ${activeTab === 'projects' ? 'text-white' : 'text-gray-700'}`}>प्रोजेक्ट</span>
                {activeTab === 'projects' && (
                  <div className="absolute -top-1 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => handleTabSwitch('form')}
                disabled={isTabSwitching}
                className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 z-10 rounded-xl ${
                  activeTab === 'form' 
                    ? 'text-white transform scale-105' 
                    : 'text-gray-600 hover:text-green-600 transform hover:scale-105'
                } ${isTabSwitching ? 'opacity-50' : ''}`}
              >
                {isTabSwitching && activeTab === 'form' ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className={`text-lg transition-all duration-300 ${activeTab === 'form' ? 'animate-bounce' : ''}`}>📝</div>
                )}
                <span className={`text-xs font-bold transition-all duration-300 ${activeTab === 'form' ? 'text-white' : 'text-gray-700'}`}>फॉर्म</span>
                {activeTab === 'form' && (
                  <div className="absolute -top-1 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => handleTabSwitch('records')}
                disabled={isTabSwitching}
                className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 z-10 rounded-xl ${
                  activeTab === 'records' 
                    ? 'text-white transform scale-105' 
                    : 'text-gray-600 hover:text-orange-600 transform hover:scale-105'
                } ${isTabSwitching ? 'opacity-50' : ''}`}
              >
                {isTabSwitching && activeTab === 'records' ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className={`text-lg transition-all duration-300 ${activeTab === 'records' ? 'animate-bounce' : ''}`}>📊</div>
                )}
                <span className={`text-xs font-bold transition-all duration-300 ${activeTab === 'records' ? 'text-white' : 'text-gray-700'}`}>रिकॉर्ड</span>
                {activeTab === 'records' && (
                  <div className="absolute -top-1 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => handleTabSwitch('admin')}
                disabled={isTabSwitching}
                className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 z-10 rounded-xl ${
                  activeTab === 'admin' 
                    ? 'text-white transform scale-105' 
                    : 'text-gray-600 hover:text-purple-600 transform hover:scale-105'
                } ${isTabSwitching ? 'opacity-50' : ''}`}
              >
                {isTabSwitching && activeTab === 'admin' ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className={`text-lg transition-all duration-300 ${activeTab === 'admin' ? 'animate-bounce' : ''}`}>⚙️</div>
                )}
                <span className={`text-xs font-bold transition-all duration-300 ${activeTab === 'admin' ? 'text-white' : 'text-gray-700'}`}>सेटिंग</span>
                {activeTab === 'admin' && (
                  <div className="absolute -top-1 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => handleTabSwitch('dashboard')}
                disabled={isTabSwitching}
                className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 z-10 rounded-xl ${
                  activeTab === 'dashboard' 
                    ? 'text-white transform scale-105' 
                    : 'text-gray-600 hover:text-indigo-600 transform hover:scale-105'
                } ${isTabSwitching ? 'opacity-50' : ''}`}
              >
                {isTabSwitching && activeTab === 'dashboard' ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white/20 border-l-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className={`text-lg transition-all duration-300 ${activeTab === 'dashboard' ? 'animate-bounce' : ''}`}>📈</div>
                )}
                <span className={`text-xs font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-700'}`}>डैशबोर्ड</span>
                {activeTab === 'dashboard' && (
                  <div className="absolute -top-1 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-32 sm:pb-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Projects Tab */}
              <TabsContent value="projects" className="p-0 m-0">
                <Card className="m-0">
                  <CardHeader className="text-center p-0 m-0">
                    <CardTitle className="flex items-center justify-center space-x-2 text-2xl font-bold py-1">📁 Projects Management</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-0">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-center">नया प्रोजेक्ट बनाएं</h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="नया प्रोजेक्ट नाम दर्ज करें"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              createProject();
                            }
                          }}
                          className="max-w-md"
                        />
                        <Input
                          placeholder="मोबाइल नंबर दर्ज करें (10 अंक)"
                          value={newProjectMobile}
                          onChange={(e) => setNewProjectMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              createProject();
                            }
                          }}
                          className="max-w-md"
                          maxLength={10}
                        />
                      </div>
                      <div className="flex space-x-3 mt-3">
                    <Button onClick={createProject} disabled={creatingProject} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      {creatingProject ? (
                        <>
                          <div className="mr-2">
                            <div className="relative w-4 h-4">
                              <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                              <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            </div>
                          </div>
                          <span className="animate-pulse">बन रहा है...</span>
                        </>
                      ) : (
                        <>
                          ➕ प्रोजेक्ट बनाएं
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => {
                    const isActive = project.id === currentProjectId;
                    const projectStats = {
                      raiyatCount: new Set(project.landRecords.map(r => r.raiyatName)).size,
                      recordCount: project.landRecords.length,
                      area: project.landRecords.reduce((sum, r) => sum + (parseFloat(r.rakwa || '0')), 0).toFixed(2)
                    };
                    
                    return (
                      <Card key={project.id} className={`${isActive ? 'border-orange-500 bg-orange-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            {editingProjectId === project.id ? (
                              <div className="flex flex-col space-y-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={editingProjectName}
                                    onChange={(e) => setEditingProjectName(e.target.value)}
                                    className="flex-1"
                                    placeholder="प्रोजेक्ट नाम"
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={editingProjectMobile}
                                    onChange={(e) => setEditingProjectMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="flex-1"
                                    placeholder="मोबाइल नंबर (10 अंक)"
                                    maxLength={10}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => updateProject(project.id, editingProjectName, editingProjectMobile)}
                                  >
                                    ✅
                                  </Button>
                                  <Button
                                    size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingProjectId(null);
                                    setEditingProjectName('');
                                    setEditingProjectMobile('');
                                  }}
                                >
                                  ❌
                                </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-bold text-lg text-center">{project.name}</h4>
                                <p className="text-sm text-gray-600 text-center">📱 {project.mobileNumber}</p>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingProjectId(project.id);
                                      setEditingProjectName(project.name);
                                      setEditingProjectMobile(project.mobileNumber || '');
                                    }}
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => generateShareLink(project.id)}
                                    disabled={generatingShare && sharingProjectId === project.id}
                                  >
                                    {generatingShare && sharingProjectId === project.id ? (
                                      <div className="animate-spin">⏳</div>
                                    ) : (
                                      <span>📤</span>
                                    )}
                                  </Button>
                                  <Badge variant={isActive ? 'default' : 'secondary'}>
                                    {isActive ? 'सक्रिय' : 'निष्क्रिय'}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                            <div className="text-center p-2 bg-gray-100 rounded">
                              <div className="font-bold">{projectStats.raiyatCount}</div>
                              <div className="text-gray-600">रैयत</div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 rounded">
                              <div className="font-bold">{projectStats.recordCount}</div>
                              <div className="text-gray-600">रिकॉर्ड्स</div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 rounded">
                              <div className="font-bold">{projectStats.area}</div>
                              <div className="text-gray-600">रकवा</div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 rounded">
                              <div className="font-bold text-xs">{new Date(project.created).toLocaleDateString('hi-IN')}</div>
                              <div className="text-gray-600">बनाया गया</div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => switchToProject(project.id)}
                              className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
                            >
                              🔄 चुनें
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteProject(project.id)}
                              disabled={projectToDelete === project.id}
                              className="flex-1"
                            >
                              {projectToDelete === project.id ? (
                                <>
                                  <div className="mr-2">
                                    <div className="relative w-3 h-3">
                                      <div className="absolute inset-0 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  </div>
                                  डिलीट हो रहा...
                                </>
                              ) : (
                                <>
                                  🗑️ डिलीट
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form" className="pb-24 max-sm:pb-0">
            <Card className="border-0 shadow-xl">
              <CardContent>
                <form onSubmit={submitLandRecord} className="space-y-6">
                  {/* रैयत की जानकारी */}
                  <div className="flex flex-col">
                    <div className="w-full">
                      <Label htmlFor="raiyatName" className="text-left block mb-2">1. रैयत का नाम</Label>
                      <Select value={formData.raiyatName} onValueChange={(value) => setFormData({...formData, raiyatName: value})}>
                        <SelectTrigger className="h-12 text-base font-medium w-full text-left">
                          <SelectValue placeholder="-- चुनें --" className="text-center w-full" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {currentProject?.raiyatNames.map((raiyat) => (
                            <SelectItem key={raiyat.id} value={raiyat.id} className="py-3 text-base font-medium">
                              <div className="flex items-center gap-3">
                                <span 
                                  className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-md"
                                  style={{ backgroundColor: raiyat.color || '#6b7280' }}
                                />
                                <span style={{ color: raiyat.color || '#1f2937' }} className="text-base">
                                  {raiyat.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jamabandiNumber">2. जमाबंदी नंबर</Label>
                        <Input
                          id="jamabandiNumber"
                          type="number"
                          value={formData.jamabandiNumber}
                          onChange={(e) => setFormData({...formData, jamabandiNumber: e.target.value})}
                          placeholder="जमाबंदी नंबर दर्ज करें"
                        />
                      </div>
                      <div>
                        <Label htmlFor="khataNumber">3. खाता नंबर</Label>
                        <Input
                          id="khataNumber"
                          type="number"
                          value={formData.khataNumber}
                          onChange={(e) => setFormData({...formData, khataNumber: e.target.value})}
                          placeholder="खाता नंबर दर्ज करें"
                        />
                      </div>
                      <div>
                        <Label htmlFor="khesraNumber">4. खेसरा नंबर *</Label>
                        <Input
                          id="khesraNumber"
                          type="number"
                          value={formData.khesraNumber}
                          onChange={(e) => setFormData({...formData, khesraNumber: e.target.value})}
                          placeholder="खेसरा नंबर दर्ज करें"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="rakwa">5. रकवा (डिसमिल में)</Label>
                        <Input
                          id="rakwa"
                          type="number"
                          step="0.01"
                          value={formData.rakwa}
                          onChange={(e) => setFormData({...formData, rakwa: e.target.value})}
                          placeholder="रकवा दर्ज करें"
                        />
                      </div>
                    </div>
                  </div>

                  {/* चौहद्दी विवरण */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="uttar">6. उत्तर</Label>
                        <Input
                          id="uttar"
                          value={formData.uttar}
                          onChange={(e) => setFormData({...formData, uttar: e.target.value})}
                          placeholder="उत्तर दिशा"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dakshin">7. दक्षिण</Label>
                        <Input
                          id="dakshin"
                          value={formData.dakshin}
                          onChange={(e) => setFormData({...formData, dakshin: e.target.value})}
                          placeholder="दक्षिण दिशा"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purab">8. पूर्व</Label>
                        <Input
                          id="purab"
                          value={formData.purab}
                          onChange={(e) => setFormData({...formData, purab: e.target.value})}
                          placeholder="पूर्व दिशा"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paschim">9. पश्चिम</Label>
                        <Input
                          id="paschim"
                          value={formData.paschim}
                          onChange={(e) => setFormData({...formData, paschim: e.target.value})}
                          placeholder="पश्चिम दिशा"
                        />
                      </div>
                    </div>
                  </div>

                  {/* अतिरिक्त जानकारी */}
                  <div>
                    <div>
                      <Label htmlFor="remarks">10. रिमार्क्स</Label>
                      <Textarea
                        id="remarks"
                        rows={3}
                        value={formData.remarks}
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                        placeholder="अन्य टिप्पणियाँ दर्ज करें"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg" disabled={submittingRecord}>
                    {submittingRecord ? (
                      <>
                        <div className="mr-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                          </div>
                        </div>
                        <span className="animate-pulse">सबमिट हो रहा...</span>
                      </>
                    ) : (
                      <>
                        ✅ सबमिट करें
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="pb-24 max-sm:pb-0">
            <Card className="mb-4 max-sm:mb-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl font-bold">📊 सभी रिकॉर्ड्स</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">👥</div>
                      <div className="text-3xl font-bold">{stats.totalRaiyat}</div>
                      <div>कुल रैयत</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`bg-gradient-to-r from-green-500 to-green-600 text-white transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
                      currentRaiyatFilter ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
                    }`}
                    onClick={() => currentRaiyatFilter && setCurrentRaiyatFilter(null)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">📋</div>
                      <div className="text-3xl font-bold">{stats.totalRecords}</div>
                      <div>कुल रिकॉर्ड्स</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">📏</div>
                      <div className="text-3xl font-bold">{stats.totalArea.toFixed(2)}</div>
                      <div>कुल रकवा (डिसमिल)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Beautiful Chart */}
                <BeautifulChart
                  data={chartData}
                  onRaiyatClick={handleRaiyatChartClick}
                />

                {/* Spacer for better visual separation */}
                <div className="my-8"></div>

                {/* Clear Filter Button - Only show when filter is active */}
                {currentRaiyatFilter && (
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-800">फिल्टर लगा है:</span>
                      <Badge variant="secondary" className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: currentProject?.raiyatNames.find(r => r.name === currentRaiyatFilter)?.color || '#6b7280' }}
                        />
                        {currentRaiyatFilter}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentRaiyatFilter(null)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-600 hover:from-red-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                    >
                      ❌ क्लियर फिल्टर
                    </Button>
                  </div>
                )}


                {/* Export and Import Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mb-6">
                  {/* Export Record Button */}
                  <button 
                    onClick={exportRecords}
                    disabled={exportingData}
                    className="w-full max-w-xs px-5 py-3 border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: exportingData ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white'
                    }}
                    onMouseOver={(e) => {
                      if (!exportingData) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!exportingData) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {exportingData ? (
                      <>
                        <Spinner size="sm" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <span>📥</span>
                        <span>Export record</span>
                      </>
                    )}
                  </button>
                  
                  {/* Import Record Button */}
                  <button 
                    onClick={() => setShowImportPopup(true)}
                    className="w-full max-w-xs px-5 py-3 border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(245, 158, 11, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span>📤</span> Import Record
                  </button>
                </div>

                {/* Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
                        <th className="border border-gray-300 p-2">क्र.</th>
                        <th className="border border-gray-300 p-2">रैयत नाम</th>
                        <th className="border border-gray-300 p-2">जमाबंदी नंबर</th>
                        <th className="border border-gray-300 p-2">खाता नंबर</th>
                        <th className="border border-gray-300 p-2">खेसरा नंबर</th>
                        <th className="border border-gray-300 p-2">रकवा</th>
                        <th className="border border-gray-300 p-2">उत्तर</th>
                        <th className="border border-gray-300 p-2">दक्षिण</th>
                        <th className="border border-gray-300 p-2">पूर्व</th>
                        <th className="border border-gray-300 p-2">पश्चिम</th>
                        <th className="border border-gray-300 p-2">रिमार्क्स</th>
                        <th className="border border-gray-300 p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProject?.landRecords
                        .filter(record => !currentRaiyatFilter || record.raiyatName === currentRaiyatFilter)
                        .map((record, index) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">{index + 1}</td>
                          <td className="border border-gray-300 p-2 font-semibold">
                            <span 
                              className="px-2 py-1 font-bold text-sm"
                              style={{ 
                                color: record.raiyatColor || '#1f2937'
                              }}
                            >
                              {record.raiyatName}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">{record.jamabandiNumber || '-'}</td>
                          <td className="border border-gray-300 p-2">{record.khataNumber || '-'}</td>
                          <td className="border border-gray-300 p-2">{record.khesraNumber}</td>
                          <td className="border border-gray-300 p-2">{record.rakwa || '0'} डिसमिल</td>
                          <td className="border border-gray-300 p-2">{record.uttar || '-'}</td>
                          <td className="border border-gray-300 p-2">{record.dakshin || '-'}</td>
                          <td className="border border-gray-300 p-2">{record.purab || '-'}</td>
                          <td className="border border-gray-300 p-2">{record.paschim || '-'}</td>
                          <td className="border border-gray-300 p-2">{record.remarks || '-'}</td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setShowRecordView(true);
                                }}
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                              >
                                👁️
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => deleteRecord(record.id, record.khesraNumber)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
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

          {/* Admin Tab */}
          <TabsContent value="admin" className="pb-24 max-sm:pb-0">
            <Card className="mb-4 max-sm:mb-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl font-bold">⚙️ एडमिन पैनल</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Raiyat Management */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-center">👥 रैयत नाम प्रबंधन</h3>
                  <div className="flex space-x-3 mb-4">
                    <Input
                      placeholder="नया रैयत नाम दर्ज करें"
                      value={newRaiyatName}
                      onChange={(e) => setNewRaiyatName(e.target.value)}
                      className="max-w-md"
                    />
                    <Button onClick={addRaiyat} disabled={addingRaiyat} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      {addingRaiyat ? (
                        <>
                          <div className="mr-2">
                            <div className="relative w-4 h-4">
                              <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"></div>
                              <div className="absolute inset-0 border-2 border-white/30 border-b-transparent rounded-full"></div>
                            </div>
                          </div>
                          <span className="animate-pulse">जोड़ा जा रहा है...</span>
                        </>
                      ) : (
                        <>
                          ➕ जोड़ें
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {currentProject?.raiyatNames.map((raiyat) => (
                      <div key={raiyat.id} className="flex justify-between items-center p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-4 h-4 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: raiyat.color || '#e5e7eb' }}
                          />
                          <span className="font-medium" style={{ color: raiyat.color || '#1f2937' }}>
                            {raiyat.name}
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => deleteRaiyat(raiyat.id, raiyat.name)}
                          disabled={deletingRaiyatId === raiyat.id}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {deletingRaiyatId === raiyat.id ? (
                            <>
                              <Spinner size="sm" className="mr-1" />
                              डिलीट हो रहा...
                            </>
                          ) : (
                            <>
                              🗑️ डिलीट
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="pb-24 max-sm:pb-0">
            {/* Main Dashboard Card */}
            <Card className="shadow-2xl border-2 border-indigo-200 overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-3 text-2xl font-bold text-black">
                  <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">📊</span>
                  </div>
                  <span className="text-black">
                    डैशबोर्ड
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* User Info Card */}
                <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl shadow-xl overflow-hidden">
                <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Card */}
                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-blue-600 font-semibold mb-1">पूरा नाम</div>
                          <div className="text-lg font-bold text-gray-800">{user?.name || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Email Card */}
                    <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📧</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-green-600 font-semibold mb-1">ईमेल पता</div>
                          <div className="text-sm font-semibold text-gray-800 truncate">{user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="bg-white rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📱</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-purple-600 font-semibold mb-1">मोबाइल नंबर</div>
                          <div className="text-lg font-bold text-gray-800">{user?.mobile || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📍</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-orange-600 font-semibold mb-1">पता</div>
                          <div className="text-sm font-semibold text-gray-800 truncate">{user?.address || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
        
        {/* Profile Update and Account Management Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <Button 
            onClick={() => {
              setProfileData({
                name: user?.name || '',
                mobile: user?.mobile || '',
                address: user?.address || ''
              });
              setShowProfileUpdate(true);
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-2 border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-xl px-8 py-3 font-semibold rounded-xl w-full sm:w-auto"
          >
            <span className="mr-2">✏️</span>
            प्रोफाइल अपडेट करें
          </Button>
          
          <Button 
            onClick={() => {
              setShowDeleteAccountDialog(true);
              setDeleteAccountEmail('');
              setDeleteAccountError('');
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-300 transition-all duration-300 hover:scale-105 hover:shadow-xl px-8 py-3 font-semibold rounded-xl w-full sm:w-auto"
          >
            <span className="mr-2">🗑️</span>
            खाता डिलीट करें
          </Button>
        </div>
                </CardContent>
              </Card>

  
  
              {/* Payment Management System */}
              <Card className="mb-4 max-sm:mb-0">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💰</span>
                      <span>पेमेंट मैनेजमेंट सिस्टम</span>
                    </div>
                    <Button 
                      onClick={() => {
                        setPaymentForm({
                          ...paymentForm,
                          projectId: currentProjectId || ''
                        });
                        setShowPaymentModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <span className="mr-2">➕</span>
                      पेमेंट जोड़ें
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600">कुल भुगतान</div>
                        <div className="text-2xl font-bold text-blue-800">
                          ₹{payments.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString('hi-IN')}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600">प्राप्त भुगतान</div>
                        <div className="text-2xl font-bold text-green-800">
                          ₹{payments.reduce((sum, p) => sum + p.receivedAmount, 0).toLocaleString('hi-IN')}
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="text-sm text-red-600">बकाया भुगतान</div>
                        <div className="text-2xl font-bold text-red-800">
                          ₹{payments.reduce((sum, p) => sum + p.pendingAmount, 0).toLocaleString('hi-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Payment List */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-700 text-center">प्रोजेक्ट वार पेमेंट डिटेल्स</h3>
                      {payments.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                          <table className="w-full border-collapse bg-white">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700">प्रोजेक्ट</th>
                                <th className="border border-gray-200 p-3 text-right font-semibold text-gray-700">कुल राशि</th>
                                <th className="border border-gray-200 p-3 text-right font-semibold text-gray-700">प्राप्त राशि</th>
                                <th className="border border-gray-200 p-3 text-right font-semibold text-gray-700">बकाया राशि</th>
                                <th className="border border-gray-200 p-3 text-center font-semibold text-gray-700">स्टेटस</th>
                                <th className="border border-gray-200 p-3 text-center font-semibold text-gray-700">कार्य</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((payment, index) => (
                                <tr key={payment.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                  <td className="border border-gray-200 p-3 font-medium text-gray-900">{payment.project?.name || 'Unknown Project'}</td>
                                  <td className="border border-gray-200 p-3 text-right font-semibold text-gray-900">₹{payment.totalAmount.toLocaleString('hi-IN')}</td>
                                  <td className="border border-gray-200 p-3 text-right font-medium text-green-600">₹{payment.receivedAmount.toLocaleString('hi-IN')}</td>
                                  <td className="border border-gray-200 p-3 text-right font-bold text-red-600">₹{payment.pendingAmount.toLocaleString('hi-IN')}</td>
                                  <td className="border border-gray-200 p-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      payment.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                      payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                      'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {payment.status === 'completed' ? 'पूर्ण' :
                                       payment.status === 'partial' ? 'आंशिक' : 'बकाया'}
                                    </span>
                                  </td>
                                  <td className="border border-gray-200 p-3 text-center">
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
                                        disabled={updatingPayment || deletingPaymentId === payment.id}
                                        className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white transition-colors"
                                        title="पेमेंट एडिट करें"
                                      >
                                        {updatingPayment && editingPayment?.id === payment.id ? (
                                          <Spinner size="sm" />
                                        ) : (
                                          <span>✏️</span>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteClick(payment)}
                                        disabled={updatingPayment || deletingPaymentId === payment.id}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                                        title="पेमेंट डिलीट करें"
                                      >
                                        {deletingPaymentId === payment.id ? (
                                          <Spinner size="sm" />
                                        ) : (
                                          <span>🗑️</span>
                                        )}
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
                  </div>
                </CardContent>
              </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
      </div>

      {/* Record View Popup */}
      <Dialog open={showRecordView} onOpenChange={setShowRecordView}>
        <DialogContent className="max-w-lg w-full ml-0 mr-6 pl-0 pr-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-4">
            <div className="text-4xl sm:text-6xl mb-4">📋</div>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2 text-center">रिकॉर्ड की पूरी जानकारी</h2>
          </div>
          
          {selectedRecord && (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
              <div className="text-sm sm:text-base"><strong>📅 तारीख:</strong> {selectedRecord.timestamp}</div>
              <div className="text-sm sm:text-base"><strong>👤 रैयत नाम:</strong> {selectedRecord.raiyatName}</div>
              <div className="text-sm sm:text-base"><strong>🔢 जमाबंदी नंबर:</strong> {selectedRecord.jamabandiNumber || 'नहीं दिया'}</div>
              <div className="text-sm sm:text-base"><strong>📋 खाता नंबर:</strong> {selectedRecord.khataNumber || 'नहीं दिया'}</div>
              <div className="text-sm sm:text-base"><strong>🏷️ खेसरा नंबर:</strong> {selectedRecord.khesraNumber}</div>
              <div className="text-sm sm:text-base"><strong>📏 रकवा:</strong> {selectedRecord.rakwa || 'नहीं दिया'} डिसमिल</div>
              <div className="text-sm sm:text-base">
                <strong>🗺️ चौहद्दी:</strong>
                <div className="ml-2 sm:ml-4 mt-1 space-y-1">
                  <div className="text-xs sm:text-sm">• उत्तर: {selectedRecord.uttar || 'नहीं दिया'}</div>
                  <div className="text-xs sm:text-sm">• दक्षिण: {selectedRecord.dakshin || 'नहीं दिया'}</div>
                  <div className="text-xs sm:text-sm">• पूर्व: {selectedRecord.purab || 'नहीं दिया'}</div>
                  <div className="text-xs sm:text-sm">• पश्चिम: {selectedRecord.paschim || 'नहीं दिया'}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base"><strong>💬 रिमार्क्स:</strong> {selectedRecord.remarks || 'नहीं दिया'}</div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
            <Button
              onClick={() => {
                setShowEditRecord(true);
                setShowRecordView(false);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-full sm:w-auto"
            >
              ✏️ एडिट करें
            </Button>
            <Button
              onClick={() => selectedRecord && shareRecordOnWhatsApp(selectedRecord)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-full sm:w-auto"
            >
              📱 WhatsApp शेयर करें
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRecord && deleteRecord(selectedRecord.id, selectedRecord.khesraNumber)}
              disabled={deletingRecordId === selectedRecord?.id}
              className="w-full sm:w-auto"
            >
              {deletingRecordId === selectedRecord?.id ? (
                <>
                  <Spinner size="sm" className="mr-1" />
                  डिलीट हो रहा...
                </>
              ) : (
                <>
                  🗑️ डिलीट
                </>
              )}
            </Button>
            <Button onClick={() => setShowRecordView(false)} className="w-full sm:w-auto">
              ✖️ बंद करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Record Popup */}
      <Dialog open={showEditRecord} onOpenChange={setShowEditRecord}>
        <DialogContent className="max-w-lg w-full ml-0 mr-6 pl-0 pr-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">✏️</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2 text-center">रिकॉर्ड एडिट करें</h2>
          </div>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <Label>रैयत नाम</Label>
                <Select 
                  value={selectedRecord.raiyatId} 
                  onValueChange={(value) => setSelectedRecord({...selectedRecord, raiyatId: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProject?.raiyatNames.map((raiyat) => (
                      <SelectItem key={raiyat.id} value={raiyat.id}>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-md"
                            style={{ backgroundColor: raiyat.color || '#6b7280' }}
                          />
                          <span style={{ color: raiyat.color || '#1f2937' }}>
                            {raiyat.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>जमाबंदी नंबर</Label>
                  <Input
                    type="number"
                    value={selectedRecord.jamabandiNumber || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, jamabandiNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label>खाता नंबर</Label>
                  <Input
                    type="number"
                    value={selectedRecord.khataNumber || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, khataNumber: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>खेसरा नंबर</Label>
                  <Input
                    type="number"
                    value={selectedRecord.khesraNumber}
                    onChange={(e) => setSelectedRecord({...selectedRecord, khesraNumber: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>रकवा (डिसमिल)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedRecord.rakwa || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, rakwa: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>उत्तर</Label>
                  <Input
                    value={selectedRecord.uttar || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, uttar: e.target.value})}
                  />
                </div>
                <div>
                  <Label>दक्षिण</Label>
                  <Input
                    value={selectedRecord.dakshin || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, dakshin: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>पूर्व</Label>
                  <Input
                    value={selectedRecord.purab || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, purab: e.target.value})}
                  />
                </div>
                <div>
                  <Label>पश्चिम</Label>
                  <Input
                    value={selectedRecord.paschim || ''}
                    onChange={(e) => setSelectedRecord({...selectedRecord, paschim: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>रिमार्क्स</Label>
                <Textarea
                  rows={3}
                  value={selectedRecord.remarks || ''}
                  onChange={(e) => setSelectedRecord({...selectedRecord, remarks: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-3 mt-6">
            <Button 
              onClick={() => selectedRecord && updateRecord(selectedRecord)}
              disabled={updatingRecord}
            >
              {updatingRecord ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  अपडेट हो रहा...
                </>
              ) : (
                <>
                  ✅ अपडेट करें
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowEditRecord(false)}>
              ✖️ रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">प्रोजेक्ट डिलीट करें?</h2>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4">
              <p className="font-bold text-red-800">
                {projects.find(p => p.id === projectToDelete)?.name || 'प्रोजेक्ट'}
              </p>
            </div>
            <p className="text-gray-600 mb-4">
              क्या आप वाकई इस प्रोजेक्ट को डिलीट करना चाहते हैं? 
              इससे सभी land records भी डिलीट हो जाएंगे!
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setProjectToDelete(null)}
              className="flex-1"
            >
              ❌ रद्द करें
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteProject}
              className="flex-1"
            >
              🗑️ डिलीट करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Raiyat Confirmation Dialog */}
      <Dialog open={!!raiyatToDelete} onOpenChange={() => setRaiyatToDelete(null)}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-orange-600 mb-2">रैयत डिलीट करें?</h2>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-4">
              <p className="font-bold text-orange-800">{raiyatToDelete?.name}</p>
            </div>
            <p className="text-gray-600 mb-4">
              क्या आप वाकई इस रैयत को डिलीट करना चाहते हैं? 
              इससे इस रैयत से जुड़े सभी records भी डिलीट हो जाएंगे!
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setRaiyatToDelete(null)}
              className="flex-1"
            >
              ❌ रद्द करें
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteRaiyat}
              disabled={deletingRaiyatId === raiyatToDelete?.id}
              className="flex-1"
            >
              {deletingRaiyatId === raiyatToDelete?.id ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  डिलीट हो रहा...
                </>
              ) : (
                <>
                  🗑️ डिलीट करें
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Record Confirmation Dialog */}
      <Dialog open={!!recordToDelete} onOpenChange={() => setRecordToDelete(null)}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">रिकॉर्ड डिलीट करें?</h2>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4">
              <p className="font-bold text-red-800">खेसरा नंबर: {recordToDelete?.khesraNumber}</p>
            </div>
            <p className="text-gray-600 mb-4">
              क्या आप वाकई इस LRMS रिकॉर्ड को डिलीट करना चाहते हैं? 
              यह कार्रवाई पूर्ववत नहीं की जा सकती!
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setRecordToDelete(null)}
              className="flex-1"
            >
              ❌ रद्द करें
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteRecord}
              disabled={deletingRecordId === recordToDelete?.id}
              className="flex-1"
            >
              {deletingRecordId === recordToDelete?.id ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  डिलीट हो रहा...
                </>
              ) : (
                <>
                  🗑️ डिलीट करें
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Import File Popup */}
      <Dialog open={showImportPopup} onOpenChange={setShowImportPopup}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6 max-h-[85vh] overflow-y-auto">
          <div className="text-center mb-4">
            <div className="text-3xl sm:text-4xl mb-2">📤</div>
            <h2 className="text-lg sm:text-xl font-bold text-blue-600 mb-1">फाइल इंपोर्ट करें</h2>
            <p className="text-gray-600 text-sm sm:text-base">Excel या CSV फाइल चुनें</p>
          </div>
          
          {/* File Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-2xl sm:text-3xl mb-2">
              {isDragging ? '📥' : '📁'}
            </div>
            <Label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-base text-center">
              {isDragging ? 'फाइल डालें' : 'फाइल चुनें'}
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="text-xs text-gray-500 mt-2">
              Excel (.xlsx, .xls) या CSV (.csv)
            </div>
          </div>
          {/* File Information */}
          {importFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="text-lg">📄</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{importFile.name}</div>
                    <div className="text-xs text-gray-600">{(importFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportFile(null)}
                  className="ml-2 h-8 w-8 p-0"
                >
                  ❌
                </Button>
              </div>
            </div>
          )}
            
          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 mt-4">
            <Button 
              onClick={handleFileImport} 
              disabled={!importFile || isImporting}
              className="w-full bg-green-500 hover:bg-green-600 text-white opacity-100 font-bold text-lg py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isImporting ? (
                <>
                  <span className="mr-2">🔄</span>
                  इंपोर्ट हो रहा...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  इंपोर्ट करें
                </>
              )}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowImportPopup(false);
                setImportFile(null);
              }}
              disabled={isImporting}
              className="w-full bg-red-500 text-white hover:bg-red-600 border-red-500"
            >
              रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Update Dialog */}
      <Dialog open={showProfileUpdate} onOpenChange={setShowProfileUpdate}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">प्रोफाइल अपडेट करें</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>नाम</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="आपका नाम"
              />
            </div>
            <div>
              <Label>मोबाइल नंबर</Label>
              <Input
                type="tel"
                value={profileData.mobile}
                onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                placeholder="9876543210"
                pattern="[0-9]{10}"
                maxLength={10}
              />
            </div>
            <div>
              <Label>पता</Label>
              <Textarea
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                placeholder="आपका पूरा पता"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-3 mt-6">
            <Button 
              onClick={() => {
                // Update profile logic here
                setUser({...user, name: profileData.name, mobile: profileData.mobile, address: profileData.address});
                setShowProfileUpdate(false);
                toast({ title: 'सफलता', description: 'प्रोफाइल अपडेट हो गया' });
              }}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  अपडेट हो रहा...
                </>
              ) : (
                <>
                  ✅ अपडेट करें
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowProfileUpdate(false)}>
              ✖️ रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">खाता डिलीट करें</h2>
            <p className="text-gray-600 text-sm">
              यह कार्रवाई अपरिवर्तनीय है और आपका सारा डेटा हमेशा के लिए डिलीट हो जाएगा
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-red-600 font-semibold">⚠️ खतरा:</span>
                <span className="text-red-800 font-medium">सभी डेटा हमेशा के लिए डिलीट हो जाएगा</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• सभी प्रोजेक्ट्स</li>
                <li>• सभी LRMS</li>
                <li>• सभी रैयत डेटा</li>
                <li>• सभी पेमेंट रिकॉर्ड्स</li>
                <li>• आपका यूजर अकाउंट</li>
              </ul>
            </div>

            <div>
              <Label className="text-red-600 font-semibold">
                अपना ईमेल ID दर्ज करें ({user?.email})
              </Label>
              <Input
                type="email"
                value={deleteAccountEmail}
                onChange={(e) => {
                  setDeleteAccountEmail(e.target.value);
                  setDeleteAccountError('');
                }}
                placeholder={user?.email || "your@email.com"}
                className={`mt-2 ${deleteAccountError ? 'border-red-500' : ''}`}
              />
              {deleteAccountError && (
                <p className="text-red-500 text-sm mt-1">{deleteAccountError}</p>
              )}
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm font-medium">
                💡 सत्यापन: ऊपर दिए गए ईमेल ID को बिल्कुल सही दर्ज करें
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-3 mt-6">
            <Button 
              onClick={handleDeleteAccount}
              disabled={!deleteAccountEmail || deleteAccountEmail !== user?.email}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-semibold"
            >
              🗑️ खाता डिलीट करें
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowDeleteAccountDialog(false);
                setDeleteAccountEmail('');
                setDeleteAccountError('');
              }}
            >
              ✖️ रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Add Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">पेमेंट जोड़ें</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>प्रोजेक्ट चुनें</Label>
              <Select value={paymentForm.projectId} onValueChange={(value) => setPaymentForm({...paymentForm, projectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="प्रोजेक्ट चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>कुल राशि (₹)</Label>
              <Input
                type="number"
                value={paymentForm.totalAmount}
                onChange={(e) => setPaymentForm({...paymentForm, totalAmount: e.target.value})}
                placeholder="कुल राशि"
              />
            </div>
            <div>
              <Label>प्राप्त राशि (₹)</Label>
              <Input
                type="number"
                value={paymentForm.receivedAmount}
                onChange={(e) => setPaymentForm({...paymentForm, receivedAmount: e.target.value})}
                placeholder="प्राप्त राशि"
              />
            </div>
            <div>
              <Label>भुगतान प्रकार</Label>
              <Select value={paymentForm.paymentType} onValueChange={(value) => setPaymentForm({...paymentForm, paymentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="भुगतान प्रकार चुनें" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 नकद</SelectItem>
                  <SelectItem value="bank">🏪 बैंक ट्रांसफर</SelectItem>
                  <SelectItem value="upi">📱 UPI</SelectItem>
                  <SelectItem value="cheque">📄 चेक</SelectItem>
                  <SelectItem value="other">🔄 अन्य</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>विवरण (वैकल्पिक)</Label>
              <Textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                placeholder="भुगतान का विवरण या टिप्पणी"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-3 mt-6">
            <Button 
              onClick={addPayment}
              disabled={addingPayment}
            >
              {addingPayment ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  जोड़ा जा रहा है...
                </>
              ) : (
                <>
                  ✅ पेमेंट जोड़ें
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              ✖️ रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={showEditPaymentModal} onOpenChange={setShowEditPaymentModal}>
        <DialogContent className="max-w-sm w-full ml-0 mr-6 pl-0 pr-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center space-x-2">
              💰 पेमेंट अपडेट करें
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>प्रोजेक्ट</Label>
              <Input
                value={projects.find(p => p.id === editingPayment?.projectId)?.name || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>कुल राशि (₹)</Label>
              <Input
                type="number"
                value={editPaymentForm.totalAmount}
                onChange={(e) => setEditPaymentForm({...editPaymentForm, totalAmount: e.target.value})}
                placeholder="कुल राशि"
              />
            </div>
            <div>
              <Label>प्राप्त राशि (₹)</Label>
              <Input
                type="number"
                value={editPaymentForm.receivedAmount}
                onChange={(e) => setEditPaymentForm({...editPaymentForm, receivedAmount: e.target.value})}
                placeholder="प्राप्त राशि"
              />
            </div>
            <div>
              <Label>भुगतान प्रकार</Label>
              <Select value={editPaymentForm.paymentType} onValueChange={(value) => setEditPaymentForm({...editPaymentForm, paymentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="भुगतान प्रकार चुनें" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 नकद</SelectItem>
                  <SelectItem value="bank">🏪 बैंक ट्रांसफर</SelectItem>
                  <SelectItem value="upi">📱 UPI</SelectItem>
                  <SelectItem value="cheque">📄 चेक</SelectItem>
                  <SelectItem value="other">🔄 अन्य</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>विवरण (वैकल्पिक)</Label>
              <Textarea
                value={editPaymentForm.description}
                onChange={(e) => setEditPaymentForm({...editPaymentForm, description: e.target.value})}
                placeholder="भुगतान का विवरण या टिप्पणी"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-3 mt-6">
            <Button 
              onClick={handleEditPayment}
              disabled={updatingPayment}
            >
              {updatingPayment ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  अपडेट हो रहा है...
                </>
              ) : (
                <>
                  ✅ पेमेंट अपडेट करें
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowEditPaymentModal(false)}>
              ✖️ रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={processingModal.isOpen}
        message={processingModal.message}
        subMessage={processingModal.subMessage}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && paymentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-white/25 backdrop-blur-sm rounded-full mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-center">पेमेंट डिलीट करने की पुष्टि</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-800 mb-3 text-center">पेमेंट विवरण</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">प्रोजेक्ट:</span>
                    <span className="font-medium text-gray-900">{paymentToDelete.project?.name || 'Unknown Project'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">कुल राशि:</span>
                    <span className="font-semibold text-green-600">₹{paymentToDelete.totalAmount.toLocaleString('hi-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">प्राप्त राशि:</span>
                    <span className="font-semibold text-blue-600">₹{paymentToDelete.receivedAmount.toLocaleString('hi-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">बकाया राशि:</span>
                    <span className="font-semibold text-red-600">₹{paymentToDelete.pendingAmount.toLocaleString('hi-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">स्थिति:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      paymentToDelete.status === 'completed' ? 'bg-green-100 text-green-800' :
                      paymentToDelete.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {paymentToDelete.status === 'completed' ? 'पूर्ण' :
                       paymentToDelete.status === 'partial' ? 'आंशिक' : 'बकाया'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-center text-sm font-medium">
                  <span className="text-red-600 font-bold">⚠️ चेतावनी:</span> यह कार्रवाई वापस नहीं की जा सकती!
                </p>
              </div>

              <p className="text-center text-gray-700 mb-6">
                क्या आप वाकई इस पेमेंट को हमेशा के लिए डिलीट करना चाहते हैं?
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 border border-gray-300"
                >
                  रद्द करें
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                >
                  डिलीट करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {user && (
        <button
          onClick={() => setShowFloatingForm(true)}
          className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transform hover:scale-110 group hidden lg:block"
          aria-label="Quick Form"
        >
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-20"></div>
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-300 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Quick Form
          </span>
        </button>
      )}

      {/* Floating Form Dialog */}
      <Dialog open={showFloatingForm} onOpenChange={setShowFloatingForm}>
        <DialogContent className="max-w-xl w-full ml-0 mr-6 pl-0 pr-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📝</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Land Record Form</h2>
            <p className="text-gray-600 text-sm">जल्दी से LRMS जानकारी भरें</p>
          </div>
          
          <form className="space-y-6">
            {/* रैयत की जानकारी */}
            <div className="flex flex-col">
              <div className="w-full">
                <Label htmlFor="floating-raiyatName" className="text-left block mb-2">1. रैयत का नाम</Label>
                <Select value={floatingFormData.raiyatName} onValueChange={(value) => setFloatingFormData({...floatingFormData, raiyatName: value})}>
                  <SelectTrigger className="h-12 text-base font-medium w-full text-left">
                    <SelectValue placeholder="-- चुनें --" className="text-center w-full" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {currentProject?.raiyatNames.map((raiyat) => (
                      <SelectItem key={raiyat.id} value={raiyat.id} className="py-3 text-base font-medium">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-md"
                            style={{ backgroundColor: raiyat.color || '#6b7280' }}
                          />
                          <span style={{ color: raiyat.color || '#1f2937' }} className="text-base">
                            {raiyat.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floating-jamabandiNumber">2. जमाबंदी नंबर</Label>
                  <Input
                    id="floating-jamabandiNumber"
                    type="number"
                    value={floatingFormData.jamabandiNumber}
                    onChange={(e) => setFloatingFormData({...floatingFormData, jamabandiNumber: e.target.value})}
                    placeholder="जमाबंदी नंबर दर्ज करें"
                  />
                </div>
                <div>
                  <Label htmlFor="floating-khataNumber">3. खाता नंबर</Label>
                  <Input
                    id="floating-khataNumber"
                    type="number"
                    value={floatingFormData.khataNumber}
                    onChange={(e) => setFloatingFormData({...floatingFormData, khataNumber: e.target.value})}
                    placeholder="खाता नंबर दर्ज करें"
                  />
                </div>
                <div>
                  <Label htmlFor="floating-khesraNumber">4. खेसरा नंबर *</Label>
                  <Input
                    id="floating-khesraNumber"
                    type="number"
                    value={floatingFormData.khesraNumber}
                    onChange={(e) => setFloatingFormData({...floatingFormData, khesraNumber: e.target.value})}
                    placeholder="खेसरा नंबर दर्ज करें"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="floating-rakwa">5. रकवा (डिसमिल में)</Label>
                  <Input
                    id="floating-rakwa"
                    type="number"
                    step="0.01"
                    value={floatingFormData.rakwa}
                    onChange={(e) => setFloatingFormData({...floatingFormData, rakwa: e.target.value})}
                    placeholder="रकवा दर्ज करें"
                  />
                </div>
              </div>
            </div>

            {/* चौहद्दी विवरण */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floating-uttar">6. उत्तर</Label>
                  <Input
                    id="floating-uttar"
                    value={floatingFormData.uttar}
                    onChange={(e) => setFloatingFormData({...floatingFormData, uttar: e.target.value})}
                    placeholder="उत्तर दिशा"
                  />
                </div>
                <div>
                  <Label htmlFor="floating-dakshin">7. दक्षिण</Label>
                  <Input
                    id="floating-dakshin"
                    value={floatingFormData.dakshin}
                    onChange={(e) => setFloatingFormData({...floatingFormData, dakshin: e.target.value})}
                    placeholder="दक्षिण दिशा"
                  />
                </div>
                <div>
                  <Label htmlFor="floating-purab">8. पूर्व</Label>
                  <Input
                    id="floating-purab"
                    value={floatingFormData.purab}
                    onChange={(e) => setFloatingFormData({...floatingFormData, purab: e.target.value})}
                    placeholder="पूर्व दिशा"
                  />
                </div>
                <div>
                  <Label htmlFor="floating-paschim">9. पश्चिम</Label>
                  <Input
                    id="floating-paschim"
                    value={floatingFormData.paschim}
                    onChange={(e) => setFloatingFormData({...floatingFormData, paschim: e.target.value})}
                    placeholder="पश्चिम दिशा"
                  />
                </div>
              </div>
            </div>

            {/* अतिरिक्त जानकारी */}
            <div>
              <div>
                <Label htmlFor="floating-remarks">10. रिमार्क्स</Label>
                <Textarea
                  id="floating-remarks"
                  rows={3}
                  value={floatingFormData.remarks}
                  onChange={(e) => setFloatingFormData({...floatingFormData, remarks: e.target.value})}
                  placeholder="अन्य टिप्पणियाँ दर्ज करें"
                />
              </div>
            </div>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={submitFloatingForm}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              सबमिट करें
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowFloatingForm(false);
                setFloatingFormData({ 
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
              }}
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              रद्द करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>📤</span>
              <span>प्रोजेक्ट शेयर करें</span>
            </DialogTitle>
          </DialogHeader>
          
          {shareData && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{shareData.project.name}</h3>
                <p className="text-sm text-gray-600">📱 पासवर्ड: {shareData.project.mobileNumber}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">शेयर लिंक:</label>
                <div className="flex space-x-2">
                  <Input
                    value={shareData.shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyShareLink}
                  >
                    📋
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  📱 WhatsApp पर भेजें
                </Button>
                <Button
                  variant="outline"
                  onClick={closeShareModal}
                >
                  बंद करें
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                <p>🔒 केवल मोबाइल नंबर वाला व्यक्ति देख सकता है</p>
                <p>📋 Records और 📊 Overview उपलब्ध होंगे</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
