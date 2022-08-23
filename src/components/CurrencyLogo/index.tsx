import { ChainId, Currency } from '@fx-swap/sdk-core'
import React, { useMemo } from 'react'
import styled from 'styled-components/macro'
import FXLogo from '../../assets/images/fx-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/wrappedTokenInfo'
import Logo from '../Logo'
import { _WFX } from 'constants/tokens'

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/YP010/FXSwap-TokenList/main/Tokens/${address}/logo.png`

const StyledFXLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  ...rest
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (!currency || currency.isEther) return []

    if (currency.isToken) {
      const defaultUrls =
        currency.chainId === ChainId.FXCORE ? [getTokenLogoURL(currency.address)] : [getTokenLogoURL(_WFX.address)]
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...defaultUrls]
      }
      return defaultUrls
    }
    return []
  }, [currency, uriLocations])

  if (currency?.isEther) {
    return <StyledFXLogo src={FXLogo} size={size} style={style} {...rest} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} {...rest} />
}
