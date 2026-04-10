const COLOR_POOL = [
  '#6b1ef3', '#006a28', '#b41924', '#0066cc', '#e65100',
  '#00838f', '#6a1b9a', '#ad1457', '#2e7d32', '#1565c0',
  '#ef6c00', '#00695c', '#7b1fa2', '#c62828', '#283593',
  '#4e342e', '#37474f', '#d84315',
];

export function assignColor(index: number): string {
  return COLOR_POOL[index % COLOR_POOL.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
