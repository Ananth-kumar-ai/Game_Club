import React, { useState, useEffect } from 'react';
import { Coins, ShoppingCart, TrendingUp } from 'lucide-react';

type Upgrade = {
  id: string;
  name: string;
  baseCost: number;
  baseIncome: number;
  count: number;
  description: string;
};

const IdleGame = () => {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('idleGameCoins');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('idleGameUpgrades');
    return saved ? JSON.parse(saved) : [
      {
        id: 'clicker',
        name: 'Auto Clicker',
        baseCost: 10,
        baseIncome: 0.1,
        count: 0,
        description: 'Automatically clicks for you'
      },
      {
        id: 'farm',
        name: 'Coin Farm',
        baseCost: 50,
        baseIncome: 0.5,
        count: 0,
        description: 'Generates coins passively'
      },
      {
        id: 'mine',
        name: 'Coin Mine',
        baseCost: 200,
        baseIncome: 2,
        count: 0,
        description: 'A large-scale coin operation'
      },
      {
        id: 'factory',
        name: 'Coin Factory',
        baseCost: 1000,
        baseIncome: 10,
        count: 0,
        description: 'Industrial-scale coin production'
      }
    ];
  });

  const [clickPower, setClickPower] = useState(() => {
    const saved = localStorage.getItem('idleGameClickPower');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('idleGameCoins', coins.toString());
      localStorage.setItem('idleGameUpgrades', JSON.stringify(upgrades));
      localStorage.setItem('idleGameClickPower', clickPower.toString());
    }, 1000);

    return () => clearInterval(saveInterval);
  }, [coins, upgrades, clickPower]);

  useEffect(() => {
    const incomeInterval = setInterval(() => {
      const income = upgrades.reduce((total, upgrade) => 
        total + (upgrade.baseIncome * upgrade.count), 0);
      setCoins(c => c + income);
    }, 1000);

    return () => clearInterval(incomeInterval);
  }, [upgrades]);

  const handleClick = () => {
    setCoins(c => c + clickPower);
  };

  const calculateUpgradeCost = (upgrade: Upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return;

    const cost = calculateUpgradeCost(upgrades[upgradeIndex]);
    if (coins >= cost) {
      setCoins(c => c - cost);
      setUpgrades(current => {
        const newUpgrades = [...current];
        newUpgrades[upgradeIndex] = {
          ...newUpgrades[upgradeIndex],
          count: newUpgrades[upgradeIndex].count + 1
        };
        return newUpgrades;
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const calculateIncome = () => {
    return upgrades.reduce((total, upgrade) => 
      total + (upgrade.baseIncome * upgrade.count), 0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-green-900 to-green-700 p-4">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Idle Clicker</h2>
          <div className="flex justify-center items-center gap-4">
            <Coins className="text-yellow-400" size={24} />
            <span className="text-2xl font-bold text-yellow-400">{formatNumber(coins)} coins</span>
          </div>
          <div className="text-gray-400 mt-2">
            Income: {formatNumber(calculateIncome())} per second
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleClick}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 transform active:scale-95"
          >
            Click for {formatNumber(clickPower)} coins
          </button>
        </div>

        <div className="grid gap-4">
          {upgrades.map(upgrade => {
            const cost = calculateUpgradeCost(upgrade);
            const canAfford = coins >= cost;
            
            return (
              <div
                key={upgrade.id}
                className={`bg-gray-700 p-4 rounded-lg ${
                  canAfford ? 'hover:bg-gray-600' : 'opacity-75'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">{upgrade.name}</h3>
                    <p className="text-gray-400 text-sm">{upgrade.description}</p>
                    <p className="text-gray-400 text-sm">
                      Producing {formatNumber(upgrade.baseIncome * upgrade.count)} coins/s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">Cost: {formatNumber(cost)}</p>
                    <p className="text-gray-400">Owned: {upgrade.count}</p>
                  </div>
                </div>
                <button
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={!canAfford}
                  className={`w-full mt-2 py-2 px-4 rounded font-bold transition-colors ${
                    canAfford
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Buy Upgrade
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IdleGame;