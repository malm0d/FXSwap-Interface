import { ChainId, Currency, CurrencyAmount, Price, Token } from '@fx-swap/sdk-core'
import { useMemo } from 'react'
import { USDC } from '../constants/tokens'
import { useV2TradeExactOut } from './useV2Trade'
import { useActiveWeb3React } from './web3'

// USDC amount used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const usdcCurrencyAmount = CurrencyAmount.fromRawAmount(USDC[ChainId.FXCORE], 100_000e6)

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price<Currency, Token> | undefined {
  const { chainId } = useActiveWeb3React()

  const v2USDCTrade = useV2TradeExactOut(currency, chainId === ChainId.FXCORE ? usdcCurrencyAmount : undefined, {
    maxHops: 2,
  })

  return useMemo(() => {
    if (!currency || !chainId) {
      return undefined
    }

    // return some fake price data for non-mainnet
    if (chainId !== ChainId.FXCORE && chainId !== ChainId.DHOBYGHAUT) {
      const fakeUSDC = new Token(chainId, '0xF5b24c0093b65408ACE53df7ce86a02448d53b25', 6, 'fUSDC', 'Fake USDC')
      return new Price(
        currency,
        fakeUSDC,
        10 ** Math.max(0, currency.decimals - 6),
        15 * 10 ** Math.max(6 - currency.decimals, 0)
      )
    }

    if (v2USDCTrade) {
      const { numerator, denominator } = v2USDCTrade.route.midPrice
      return new Price(currency, USDC[ChainId.FXCORE], denominator, numerator)
    }
    return undefined
  }, [chainId, currency, v2USDCTrade])
}

export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
  const price = useUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}
