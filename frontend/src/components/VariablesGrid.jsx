import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Activity, CheckCircle } from 'lucide-react';

const VariablesGrid = ({ features }) => {
  const [expandedKey, setExpandedKey] = useState(null);

  const variablesList = [
    { name: "Inclinació", key: "inclinacio", category: "Forma" },
    { name: "Grandària", key: "grandaria", category: "Dimensió" },
    { name: "Amplada", key: "amplada", category: "Dimensió" },
    { name: "Regularitat", key: "regularitat", category: "Moviment" },
    { name: "Velocitat aparent", key: "velocitat_aparent", category: "Moviment" },
    { name: "Pressió aparent", key: "pressio_aparent", category: "Pressió" },
    { name: "Separació paraules", key: "separacio_paraules", category: "Ordre" },
    { name: "Separació línies", key: "separacio_linies", category: "Ordre" },
    { name: "Marges", key: "marges", category: "Ordre" },
    { name: "Línia base", key: "linea_base", category: "Direcció" },
    { name: "Continuïtat", key: "continuitat", category: "Cohesió" },
    { name: "Lligams", key: "lligams", category: "Cohesió" },
    { name: "Angularitat", key: "angularitat", category: "Forma" },
    { name: "Arrodoniment", key: "arrodoniment", category: "Forma" },
    { name: "Majúscules", key: "majúscules", category: "Forma" },
    { name: "Zona superior", key: "zona_superior", category: "Zonificació" },
    { name: "Zona mitjana", key: "zona_mitjana", category: "Zonificació" },
    { name: "Zona inferior", key: "zona_inferior", category: "Zonificació" },
    { name: "Bucles", key: "bucles", category: "Forma" },
    { name: "Signatura", key: "signatura", category: "Signatura" },
    { name: "Proporció signatura", key: "proporcio_signatura_text", category: "Signatura" },
    { name: "Ocupació full", key: "ocupacio_full", category: "Ordre" },
    { name: "Ordre", key: "ordre", category: "Ordre" },
    { name: "Espontaneïtat", key: "espontaneitat", category: "Moviment" },
    { name: "Ritme", key: "ritme", category: "Moviment" },
    { name: "Direcció", key: "direccio", category: "Direcció" },
    { name: "Verticalitat", key: "verticalitat", category: "Direcció" },
    { name: "Densitat", key: "densitat", category: "Pressió" }
  ];

  // Group variables by category for visual organization
  const categories = ["Dimensió", "Forma", "Pressió", "Ordre", "Direcció", "Cohesió", "Zonificació", "Moviment", "Signatura"];

  const toggleExpand = (key) => {
    if (expandedKey === key) {
      setExpandedKey(null);
    } else {
      setExpandedKey(key);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 85) return 'bg-emerald-500 text-emerald-50 dark:bg-emerald-950 dark:text-emerald-300';
    if (score >= 70) return 'bg-blue-500 text-blue-50 dark:bg-blue-950 dark:text-blue-300';
    return 'bg-amber-500 text-amber-50 dark:bg-amber-950 dark:text-amber-300';
  };

  const getConfidenceBarColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold font-heading">
          Variables Gràfiques Analitzades
        </h2>
      </div>

      <div className="space-y-6">
        {categories.map(category => {
          // Filter variables belonging to this category
          const catVars = variablesList.filter(v => v.category === category);
          
          return (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                {category}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catVars.map(v => {
                  const data = features[v.key] || { value: "N/A", detail: "Mètrica no detectada", confidence: 0 };
                  const isExpanded = expandedKey === v.key;

                  return (
                    <div 
                      key={v.key}
                      className={`flex flex-col bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm transition-all duration-200
                        ${isExpanded 
                          ? 'border-blue-500 ring-1 ring-blue-500/50' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                      {/* Top click target */}
                      <button
                        onClick={() => toggleExpand(v.key)}
                        className="w-full text-left p-3.5 flex flex-col justify-between h-full focus:outline-none"
                      >
                        <div className="flex justify-between items-start w-full gap-2 mb-1.5">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {v.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${getConfidenceColor(data.confidence)}`}>
                            {data.confidence}%
                          </span>
                        </div>

                        <div className="flex items-end justify-between w-full mt-auto">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {data.value}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                        
                        {/* Confidence Indicator Line */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${getConfidenceBarColor(data.confidence)}`}
                            style={{ width: `${data.confidence}%` }}
                          />
                        </div>
                      </button>

                      {/* Expandable description panel */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-fadeIn">
                          <div className="flex gap-1.5 mb-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Interpretació grafopsicològica</span>
                          </div>
                          {data.detail}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariablesGrid;
