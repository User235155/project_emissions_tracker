import { ASSET_CONFIG } from '@/data/assetConfig'
import type { AssetConfig } from '@/types/fuelEntry'

export function getAssetConfig(asset: string): AssetConfig {
  return (
    ASSET_CONFIG.find((item) => item.asset === asset) ?? {
      asset,
      label: asset,
      assetType: 'Generator',
      fuelType: 'Diesel',
      location: 'North',
    }
  )
}

export function getAssetLabel(asset: string) {
  return getAssetConfig(asset).label
}