// Mid-tone colors that read on both white and near-black backgrounds.
export const TAG_COLORS = ['#4a7cff', '#2f9e6b', '#e0803a', '#c5508a', '#8a5cf6', '#1fa3b8', '#c9a227', '#d14b4b']

export function pickTagColor(existingCount: number): string {
  return TAG_COLORS[existingCount % TAG_COLORS.length]
}
