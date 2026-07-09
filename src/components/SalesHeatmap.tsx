import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Order, Product } from '../types';
import { Language, translations } from '../localization';
import { Sliders, HelpCircle, BarChart3, Landmark } from 'lucide-react';

interface SalesHeatmapProps {
  orders: Order[];
  products: Product[];
  currentLang: Language;
}

interface HeatmapDataPoint {
  city: string;
  category: string;
  revenue: number;
  unitsSold: number;
  ordersCount: number;
}

export default function SalesHeatmap({ orders, products, currentLang }: SalesHeatmapProps) {
  const t = translations[currentLang];
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
    city: string;
    category: string;
    value: number;
    count: number;
  } | null>(null);

  // Default major regions / hubs and categories to ensure a beautiful grid format even with low initial data
  const defaultCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];
  const defaultCategories = ['Laptops', 'Smartphones', 'Audio', 'Home', 'Cameras'];

  // Handle dynamic sizing using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Maintain a nice aspect ratio
      const computedHeight = Math.max(300, Math.min(450, width * 0.55));
      setDimensions({ width, height: computedHeight });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Aggregate order data to build the heatmap metrics
  const aggregatedData = React.useMemo(() => {
    // Collect all cities dynamically from paid orders, or fall back to defaults
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    
    const activeCities = Array.from(new Set(
      paidOrders.map(o => o.shippingInfo?.city?.trim()).filter(Boolean)
    )) as string[];

    // Ensure we have a beautiful grid with at least our default cities
    const citiesList = Array.from(new Set([...activeCities, ...defaultCities])).slice(0, 7);
    const categoriesList = defaultCategories;

    // Initialize full grid combinations with 0 values
    const gridMap: Record<string, HeatmapDataPoint> = {};
    citiesList.forEach(city => {
      categoriesList.forEach(category => {
        const key = `${city}::${category}`;
        gridMap[key] = {
          city,
          category,
          revenue: 0,
          unitsSold: 0,
          ordersCount: 0
        };
      });
    });

    // Populate active order details
    paidOrders.forEach(order => {
      const rawCity = order.shippingInfo?.city?.trim();
      const matchedCity = citiesList.find(c => c.toLowerCase() === rawCity?.toLowerCase()) || citiesList[0];
      
      const orderProductMatches: Record<string, { category: string; quantity: number; price: number }> = {};

      order.items.forEach(item => {
        // Find category of the product
        let category = 'Audio'; // fallback
        const matchingProduct = products.find(p => p.id === item.productId);
        
        if (matchingProduct) {
          category = matchingProduct.category;
        } else {
          // Fallback keyword checks
          const name = item.name.toLowerCase();
          if (name.includes('laptop') || name.includes('macbook') || name.includes('notebook')) {
            category = 'Laptops';
          } else if (name.includes('phone') || name.includes('pixel') || name.includes('iphone') || name.includes('samsung')) {
            category = 'Smartphones';
          } else if (name.includes('camera') || name.includes('sony') || name.includes('lens')) {
            category = 'Cameras';
          } else if (name.includes('vacuum') || name.includes('purifier') || name.includes('bulb') || name.includes('appliances')) {
            category = 'Home';
          }
        }

        // Map categories that aren't in our active list to 'Home' or similar
        if (!categoriesList.includes(category)) {
          category = 'Home';
        }

        const key = `${matchedCity}::${category}`;
        if (gridMap[key]) {
          gridMap[key].revenue += item.price * item.quantity;
          gridMap[key].unitsSold += item.quantity;
        }
      });

      // Count orders per category for tooltip density
      const uniqueCategoriesInOrder = Array.from(new Set(order.items.map(item => {
        const matchingProduct = products.find(p => p.id === item.productId);
        return matchingProduct?.category || 'Audio';
      })));

      uniqueCategoriesInOrder.forEach(category => {
        const key = `${matchedCity}::${category}`;
        if (gridMap[key]) {
          gridMap[key].ordersCount += 1;
        }
      });
    });

    return {
      cities: citiesList,
      categories: categoriesList,
      points: Object.values(gridMap)
    };
  }, [orders, products]);

  // Render Heatmap using D3
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Clear previous SVG content to avoid layering issues
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 25, bottom: 50, left: 95 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const { cities, categories, points } = aggregatedData;

    // Build X scales and axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(cities)
      .padding(0.06);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain').remove();

    // Style X axis tick labels
    svg.selectAll('g.tick text')
      .attr('class', 'font-sans text-[10px] font-bold text-zinc-500 dark:text-zinc-400')
      .style('text-anchor', 'middle')
      .attr('dy', '12px');

    // Build Y scales and axis
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(categories)
      .padding(0.06);

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();

    // Style Y axis tick labels
    svg.selectAll('g')
      .selectAll('text')
      .attr('class', 'font-sans text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400')
      .attr('dx', '-8px');

    // Determine values range for metric coloring
    const valueAccessor = (d: HeatmapDataPoint) => metric === 'revenue' ? d.revenue : d.unitsSold;
    const maxVal = d3.max(points, valueAccessor) || 1;

    // Set up progressive color scales
    const isDark = document.documentElement.classList.contains('dark');
    
    // Smooth interpolator mapping
    const colorScale = d3.scaleSequential()
      .interpolator(isDark ? d3.interpolateCool : d3.interpolateBlues)
      .domain([0, maxVal]);

    // Grid rendering with smooth transitions
    svg.selectAll()
      .data(points, (d: any) => d.city + ':' + d.category)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.city) || 0)
      .attr('y', (d: any) => y(d.category) || 0)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d: any) => {
        const val = valueAccessor(d);
        if (val === 0) {
          return isDark ? '#18181b' : '#f4f4f5'; // empty cell placeholder
        }
        return colorScale(val);
      })
      .style('stroke', 'transparent')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .on('mouseover', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .style('stroke', isDark ? '#2563eb' : '#3b82f6')
          .style('stroke-width', 2)
          .attr('transform', function() {
            // Slight visual pop effect
            return `scale(1.01)`;
          });

        const val = valueAccessor(d);
        // Compute absolute tooltip coordinate location relative to container
        const boundingBox = containerRef.current?.getBoundingClientRect();
        if (boundingBox) {
          const clientX = event.clientX - boundingBox.left;
          const clientY = event.clientY - boundingBox.top;
          setTooltip({
            x: clientX,
            y: clientY,
            visible: true,
            city: d.city,
            category: d.category,
            value: val,
            count: d.ordersCount
          });
        }
      })
      .on('mousemove', function (event) {
        const boundingBox = containerRef.current?.getBoundingClientRect();
        if (boundingBox) {
          const clientX = event.clientX - boundingBox.left;
          const clientY = event.clientY - boundingBox.top;
          setTooltip(prev => prev ? { ...prev, x: clientX, y: clientY } : null);
        }
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .style('stroke', 'transparent')
          .style('stroke-width', 0)
          .attr('transform', 'none');

        setTooltip(null);
      })
      .transition()
      .duration(600)
      .delay((_d, i) => i * 12)
      .style('opacity', 1);

    // Render value overlays inside cells if columns are wide enough for readability
    if (x.bandwidth() > 55) {
      svg.selectAll()
        .data(points)
        .enter()
        .append('text')
        .attr('x', (d: any) => (x(d.city) || 0) + x.bandwidth() / 2)
        .attr('y', (d: any) => (y(d.category) || 0) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('class', 'font-mono text-[9px] font-black select-none pointer-events-none')
        .style('fill', (d: any) => {
          const val = valueAccessor(d);
          if (val === 0) return 'transparent';
          
          // dynamic text-color high-contrast calculation based on color intensity
          const ratio = val / maxVal;
          if (isDark) {
            return ratio > 0.6 ? '#09090b' : '#38bdf8';
          } else {
            return ratio > 0.5 ? '#ffffff' : '#1e3a8a';
          }
        })
        .text((d: any) => {
          const val = valueAccessor(d);
          if (val === 0) return '';
          if (metric === 'revenue') {
            if (val >= 100000) return `${(val / 1000).toFixed(0)}k`;
            return `${(val / 1000).toFixed(1)}k`;
          }
          return `${val} u`;
        });
    }

  }, [aggregatedData, dimensions, metric]);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950 shadow-sm relative space-y-5">
      
      {/* Heatmap header metrics switches */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            D3-Based Regional Sales Heatmap
          </h4>
          <p className="font-sans text-[10px] text-zinc-400 dark:text-zinc-500">
            Cross-referencing product category metrics against regional logistic cities.
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start sm:self-auto border border-zinc-200/50 dark:border-zinc-800">
          <button
            onClick={() => setMetric('revenue')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'revenue' 
                ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Landmark className="h-3 w-3" />
            <span>Revenue (₹)</span>
          </button>
          <button
            onClick={() => setMetric('units')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'units' 
                ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Sliders className="h-3 w-3" />
            <span>Units Sold</span>
          </button>
        </div>
      </div>

      {/* SVG Container Stage */}
      <div 
        ref={containerRef} 
        className="w-full overflow-hidden select-none relative"
      >
        <svg 
          ref={svgRef} 
          className="mx-auto block overflow-visible"
        />

        {/* HTML Based custom styled absolute tooltips */}
        {tooltip && tooltip.visible && (
          <div 
            style={{ 
              left: `${tooltip.x + 15}px`, 
              top: `${tooltip.y - 10}px`,
              pointerEvents: 'none'
            }}
            className="absolute z-25 min-w-[140px] rounded-xl border border-zinc-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 font-sans animate-fade-in text-[10px]"
          >
            <div className="font-mono text-[8px] font-black uppercase tracking-wider text-blue-600 mb-1">
              📍 Hub: {tooltip.city}
            </div>
            <div className="font-sans font-bold text-zinc-800 dark:text-zinc-150 mb-2">
              Category: {tooltip.category}
            </div>
            
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-1.5 space-y-1 font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Total Value:</span>
                <span className="font-black text-zinc-900 dark:text-white">
                  {metric === 'revenue' 
                    ? `₹${tooltip.value.toLocaleString('en-IN')}` 
                    : `${tooltip.value} units`
                  }
                </span>
              </div>
              
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Paid Orders:</span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  {tooltip.count} orders
                </span>
              </div>

              {metric === 'units' && (
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Revenue Est:</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    ₹{aggregatedData.points.find(p => p.city === tooltip.city && p.category === tooltip.category)?.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid Legend scale */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
          <span>Interactive Grid. Hover for logistics microdetails.</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Less Active</span>
          <div className="flex h-2.5 w-24 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <span className="flex-1 bg-blue-100 dark:bg-blue-950/40" />
            <span className="flex-1 bg-blue-300 dark:bg-blue-800/60" />
            <span className="flex-1 bg-blue-500 dark:bg-blue-600" />
            <span className="flex-1 bg-blue-700 dark:bg-blue-450" />
          </div>
          <span>Most Active</span>
        </div>
      </div>

    </div>
  );
}
