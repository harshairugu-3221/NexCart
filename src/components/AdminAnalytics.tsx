import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { IndianRupee, Archive, Warehouse, TrendingUp, AlertTriangle, ChevronRight, Check, Route } from 'lucide-react';
import { AnalyticsSummary, Order, Product } from '../types';
import { Language, translations } from '../localization';
import SalesHeatmap from './SalesHeatmap';

interface AdminAnalyticsProps {
  currentLang: Language;
  userToken: string | null;
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (id: string, newStatus: string) => void;
}

export default function AdminAnalytics({ currentLang, userToken, orders, products, onUpdateOrderStatus }: AdminAnalyticsProps) {
  const t = translations[currentLang];
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('shipped');
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (!userToken) return;
    setLoadingActivities(true);
    fetch('/api/activity', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAdminActivities(data);
        }
      })
      .catch(err => console.error('Error fetching admin activity log:', err))
      .finally(() => setLoadingActivities(false));
  }, [userToken, orders]);

  useEffect(() => {
    if (!userToken) return;
    setLoading(true);
    // Fetch sales report analytics
    fetch('/api/analytics', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not admin');
        return res.json();
      })
      .then(data => {
        setAnalytics(data);
      })
      .catch(err => console.error('Analytics extraction issue:', err))
      .finally(() => setLoading(false));
  }, [userToken, orders]);

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-zinc-400 dark:text-zinc-600 animate-pulse">
        Calculating financial aggregates and packaging logistic tables...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-24 text-center text-rose-500 font-mono text-xs">
        Access Denied. Admin level clearance required for financial statistics.
      </div>
    );
  }

  const COLORS = ['#2563eb', '#3b82f6', '#1d4ed8', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 py-6">
      
      {/* 4 KPI Dashboard Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Metric Card 1: Revenue */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">{t.totalSales}</span>
            <p className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-50">
              ₹{analytics.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        {/* Metric Card 2: Orders */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">{t.totalOrdersCount}</span>
            <p className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {analytics.totalOrders}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Archive className="h-6 w-6" />
          </div>
        </div>

        {/* Metric Card 3: Supply Alerts */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">{t.lowStockAlerts}</span>
            <p className="font-mono text-2xl font-black text-rose-500 dark:text-rose-400">
              {analytics.lowStockItemsCount}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Warehouse className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Recharts Analytics Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line area chart daily financial performance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950">
          <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-500 tracking-wider mb-5 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {t.dailyRevenueTrend}
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyRevenue}>
                <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-zinc-850" />
                <XAxis dataKey="date" stroke="#888888" fontSize={9} fontClass="font-mono" tickLine={false} />
                <YAxis stroke="#888888" fontSize={9} fontClass="font-mono" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categorization Split graphs */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950">
          <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-500 tracking-wider mb-5 flex items-center gap-1.5">
            📋 {t.salesByCategory}
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-zinc-850" />
                <XAxis dataKey="category" stroke="#888888" fontSize={9} tickLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {analytics.salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* D3-based Sales Heatmap */}
      <SalesHeatmap orders={orders} products={products} currentLang={currentLang} />

      {/* Top Performing products list & Active Orders Admin switches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products Box */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950 lg:col-span-1">
          <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-500 tracking-wider mb-4">
            🥇 {t.topPerformingItems}
          </h4>
          <div className="space-y-4">
            {analytics.topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between gap-4 py-2 border-b last:border-0 border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-black text-zinc-400">0{idx + 1}</span>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-250 truncate">{p.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-50">₹{p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className="font-sans text-[9px] text-zinc-400">Sold: {p.sales} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Status Updates (Modify Tracking updates) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950 lg:col-span-2 space-y-5">
          <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
            <Route className="h-4 w-4 text-blue-600" />
            {t.changeStatus}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[9px] text-zinc-400 uppercase">Select Target Order</label>
              <select
                value={selectedOrderId}
                onChange={e => setSelectedOrderId(e.target.value)}
                className="w-full mt-1.5 rounded-md border border-slate-202 p-3 text-xs text-zinc-850 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer"
              >
                <option value="">-- Choose active order --</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.shippingInfo.fullName} (₹{o.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[9px] text-zinc-400 uppercase">Select Transit Phase</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full mt-1.5 rounded-md border border-slate-202 p-3 text-xs text-zinc-850 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped (Departed Hub)</option>
                <option value="delivered">Delivered (Sign & OTP)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <button
              onClick={() => {
                if (!selectedOrderId) return;
                onUpdateOrderStatus(selectedOrderId, selectedStatus);
              }}
              disabled={!selectedOrderId}
              className={`cursor-pointer font-sans text-xs font-extrabold text-white rounded-lg bg-blue-600 px-6 py-2.5 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-650 disabled:cursor-not-allowed shadow-md shadow-blue-550/10`}
            >
              {t.updateStatusBtn}
            </button>
          </div>

          {/* Low inventory alerts list */}
          {analytics.lowStockItemsCount > 0 && (
            <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 flex items-start gap-3.5">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-xs font-black text-rose-600 dark:text-rose-400 block uppercase tracking-wide">Critical Warehouse Alerts</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-normal">
                  There are currently {analytics.lowStockItemsCount} critical electronics running low. Update procurement, or modify lists to secure supply schedules.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Durable Firestore Activity Ledger */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div>
            <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-500 tracking-wider">
              🔐 Durable Firestore Operations Audit Trail
            </h4>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Tracks searches, logins, reviews, status updates, and checkouts live-synced to the cloud database
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-mono font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/10">
            {adminActivities.length} Operations Audited
          </span>
        </div>

        {loadingActivities ? (
          <div className="text-center py-12 font-mono text-xs text-zinc-400 dark:text-zinc-600 animate-pulse">
            Re-syncing audit trail from cloud...
          </div>
        ) : adminActivities.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs">
            No system operations logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900">
                  <th className="py-2.5 text-[10px] font-mono font-extrabold uppercase text-zinc-400 tracking-wider">Timestamp</th>
                  <th className="py-2.5 text-[10px] font-mono font-extrabold uppercase text-zinc-400 tracking-wider">Operator ID / Name</th>
                  <th className="py-2.5 text-[10px] font-mono font-extrabold uppercase text-zinc-400 tracking-wider">Action Event</th>
                  <th className="py-2.5 text-[10px] font-mono font-extrabold uppercase text-zinc-400 tracking-wider">Details Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {adminActivities.slice(0, 50).map((act) => {
                  let badgeColor = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400';
                  if (act.action === 'checkout') badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
                  if (act.action === 'login' || act.action === 'register') badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
                  if (act.action === 'add_review') badgeColor = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400';
                  if (act.action === 'search') badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400';
                  if (act.action === 'update_order_status') badgeColor = 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';

                  return (
                    <tr key={act.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="py-2.5 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-xs font-bold text-zinc-750 dark:text-zinc-250 truncate max-w-[180px]">
                        <span className="block truncate">{act.userName || 'Anonymous'}</span>
                        <span className="block font-mono text-[9px] text-zinc-400 truncate">{act.userId}</span>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${badgeColor}`}>
                          {act.action}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-zinc-500 max-w-[320px] truncate">
                        {act.details && Object.keys(act.details).length > 0 ? (
                          <span className="truncate block text-zinc-600 dark:text-zinc-400" title={JSON.stringify(act.details)}>
                            {act.details.name || act.details.query || act.details.orderId 
                              ? `${act.details.name || act.details.query || act.details.orderId} ${act.details.status ? `(${act.details.status})` : ''}`
                              : JSON.stringify(act.details)
                            }
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-700">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
