import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Market } from "@/lib/types";
import { PolyAppContext } from "../context/PolyAppContext";
import Image from "next/image";
import { useActiveAccount, useConnectModal } from "thirdweb/react";
import { thirdwebClient } from "../config/client";
import { defineChain, toWei } from "thirdweb";
import { contractConfig } from "../config/contractConfig";
import { Account } from "thirdweb/wallets";
import { Skeleton } from "@/components/ui/skeleton";
import EnterAmountModal from "./enterAmountModal";
import { MarketDetailModal } from "./marketDetailsModal";
import { ToastState } from "./Toast";

const { chainId, rpc } = contractConfig;

const chain = defineChain({ id: chainId, rpc });

const IsResolved = ({
  isResolved,
  expiresAt,
}: {
  isResolved: boolean;
  expiresAt: string;
}) => {
  console.log(
    "Is Expires : ",
    parseInt(expiresAt) < Math.floor(Date.now() / 1000)
  );

  console.log("expiresAt : ", Math.floor(Date.parse(expiresAt) / 1000));
  console.log("date now : ", Math.floor(Date.now() / 1000));

  return isResolved || Date.parse(expiresAt) < Date.now() ? (
    <div className="px-3 py-1 rounded bg-red-400/10 text-red-400 hover:bg-red-400/20 w-min text-xs">
      Resolved
    </div>
  ) : (
    <div className="px-3 py-1 rounded bg-green-400/10 text-green-400 hover:bg-green-400/20 w-min text-xs">
      Open
    </div>
  );
};

interface MarketCardProps {
  market: Market;
  isLoading?: boolean;
  setToastState: React.Dispatch<React.SetStateAction<ToastState>>;
}

// market card
export function MarketCard({ market, setToastState }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { placeBet, getMarket } = React.useContext(PolyAppContext);
  const [currentMarket, setCurrentMarket] = useState<Market>(market);
  const [isLoadingVote, setIsLoadingVote] = useState<boolean>(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState<boolean>(false);
  const [vote, setVoting] = useState<boolean>(true);
  const { connect } = useConnectModal();
  const [account, setAccount] = useState<Account | undefined>(
    useActiveAccount()
  );

  // const [toastState, setToastState] = useState<ToastState>({
  //   show: false,
  //   message: "",
  //   isSuccess: false,
  // });

  const showToast = (message: string, isSuccess: boolean) => {
    setToastState({
      show: true,
      message,
      isSuccess,
    });

    setTimeout(() => {
      setToastState((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const closeEnterAmountModal = (): void => {
    setIsAmountModalOpen(false);
  };

  const openEnterAmountModal = ({ vote }: { vote: boolean }) => {
    setVoting(vote);
    setIsAmountModalOpen(true);
  };

  const _placeBet = async ({
    marketId,
    vote,
    amount,
  }: {
    marketId: bigint;
    vote: boolean;
    amount: bigint;
  }) => {
    if (!account) {
      try {
        const wallet = await connect({
          client: thirdwebClient,
          accountAbstraction: {
            chain,
            sponsorGas: true,
          },
        });
        console.log("connected to : ", wallet);
        setAccount(wallet.getAccount());
      } catch (error) {
        console.log(error);
      }
    }

    if (account) {
      await placeBet({ marketId, vote, amount, account });
      const _market = await getMarket({ marketId: parseInt(market.id) });
      setCurrentMarket(_market);
    }
  };

  const LoadingCard = () => (
    <Card className="bg-[#1e262f] border-gray-800">
      <div className="flex justify-end pt-4 pr-4">
        <Skeleton className="w-16 h-6 rounded" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-7 w-16 rounded" />
          </div>
        </div>
      </div>
    </Card>
  );

  if (isLoadingVote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <LoadingCard />
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer"
      >
        <Card className="bg-[#1e262f] border-gray-800 hover:bg-[#232a34] transition-colors">
          <div className="flex justify-end pt-4 pr-4">
            <IsResolved
              isResolved={currentMarket.resolved}
              expiresAt={market.expiresAt}
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {currentMarket.icon && (
                  <Image
                    height={8}
                    width={8}
                    src={currentMarket.icon}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <h3
                  onClick={() => setIsModalOpen(true)}
                  className="font-bold text-md hover:underline"
                >
                  {currentMarket.question}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Yes</span>
                  <span className="text-sm font-medium text-green-400">
                    {currentMarket.yesPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-green-400/50"
                    style={{ width: `${currentMarket.yesPercentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">No</span>
                  <span className="text-sm font-medium text-red-400">
                    {currentMarket.noPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-red-400/50"
                    style={{ width: `${currentMarket.noPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-300">
                  Vol • {currentMarket.volume} Uzar
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={async () => {
                    openEnterAmountModal({ vote: true });
                  }}
                  disabled={isLoadingVote}
                  className={`px-3 py-1 rounded ${
                    isLoadingVote
                      ? "bg-gray-400/10 text-gray-400 cursor-not-allowed"
                      : "bg-green-400/10 text-green-400 hover:bg-green-400/20"
                  }`}
                >
                  {isLoadingVote ? "Loading..." : "Buy Yes"}
                </button>
                <button
                  onClick={async () => {
                    openEnterAmountModal({ vote: false });
                  }}
                  disabled={isLoadingVote}
                  className={`px-3 py-1 rounded ${
                    isLoadingVote
                      ? "bg-gray-400/10 text-gray-400 cursor-not-allowed"
                      : "bg-red-400/10 text-red-400 hover:bg-red-400/20"
                  }`}
                >
                  {isLoadingVote ? "Loading..." : "Buy No"}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <EnterAmountModal
        isOpen={isAmountModalOpen}
        title="Enter Amount"
        description="Please enter the amount you wish to proceed with."
        onConfirm={async ({ amount }: { amount: string }) => {
          setIsLoadingVote(true);
          _placeBet({
            marketId: BigInt(currentMarket.id),
            vote,
            amount: toWei(amount),
          })
            .then(() => {
              console.log("successfully placed bet");

              showToast("Market created successfully", true);
            })
            .catch((error) => {
              console.log("failed to place bet : ", error);

              showToast(error.message, false);
            })
            .finally(() => {
              setIsLoadingVote(false);
            });
        }}
        toggle={closeEnterAmountModal}
        cancelButtonText="Cancel"
        confirmButtonText="Place Bet"
      />

      <MarketDetailModal
        market={currentMarket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoadingVote}
        onPlaceBet={(vote: boolean) => {
          openEnterAmountModal({ vote });
        }}
      />
    </>
  );
}
