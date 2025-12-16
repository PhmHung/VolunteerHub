/** @format */

export const extractAllTags = (events) => {
  if (!events || !Array.isArray(events)) return [];

  const tagMap = {};

  events.forEach((event) => {
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase().trim();
        if (normalizedTag) {
          tagMap[normalizedTag] = (tagMap[normalizedTag] || 0) + 1;
        }
      });
    }

    if (event.category) {
      const normalizedCat = event.category.toLowerCase().trim();
      tagMap[normalizedCat] = (tagMap[normalizedCat] || 0) + 1;
    }
  });

  const sortedTags = Object.entries(tagMap)
    .map(([text, count]) => ({
      id: text,
      text: text.charAt(0).toUpperCase() + text.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return sortedTags.slice(0, 20);
};
