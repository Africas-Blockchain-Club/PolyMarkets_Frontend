"use client";
import { useContext, useEffect, useState } from "react";
import { MarketCard } from "./components/market-card";
import { CategoryScroll } from "./components/category-scroll";
import { PolyAppContext } from "./context/PolyAppContext";
import { Market } from "@/lib/types";
import { Topbar } from "./components/Topbar";
import { useActiveAccount } from "thirdweb/react";
import { Loader2 } from "lucide-react";
import Carousel from "./components/Carousel";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { readMarkets, createMarket } = useContext(PolyAppContext);
  const account = useActiveAccount();

  const _createMarket = async (question: string, expiresAt: number) => {
    try {
      if (account) {
        const market = await createMarket(question, expiresAt, account);
        console.log(market);
        const _markets = await readMarkets();
        setMarkets(_markets);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const _markets = await readMarkets();
        setMarkets(_markets);
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, [readMarkets]);

  const filteredMarkets = markets.filter(
    (market) =>
      selectedCategory === "All" || market.category === selectedCategory
  );

  return (
    <main className="">
      <Topbar createMarket={_createMarket} />
      <div className="container mx-auto py-6 px-4">
        <Carousel/>
        <CategoryScroll
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-gray-500 text-lg mb-2">
              {selectedCategory === "All"
                ? "No markets found"
                : `No markets found in ${selectedCategory}`}
            </div>
            <p className="text-gray-400 text-sm">
              {selectedCategory === "All"
                ? "Be the first to create a market!"
                : "Try selecting a different category or create a new market in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
