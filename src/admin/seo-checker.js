/**
 * Live post preview (real site CSS) + writing checklist.
 * Built incrementally and kept deliberately simple after an earlier
 * version's cover-image/date handling silently broke the whole render.
 */

CMS.registerPreviewStyle('/css/style.css');

const CAT_LABELS = {
  musings: '✍ Musings', learnings: '💡 Learnings', movies: '🎬 Movies',
  books: '📚 Books', photos: '📷 Photos', travel: '✈ Travel', mba: '🎓 MBA',
};

// ── Checklist logic — pure functions, no Decap API calls, nothing that can throw ──
function checkTitle(title) {
  title = title || '';
  const len = title.length;
  if (!title) return { status: 'fail', msg: 'No title yet.' };
  if (len < 20) return { status: 'warn', msg: `Title is ${len} chars — a bit short. 30–60 is the sweet spot.` };
  if (len > 60) return { status: 'warn', msg: `Title is ${len} chars — search engines usually truncate past ~60.` };
  return { status: 'pass', msg: `Title length is good (${len} chars).` };
}
function checkExcerpt(excerpt) {
  excerpt = excerpt || '';
  const len = excerpt.length;
  if (!excerpt) return { status: 'fail', msg: 'No excerpt yet — this shows in search results and on the card.' };
  if (len < 50) return { status: 'warn', msg: `Excerpt is only ${len} chars — a bit thin.` };
  if (len > 160) return { status: 'warn', msg: `Excerpt is ${len} chars — usually cut off around 150–160.` };
  return { status: 'pass', msg: `Excerpt length is good (${len} chars).` };
}
function checkBody(body) {
  body = body || '';
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  if (words === 0) return [{ status: 'fail', msg: 'No body content yet.' }];
  const headings = (body.match(/^##\s+/gm) || []).length;
  const paragraphs = body.split(/\n\s*\n/).filter(p => p.trim());
  const longestPara = paragraphs.reduce((max, p) => Math.max(max, p.trim().split(/\s+/).length), 0);
  const results = [words < 150
    ? { status: 'warn', msg: `${words} words — quite short for a full post.` }
    : { status: 'pass', msg: `${words} words.` }];
  if (words > 400) {
    results.push(headings === 0
      ? { status: 'warn', msg: 'No ## headings — worth breaking this up.' }
      : { status: 'pass', msg: `${headings} heading${headings > 1 ? 's' : ''} in place.` });
  }
  if (longestPara > 100) results.push({ status: 'warn', msg: `Longest paragraph is ~${longestPara} words — reads long on mobile.` });
  return results;
}

const DOT = { pass: '#2A8A5C', warn: '#B4880A', fail: '#C43A3A' };
function renderCheck(check, key) {
  if (!check) return null;
  return h('div', { key: key, style: { display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', fontFamily: 'system-ui, sans-serif' } },
    h('span', { style: { color: DOT[check.status] } }, '●'),
    h('span', {}, check.msg)
  );
}

const PostPreview = createClass({
  render: function () {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title']) || '';
    const excerpt = entry.getIn(['data', 'excerpt']) || '';
    const body = entry.getIn(['data', 'body']) || '';
    const category = entry.getIn(['data', 'category']) || '';

    const checks = [checkTitle(title), checkExcerpt(excerpt), ...checkBody(body)];

    return h('div', {},
      h('div', { className: 'post-wrap' },
        h('div', { className: 'cat-tag' }, CAT_LABELS[category] || category || ''),
        h('h1', {}, title || 'Untitled post'),
        h('div', { className: 'post-content' }, this.props.widgetFor('body'))
      ),
      h('div', { style: { padding: '20px', borderTop: '1px solid #ddd', fontFamily: 'system-ui, sans-serif' } },
        h('div', { style: { fontSize: '15px', fontWeight: 700, marginBottom: '12px' } }, 'Writing checklist'),
        ...checks.map((c, i) => renderCheck(c, i))
      )
    );
  }
});

CMS.registerPreviewTemplate('posts', PostPreview);
