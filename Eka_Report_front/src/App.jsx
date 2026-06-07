import { useState, useEffect } from 'react'

// Initial mock reports representing production runs parsed from Excel
const INITIAL_REPORTS = [
  {
    id: 'REP-2026-001',
    name: 'EKA Production Report_R2.xlsx',
    date: '2026-06-07 10:15 AM',
    size: '95.4 KB',
    status: 'Completed',
    output: 14820,
    efficiency: 94.2,
    quality: 99.4,
    runs: 48,
    uploadedBy: 'Omkar S.'
  },
  {
    id: 'REP-2026-002',
    name: 'EKA Production Report_R1.xlsx',
    date: '2026-06-06 04:30 PM',
    size: '94.8 KB',
    status: 'Completed',
    output: 12450,
    efficiency: 91.8,
    quality: 98.9,
    runs: 42,
    uploadedBy: 'Omkar S.'
  },
  {
    id: 'REP-2026-003',
    name: 'Weekly_Shift_Summary_Final.xlsx',
    date: '2026-06-05 09:00 AM',
    size: '112.1 KB',
    status: 'Completed',
    output: 18230,
    efficiency: 95.6,
    quality: 99.1,
    runs: 56,
    uploadedBy: 'John D.'
  },
  {
    id: 'REP-2026-004',
    name: 'Raw_Material_Batch_Check.xlsx',
    date: '2026-06-04 11:20 AM',
    size: '48.2 KB',
    status: 'Failed',
    output: 0,
    efficiency: 0,
    quality: 0,
    runs: 0,
    uploadedBy: 'Sarah K.'
  },
  {
    id: 'REP-2026-005',
    name: 'Line_B_Maintenance_Log.xlsx',
    date: '2026-06-03 02:15 PM',
    size: '72.5 KB',
    status: 'Completed',
    output: 8900,
    efficiency: 88.4,
    quality: 99.7,
    runs: 28,
    uploadedBy: 'Alex M.'
  }
]

function App() {
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStep, setUploadStep] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  
  // Custom stats calculated from reports
  const [stats, setStats] = useState({
    totalOutput: 0,
    avgEfficiency: 0,
    avgQuality: 0,
    totalRuns: 0
  })

  // Calculate stats based on completed reports
  useEffect(() => {
    const completed = reports.filter(r => r.status === 'Completed')
    if (completed.length === 0) return

    const totalOutput = completed.reduce((sum, r) => sum + r.output, 0)
    const avgEfficiency = (completed.reduce((sum, r) => sum + r.efficiency, 0) / completed.length).toFixed(1)
    const avgQuality = (completed.reduce((sum, r) => sum + r.quality, 0) / completed.length).toFixed(2)
    const totalRuns = completed.reduce((sum, r) => sum + r.runs, 0)

    setStats({ totalOutput, avgEfficiency, avgQuality, totalRuns })
  }, [reports])

  // Clear Toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle Drop/Upload File
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0])
    }
  }

  // File upload simulation workflow
  const simulateFileUpload = (file) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setToastMessage({
        type: 'error',
        text: 'Invalid file format. Please upload an Excel (.xlsx or .xls) file.'
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(10)
    setUploadStep('Reading Excel binary structures...')

    // Step 1: Read structures
    setTimeout(() => {
      setUploadProgress(40)
      setUploadStep('Validating workbook columns & sheets...')
      
      // Step 2: Validate columns
      setTimeout(() => {
        setUploadProgress(75)
        setUploadStep('Extracting production run formulas and cells...')

        // Step 3: Extract data
        setTimeout(() => {
          setUploadProgress(100)
          setUploadStep('Finalizing ingestion...')

          // Complete upload
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
            setUploadStep('')

            const isSuccess = Math.random() > 0.15 // 85% success rate simulation
            const newReportId = `REP-2026-0${reports.length + 1}`
            
            if (isSuccess) {
              const mockOutput = Math.floor(Math.random() * 8000) + 10000
              const mockEfficiency = parseFloat((Math.random() * 8 + 88).toFixed(1))
              const mockQuality = parseFloat((Math.random() * 2 + 98).toFixed(2))
              const mockRuns = Math.floor(mockOutput / 300)

              const newReport = {
                id: newReportId,
                name: file.name,
                date: new Date().toLocaleString('en-US', { hour12: true }).replace(/:\d+ /, ' '),
                size: `${(file.size / 1024).toFixed(1)} KB`,
                status: 'Completed',
                output: mockOutput,
                efficiency: mockEfficiency,
                quality: mockQuality,
                runs: mockRuns,
                uploadedBy: 'Omkar S. (You)'
              }

              setReports(prev => [newReport, ...prev])
              setToastMessage({
                type: 'success',
                text: `Successfully processed "${file.name}"! Added ${mockOutput.toLocaleString()} units.`
              })
            } else {
              const failedReport = {
                id: newReportId,
                name: file.name,
                date: new Date().toLocaleString('en-US', { hour12: true }).replace(/:\d+ /, ' '),
                size: `${(file.size / 1024).toFixed(1)} KB`,
                status: 'Failed',
                output: 0,
                efficiency: 0,
                quality: 0,
                runs: 0,
                uploadedBy: 'Omkar S. (You)'
              }
              setReports(prev => [failedReport, ...prev])
              setToastMessage({
                type: 'error',
                text: `Failed to parse "${file.name}". Missing required column: "ProductionQty".`
              })
            }
          }, 600)
        }, 800)
      }, 800)
    }, 600)
  }

  // Delete a report
  const handleDeleteReport = (id, e) => {
    e.stopPropagation()
    setReports(prev => prev.filter(r => r.id !== id))
    setToastMessage({
      type: 'success',
      text: 'Report record deleted successfully.'
    })
  }

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Visual background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/80 border-rose-500/30 text-rose-200'
          }`}>
            {toastMessage.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="font-medium text-sm">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/75 border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-teal-500/20 bg-white/5">
              <img src="/eka_logo.png" alt="Eka Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Eka Report Studio
              </h1>
              <p className="text-xs text-teal-400 font-medium tracking-wide uppercase">Production Operations Dashboard</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#" className="px-4 py-2 rounded-lg bg-slate-900 text-teal-300 font-medium text-sm transition-all">Overview</a>
            <a href="#" className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 font-medium text-sm transition-all hover:bg-slate-900/40">Analytics</a>
            <a href="#" className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 font-medium text-sm transition-all hover:bg-slate-900/40">Schedules</a>
            <a href="#" className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 font-medium text-sm transition-all hover:bg-slate-900/40">Settings</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">Omkar S.</span>
              <span className="text-[10px] text-slate-500 font-mono">ADMIN PRIVILEGES</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-sm ring-2 ring-teal-500/20 shadow-md">
              OS
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* KPI Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Key Performance Indicators">
          
          {/* Card 1 */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all duration-300 shadow-md">
            <div className="absolute top-0 right-0 p-3 text-teal-500/10 group-hover:text-teal-500/20 transition-all duration-300">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Output</p>
            <h2 className="text-3xl font-bold font-display text-white mt-2 mb-1 tracking-tight">
              {stats.totalOutput.toLocaleString()}
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +12.4%
              </span>
              <span className="text-slate-500">vs last report run</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all duration-300 shadow-md">
            <div className="absolute top-0 right-0 p-3 text-cyan-500/10 group-hover:text-cyan-500/20 transition-all duration-300">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Efficiency</p>
            <h2 className="text-3xl font-bold font-display text-white mt-2 mb-1 tracking-tight">
              {stats.avgEfficiency}%
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +1.8%
              </span>
              <span className="text-slate-500">efficiency index</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all duration-300 shadow-md">
            <div className="absolute top-0 right-0 p-3 text-indigo-500/10 group-hover:text-indigo-500/20 transition-all duration-300">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Quality Rate</p>
            <h2 className="text-3xl font-bold font-display text-white mt-2 mb-1 tracking-tight">
              {stats.avgQuality}%
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +0.35%
              </span>
              <span className="text-slate-500">defect-free runs</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all duration-300 shadow-md">
            <div className="absolute top-0 right-0 p-3 text-purple-500/10 group-hover:text-purple-500/20 transition-all duration-300">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Run Cycles</p>
            <h2 className="text-3xl font-bold font-display text-white mt-2 mb-1 tracking-tight">
              {stats.totalRuns}
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold bg-slate-500/10 px-1.5 py-0.5 rounded">
                Active
              </span>
              <span className="text-slate-500">production checkpoints</span>
            </div>
          </div>

        </section>

        {/* Dashboard Actions and Upload UI */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8" aria-label="Ingestion and Analytics Panel">
          
          {/* File Upload / Ingest Box */}
          <div className="lg:col-span-1 bg-gradient-to-b from-slate-900/60 to-slate-950/20 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm relative shadow-lg">
            <div>
              <h2 className="text-lg font-bold font-display text-white mb-1.5 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Ingest Production Excel
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                Drop your production reports (`.xlsx`, `.xls`) to update stats, parsing formulas, efficiency logs, and output indicators instantly.
              </p>

              {/* Upload Drop Zone */}
              <div 
                id="excel-drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/10'
                }`}
              >
                {!isUploading ? (
                  <>
                    <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors mb-3">
                      <svg className="w-6 h-6 text-teal-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <label className="cursor-pointer">
                      <span className="text-sm font-semibold text-slate-200 block hover:text-teal-400 transition-colors">Choose Excel File</span>
                      <span className="text-xs text-slate-500 block mt-1">or drag and drop it here</span>
                      <input 
                        id="excel-file-input"
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        onChange={handleFileInput} 
                      />
                    </label>
                  </>
                ) : (
                  <div className="w-full py-2 flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                      {/* Spinner */}
                      <svg className="animate-spin h-10 w-10 text-teal-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-teal-400 font-mono">{uploadProgress}%</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-4 text-center">{uploadStep}</p>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3 max-w-[200px]">
                      <div className="bg-teal-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-900 pt-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Maximum file size:</span>
                <span className="font-mono font-medium text-slate-300">10 MB</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>Supported sheets:</span>
                <span className="font-mono font-medium text-slate-300">RunSummary, LineDetails</span>
              </div>
            </div>

          </div>

          {/* Quick Analytics & Chart View */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm relative shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Runs &amp; Efficiency Breakdown
                </h2>
                <div className="flex gap-1.5">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/20">Line A</span>
                  <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full font-semibold border border-teal-500/20">Line B</span>
                </div>
              </div>

              {/* Graphical simulation of data */}
              <div className="h-44 flex items-end gap-3 px-2 pt-6 pb-2 border-b border-slate-800/60 relative">
                
                {/* Visual gridlines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-900/80 pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-900/80 pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-900/80 pointer-events-none"></div>

                {reports.filter(r => r.status === 'Completed').slice(0, 5).reverse().map((report, idx) => {
                  const maxOutput = 20000
                  const heightPct = Math.min((report.output / maxOutput) * 100, 100)
                  return (
                    <div key={report.id} className="flex-1 flex flex-col items-center group cursor-pointer relative z-10" onClick={() => setSelectedReport(report)}>
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 text-[10px] rounded-lg px-2.5 py-1.5 shadow-2xl pointer-events-none text-center whitespace-nowrap z-20">
                        <span className="block font-semibold text-slate-100">{report.output.toLocaleString()} Units</span>
                        <span className="block text-teal-400 font-mono text-[9px] mt-0.5">{report.efficiency}% Efficiency</span>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-900/30 via-teal-500/30 to-teal-400 flex flex-col justify-end group-hover:from-indigo-800/40 group-hover:via-teal-400/40 group-hover:to-teal-300 transition-all duration-300 shadow-md shadow-teal-950/20" style={{ height: `${heightPct}%` }}>
                        <span className="text-[10px] font-bold text-white mb-2 text-center select-none">{report.runs}r</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium font-mono mt-2 truncate w-full text-center">
                        {report.name.split('_')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
              <span>* Showing up to last 5 completed Excel ingestions. Click bar to inspect run profile.</span>
              <button 
                id="trigger-analytics-refresh"
                type="button" 
                onClick={() => setToastMessage({ type: 'success', text: 'Recalculated line statistics correctly.' })}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                </svg>
                Sync Calculations
              </button>
            </div>

          </div>

        </section>

        {/* Reports Table Section */}
        <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-5">
          
          {/* Table Header / Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
            <div>
              <h2 className="text-lg font-bold font-display text-white">Ingestion History</h2>
              <p className="text-xs text-slate-400">Manage and browse previously ingested production reports.</p>
            </div>
            
            {/* Toolbar Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  id="report-search-input"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files or uploaders..." 
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 w-56 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1">
                {['All', 'Completed', 'Failed'].map((status) => (
                  <button
                    key={status}
                    id={`filter-btn-${status.toLowerCase()}`}
                    type="button"
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      filterStatus === status 
                        ? 'bg-slate-900 text-teal-400 border border-slate-800/80 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Report Details</th>
                  <th className="py-3 px-4">Ingested Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Yield / Output</th>
                  <th className="py-3 px-4">Avg Efficiency</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-sm text-slate-300">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-slate-900/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            report.status === 'Completed' ? 'bg-teal-500/5 text-teal-400' : 'bg-rose-500/5 text-rose-400'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 block group-hover:text-teal-400 transition-colors">{report.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{report.id} • {report.size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-400">
                        {report.date}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          report.status === 'Completed' 
                            ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'Completed' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {report.status === 'Completed' ? `${report.output.toLocaleString()} units` : '—'}
                      </td>
                      <td className="py-4 px-4 font-mono font-medium text-slate-200">
                        {report.status === 'Completed' ? `${report.efficiency}%` : '—'}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-300">
                        {report.uploadedBy}
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteReport(report.id, e)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      <svg className="w-10 h-10 mx-auto text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No reports match the current filter criteria or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; 2026 Eka Production Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-500/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              EKA Core API Connected
            </span>
            <span>v1.2.0-beta</span>
          </div>
        </div>
      </footer>

      {/* Detail Inspector Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div 
            id="inspector-modal"
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-start bg-slate-950/40">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedReport.status === 'Completed' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  Report Inspector
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{selectedReport.id}</p>
              </div>
              <button
                type="button"
                id="close-modal-btn"
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">
              
              {/* File Info */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Filename</span>
                  <span className="text-sm font-semibold text-slate-200 truncate max-w-[280px] block">{selectedReport.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Size</span>
                  <span className="text-xs font-mono font-medium text-slate-300 block">{selectedReport.size}</span>
                </div>
              </div>

              {/* Ingestion Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/20 border border-slate-900 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Ingestion Date</span>
                  <span className="text-xs font-semibold text-slate-300 block mt-1.5">{selectedReport.date}</span>
                </div>
                <div className="bg-slate-950/20 border border-slate-900 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Ingested By</span>
                  <span className="text-xs font-semibold text-slate-300 block mt-1.5">{selectedReport.uploadedBy}</span>
                </div>
              </div>

              {selectedReport.status === 'Completed' ? (
                <>
                  {/* Detailed Performance Data */}
                  <div className="border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Yield Analytics</h4>
                    
                    {/* Progress Bar 1: Output */}
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Production Output</span>
                        <span className="text-slate-200 font-semibold">{selectedReport.output.toLocaleString()} / 20k Units</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(selectedReport.output / 20000) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Progress Bar 2: Efficiency */}
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Average Efficiency</span>
                        <span className="text-slate-200 font-semibold">{selectedReport.efficiency}%</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedReport.efficiency}%` }}></div>
                      </div>
                    </div>

                    {/* Progress Bar 3: Quality */}
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Quality Pass Rate</span>
                        <span className="text-slate-200 font-semibold">{selectedReport.quality}%</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${selectedReport.quality}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-900 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Runs</span>
                      <span className="text-md font-bold text-white font-mono mt-1 block">{selectedReport.runs}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Avg Run Vol</span>
                      <span className="text-md font-bold text-white font-mono mt-1 block">
                        {Math.floor(selectedReport.output / selectedReport.runs)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Est. Revenue</span>
                      <span className="text-md font-bold text-emerald-400 font-mono mt-1 block">
                        ${(selectedReport.output * 0.45).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border border-rose-900/30 bg-rose-950/20 text-rose-300 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
                  <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-bold text-white block mb-1">Parsing Error Detected</span>
                    The workbook layout failed structural checks. Please ensure the Excel contains a sheet named `RunSummary` with `Date`, `RunTime`, and `ProductionQty` columns.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                id="modal-cancel-btn"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Close Inspector
              </button>
              {selectedReport.status === 'Completed' && (
                <button
                  type="button"
                  id="modal-download-btn"
                  onClick={() => {
                    setToastMessage({ type: 'success', text: `Downloaded parsed structure for ${selectedReport.id}.` })
                    setSelectedReport(null)
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all shadow-md shadow-teal-500/10 active:scale-95"
                >
                  Download JSON
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default App
