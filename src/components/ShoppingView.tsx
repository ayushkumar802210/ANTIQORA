import React, { useState } from 'react';
import { ProductResultItem } from '../services/api';
import { ShoppingBag, ExternalLink, CheckCircle, Scale, X, AlertCircle, Eye } from 'lucide-react';

interface ShoppingViewProps {
  products: ProductResultItem[];
  isLoading?: boolean;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({ products }) => {
  const [comparedProducts, setComparedProducts] = useState<ProductResultItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResultItem | null>(null);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const toggleCompare = (product: ProductResultItem) => {
    if (comparedProducts.some(p => p.id === product.id)) {
      setComparedProducts(comparedProducts.filter(p => p.id !== product.id));
      setCompareNotice(null);
    } else {
      if (comparedProducts.length >= 2) {
        setCompareNotice("Comparison is limited to 2 items simultaneously in Phase 1.");
        setTimeout(() => setCompareNotice(null), 3000);
        return;
      }
      setComparedProducts([...comparedProducts, product]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Commerce & Shopping Engine</span>
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Demo Content
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulated catalog comparing demo merchants, pricing, and availability.
          </p>
        </div>

        {comparedProducts.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-600 dark:text-cyan-300 font-semibold">
            <span>Comparing ({comparedProducts.length}/2)</span>
            <button
              onClick={() => setComparedProducts([])}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Demo Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Demo Content: All prices, product titles, and merchant listings are simulated DEMO data for Phase 1. Real merchant and affiliate connectors will be integrated in Phase 2.</span>
      </div>

      {compareNotice && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-600 dark:text-cyan-300 font-medium">
          {compareNotice}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((item) => {
          const isCompared = comparedProducts.some(p => p.id === item.id);
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm hover:border-cyan-500/40 transition"
            >
              <div>
                {/* Product Image Placeholder */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  
                  <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30">
                    Demo Result
                  </span>

                  {/* Demo Price Badge */}
                  <div className="absolute top-2 right-2 rounded-lg bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-cyan-400 border border-slate-800">
                    {item.price} <span className="text-[10px] text-slate-400 font-normal">(Demo Price)</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Seller: {item.seller}
                  </span>
                  
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>
                  
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{item.availability} (Demo Status)</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Compare button & View product button */}
              <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-4">
                <button
                  onClick={() => toggleCompare(item)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    isCompared
                      ? 'bg-cyan-500 text-slate-950 border-cyan-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                  title="Compare product"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared ? "Comparing" : "Compare"}</span>
                </button>

                <button
                  onClick={() => setSelectedProduct(item)}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                  title="View product"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Product</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Drawer / Section */}
      {comparedProducts.length === 2 && (
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/5 to-indigo-500/5 dark:bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Direct Product Comparison (Demo Data)</span>
            </h3>
            <button
              onClick={() => setComparedProducts([])}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {comparedProducts.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                <p className="text-cyan-600 dark:text-cyan-400 font-semibold">{p.price} (Demo Price)</p>
                <p className="text-slate-500">Merchant: {p.seller}</p>
                <p className="text-emerald-500">{p.availability}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Demo Product View
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-48 rounded-xl bg-slate-950 overflow-hidden">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="text-xs text-slate-400">Seller: {selectedProduct.seller}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedProduct.name}
              </h3>
              <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                {selectedProduct.price} <span className="text-xs text-slate-400 font-normal">(Demo Price)</span>
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              In Phase 2, this modal will connect with verified e-commerce APIs and direct merchant checkout gateways.
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Close Product View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
