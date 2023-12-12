export default function (topics, slug) {
  const allTopics = topics.reduce((acc, val) => acc.concat(val.items), []);
  const index = allTopics.findIndex((t) => `/docs/${t.link}` === slug);

  const getPrevious = () => {
    if (index === 0) {
      return null;
    }
    return allTopics[index - 1];
  };

  const getNext = () => {
    if (index === allTopics.length - 1) {
      return null;
    }
    return allTopics[index + 1];
  };

  const previous = getPrevious();
  const next = getNext();
  const isInTopics = index > -1;

  return {
    previous,
    next,
    isInTopics,
  };
}
