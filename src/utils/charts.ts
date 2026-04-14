import { SERIES_COLORS } from '@/data/constants'

export function getSeriesColor(index: number) {
  return SERIES_COLORS[index % SERIES_COLORS.length]
}