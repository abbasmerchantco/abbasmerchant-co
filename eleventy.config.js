module.exports = function(eleventyConfig) {
  // Syntax highlighting
  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
  eleventyConfig.addPlugin(syntaxHighlight);

  // Pass through copy
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // Collections: all posts
  eleventyConfig.addCollection("posts", function(collection) {
    return collection
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Collections: published posts only (excludes unpublished)
  eleventyConfig.addCollection("publishedPosts", function(collection) {
    return collection
      .getFilteredByGlob("src/posts/*.md")
      .filter(post => post.data.published !== false)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Collections: posts by category (published only)
  eleventyConfig.addCollection("postsByCategory", function(collection) {
    const posts = collection
      .getFilteredByGlob("src/posts/*.md")
      .filter(post => post.data.published !== false);

    const categories = {};
    posts.forEach(post => {
      const cat = post.data.category || "uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(post);
    });

    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    });

    return categories;
  });

  // Filters
  eleventyConfig.addFilter("isoDate", (date) => {
    return new Date(date).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  return {
    dir: {
      input: "src",
      output: "_site",
      layouts: "_includes",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
