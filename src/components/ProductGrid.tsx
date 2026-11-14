import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { RevealGroup, RevealItem } from "./motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductGridProps {
  products: Product[];
}

type Option = { key: string; label: string; count: number };
type SortKey = "default" | "price-asc" | "price-desc" | "name";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

/** How many categories the desktop sidebar lists before "Show all". */
const CATEGORY_LIMIT = 8;

/**
 * The data spells the same category several ways ("office", "Office"). Everything is matched on
 * this key and shown in sentence case, so the list has one entry per category. The data is untouched.
 */
const keyOf = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
const sentenceCase = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const buildOptions = (
  products: Product[],
  pick: (p: Product) => string[],
  label: (key: string, original: string) => string,
): Option[] => {
  const found = new Map<string, Option>();
  products.forEach((product) => {
    const seen = new Set<string>();
    pick(product).forEach((raw) => {
      const key = keyOf(raw || "");
      if (!key || seen.has(key)) return;
      seen.add(key);
      const option = found.get(key);
      if (option) option.count += 1;
      else found.set(key, { key, label: label(key, raw.trim()), count: 1 });
    });
  });
  return Array.from(found.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const toggle = (list: string[], key: string) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

/** Two-handle price slider. The filter is applied when a handle is released, so the grid does not flicker while dragging. */
const PriceSlider: React.FC<{
  value: [number, number];
  max: number;
  onChange: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
}> = ({ value, max, onChange, onCommit }) => (
  <SliderPrimitive.Root
    data-vaul-no-drag
    className="relative flex h-11 w-full touch-none select-none items-center"
    min={0}
    max={max}
    step={100}
    minStepsBetweenThumbs={1}
    value={value}
    onValueChange={(v) => onChange(v as [number, number])}
    onValueCommit={(v) => onCommit(v as [number, number])}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-ink/15">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-ink" />
    </SliderPrimitive.Track>
    {["Lowest price", "Highest price"].map((name) => (
      <SliderPrimitive.Thumb
        key={name}
        aria-label={name}
        className="relative block h-6 w-6 cursor-grab rounded-full border-2 border-ink bg-white shadow-chip transition-transform duration-300 ease-out-expo after:absolute after:-inset-2.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teak-deep focus-visible:ring-offset-2 active:scale-110 active:cursor-grabbing"
      />
    ))}
  </SliderPrimitive.Root>
);

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0;
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [appliedPrice, setAppliedPrice] = useState<[number, number]>([0, maxPrice]);
  const [sort, setSort] = useState<SortKey>("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const categoryOptions = useMemo(() => buildOptions(products, (p) => p.categories ?? [], (key) => sentenceCase(key)), [products]);
  const materialOptions = useMemo(() => buildOptions(products, (p) => [p.material], (_key, original) => original), [products]);
  const categoryKeys = categoryOptions.map((o) => o.key).join("|");

  // Keep the price filter in sync when the product list (and so the max price) changes.
  useEffect(() => {
    setPriceRange([0, maxPrice]);
    setAppliedPrice([0, maxPrice]);
  }, [maxPrice]);

  // Typing filters after a short pause, so the grid's entrance does not restart on every key.
  useEffect(() => {
    const id = window.setTimeout(() => setAppliedSearch(searchTerm), 220);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  // "/shop?category=office" opens the shop with that category ticked (any letter case).
  useEffect(() => {
    if (!categoryParam) return;
    const key = keyOf(categoryParam);
    if (categoryKeys.split("|").includes(key)) setSelectedCategories([key]);
  }, [categoryParam, categoryKeys]);

  // Once the visitor changes the categories by hand, the link's category no longer describes the page.
  const dropCategoryParam = () => {
    if (!searchParams.has("category")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    setSearchParams(next, { replace: true });
  };

  const priceActive = appliedPrice[0] > 0 || appliedPrice[1] < maxPrice;
  const activeFilterCount = selectedCategories.length + selectedMaterials.length + (priceActive ? 1 : 0);
  const anythingActive = activeFilterCount > 0 || appliedSearch.trim() !== "";

  const filteredProducts = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();
    const result = products.filter((product) => {
      if (
        term &&
        !(
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.material.toLowerCase().includes(term)
        )
      )
        return false;
      if (selectedCategories.length > 0 && !product.categories.some((c) => selectedCategories.includes(keyOf(c)))) return false;
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(keyOf(product.material))) return false;
      return product.price >= appliedPrice[0] && product.price <= appliedPrice[1];
    });
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, appliedSearch, selectedCategories, selectedMaterials, appliedPrice, sort]);

  // A new set (or order) of results gets a fresh staggered entrance; the same set stays put.
  const resultKey = filteredProducts.map((p) => p.id).join(",");

  const handleCategoryChange = (key: string) => {
    dropCategoryParam();
    setSelectedCategories((prev) => toggle(prev, key));
  };

  const handleMaterialChange = (key: string) => setSelectedMaterials((prev) => toggle(prev, key));

  const resetPrice = () => {
    setPriceRange([0, maxPrice]);
    setAppliedPrice([0, maxPrice]);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
  };

  const handleResetFilters = () => {
    dropCategoryParam();
    clearSearch();
    setSelectedCategories([]);
    setSelectedMaterials([]);
    resetPrice();
  };

  const labelFor = (options: Option[], key: string) => options.find((o) => o.key === key)?.label ?? sentenceCase(key);

  const chips: { id: string; label: string; remove: () => void }[] = [
    ...(appliedSearch.trim() ? [{ id: "search", label: `“${appliedSearch.trim()}”`, remove: clearSearch }] : []),
    ...selectedCategories.map((key) => ({
      id: `category-${key}`,
      label: labelFor(categoryOptions, key),
      remove: () => handleCategoryChange(key),
    })),
    ...selectedMaterials.map((key) => ({
      id: `material-${key}`,
      label: labelFor(materialOptions, key),
      remove: () => handleMaterialChange(key),
    })),
    ...(priceActive
      ? [{ id: "price", label: `${formatPrice(appliedPrice[0])} to ${formatPrice(appliedPrice[1])}`, remove: resetPrice }]
      : []),
  ];

  const checkRow = (id: string, option: Option, checked: boolean, onChange: () => void) => (
    <li key={option.key}>
      <label htmlFor={id} className="group/row flex min-h-11 cursor-pointer items-center gap-3 lg:min-h-10">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          className="h-5 w-5 rounded-[5px] border-ink/35 bg-board transition-colors duration-300 group-hover/row:border-ink data-[state=checked]:border-ink"
        />
        <span className={cn("flex-1 text-[0.9375rem] leading-snug", checked && "font-semibold")}>{option.label}</span>
        <span className="num text-sm text-steel">{option.count}</span>
      </label>
    </li>
  );

  /** The filter groups, used by the desktop sidebar and the phone drawer. */
  const filterFields = (prefix: string, collapseCategories: boolean) => {
    const visibleCategories =
      collapseCategories && !showAllCategories && categoryOptions.length > CATEGORY_LIMIT
        ? categoryOptions.filter((o, i) => i < CATEGORY_LIMIT || selectedCategories.includes(o.key))
        : categoryOptions;
    return (
      <div className="divide-y divide-ink/10">
        {categoryOptions.length > 0 && (
          <fieldset className="pb-5">
            <legend className="label mb-2 text-steel">Category</legend>
            <ul>
              {visibleCategories.map((o) =>
                checkRow(`${prefix}-category-${o.key}`, o, selectedCategories.includes(o.key), () => handleCategoryChange(o.key)),
              )}
            </ul>
            {collapseCategories && categoryOptions.length > CATEGORY_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllCategories((v) => !v)}
                aria-expanded={showAllCategories}
                className="link-draw mt-2 text-sm font-semibold"
              >
                {showAllCategories ? "Show fewer" : `Show all ${categoryOptions.length}`}
              </button>
            )}
          </fieldset>
        )}

        {materialOptions.length > 1 && (
          <fieldset className="py-5">
            <legend className="label mb-2 text-steel">Material</legend>
            <ul>
              {materialOptions.map((o) =>
                checkRow(`${prefix}-material-${o.key}`, o, selectedMaterials.includes(o.key), () => handleMaterialChange(o.key)),
              )}
            </ul>
          </fieldset>
        )}

        {maxPrice > 0 && (
          <fieldset className="pt-5">
            <legend className="label mb-1 text-steel">Price</legend>
            <div className="px-0.5">
              <PriceSlider value={priceRange} max={maxPrice} onChange={setPriceRange} onCommit={setAppliedPrice} />
            </div>
            <div className="num flex items-center justify-between text-sm font-medium">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </fieldset>
        )}
      </div>
    );
  };

  const total = products.length;
  const shown = filteredProducts.length;
  const countText = shown === total ? `${total} table${total === 1 ? "" : "s"}` : `${shown} of ${total} tables`;

  return (
    <div className="w-full lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16">
      {/* Desktop filters: sticks under the header (top-header), never beneath it. */}
      <aside aria-label="Filters" className="hidden lg:sticky lg:top-header lg:block lg:self-start">
        <div className="mb-4 flex h-12 items-center justify-between border-b border-ink/15">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">Filters</h2>
          {activeFilterCount > 0 && (
            <button type="button" onClick={handleResetFilters} className="link-draw text-sm font-semibold text-teak-deep">
              Clear all
            </button>
          )}
        </div>
        {filterFields("side", true)}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="num order-last text-[0.9375rem] font-medium text-steel lg:order-first" role="status" aria-live="polite">
            {countText}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden="true" />
              <Input
                type="search"
                enterKeyHint="search"
                placeholder="Search tables"
                aria-label="Search tables"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isFilterOpen}
                aria-label={activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : "Filters"}
                className="h-12 flex-1 bg-board px-5 text-[0.9375rem] sm:flex-none lg:hidden"
              >
                <SlidersHorizontal aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="num flex h-5 min-w-5 items-center justify-center rounded-full bg-teak px-1.5 text-xs font-bold leading-none text-ink">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger aria-label="Sort tables" className="min-w-0 flex-1 text-[0.9375rem] sm:w-52 sm:flex-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="rounded-lg py-2.5 text-[0.9375rem]">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <ul aria-label="Active filters" className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <li key={chip.id}>
                <button
                  type="button"
                  onClick={chip.remove}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="group/chip relative inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/20 bg-board pl-3.5 pr-2.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-expo after:absolute after:-inset-y-1 after:inset-x-0 hover:border-ink hover:bg-ink hover:text-white active:scale-[0.96]"
                >
                  <span className="num">{chip.label}</span>
                  <X className="h-3.5 w-3.5 opacity-60 transition-opacity duration-300 group-hover/chip:opacity-100" aria-hidden="true" />
                </button>
              </li>
            ))}
            {chips.length > 1 && (
              <li>
                <button type="button" onClick={handleResetFilters} className="link-draw ml-1.5 text-sm font-semibold text-teak-deep">
                  Clear all
                </button>
              </li>
            )}
          </ul>
        )}

        <div className="mt-6 border-t border-ink/10 pt-6 md:mt-7 md:pt-8">
          {shown === 0 ? (
            <div className="mx-auto max-w-md py-12 text-center md:py-20">
              <h2 className="display-md">No tables match</h2>
              <p className="mt-3 text-steel">
                {anythingActive
                  ? "Nothing in the catalogue fits that search and those filters. Clear them to see every table, or set your own size in the designer."
                  : "The catalogue is empty right now. Message us and we will build the table you need."}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {anythingActive && <Button onClick={handleResetFilters}>Clear filters</Button>}
                <Link to="/design" className="link-draw font-semibold">
                  Design a table
                </Link>
              </div>
            </div>
          ) : (
            <RevealGroup
              key={resultKey}
              stagger={0.05}
              className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-12"
            >
              {filteredProducts.map((product) => (
                <RevealItem key={product.id}>
                  <ProductCard product={product} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>

      {/* Phone and tablet filters: a bottom sheet that can be dragged down to close. */}
      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen} shouldScaleBackground={false}>
        <DrawerContent className="max-h-[88dvh] rounded-t-2xl border-ink/10 bg-ash lg:hidden">
          <DrawerHeader className="flex items-center justify-between px-5 pb-1 pt-3 text-left">
            <div>
              <DrawerTitle className="font-display text-xl font-semibold tracking-[-0.01em]">Filters</DrawerTitle>
              <DrawerDescription className="num mt-1 text-sm text-steel">{countText}</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close filters"
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 hover:bg-ink/[0.07] active:scale-95"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-3">
            {filterFields("sheet", false)}
          </div>

          {/* The right edge stays clear for the chat bubble, which floats above every overlay. */}
          <DrawerFooter className="flex-row gap-3 border-t border-ink/10 py-3 pl-5 pr-[4.75rem] pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              disabled={!anythingActive}
              className="h-12 flex-none px-5 text-[0.9375rem]"
            >
              Clear
            </Button>
            <Button type="button" onClick={() => setIsFilterOpen(false)} className="num h-12 min-w-0 flex-1 px-4 text-[0.9375rem]">
              {shown === 0 ? "No tables match" : `Show ${shown} table${shown === 1 ? "" : "s"}`}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProductGrid;
