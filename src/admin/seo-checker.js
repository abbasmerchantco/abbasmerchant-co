/**
 * Live post preview, styled with your real site CSS.
 * Deliberately minimal — closely follows Decap's own documented
 * registerPreviewTemplate example to keep this reliable.
 */

CMS.registerPreviewStyle('/css/style.css');

const CAT_LABELS = {
  musings: '✍ Musings', learnings: '💡 Learnings', movies: '🎬 Movies',
  books: '📚 Books', photos: '📷 Photos', travel: '✈ Travel', mba: '🎓 MBA',
};

const PostPreview = createClass({
  render: function () {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title']) || 'Untitled post';
    const category = entry.getIn(['data', 'category']) || '';

    return h('div', { className: 'post-wrap' },
      h('div', { className: 'cat-tag' }, CAT_LABELS[category] || category || ''),
      h('h1', {}, title),
      h('div', { className: 'post-content' }, this.props.widgetFor('body'))
    );
  }
});

CMS.registerPreviewTemplate('posts', PostPreview);
