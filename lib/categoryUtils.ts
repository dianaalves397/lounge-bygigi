export const getCategoryTheme = (category: { name: string; id: string }) => {
  const fullText = (category.name + category.id).toLowerCase();
  if (fullText.includes('beach') || fullText.includes('summer')) return { theme: 'Summer', slug: 'summer' };
  if (fullText.includes('sports')) return { theme: 'Sports', slug: 'sports' };
  if (fullText.includes('lounge')) return { theme: 'Loungewear', slug: 'loungewear' };
  return { theme: 'Add-ons', slug: 'add-ons' };
};
