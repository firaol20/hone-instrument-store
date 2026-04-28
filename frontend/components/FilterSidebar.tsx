'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  categories: { name: string; slug: string }[];
  minPrice?: number;
  maxPrice?: number;
  onCategoryChange?: (slug: string) => void;
  onPriceChange?: (min: number, max: number) => void;
  onReset?: () => void;
}

export function FilterSidebar({
  categories,
  minPrice = 0,
  maxPrice = 5000000,
  onCategoryChange,
  onPriceChange,
  onReset,
}: FilterSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [isPriceExpanded, setIsPriceExpanded] = useState(true);

  // Update local range when product boundaries change (e.g. initial load)
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? null : slug);
    onCategoryChange?.(slug);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    // Pass formatted values if necessary, but internal state handles ETB
    onPriceChange?.(values[0], values[1]);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setPriceRange([minPrice, maxPrice]);
    onReset?.();
  };

  return (
    <div className="space-y-4 sticky top-24 self-start">
      {/* Categories Filter */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer select-none"
          onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
        >
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center justify-between">
            Categories
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-0' : '-rotate-90'}`} />
          </CardTitle>
        </CardHeader>
        <AnimatePresence initial={false}>
          {isCategoriesExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <CardContent className="space-y-2.5 pt-0">
                {categories.map((category) => (
                  <div key={category.slug} className="flex items-center space-x-2 py-0.5">
                    <Checkbox
                      id={category.slug}
                      checked={selectedCategory === category.slug}
                      onCheckedChange={() => handleCategoryChange(category.slug)}
                    />
                    <Label
                      htmlFor={category.slug}
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer hover:text-orange-600 transition-colors"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Price Filter */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer select-none"
          onClick={() => setIsPriceExpanded(!isPriceExpanded)}
        >
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center justify-between">
            Price Range
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isPriceExpanded ? 'rotate-0' : '-rotate-90'}`} />
          </CardTitle>
        </CardHeader>
        <AnimatePresence initial={false}>
          {isPriceExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <CardContent className="space-y-4 pt-0">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  min={minPrice}
                  max={maxPrice}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tabular-nums">
                  <span>ETB {priceRange[0].toLocaleString()}</span>
                  <span>ETB {priceRange[1].toLocaleString()}</span>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Reset Button */}
      <Button
        onClick={handleReset}
        variant="outline"
        className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-100 transition-all rounded-xl"
      >
        Reset Filters
      </Button>
    </div>
  );
}
