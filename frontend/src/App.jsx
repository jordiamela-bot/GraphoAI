import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, ArrowRight, Download, Printer, Share2, 
  Settings, CheckCircle2, AlertTriangle, Sparkles, BrainCircuit, 
  Layers, Users, ShieldAlert, Check, Moon, Sun, ArrowLeft, Loader2,
  History, Plus, Trash2, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import RadarChart from './components/RadarChart';
import VariablesGrid from './components/VariablesGrid';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  
  // App States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('personalitat');
  const [darkMode, setDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // History Sidebar States
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  
  const cvSteps = [
    "Detectant full...",
    "Corregint perspectiva...",
    "Millorar contrast...",
    "Eliminant soroll...",
    "Detectant línies...",
    "Detectant paraules...",
    "Detectant lletres...",
    "Calculant característiques gràfiques...",
    "Generant informe grafològic..."
  ];

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load history list on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setupFile(e.target.files[0]);
    }
  };

  const setupFile = (selectedFile) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setAnalysisResult(null);
    
    // Create preview
    if (selectedFile.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setPreviewUrl('pdf-icon');
    } else {
      setPreviewUrl('doc-icon');
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setErrorMessage(null);
    
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < 7) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', subjectName.trim() || 'Desconegut');

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("S'ha produït un error en analitzar el document. Verifica que el fitxer sigui una imatge o un PDF vàlid.");
      }

      const data = await response.json();
      
      setAnalysisStep(8);
      setTimeout(() => {
        setAnalysisResult(data);
        setIsAnalyzing(false);
        setSubjectName("");
        setFile(null);
        setPreviewUrl(null);
        fetchHistory(); // Refresh history sidebar list
      }, 500);

    } catch (err) {
      clearInterval(stepInterval);
      setErrorMessage(err.message);
      setIsAnalyzing(false);
    }
  };

  const loadHistoryDetail = async (id) => {
    setLoadingDetailId(id);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${id}`);
      if (!response.ok) throw new Error("No s'ha pogut carregar l'informe");
      const data = await response.json();
      
      setAnalysisResult(data.data);
      // Close sidebar on mobile once selected
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoadingDetailId(null);
    }
  };

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation(); // Avoid loading the details
    if (!confirm("Segur que vols eliminar aquesta anàlisi?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // If current viewing analysis is deleted, clear it
        if (analysisResult && analysisResult.id === id) {
          setAnalysisResult(null);
        }
        fetchHistory();
      }
    } catch (err) {
      console.error("Error deleting history entry:", err);
    }
  };

  const handlePDFExport = async () => {
    if (!analysisResult) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: analysisResult.report })
      });
      if (!response.ok) throw new Error("Error en exportar PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GraphoAI_Report_${analysisResult.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("No s'ha pogut descarregar el PDF.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleJSONExport = () => {
    if (!analysisResult) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analysisResult, null, 2)
    )}`;
    const a = document.createElement('a');
    a.href = jsonString;
    a.download = `GraphoAI_Analysis_${analysisResult.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const resetToNewAnalysis = () => {
    setAnalysisResult(null);
    setFile(null);
    setPreviewUrl(null);
    setSubjectName("");
    setErrorMessage(null);
  };

  const getImageUrl = (url) => {
    if (url && url.startsWith('/api/')) {
      return `${API_BASE_URL}${url}`;
    }
    return url;
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ca-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300 dark:bg-[#070b13] dark:text-slate-100">
      
      {/* Sidebar Historial */}
      <aside 
        className={`glass-panel border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-40 fixed md:static h-full md:h-auto
          ${sidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider">Historial d'Anàlisis</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Analysis Button */}
        <div className="p-4">
          <button
            onClick={resetToNewAnalysis}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-500/50 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            Nova Anàlisi
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {history.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              Sense anàlisis històriques desades
            </div>
          ) : (
            history.map(item => {
              const isActive = analysisResult && analysisResult.id === item.id;
              const isLoading = loadingDetailId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => loadHistoryDetail(item.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-medium border-l-4 border-blue-600 dark:border-blue-400' 
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <div className="min-w-0 pr-6">
                    <h4 className="text-xs font-bold truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {item.filename}
                    </p>
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-0.5">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                  
                  <div className="absolute right-2 flex items-center gap-1">
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                    <button
                      onClick={(e) => deleteHistoryItem(e, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Toggle Sidebar Button (Floating on Mobile) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-6 left-6 z-40 p-3 bg-slate-900 text-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center justify-center border border-slate-700/50"
          >
            <History className="w-5 h-5" />
          </button>
        )}

        {/* Navbar */}
        <header className="sticky top-0 z-30 glass-panel border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Desktop toggle button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <History className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold font-heading text-slate-900 dark:text-white leading-tight m-0 select-none">
                  GraphoAI
                </h1>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-wide m-0">
                  Anàlisi grafopsicològica assistida per IA
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 px-4 py-8 md:py-12 max-w-6xl w-full mx-auto">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex gap-3 items-center">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Upload Screen */}
          {!analysisResult && !isAnalyzing && (
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center mt-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight mb-2">
                  Descobreix la teva escriptura
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Puja una fotografia clara o un fitxer PDF del teu text manuscrit per generar una anàlisi grafopsicològica completa.
                </p>
              </div>

              <div className="w-full space-y-4">
                {/* Subject Name Input */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Nom de la persona analitzada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maria Vila, Jordi Bosch..."
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Drag and Drop Container */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload-input').click()}
                  className={`w-full p-10 border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-all duration-300
                    ${dragActive 
                      ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/10' 
                      : 'border-slate-200 hover:border-blue-500 bg-white dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-500/50 shadow-sm'
                    }`}
                >
                  <input 
                    id="file-upload-input"
                    type="file" 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.pdf,.heic,.bmp,.tiff" 
                    onChange={handleFileChange}
                  />
                  
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Pujar document
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center max-w-xs leading-normal">
                    Arrossega un fitxer o fes clic per examinar.<br/>Accepta JPG, PNG, PDF, HEIC, BMP i TIFF.
                  </p>
                </div>

                {/* Uploaded File Panel */}
                {file && (
                  <div className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {previewUrl === 'pdf-icon' ? (
                          <FileText className="w-6 h-6 text-red-500" />
                        ) : previewUrl === 'doc-icon' ? (
                          <FileText className="w-6 h-6 text-blue-500" />
                        ) : (
                          <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-950 dark:text-white truncate">
                          {file.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={startAnalysis}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Analitzar escriptura
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Analysis Progress Screen */}
          {isAnalyzing && (
            <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm text-center">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-6" />
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                Processant document
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                Això pot trigar uns 10 segons. Si us plau, no tanquis la pestanya.
              </p>

              {/* Steps checklists */}
              <div className="text-left space-y-3 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-900/50">
                {cvSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                      ${analysisStep > idx 
                        ? 'bg-emerald-500 text-white' 
                        : analysisStep === idx 
                          ? 'border-2 border-blue-600 animate-pulse' 
                          : 'border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {analysisStep > idx && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className={`text-xs font-medium transition-colors
                      ${analysisStep > idx 
                        ? 'text-slate-500 dark:text-slate-400 line-through' 
                        : analysisStep === idx 
                          ? 'text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Dashboard Report Screen */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-8 animate-fadeIn">
              {/* Top Header Card */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div>
                  <button 
                    onClick={resetToNewAnalysis} 
                    className="mb-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline focus:outline-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova anàlisi / Pujar document
                  </button>
                  <h2 className="text-2xl font-bold font-heading text-slate-950 dark:text-white flex flex-wrap items-center gap-2 leading-tight">
                    Anàlisi de: <span className="text-blue-600 dark:text-blue-400">{analysisResult.name}</span>
                    {analysisResult.is_demo_mode && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900/50 uppercase tracking-wider">
                        Mode Demo
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Document: <span className="font-semibold text-slate-600 dark:text-slate-400">{analysisResult.filename}</span>
                  </p>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handlePDFExport}
                    className="flex-1 md:flex-none px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                  <button
                    onClick={handleJSONExport}
                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    JSON
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {copiedLink ? "Copiat!" : "Compartir"}
                  </button>
                </div>
              </div>

              {/* Disclaimer Alert */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs leading-relaxed text-blue-800 dark:text-blue-300">
                <strong>Nota de descàrrec:</strong> Totes les conclusions presentades en aquest panell s'han de considerar com a interpretacions grafopsicològiques basades en criteris acadèmics de grafologia clàssica europea. No constitueixen fets demostrats, diagnòstics clínics, ni valoracions mèdiques, mentals o legals.
              </div>

              {/* Grid Layout: Main analysis details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Report Tabs & Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Executive Summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      Resum executiu
                    </h3>
                    <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {analysisResult.report.resum_executiu}
                    </p>
                  </div>

                  {/* Main Tabs Container */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    {/* Tab header */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                      {[
                        { id: 'personalitat', name: 'Personalitat', icon: BrainCircuit },
                        { id: 'relacions', name: 'Relacions Personals', icon: Users },
                        { id: 'laboral', name: 'Entorn Laboral', icon: Settings },
                        { id: 'recomanacions', name: 'Recomanacions', icon: Sparkles }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-5 py-4 border-b-2 font-bold text-xs whitespace-nowrap transition-colors focus:outline-none
                            ${activeTab === tab.id 
                              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content body */}
                    <div className="p-6">
                      {/* Tab 1: Personalitat */}
                      {activeTab === 'personalitat' && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fortaleses</h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.report.personalitat.fortaleses}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Punts de millora</h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.report.personalitat.debilitats}</p>
                            </div>
                          </div>
                          <div className="border-t border-slate-100 dark:border-slate-800/80 my-4" />
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Forma de pensar</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.forma_de_pensar}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Intel·ligència pràctica</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.intelligencia_practica}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Creativitat</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.creativitat}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Organització</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.organitzacio}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Capacitat d'aprenentatge</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.capacitat_aprenentatge}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Capacitat analítica</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.capacitat_analitica}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Autocontrol</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.autocontrol}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Constància</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.constancia}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Motivació</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{analysisResult.report.personalitat.motivacio}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Relacions */}
                      {activeTab === 'relacions' && (
                        <div className="space-y-4 animate-fadeIn">
                          {Object.entries(analysisResult.report.relacions_personals).map(([key, desc]) => (
                            <div key={key} className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/50 rounded-xl">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 capitalize">
                                {key.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">{desc}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab 3: Laboral */}
                      {activeTab === 'laboral' && (
                        <div className="space-y-4 animate-fadeIn">
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Segons la grafologia, podria sentir-se més còmode en:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(analysisResult.report.entorn_laboral).map(([key, desc]) => (
                              <div key={key} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Recomanacions */}
                      {activeTab === 'recomanacions' && (
                        <div className="space-y-5 animate-fadeIn">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entorns de Treball Compatibles</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.report.recomanacions.entorns_compatibles}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estil de Lideratge Més Adequat</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.report.recomanacions.estil_lideratge}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Forma de Comunicació Recomanada</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.report.recomanacions.forma_comunicacio}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Factors Motivadors</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.report.recomanacions.factors_motivadors}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OpenCV Document Segmentation Step Gallery */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-base font-bold font-heading text-slate-950 dark:text-white">
                        Passos del Processament d'Imatge (OpenCV)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                      A continuació es mostren els diferents talls i segmentacions utilitzades pel nostre motor de visió artificial per extreure les característiques.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[
                        { key: 'original', name: '1. Pàgina corregida' },
                        { key: 'processed', name: '2. Tinta binaria' },
                        { key: 'lines_detected', name: '3. Caixes de Línies' },
                        { key: 'words_detected', name: '4. Caixes de Paraules' },
                        { key: 'letters_detected', name: '5. Caixes de Traços' }
                      ].map(imgStep => (
                        <div key={imgStep.key} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/20">
                          <div className="aspect-[3/4] overflow-hidden">
                            <img 
                              src={getImageUrl(analysisResult.visualizations[imgStep.key])} 
                              alt={imgStep.name} 
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                              onClick={() => {
                                const newWindow = window.open();
                                newWindow.document.write(`<img src="${getImageUrl(analysisResult.visualizations[imgStep.key])}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                              }}
                            />
                          </div>
                          <div className="p-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                            {imgStep.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom 28 Variables Table Grid */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8">
                  <VariablesGrid features={analysisResult.features} />
                </div>
              </div>

              {/* Right Column: Radar Chart & Strengths / Concerns Lists */}
              <div className="space-y-8">
                {/* Radar Chart */}
                <RadarChart data={analysisResult.report.indexes} />

                {/* Strengths Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="text-base font-bold font-heading text-slate-950 dark:text-white">
                      Fortaleses destacades
                    </h3>
                  </div>
                  <ul className="space-y-3 pl-1">
                    {analysisResult.report.fortaleses.map((f, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Attention Areas Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-500">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 className="text-base font-bold font-heading text-slate-950 dark:text-white">
                      Aspectes a considerar
                    </h3>
                  </div>
                  <ul className="space-y-3 pl-1">
                    {analysisResult.report.aspectes_atencio.map((f, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 GraphoAI. Anàlisi grafopsicològica assistida per IA de base clàssica europea. Tots els drets reservats.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
