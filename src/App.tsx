import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  ShoppingBag, 
  ChefHat, 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  RefreshCw, 
  UserPlus, 
  Check, 
  Clock, 
  X, 
  Search, 
  Filter, 
  TrendingUp, 
  LayoutDashboard,
  Calendar,
  Send,
  HelpCircle,
  HelpCircle as QuestionIcon,
  Upload,
  Lock,
  Pencil
} from 'lucide-react';
import FamilyHeader from './components/FamilyHeader';
import { PantryItem, Recipe, GroceryItem, FamilyProfile, SavingStats, AssistantMessage } from './types';

export default function App() {
  // Navigation Tabs: dashboard, inventory, recipes, grocery
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'recipes' | 'grocery'>('dashboard');
  
  // Backend inventories
  const [inventory, setInventory] = useState<PantryItem[]>([]);
  const [grocery, setGrocery] = useState<GroceryItem[]>([]);
  const [stats, setStats] = useState<SavingStats>({
    moneySaved: 142.50,
    moneyWasted: 15.80,
    itemsSavedCount: 38,
    itemsWastedCount: 3,
    wasteReductionRate: 90
  });

  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('pantrypal_savings_goal');
    return saved ? parseFloat(saved) : 200;
  });
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>(savingsGoal.toString());

  // Keep input in sync if savingsGoal changes from storage loading
  useEffect(() => {
    setGoalInput(savingsGoal.toString());
  }, [savingsGoal]);
  
  // Family configuration
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('f1');
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state for active inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fridge' | 'freezer' | 'pantry'>('all');
  const [foodGroupFilter, setFoodGroupFilter] = useState<string>('all');

  // AI Assistant Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([
    { id: '1', sender: 'assistant', text: "Bonjour! I am your PantryPal Chef Bot. What ingredient can we save from the trash bin today? Or ask me for smart kitchen hacks!", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Scanner Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanType, setScanType] = useState<'receipt' | 'item' | 'barcode'>('receipt');
  const [scanLoading, setScanLoading] = useState(false);
  const [scannedPreviewItems, setScannedPreviewItems] = useState<any[]>([]);

  // Real Camera & Image Upload state integration
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const miniChatContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Auto scroll inline assistant chat container to bottom
  useEffect(() => {
    if (miniChatContainerRef.current) {
      miniChatContainerRef.current.scrollTo({
        top: miniChatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, chatLoading]);

  // Manage camera stream lifecycle when scanner modal opens/closes
  useEffect(() => {
    if (!scannerOpen) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraActive(false);
      setCapturedPhoto(null);
      setCameraError(null);
    }
  }, [scannerOpen]);

  // Ensure webcam feed is updated when element attaches
  useEffect(() => {
    if (cameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.error("Webcam video play failed:", err));
    }
  }, [cameraActive, cameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access failed", err);
      let errorMsg = "Could not access camera. Please check permissions.";
      if (err.name === 'NotAllowedError') {
        errorMsg = "Camera permission denied. Please enable camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = "No camera found on this device.";
      }
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhoto(dataUrl);
          stopCamera();
        }
      } catch (err) {
        console.error("Failed to capture snapshot", err);
        setCameraError("Failed to capture image from webcam.");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhoto(reader.result);
          stopCamera();
          setCameraError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhoto(reader.result);
          stopCamera();
          setCameraError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [customAddedItem, setCustomAddedItem] = useState({
    name: '',
    category: 'fridge' as const,
    foodGroup: 'Produce',
    quantity: '1 unit',
    cost: 3.50,
    expiryDays: 7
  });

  // Manual Quick additive form state
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showManualAddError, setShowManualAddError] = useState('');

  // AI Recipe Generator settings
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeCustomNotes, setRecipeCustomNotes] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Grocery State Addon
  const [newGroceryName, setNewGroceryName] = useState('');
  const [newGroceryCat, setNewGroceryCat] = useState<'fridge' | 'freezer' | 'pantry'>('fridge');
  const [newGroceryQty, setNewGroceryQty] = useState('1 unit');
  const [newGroceryPrice, setNewGroceryPrice] = useState('2.99');

  // Reset flag
  const [isResetting, setIsResetting] = useState(false);

  // Auto-fetch data on load
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [invRes, groRes, statsRes, famRes, actRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/grocery'),
        fetch('/api/stats'),
        fetch('/api/family'),
        fetch('/api/family/active')
      ]);

      const invData = await invRes.json();
      const groData = await groRes.json();
      const statsData = await statsRes.json();
      const famData = await famRes.json();
      const actData = await actRes.json();

      setInventory(invData);
      setGrocery(groData);
      setStats(statsData);
      setProfiles(famData);
      setActiveProfileId(actData.activeId);
    } catch (err) {
      console.error("Failed to synchronize with server core:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync recipes as well to ensure fallback list is populated on start
  useEffect(() => {
    generateRecipes();
  }, []);

  // Profile Switching API
  const handleProfileSwitch = async (id: string) => {
    try {
      const res = await fetch('/api/family/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setActiveProfileId(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Family Member Profile API
  const handleAddMember = async (name: string, avatar: string, color: string) => {
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar, color })
      });
      if (res.ok) {
        const freshMember = await res.json();
        setProfiles(prev => [...prev, freshMember]);
        setActiveProfileId(freshMember.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Simulation Data API
  const handleReset = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('/api/inventory/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory);
        setStats(data.stats);
        setGrocery(data.grocery);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  // Mark food item as either consumed (saved) or wasted
  const handleItemStatusChange = async (itemId: string, status: 'consumed' | 'wasted') => {
    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Reload inventories & statistics to show dynamic compound savings instantly
        const updatedItem = await res.json();
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual fast item add
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddedItem.name.trim()) return;

    try {
      // Calculate realistic expiry days based on manual input date choice or use chosen
      const defaultDays = Number(customAddedItem.expiryDays) || 7;
      const targetExpiry = new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customAddedItem.name,
          category: customAddedItem.category,
          foodGroup: customAddedItem.foodGroup,
          quantity: customAddedItem.quantity,
          expiryDate: targetExpiry,
          cost: Number(customAddedItem.cost) || 2.50
        })
      });

      if (res.ok) {
        const added = await res.json();
        setInventory(prev => [...prev, added]);
        setShowManualAdd(false);
        setCustomAddedItem({
          name: '',
          category: 'fridge',
          foodGroup: 'Produce',
          quantity: '1 unit',
          cost: 3.50,
          expiryDays: 7
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Recipes compilation
  const generateRecipes = async () => {
    try {
      setRecipeLoading(true);
      const res = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customizePrompt: recipeCustomNotes })
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecipeLoading(false);
    }
  };

  // Triggering simulated or real item/receipt scanning
  const executeScan = async (base64Image?: string) => {
    try {
      setScanLoading(true);
      setScannedPreviewItems([]);
      
      const payload: any = {
        inputType: scanType,
        feedbackPrompt: ""
      };

      if (base64Image) {
        // Dynamically detect MIME type from the base64 data URL
        let detectedMimeType = "image/jpeg";
        const mimeMatch = base64Image.match(/^data:([^;]+);base64,/);
        if (mimeMatch && mimeMatch[1]) {
          detectedMimeType = mimeMatch[1];
        }

        // Strip out base64 header if present
        const cleanBase64 = base64Image.includes('base64,') 
          ? base64Image.split('base64,')[1] 
          : base64Image;
        
        payload.imageBase64 = cleanBase64;
        payload.mimeType = detectedMimeType;
      }
      
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setScannedPreviewItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScanLoading(false);
    }
  };

  // Approving & Saving scanned results into database
  const approveScannedItems = async () => {
    if (scannedPreviewItems.length === 0) return;
    try {
      const res = await fetch('/api/inventory/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: scannedPreviewItems })
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(prev => [...prev, ...data.items]);
        setScannerOpen(false);
        setScannedPreviewItems([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Grocery Shopping Additions
  const handleAddGrocery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryName.trim()) return;

    try {
      const res = await fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroceryName,
          category: newGroceryCat,
          quantity: newGroceryQty,
          estimatedPrice: Number(newGroceryPrice) || 2.49,
          autoAdded: false
        })
      });

      if (res.ok) {
        const added = await res.json();
        setGrocery(prev => [...prev, added]);
        setNewGroceryName('');
        setNewGroceryQty('1 unit');
        setNewGroceryPrice('2.99');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle checkout status of grocery list
  const toggleGroceryCompleted = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/grocery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setGrocery(prev => prev.map(item => item.id === id ? updated : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove completely from grocery
  const deleteGroceryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/grocery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGrocery(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Complete purchase & transfer items safely into kitchen inventory
  const moveGroceriesToPantry = async () => {
    const completedOnes = grocery.filter(g => g.completed);
    if (completedOnes.length === 0) return;

    try {
      const res = await fetch('/api/grocery/purchase', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInventory(prev => [...prev, ...data.added]);
        setGrocery(data.remainingGrocery);
        
        // Show celebratory alert on top header
        alert(`Successfully purchased ${data.added.length} items! They are now organized under Fridge & Pantry.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chef Chat Assistant response API
  const handleSendChatMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const userMessage = (customMsg || chatInput).trim();
    if (!userMessage || chatLoading) return;

    const newUserMsgObj: AssistantMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMsgObj]);
    if (!customMsg) {
      setChatInput('');
    }
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          userMessage: userMessage
        })
      });

      if (res.ok) {
        const data = await res.json();
        const robotMsgObj: AssistantMessage = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: data.responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, robotMsgObj]);
      }
    } catch (err) {
      console.error("Chef assistant crashed:", err);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick suggestion queries from customer in chat box
  const triggerQuickQuestion = (phrase: string) => {
    handleSendChatMessage(undefined, phrase);
  };

  // Helper to render message text elegantly with headers and paragraph spacing
  const renderFormattedText = (text: string, isLightBg: boolean = false) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }
      
      // Look for a Markdown style bold header
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const title = trimmed.replace(/\*\*/g, '');
        return (
          <div 
            key={idx} 
            className={`font-extrabold text-[13px] tracking-tight mb-1 mt-0.5 ${
              isLightBg ? 'text-slate-950 font-black' : 'text-white'
            }`}
          >
            {title}
          </div>
        );
      }
      
      // Inline formatting helper for **bold words**
      const parts = line.split('**');
      return (
        <p 
          key={idx} 
          className={`text-[11px] leading-relaxed font-medium ${
            isLightBg ? 'text-slate-700' : 'text-indigo-50'
          }`}
        >
          {parts.map((part, pIdx) => pIdx % 2 === 1 ? (
            <strong key={pIdx} className={`font-extrabold ${isLightBg ? 'text-indigo-600' : 'text-amber-300'}`}>
              {part}
            </strong>
          ) : part)}
        </p>
      );
    });
  };

  // Filter logic details
  const activeWorkingInventory = inventory.filter(item => {
    if (item.status !== 'active') return false;
    
    // Category check
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    
    // Food Group check
    if (foodGroupFilter !== 'all' && item.foodGroup !== foodGroupFilter) return false;

    // Search query match
    if (inventorySearch.trim()) {
      return item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
             (item.foodGroup && item.foodGroup.toLowerCase().includes(inventorySearch.toLowerCase()));
    }

    return true;
  });

  // Calculate critical highlights
  const activeProfile = profiles.find(p => p.id === activeProfileId) || { name: "Sarah", avatar: "👩‍🍳", color: "from-pink-500 to-rose-500" };
  const expiringSoonCount = inventory.filter(item => {
    if (item.status !== 'active') return false;
    const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3;
  }).length;

  const currentKitchenOptimizationRate = 100 - Math.min(100, Math.round((expiringSoonCount / (inventory.filter(i=>i.status==='active').length || 1)) * 100));

  // Category statistics distribution helper
  const categoryCounts = {
    fridge: inventory.filter(it => it.status === 'active' && it.category === 'fridge').length,
    freezer: inventory.filter(it => it.status === 'active' && it.category === 'freezer').length,
    pantry: inventory.filter(it => it.status === 'active' && it.category === 'pantry').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navigation Left Sidebar Panel */}
      <nav className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col py-6 px-4 shrink-0">
        
        {/* Navigation Logo Block */}
        <div className="flex items-center gap-3 px-4 pb-8 border-b border-slate-100">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-emerald-600/20">
            P
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">PantryPal</h1>
            <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase">AI Household Kitchen</span>
          </div>
        </div>

        {/* Dynamic Sidebar Nav Links */}
        <div className="flex-1 space-y-1.5 mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-current" />
              <span>Dashboard Overview</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
              activeTab === 'inventory' 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-current" />
              <span>Kitchen Inventory</span>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
              {inventory.filter(i => i.status === 'active').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
              activeTab === 'recipes' 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-current" />
              <span>Zero-Waste Chef AI</span>
            </div>
            {recipes.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                {recipes.length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('grocery')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
              activeTab === 'grocery' 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-current" />
              <span>Smart Grocery List</span>
            </div>
            {grocery.filter(g => !g.completed).length > 0 && (
              <span className="text-xs bg-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                {grocery.filter(g => !g.completed).length}
              </span>
            )}
          </button>
        </div>

        {/* Household context info & helpful tips in sidebar bottom */}
        <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Edit Pen in top right corner */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
              {isEditingGoal ? (
                <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
                  <button 
                    onClick={() => {
                      const num = parseFloat(goalInput);
                      if (!isNaN(num) && num > 0) {
                        setSavingsGoal(num);
                        localStorage.setItem('pantrypal_savings_goal', num.toString());
                        setIsEditingGoal(false);
                      }
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    title="Save target"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      setGoalInput(savingsGoal.toString());
                      setIsEditingGoal(false);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="p-1.5 bg-slate-800/60 hover:bg-slate-800/90 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Edit savings goal"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Monthly Savings Goal</p>
              <p className="text-2xl font-extrabold text-white mt-1">${stats.moneySaved.toFixed(2)}</p>
              
              <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (stats.moneySaved / savingsGoal) * 100)}%` }}
                />
              </div>

              {isEditingGoal ? (
                <div className="mt-2.5 flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Goal $:</span>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    className="bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white w-24 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const num = parseFloat(goalInput);
                        if (!isNaN(num) && num > 0) {
                          setSavingsGoal(num);
                          localStorage.setItem('pantrypal_savings_goal', num.toString());
                          setIsEditingGoal(false);
                        }
                      } else if (e.key === 'Escape') {
                        setGoalInput(savingsGoal.toString());
                        setIsEditingGoal(false);
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Target: ${savingsGoal.toFixed(2)} saved ({Math.round((stats.moneySaved / savingsGoal) * 100)}%)
                </p>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setChatOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Ask Pantry Bot Assistant
            </button>
          </div>
        </div>

      </nav>

      {/* Main Core Content Stage */}
      <main className="flex-1 flex flex-col min-w-0 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-screen">
        
        {/* Top Header Row with Active User, custom triggers */}
        <div id="pantrypal-top-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              Welcome back, {activeProfile.name.split(' ')[0]} {activeProfile.avatar}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Your family kitchen is <span className="text-emerald-600 font-bold">{currentKitchenOptimizationRate}% optimized</span> today. Saving food is saving capital!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="header-manual-add-btn"
              onClick={() => {
                setShowManualAdd(true);
                setShowManualAddError('');
              }}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              Add Single Item
            </button>

            <button
              id="header-camera-scan-btn"
              onClick={() => {
                setScannerOpen(true);
                setScannedPreviewItems([]);
                setScanLoading(false);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Scan Food / Receipt
            </button>
          </div>
        </div>

        {/* Global Household Statistic Header */}
        <FamilyHeader 
          stats={stats}
          profiles={profiles}
          activeId={activeProfileId}
          onProfileSelect={handleProfileSwitch}
          onAddNewMember={handleAddMember}
          onResetData={handleReset}
          isResetting={isResetting}
        />

        {/* TAB 1: DASHBOARD VIEW */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Top Quick Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Items in active stock */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Active Inventory</span>
                    <span className="text-3xl font-black text-slate-900 block mt-1">
                      {inventory.filter(i => i.status === 'active').length}
                    </span>
                    <span className="text-xs text-slate-500 mt-2 block">
                      {categoryCounts.fridge} in fridge • {categoryCounts.pantry} in pantry
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                {/* Critical expiration warning */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Expiring on Priority</span>
                    <span className={`text-3xl font-black block mt-1 ${expiringSoonCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {expiringSoonCount} {expiringSoonCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs text-slate-500 mt-2 block">
                      Must consume within 72 hours
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expiringSoonCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>

                {/* Auto suggested Meal Planner info */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">AI-Crafted Leftovers</span>
                    <span className="text-3xl font-black text-slate-900 block mt-1">
                      {recipes.length} Chef Plans
                    </span>
                    <span className="text-xs text-slate-500 mt-2 block">
                      Estimated savings: <span className="text-emerald-700 font-bold">${recipes.reduce((sum, r) => sum + r.savingAmount, 0).toFixed(0)} saved</span>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ChefHat className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Expiring Soon Action Panel & suggested layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Expiring items checklist (2/3 size) */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">⚠️ Priority Expiration Board</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Use or log these items right now to preserve budget and avoid trash bins.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setCategoryFilter('all');
                        setActiveTab('inventory');
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      Browse All Stock (→)
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 p-2">
                    {inventory.filter(it => {
                      if (it.status !== 'active') return false;
                      const daysLeft = Math.ceil((new Date(it.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return daysLeft <= 4;
                    }).length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <span className="text-4xl block mb-2">🎉</span>
                        <p className="text-sm font-semibold text-slate-600">Pure Culinary Harmony!</p>
                        <p className="text-xs text-slate-400">None of your current ingredients are expiring soon.</p>
                      </div>
                    ) : (
                      inventory
                        .filter(it => it.status === 'active')
                        .map(it => {
                          const daysLeft = Math.ceil((new Date(it.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return { ...it, daysLeft };
                        })
                        .sort((a,b) => a.daysLeft - b.daysLeft)
                        .slice(0, 5)
                        .map(it => {
                          const isExpired = it.daysLeft <= 0;
                          const isUrgent = it.daysLeft === 1 || it.daysLeft === 2;
                          
                          let badgeBg = 'bg-slate-100 text-slate-700';
                          if (isExpired) badgeBg = 'bg-rose-50 text-rose-700 border border-rose-100';
                          else if (isUrgent) badgeBg = 'bg-amber-50 text-amber-700 border border-amber-100';
                          else if (it.daysLeft === 3) badgeBg = 'bg-amber-50/50 text-amber-700';

                          return (
                            <div key={it.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50/70 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-100 text-xl rounded-xl">
                                  {it.category === 'fridge' ? '🥬' : it.category === 'freezer' ? '🥩' : '🥯'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">{it.name}</h4>
                                  <p className="text-xs text-slate-500 italic mt-0.5">
                                    {it.category.toUpperCase()} • Qty: {it.quantity} • Value: ${it.cost.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeBg} whitespace-nowrap`}>
                                  {isExpired 
                                    ? 'Expired today!' 
                                    : it.daysLeft === 1 
                                      ? 'Expires tomorrow' 
                                      : `Expires in ${it.daysLeft} days`}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleItemStatusChange(it.id, 'consumed')}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors"
                                    title="Mark as eaten / preserved"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleItemStatusChange(it.id, 'wasted')}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl transition-colors"
                                    title="Discard as wasted food"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>💡 Logging items is instant and recalculates your family savings values</span>
                    <span className="font-bold text-emerald-600">Saved: ${stats.moneySaved.toFixed(0)}</span>
                  </div>

                </div>

                {/* Right Column: Suggested Meal of Day & Quick Assist banner */}
                <div className="space-y-6">
                  
                  {/* High-end Mini AI Assistant Card */}
                  <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Interactive Support Chat
                        </span>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                        Chef Answer Engine
                      </h3>

                      {/* 1. RECOMMENDATIONS MOVED TO THE TOP */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">💡 Popular Kitchen Queries:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => triggerQuickQuestion("What can I substitute for buttermilk in baking?")}
                            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-bold text-white transition-all text-left truncate max-w-full cursor-pointer"
                          >
                            🥛 Buttermilk Substitutes
                          </button>
                          <button
                            onClick={() => triggerQuickQuestion("How do I store cut avocados to keep them green?")}
                            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-bold text-white transition-all text-left truncate max-w-full cursor-pointer"
                          >
                            🥑 Stop Avocado Browning
                          </button>
                          <button
                            onClick={() => triggerQuickQuestion("How to keep spinach fresh longer?")}
                            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-bold text-white transition-all text-left truncate max-w-full cursor-pointer"
                          >
                            🥬 Keep Spinach Fresh
                          </button>
                        </div>
                      </div>

                      {/* 2. CHAT SCROLL CONTAINER WITH LIVE QUESTIONS VISIBLE */}
                      <div className="bg-black/20 rounded-2xl p-3.5 border border-white/15">
                        <div 
                          ref={miniChatContainerRef}
                          className="h-[210px] overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col"
                        >
                          {chatMessages.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[9px] text-indigo-200/80 mb-0.5 font-bold px-1">
                                {msg.sender === 'user' ? 'You' : 'Chef Bot'} • {msg.timestamp}
                              </span>
                              <div 
                                className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-sm ${
                                  msg.sender === 'user' 
                                    ? 'bg-emerald-500 text-white rounded-tr-none font-medium' 
                                    : 'bg-white/10 text-indigo-50 border border-white/5 rounded-tl-none font-medium'
                                  }`}
                              >
                                {msg.sender === 'user' ? (
                                  <p className="whitespace-pre-line text-[11px] font-medium text-white">{msg.text}</p>
                                ) : (
                                  renderFormattedText(msg.text)
                                )}
                              </div>
                            </div>
                          ))}

                          {/* 3. FLOATING THREE DOTS THINKING INDICATOR */}
                          {chatLoading && (
                            <div className="flex flex-col items-start">
                              <span className="text-[9px] text-indigo-200/80 mb-0.5 font-bold px-1">Chef Bot is typing...</span>
                              <div className="px-4 py-2.5 bg-white/10 border border-white/5 rounded-2xl rounded-tl-none shadow-sm flex items-center justify-center">
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. CHAT INPUT AT THE BOTTOM */}
                      <form onSubmit={(e) => handleSendChatMessage(e)} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type kitchen question..."
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          className="bg-white/10 border border-white/10 rounded-xl text-xs flex-1 px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <button 
                          type="submit"
                          disabled={chatLoading}
                          className="p-3 bg-white hover:bg-slate-50 rounded-xl text-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>

                    </div>
                  </div>

                  {/* Single Suggested Recipe Highlight Card */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3 text-sm tracking-wider uppercase">Active Menu Draft</h4>
                    
                    {recipes.slice(0, 1).map(rec => (
                      <div key={rec.id || "rec-one"} className="space-y-4">
                        <div className="w-full h-32 bg-slate-100 rounded-2xl overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400')] bg-cover" />
                          <div className="absolute bottom-3 left-3 z-20 text-white">
                            <span className="px-2 py-0.5 bg-emerald-500 text-[10px] font-bold rounded-lg uppercase">
                              Chef Pick
                            </span>
                            <h5 className="font-bold text-sm mt-1">{rec.title}</h5>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                          <span>⏱️ {rec.prepTime} • {rec.cookTime}</span>
                          <span className="text-emerald-700 font-bold">Saves ${rec.savingAmount.toFixed(2)}</span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">
                          {rec.description}
                        </p>

                        <button
                          onClick={() => {
                            setSelectedRecipe(rec);
                            setActiveTab('recipes');
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                        >
                          Show Full Recipe & Checklist
                        </button>
                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: KITCHEN INVENTORY FILTERED LIST */}
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              {/* Filter controls, search items */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                
                {/* Search */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search active food items (e.g. Sourdough, blueb, steak)..."
                      value={inventorySearch}
                      onChange={e => setInventorySearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {inventorySearch && (
                      <button 
                        onClick={() => setInventorySearch('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Filter category tabs fridge freezer pantry */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0 w-full sm:w-auto">
                    {(['all', 'fridge', 'freezer', 'pantry'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                          categoryFilter === cat 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub filter by food Group (Produce, Dairy, Grains, Meat, etc) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest mr-2">Food Group:</span>
                  {(['all', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Grains', 'Canned', 'Frozen'] as const).map(grp => (
                    <button
                      key={grp}
                      onClick={() => setFoodGroupFilter(grp)}
                      className={`px-3 py-1 rounded-lg font-medium border transition-colors ${
                        foodGroupFilter === grp
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>

              </div>

              {/* Main inventory grids */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Virtual Kitchen Storage</h3>
                    <p className="text-xs text-slate-500">Showing {activeWorkingInventory.length} of {inventory.filter(i=>i.status==='active').length} active items.</p>
                  </div>
                  
                  <span className="text-xs font-bold text-slate-500">
                    Category: {categoryFilter.toUpperCase()}
                  </span>
                </div>

                {activeWorkingInventory.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <span className="text-5xl block mb-3">🧺</span>
                    <h4 className="text-base font-bold text-slate-700">Storage Empty or Filtered</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      No matching ingredients found. Add fresh ingredients manually or upload your latest grocery receipt!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20">
                          <th className="py-4 px-6">Name & Category</th>
                          <th className="py-4 px-6">Food Group</th>
                          <th className="py-4 px-6">Quantity</th>
                          <th className="py-4 px-6">Status Info</th>
                          <th className="py-4 px-6">Cost Value</th>
                          <th className="py-4 px-6 text-right">Kitchen Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {activeWorkingInventory.map(item => {
                          const expiryDateObj = new Date(item.expiryDate);
                          const daysLeft = Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          const isExpired = daysLeft <= 0;
                          
                          let statusText = `${daysLeft} days remaining`;
                          let statusColor = 'text-emerald-700 bg-emerald-50';
                          
                          if (isExpired) {
                            statusText = 'Expired! ⚠️';
                            statusColor = 'text-rose-700 bg-rose-50 font-bold';
                          } else if (daysLeft <= 2) {
                            statusText = 'Use urgently! ⏰';
                            statusColor = 'text-amber-700 bg-amber-50 font-bold';
                          }

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">
                                    {item.category === 'fridge' ? '🥬' : item.category === 'freezer' ? '❄️' : '🥯'}
                                  </span>
                                  <div>
                                    <p className="font-bold text-slate-900">{item.name}</p>
                                    <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">{item.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="px-2.5 py-0.5 bg-slate-100 text-[11px] font-semibold rounded-lg text-slate-600">
                                  {item.foodGroup || 'Other'}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-medium text-slate-700">
                                {item.quantity}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg w-max ${statusColor}`}>
                                    {statusText}
                                  </span>
                                  <span className="text-[10px] text-slate-400 mt-1">
                                    Exp: {expiryDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-bold text-slate-950">
                                ${item.cost.toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleItemStatusChange(item.id, 'consumed')}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-xl transition-all"
                                    title="We ate this ingredient!"
                                  >
                                    Consumed
                                  </button>
                                  <button
                                    onClick={() => handleItemStatusChange(item.id, 'wasted')}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all"
                                    title="Dumped into trash"
                                  >
                                    Wasted
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

            </motion.div>
          )}

          {/* TAB 3: ZERO-WASTE CHEF AI SUGGESTED RECIPE ASSISTANCE */}
          {activeTab === 'recipes' && (
            <motion.div
              key="chef-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              {/* Options to customise the query */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">AI Gourmet Chef Planner</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Compiles what you currently have inside your stock and prioritizing items expiring in 1-4 days first.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-50">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Chef Custom Directives (Diet, prep style, appliances)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Vegetarian preference, under 15 minutes, high protein, use skillet..."
                      value={recipeCustomNotes}
                      onChange={e => setRecipeCustomNotes(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-950"
                    />
                    <button
                      onClick={generateRecipes}
                      disabled={recipeLoading}
                      className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl transition-all shadow-md disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      {recipeLoading ? 'Formulating Recipes...' : '✨ Spawn New AI Recipes'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Uses actual live metadata compiled from the inventory list to prevent any fake food references.
                  </p>
                </div>
              </div>

              {/* Recipe Layout & Selected View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left side list of recipes */}
                <div className="lg:col-span-1 space-y-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Recommended Dishes</h4>
                  
                  {recipeLoading ? (
                    <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">Chef Bot is looking through cupboard indices...</p>
                    </div>
                  ) : recipes.length === 0 ? (
                    <div className="py-12 text-center bg-white border border-slate-100 rounded-3xl">
                      <p className="text-sm text-slate-500">No suggestions spawned. Generate above!</p>
                    </div>
                  ) : (
                    recipes.map((rec, index) => {
                      const isChosen = selectedRecipe ? selectedRecipe.title === rec.title : index === 0;
                      // Set default if none selected yet
                      if (index === 0 && !selectedRecipe) {
                        setSelectedRecipe(rec);
                      }

                      return (
                        <button
                          key={rec.id || `dish-${index}`}
                          onClick={() => setSelectedRecipe(rec)}
                          className={`w-full text-left p-5 bg-white border rounded-3xl transition-all cursor-pointer ${
                            isChosen 
                              ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md' 
                              : 'border-slate-100 hover:border-slate-200 shadow-sm'
                          }`}
                        >
                          <span className="px-2.5 py-0.5 bg-slate-100 text-[10px] font-bold rounded-lg text-slate-600 uppercase tracking-wider block w-max">
                            ⚡ {rec.difficulty}
                          </span>
                          <h4 className="font-black text-slate-900 mt-2 text-base leading-tight">{rec.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{rec.description}</p>
                          
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-50">
                            <span>⏱️ {rec.prepTime} cook</span>
                            <span className="text-emerald-700 font-bold">Rescued savings: ${rec.savingAmount.toFixed(1)}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Right detailed checklist recipes card (2/3 size) */}
                <div className="lg:col-span-2">
                  {selectedRecipe ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="h-44 bg-slate-100 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=720')] bg-cover bg-center" />
                        
                        <div className="absolute bottom-5 left-6 right-6 z-20 text-white">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-amber-500 text-[10px] font-bold rounded-lg uppercase">
                              Zero Waste
                            </span>
                            <span className="text-xs text-slate-200">⏱️ {selectedRecipe.prepTime} Prep • {selectedRecipe.cookTime} Cook</span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-black mt-1.5">{selectedRecipe.title}</h3>
                        </div>
                      </div>

                      {/* Info bar */}
                      <div className="p-6 border-b border-slate-100 grid grid-cols-3 gap-4 text-center bg-slate-50/50">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Calories Approx</span>
                          <p className="text-lg font-extrabold text-slate-950 mt-0.5">{selectedRecipe.calories || 350} kcal</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Difficulty</span>
                          <p className="text-lg font-extrabold text-slate-950 mt-0.5">{selectedRecipe.difficulty}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Capital Saved</span>
                          <p className="text-lg font-extrabold text-emerald-700 mt-0.5">${selectedRecipe.savingAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        
                        {/* Ingredients checklist */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Kitchen Ingredients Checklist</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedRecipe.ingredients?.map((ing, i) => (
                              <div 
                                key={i} 
                                className={`p-3 rounded-2xl flex items-center justify-between border ${
                                  ing.inPantry 
                                    ? 'bg-emerald-50/50 border-emerald-100 text-slate-800' 
                                    : 'bg-rose-50/30 border-rose-100 text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-lg">{ing.inPantry ? '✅' : '🛒'}</span>
                                  <div>
                                    <p className="text-xs font-bold">{ing.name}</p>
                                    <p className="text-[10px] text-slate-400">{ing.amount}</p>
                                  </div>
                                </div>

                                {ing.inPantry ? (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                                    In Kitchen
                                  </span>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch('/api/grocery', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            name: ing.name,
                                            category: 'fridge',
                                            quantity: ing.amount,
                                            estimatedPrice: 2.99
                                          })
                                        });
                                        if (res.ok) {
                                          const added = await res.json();
                                          setGrocery(prev => [...prev, added]);
                                          alert(`Added '${ing.name}' directly to your Smart Grocery List!`);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="text-[10px] font-extrabold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-md uppercase cursor-pointer"
                                  >
                                    + List
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Directions */}
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Chef Instructions</h4>
                          <div className="space-y-4">
                            {selectedRecipe.instructions?.map((inst, idx) => (
                              <div key={idx} className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-950 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed">{inst}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Culinary Saving tips */}
                        {selectedRecipe.tips && selectedRecipe.tips.length > 0 && (
                          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2">
                            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                              <span>🌱</span> Leftover Optimization Hacks
                            </h5>
                            <ul className="space-y-1 text-slate-700 text-xs">
                              {selectedRecipe.tips.map((tip, tIdx) => (
                                <li key={tIdx}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                      Select a recipe suggestion on the left view window to read directions.
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: SMART GROCERY LISTS */}
          {activeTab === 'grocery' && (
            <motion.div
              key="grocery-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              {/* Grocery interactive layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Addition Form Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-max space-y-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                      ✍️
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">Compile List Item</h3>
                  </div>

                  <form onSubmit={handleAddGrocery} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Item Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Grape Tomatoes, Fresh Garlic"
                        value={newGroceryName}
                        onChange={e => setNewGroceryName(e.target.value)}
                        className="w-full mt-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Category</label>
                        <select
                          value={newGroceryCat}
                          onChange={e => setNewGroceryCat(e.target.value as any)}
                          className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2"
                        >
                          <option value="fridge">Fridge (Fresh)</option>
                          <option value="freezer">Freezer</option>
                          <option value="pantry">Pantry (Dry)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Qty / Amount</label>
                        <input
                          type="text"
                          value={newGroceryQty}
                          onChange={e => setNewGroceryQty(e.target.value)}
                          className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Estimated price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newGroceryPrice}
                        onChange={e => setNewGroceryPrice(e.target.value)}
                        className="w-full mt-1 px-4 py-2 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-990 hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider rounded-xl uppercase transition-colors shrink-0 cursor-pointer"
                    >
                      Add to Shopping List
                    </button>
                  </form>

                  <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-[11px] text-indigo-950">
                    <p className="font-bold flex items-center gap-1">
                      <span>🤖</span> PantryBot Grocery Hack
                    </p>
                    <p className="mt-1 leading-relaxed text-slate-600">
                      We automatically label ingredients missing from recipes as recommended. Purchase and check them off to put them in the pantry!
                    </p>
                  </div>
                </div>

                {/* Checklist Column (2/3 size) */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Current Shopping Cart</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Check completed items when purchased, then transfer to Kitchen Inventory easily.</p>
                    </div>

                    <button
                      onClick={moveGroceriesToPantry}
                      disabled={grocery.filter(g => g.completed).length === 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-45 cursor-pointer shadow-sm"
                    >
                      🛒 Transfer Checked Items to Storage
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 p-2">
                    {grocery.length === 0 ? (
                      <div className="py-20 text-center text-slate-400">
                        <span className="text-5xl block mb-2">🛒</span>
                        <p className="text-sm font-semibold text-slate-600">Shopping List is Clear!</p>
                        <p className="text-xs text-slate-400">You have zero outstanding items to buy.</p>
                      </div>
                    ) : (
                      grocery.map(item => (
                        <div 
                          key={item.id} 
                          className={`p-4 flex items-center justify-between gap-4 rounded-2xl transition-all ${
                            item.completed ? 'bg-slate-50/70 border-l-4 border-slate-300' : 'hover:bg-slate-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleGroceryCompleted(item.id, item.completed)}
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                item.completed 
                                  ? 'bg-slate-900 border-slate-900 text-white' 
                                  : 'border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                            >
                              {item.completed && <Check className="w-3.5 h-3.5" />}
                            </button>
                            
                            <div>
                              <span className={`font-semibold text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {item.name}
                              </span>
                              
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-medium">
                                <span className="uppercase">{item.category}</span>
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                                {item.autoAdded && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-600 bg-indigo-50 px-1 rounded">Suggested by AI Chef</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-950">
                              ${item.estimatedPrice.toFixed(2)}
                            </span>
                            
                            <button
                              onClick={() => deleteGroceryItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete grocery item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pricing recap */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Pending items count: <span className="font-bold">{grocery.filter(g => !g.completed).length}</span>
                    </span>
                    <span>
                      Estimated checkout total:{' '}
                      <span className="font-bold text-slate-950">
                        ${grocery.reduce((sum, g) => sum + g.estimatedPrice, 0).toFixed(2)}
                      </span>
                    </span>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FLOAT PANTRYBOT CHEF ASSISTANT CHAT PANELS */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col w-96 h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Assistant conversation header */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👩‍🍳</span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">PantryPal Chef Instructor</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
                    ● Always contextualized
                  </span>
                </div>
              </div>

              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Conversation Messages space */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-5/40 text-xs">
              {chatMessages.map(msg => {
                const isAI = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl ${
                        isAI 
                          ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
                          : 'bg-emerald-600 text-white rounded-tr-none'
                      }`}
                    >
                      {isAI ? (
                        renderFormattedText(msg.text, true)
                      ) : (
                        <p className="leading-relaxed whitespace-pre-line text-[11px] font-medium text-white">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 self-end">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex items-center gap-2 mr-auto max-w-[80%] bg-slate-100 text-slate-600 p-3 rounded-2xl rounded-tl-none">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  <span className="text-[10px] font-medium text-slate-500">Formulating kitchen advice...</span>
                </div>
              )}
            </div>

            {/* Quick helper inputs inside chat box */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto select-none">
              <button 
                onClick={() => triggerQuickQuestion("How do I make croutons from dry stale bread?")}
                className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                🥖 Stale Bread Hack
              </button>
              <button 
                onClick={() => triggerQuickQuestion("Can you give me a replacement for greek yogurt?")}
                className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                🥛 Yogurt Substitute
              </button>
              <button 
                onClick={() => triggerQuickQuestion("How to keep fresh avocados from turning brown?")}
                className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                🥑 Slow Avocado Browning
              </button>
            </div>

            {/* Form messaging input block */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-150 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Ask recipe substitutes or advice..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={chatInput.trim().length === 0}
                className="p-2 bg-slate-950 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: HIGH-END MULTI-MODE AI FOOD SCANNER */}
      <AnimatePresence>
        {scannerOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">PantryPal Intuitive Multi-Scan</h3>
                    <p className="text-[11px] text-slate-500">Scan receipts, barcodes, or take single picture snapshots automatically.</p>
                  </div>
                </div>

                {capturedPhoto || scannedPreviewItems.length > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-xl border border-amber-100 animate-pulse select-none">
                    <Lock className="w-3.5 h-3.5" /> Scan Locked
                  </div>
                ) : (
                  <button
                    onClick={() => setScannerOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-6 flex-1">
                
                {/* Scan Type selectors Tab */}
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      onClick={() => {
                        if (capturedPhoto || scannedPreviewItems.length > 0) return;
                        setScanType('receipt');
                        setScannedPreviewItems([]);
                      }}
                      disabled={!!capturedPhoto || scannedPreviewItems.length > 0}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        scanType === 'receipt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      } ${(capturedPhoto || scannedPreviewItems.length > 0) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      🧾 Scan Receipt
                    </button>
                    <button
                      onClick={() => {
                        if (capturedPhoto || scannedPreviewItems.length > 0) return;
                        setScanType('item');
                        setScannedPreviewItems([]);
                      }}
                      disabled={!!capturedPhoto || scannedPreviewItems.length > 0}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        scanType === 'item' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      } ${(capturedPhoto || scannedPreviewItems.length > 0) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      🥬 Take Food Photo
                    </button>
                    <button
                      onClick={() => {
                        if (capturedPhoto || scannedPreviewItems.length > 0) return;
                        setScanType('barcode');
                        setScannedPreviewItems([]);
                      }}
                      disabled={!!capturedPhoto || scannedPreviewItems.length > 0}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        scanType === 'barcode' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      } ${(capturedPhoto || scannedPreviewItems.length > 0) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      🏷️ Scan Barcode
                    </button>
                  </div>

                  {(capturedPhoto || scannedPreviewItems.length > 0) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-800 font-bold shadow-sm animate-pulse">
                      <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold uppercase tracking-wide">Scanner mode locked during session</p>
                        <p className="text-[10px] text-amber-600 font-medium mt-0.5">Please discard current captured image or confirm/approve changes before navigating away or switching scan modes.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Device Canvas Camera Area */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-3xl p-6 text-center min-h-[260px] flex flex-col justify-center items-center transition-all ${
                    dragActive ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {/* Camera Flash Screen Animation Overlay */}
                  <AnimatePresence>
                    {showFlash && (
                      <motion.div 
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-white z-40 rounded-3xl"
                      />
                    )}
                  </AnimatePresence>

                  {scanLoading ? (
                    <div className="space-y-4 py-8">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Uploading to Gemini-3.5-Flash Core...</p>
                        <p className="text-[10px] text-slate-400 mt-1">Reading store invoice lines and detecting expiry thresholds</p>
                      </div>
                    </div>
                  ) : scannedPreviewItems.length > 0 ? (
                    <div className="space-y-2 text-center py-6">
                      <span className="text-3xl text-emerald-600">✨</span>
                      <p className="text-xs font-bold text-slate-900">AI Food Search Completed Perfectly!</p>
                      <p className="text-[10px] text-slate-400">See extracted items below. Approve to log.</p>
                      <button 
                        onClick={() => { setScannedPreviewItems([]); setCapturedPhoto(null); }}
                        className="text-[11px] font-bold text-slate-500 hover:underline"
                      >
                        Reset Camera Snap
                      </button>
                    </div>
                  ) : capturedPhoto ? (
                    /* Captured Photo Preview & Action state */
                    <div className="w-full flex flex-col items-center space-y-4">
                      <div className="relative max-w-sm w-full aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-900">
                        <img 
                          src={capturedPhoto} 
                          alt="Captured Food Snapshot" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
                          <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Ready for AI extraction • {scanType === 'receipt' ? '🧾 Receipt' : scanType === 'item' ? '🥬 Food item' : '🏷️ Barcode'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => executeScan(capturedPhoto)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Analyze Image with AI
                        </button>
                        <button
                          onClick={() => { setCapturedPhoto(null); startCamera(); }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
                        </button>
                      </div>
                    </div>
                  ) : cameraActive ? (
                    /* Active Webcam Live Feed */
                    <div className="w-full flex flex-col items-center space-y-4">
                      {cameraError && (
                        <div className="w-full max-w-sm p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{cameraError}</span>
                        </div>
                      )}

                      <div className="relative max-w-sm w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 flex items-center justify-center">
                        <video 
                          ref={videoRef}
                          autoPlay 
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Live Feed indicator absolute overlay */}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm text-[10px] font-black text-white flex items-center gap-1.5 tracking-widest uppercase">
                          <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                          <span>LIVE FEED</span>
                        </div>

                        {/* Scan Area Overlay Guides */}
                        <div className="absolute inset-0 border-[2px] border-emerald-500/30 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                          {scanType === 'receipt' && (
                            <div className="w-2/3 h-5/6 border border-dashed border-emerald-400/80 rounded flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white/40 tracking-wider">ALIGN RECEIPT</span>
                            </div>
                          )}
                          {scanType === 'barcode' && (
                            <div className="w-4/5 h-1/4 border-2 border-emerald-400/80 rounded relative flex items-center justify-center animate-pulse">
                              <div className="absolute w-full h-[2px] bg-rose-500" />
                              <span className="text-[10px] font-bold text-white/50 tracking-wider">ALIGN BARCODE</span>
                            </div>
                          )}
                          {scanType === 'item' && (
                            <div className="w-1/2 aspect-square border border-dashed border-emerald-400/80 rounded-full flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white/40 tracking-wider">CENTER FOOD</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={takeSnapshot}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" /> Capture Photo
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2.5 bg-slate-250 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
                        >
                          Turn Off Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Camera Inactive (Launcher / Dropzone dashboard) */
                    <div className="w-full space-y-5 z-10 py-4 flex flex-col items-center">
                      {cameraError && (
                        <div className="w-full max-w-sm p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-medium flex items-center gap-2 text-left mb-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{cameraError}</span>
                        </div>
                      )}

                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                          <Camera className="w-7 h-7 text-emerald-600" />
                        </div>
                        
                        <div>
                          <p className="text-xs font-bold text-slate-900">Scan Receipts or Food with Laptop Camera</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Launches full screen live camera preview to detect food automatically</p>
                        </div>

                        <button
                          onClick={startCamera}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Turn On Laptop Camera
                        </button>
                      </div>

                      {/* Or upload divider line */}
                      <div className="w-full max-w-xs flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <div className="h-[1px] bg-slate-200 flex-1" />
                        <span>or upload file</span>
                        <div className="h-[1px] bg-slate-200 flex-1" />
                      </div>

                      {/* Dropzone File Input */}
                      <label className="group flex flex-col items-center justify-center w-full max-w-xs p-4 bg-white hover:bg-slate-100/60 border border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl cursor-pointer transition-all">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 mb-1.5 transition-colors" />
                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Select or Drag Photo Here</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Supports PNG, JPEG up to 10MB</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="hidden" 
                        />
                      </label>
                      
                      {/* Original convenient simulated triggers tucked away nicely */}
                      <div className="pt-4 border-t border-slate-150 w-full">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-2.5">Or Simulate Instant Demo Scans:</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {scanType === 'receipt' && (
                            <>
                              <button
                                onClick={() => executeScan()}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all"
                              >
                                Scan Costco Retail Receipt
                              </button>
                              <button
                                onClick={() => executeScan()}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all"
                              >
                                Scan Trader Joe's Checkout
                              </button>
                            </>
                          )}

                          {scanType === 'item' && (
                            <button
                              onClick={() => executeScan()}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all"
                            >
                              Snapshot of Rotisserie Chicken
                            </button>
                          )}

                          {scanType === 'barcode' && (
                            <button
                              onClick={() => executeScan()}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all"
                            >
                              Simulate UPC Barcode scan (Olive Oil)
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Scanned Items extracted pre-approval list */}
                {scannedPreviewItems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Extracted Items Pre-approval ({scannedPreviewItems.length})
                    </h4>
                    <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto border border-slate-150 rounded-2xl p-2 bg-slate-50/50">
                      {scannedPreviewItems.map((pit, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span>📦</span>
                            <div>
                              <p className="font-bold text-slate-900">{pit.name}</p>
                              <p className="text-[10px] text-slate-400 italic">
                                Suggested category: {pit.category} • food group: {pit.foodGroup}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-900 font-bold">Qty: {pit.quantity || '1 unit'}</p>
                            <p className="text-[10px] text-emerald-800">Exp days: {pit.expiryDays || 7} days • price: ${pit.estimatedCost?.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Action feet footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-3xl">
                {capturedPhoto || scannedPreviewItems.length > 0 ? (
                  <button
                    onClick={() => {
                      setCapturedPhoto(null);
                      setScannedPreviewItems([]);
                      setCameraError(null);
                      stopCamera();
                    }}
                    className="px-4 py-2 text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    🗑️ Discard & Reset Scan
                  </button>
                ) : (
                  <button
                    onClick={() => setScannerOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
                  >
                    Close Window
                  </button>
                )}
                
                <button
                  onClick={approveScannedItems}
                  disabled={scannedPreviewItems.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all disabled:opacity-45 cursor-pointer shadow-sm shadow-emerald-600/10"
                >
                  ✔️ Confirm & Load to Inventory Storage
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: MANUAL SIMPLE ITEM ADDER */}
      <AnimatePresence>
        {showManualAdd && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-extrabold text-slate-900">Add Single Ingredient</h3>
                <button 
                  onClick={() => setShowManualAdd(false)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-950"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Avocados, Rotisserie Chicken"
                    value={customAddedItem.name}
                    onChange={e => setCustomAddedItem({ ...customAddedItem, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Storage Location</label>
                    <select
                      value={customAddedItem.category}
                      onChange={e => setCustomAddedItem({ ...customAddedItem, category: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="fridge">Fridge (Fresh)</option>
                      <option value="freezer">Freezer (Frozen)</option>
                      <option value="pantry">Pantry (Dry)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Food Group</label>
                    <select
                      value={customAddedItem.foodGroup}
                      onChange={e => setCustomAddedItem({ ...customAddedItem, foodGroup: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="Produce">Produce 🥬</option>
                      <option value="Dairy">Dairy 🥛</option>
                      <option value="Meat">Meat 🥩</option>
                      <option value="Bakery">Bakery 🥯</option>
                      <option value="Canned">Canned 🥫</option>
                      <option value="Frozen">Frozen ❄️</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Quantity</label>
                    <input
                      type="text"
                      value={customAddedItem.quantity}
                      onChange={e => setCustomAddedItem({ ...customAddedItem, quantity: e.target.value })}
                      className="w-full mt-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Est Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customAddedItem.cost}
                      onChange={e => setCustomAddedItem({ ...customAddedItem, cost: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Shelf Life (Days)</label>
                    <input
                      type="number"
                      value={customAddedItem.expiryDays}
                      onChange={e => setCustomAddedItem({ ...customAddedItem, expiryDays: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManualAdd(false)}
                    className="px-4 py-2 hover:bg-slate-50 rounded-xl uppercase font-bold text-[11px] tracking-wider text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl uppercase font-bold text-[11px] tracking-wider cursor-pointer"
                  >
                    Insert to Storage
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
