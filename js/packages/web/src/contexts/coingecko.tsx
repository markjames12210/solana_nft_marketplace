import React, { useContext, useEffect, useState, useMemo} from 'react';

export const COINGECKO_POOL_INTERVAL = 1000 * 60; // 60 sec
export const COINGECKO_API = 'https://api.coingecko.com/api/v3/';
export const COINGECKO_COIN_PRICE_API = `${COINGECKO_API}simple/price`;
export interface CoingeckoContextState {
  solPrice: number;
  totalNFTs: number;
  updateTotalNFTs: (count: number) => void;
}

export const solToUSD = async (): Promise<number> => {
  const url = `${COINGECKO_COIN_PRICE_API}?ids=solana&vs_currencies=usd`;
  const resp = await window.fetch(url, {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*'
    }
  }).then(resp => resp.json());
  return resp.solana.usd;
};

const CoingeckoContext =
  React.createContext<CoingeckoContextState | null>(null);
export function CoingeckoProvider({ children = null as any }) {
  const [solPrice, setSolPrice] = useState<number>(0);
  const [totalNFTs, setTotalNFTs] = useState<number>(0);

  useEffect(() => {
    let timerId = 0;
    const queryPrice = async () => {
      try {
        const price = await solToUSD();
        setSolPrice(price);
        startTimer();
      } catch (e) {
        console.log('Error COINGECKO ===>');
        console.log(e);
      }
    };

    const startTimer = () => {
      timerId = window.setTimeout(async () => {
        queryPrice();
      }, COINGECKO_POOL_INTERVAL);
    };

    queryPrice();
    return () => {
      clearTimeout(timerId);
    };
  }, [setSolPrice]);

  const updateTotalNFTs = useMemo(
    () => async (count: number) => {
      console.log('=====> Total updated ', count);
      setTotalNFTs(count);
    },
    [],
  );

  return (
    <CoingeckoContext.Provider value={{ solPrice, totalNFTs, updateTotalNFTs }}>
      {children}
    </CoingeckoContext.Provider>
  );
}

export const useCoingecko = () => {
  const context = useContext(CoingeckoContext);
  return context as CoingeckoContextState;
};

export const useSolPrice = () => {
  const { solPrice } = useCoingecko();

  return solPrice;
};
