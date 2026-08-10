const categories = require("./src/_data/categories.js");

module.exports = function(eleventyConfig) {
  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addGlobalData("CAT_LABELS", categories.CAT_LABELS);
  eleventyConfig.addGlobalData("CAT_EMOJI", categories.CAT_EMOJI);

  eleventyConfig.addCollection("publishedPosts", function(collection) {
    return collection.getFilteredByGlob("src/posts/*.md")
      .filter(post => post.data.published !== false)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .sort((a, b) => (b.data.featured === true) - (a.data.featured === true));
  });

  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().split("T")[0]);
  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-AU", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
  );
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("rfc822", (date) => new Date(date).toUTCString());
  eleventyConfig.addFilter("safeCdata", (html) => (html || "").split("]]>").join("]]]]><![CDATA[>"));
  eleventyConfig.addFilter("commentsFor", (commentsData, slug) => {
    if (!commentsData || !slug) return [];
    const bucket = commentsData[slug];
    if (!bucket) return [];
    return Object.values(bucket)
      .filter(c => c && c.name && c.comment)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  });
  return { dir: { input: "src", output: "_site", layouts: "_includes" }, markdownTemplateEngine: "njk", htmlTemplateEngine: "njk" };
};
