const CATEGORIES = ["musings", "learnings", "movies", "books", "photos", "travel"];

module.exports = function (eleventyConfig) {
  // Static passthroughs
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  // All posts, newest first
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  // One collection per category
  CATEGORIES.forEach((cat) => {
    eleventyConfig.addCollection(cat, (api) =>
      api
        .getFilteredByGlob("src/posts/*.md")
        .filter((p) => p.data.category === cat)
        .sort((a, b) => b.date - a.date)
    );
  });

  // Featured: most recent post flagged featured, else most recent overall
  eleventyConfig.addCollection("featured", (api) => {
    const posts = api
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date);
    const flagged = posts.filter((p) => p.data.featured);
    return flagged.length ? [flagged[0]] : posts.slice(0, 1);
  });

  // Date filter: "12 June 2026"
  eleventyConfig.addFilter("niceDate", (d) => {
    return new Date(d).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  });

  // Machine-readable date for <time datetime="">
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().split("T")[0]);

  // Current year for the footer
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
