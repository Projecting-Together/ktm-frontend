/**
 * Home Page
 * Main landing page with hero section, search, and featured properties
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { useState, useMemo } from "react";
import { Property, SearchFilters } from "@/../../shared/types";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import Filters from "@/components/Filters";
import { sampleProperties, neighborhoods } from "@/lib/sampleData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, MapPin } from "lucide-react";

interface HomeProps {
  onSelectProperty?: (property: Property) => void;
}

export default function Home({ onSelectProperty }: HomeProps) {
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(sampleProperties);
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    listingType: "sale",
  });

  // Filter properties based on current filters
  const displayedProperties = useMemo(() => {
    return filteredProperties.filter((prop) => {
      if (prop.listingType !== listingType) return false;
      if (
        filters.minPrice !== undefined &&
        prop.price < filters.minPrice
      )
        return false;
      if (
        filters.maxPrice !== undefined &&
        prop.price > filters.maxPrice
      )
        return false;
      if (
        filters.minBedrooms !== undefined &&
        prop.bedrooms < filters.minBedrooms
      )
        return false;
      if (
        filters.maxBedrooms !== undefined &&
        prop.bedrooms > filters.maxBedrooms
      )
        return false;
      if (
        filters.minBathrooms !== undefined &&
        prop.bathrooms < filters.minBathrooms
      )
        return false;
      if (
        filters.maxBathrooms !== undefined &&
        prop.bathrooms > filters.maxBathrooms
      )
        return false;
      if (filters.furnished !== undefined && prop.furnished !== filters.furnished)
        return false;
      if (
        filters.petFriendly !== undefined &&
        prop.petFriendly !== filters.petFriendly
      )
        return false;
      return true;
    });
  }, [filteredProperties, listingType, filters]);

  const featuredProperties = sampleProperties.filter((p) => p.isFeatured);

  const handleSearch = (searchFilters: SearchFilters) => {
    setListingType(searchFilters.listingType);
    setFilters(searchFilters);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({ listingType });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">Z</span>
            </div>
            <span className="font-bold text-xl text-primary">Zillow Kathmandu</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-foreground hover:text-accent">
              Buy
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-accent">
              Rent
            </Button>
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/W7ddzvGH6cM3hq8rYL9fjJ/sandbox/6kePcjtdCcQad9xeJPtbWM-img-1_1771448213000_na1fn_aGVyby1rYXRobWFuZHUtdmFsbGV5.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVzdkZHp2R0g2Y00zaHE4cllMOWZqSi9zYW5kYm94LzZrZVBjanRkQ2NRYWQ5eGVKUHRiV00taW1nLTFfMTc3MTQ0ODIxMzAwMF9uYTFmbl9hR1Z5YnkxcllYUm9iV0Z1WkhVdGRtRnNiR1Y1LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=T6MLqvFzUYEX~mYW1LEesF4RBjqNC2~3-hKdXc0cW89sopQgyIdlei5QlPcNb0ei8ByL9a937M63JB3fKchBqZMFSRKeHAwsm6OABMjuVe-vy8j84PwYfGP0fy0fZwzGBaxkLKmApRyvtsgYy9RVUNsAkFb5ct-9S3COQpSXfnZNkct0dIhwAIGI0Va60XfEf5NjAAfzYIhK-g8u3NkG8NTLpqbEUUhuDxPmG7~LAEc~spkcBdIFet5p6hKWlXeR0s2~4EtH7I0mnzMge8ao0gKn7bgv~E~vK-sLC4Aw5OOU5E-xSM5u3JQZL176kFiTIoU8sZIawc2zTDn02o0sVA__')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <h1 className="text-5xl font-bold">Find Your Dream Home in Kathmandu</h1>
            <p className="text-xl text-white/90">
              Discover the perfect property to buy or rent
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative -mt-20 z-10 container">
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Filters
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Listing Type Tabs */}
            <Tabs
              value={listingType}
              onValueChange={(val: any) => setListingType(val)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/20">
                <TabsTrigger
                  value="sale"
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger
                  value="rent"
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  Rent
                </TabsTrigger>
              </TabsList>

              {/* Buy Tab */}
              <TabsContent value="sale" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Properties for Sale
                    </h2>
                    <p className="text-muted-foreground">
                      {displayedProperties.length} properties available
                    </p>
                  </div>
                </div>

                {displayedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={() => onSelectProperty?.(property)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No properties found matching your criteria
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Rent Tab */}
              <TabsContent value="rent" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Properties for Rent
                    </h2>
                    <p className="text-muted-foreground">
                      {displayedProperties.length} properties available
                    </p>
                  </div>
                </div>

                {displayedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={() => onSelectProperty?.(property)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No properties found matching your criteria
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Properties</h2>
            <p className="text-muted-foreground mt-2">
              Premium listings handpicked for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={() => onSelectProperty?.(property)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods Section */}
      <section className="container py-16 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Explore Neighborhoods
          </h2>
          <p className="text-muted-foreground mt-2">
            Discover the best areas in Kathmandu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {neighborhoods.map((neighborhood) => (
            <div
              key={neighborhood.id}
              className="group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-accent transition-all hover:shadow-lg"
            >
              <div className="relative h-40 overflow-hidden bg-muted">
                <img
                  src={neighborhood.image}
                  alt={neighborhood.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              </div>
              <div className="p-4 bg-card space-y-2">
                <h3 className="font-semibold text-foreground">
                  {neighborhood.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {neighborhood.description}
                </p>
                <div className="flex items-center justify-between text-xs text-accent font-medium">
                  <span>{neighborhood.properties} properties</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold text-primary-foreground">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Browse thousands of properties in Kathmandu and find the one that's right
            for you.
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
          >
            Start Searching
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">Z</span>
                </div>
                <span className="font-bold text-primary">Zillow Kathmandu</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for buying and renting properties in Kathmandu.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Buy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Neighborhoods
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">For Renters</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Rent
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Renting Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Apartments
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 Zillow Kathmandu. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
