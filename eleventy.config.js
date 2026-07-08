const categories = require("./src/_data/categories.js");

module.exports = function(eleventyConfig) {
  // Global data — accessible directly as CAT_LABELS / CAT_EMOJI in templates
  eleventyConfig.addGlobalData("CAT_LABELS", categories.CAT_LABELS);
  eleventyConfig.addGlobalData("CAT_EMOJI", categories.CAT_EMOJI);

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/css");

  // Filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return new Date(dateObj).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  });

  eleventyConfig.addFilter("isoDate", dateObj => {
    return new Date(dateObj).toISOString().split('T')[0];
  });

  // Collections
  eleventyConfig.addCollection("posts", collection => {
    return collection.getFilteredByGlob("src/posts/**/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("postsByCategory", collection => {
    const posts = collection.getFilteredByGlob("src/posts/**/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    
    const by = {};
    posts.forEach(post => {
      const cat = post.data.category || 'uncategorized';
      if (!by[cat]) by[cat] = [];
      by[cat].push(post);
    });
    return by;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes"
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
