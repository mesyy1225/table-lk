import React, { useState, useEffect } from "react";
import { Product, getAllCategories, getAllMaterials } from "@/lib/data";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const maxPrice = Math.max(...products.map(p => p.price));
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allCategories = getAllCategories();
  const allMaterials = getAllMaterials();

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.material.toLowerCase().includes(term)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        product.categories.some((category) => selectedCategories.includes(category))
      );
    }

    if (selectedMaterials.length > 0) {
      result = result.filter((product) =>
        selectedMaterials.includes(product.material)
      );
    }

    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(result);
  }, [searchTerm, selectedCategories, selectedMaterials, priceRange, products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setPriceRange([0, maxPrice]);
  };

  return (
    <div className="w-full">
      <div className="lg:hidden mb-6 flex justify-between items-center">
        <div className="relative w-full mr-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-medium text-lg mb-4">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              {allCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Materials</h3>
            <div className="space-y-2">
              {allMaterials.map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${material}`}
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={() => handleMaterialChange(material)}
                  />
                  <Label
                    htmlFor={`material-${material}`}
                    className="text-sm cursor-pointer"
                  >
                    {material}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Price Range</h3>
            <div className="space-y-6">
              <Slider
                defaultValue={[0, maxPrice]}
                max={maxPrice}
                step={10}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mb-6"
              />
              <div className="flex items-center justify-between">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full mt-4"
          >
            Reset Filters
          </Button>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:hidden fixed inset-0 z-50 bg-background p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-medium text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label
                          htmlFor={`mobile-category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">Materials</h3>
                  <div className="space-y-2">
                    {allMaterials.map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-material-${material}`}
                          checked={selectedMaterials.includes(material)}
                          onCheckedChange={() => handleMaterialChange(material)}
                        />
                        <Label
                          htmlFor={`mobile-material-${material}`}
                          className="text-sm cursor-pointer"
                        >
                          {material}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">Price Range</h3>
                  <div className="space-y-6">
                    <Slider
                      defaultValue={[0, maxPrice]}
                      max={maxPrice}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                    Reset
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
