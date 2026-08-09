/**
 * Post editor sidebar: a real visual preview (styled with your actual
 * site CSS via registerPreviewStyle) stacked above the writing checklist.
 * No external services involved — everything renders inside the CMS itself.
 */

CMS.registerPreviewStyle('/css/style.css');

// ── Writing checklist logic (unchanged from before) ──
function checkTitle(title) {
  title = title || '';
  const len = title.length;
  if (!title) return { status: 'fail', msg: 'No title yet.' };
  if (len < 20) return { status: 'warn', msg: `Title is ${len} chars — a bit short. 30–60 is the sweet spot for search results.` };
  if (len > 60) return { status: 'warn', msg: `Title is ${len} chars — search engines usually truncate past ~60.` };
  return { status: 'pass', msg: `Title length is good (${len} chars).` };
}
function checkExcerpt(excerpt) {
  excerpt = excerpt || '';
  const len = excerpt.length;
  if (!excerpt) return { status: 'fail', msg: 'No excerpt — this is what shows in search results and on the card. Add one.' };
  if (len < 50) return { status: 'warn', msg: `Excerpt is only ${len} chars — a bit thin for a search snippet.` };
  if (len > 160) return { status: 'warn', msg: `Excerpt is ${len} chars — search engines usually cut off around 150–160.` };
  return { status: 'pass', msg: `Excerpt length is good (${len} chars).` };
}
function checkBody(body) {
  body = body || '';
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const headings = (body.match(/^##\s+/gm) || []).length;
  const paragraphs = body.split(/\n\s*\n/).filter(p => p.trim());
  const longestPara = paragraphs.reduce((max, p) => Math.max(max, p.trim().split(/\s+/).length), 0);
  const results = [];
  if (words === 0) { results.push({ status: 'fail', msg: 'No body content yet.' }); return results; }
  results.push(words < 150
    ? { status: 'warn', msg: `${words} words — quite short for a full post (that's fine for a quick musing).` }
    : { status: 'pass', msg: `${words} words.` });
  if (words > 400) {
    results.push(headings === 0
      ? { status: 'warn', msg: 'No ## headings — a post this length is easier to scan with a couple of section breaks.' }
      : { status: 'pass', msg: `${headings} heading${headings > 1 ? 's' : ''} breaking up the post.` });
  }
  if (longestPara > 100) {
    results.push({ status: 'warn', msg: `Your longest paragraph is ~${longestPara} words — that reads as a wall of text on mobile. Consider breaking it up.` });
  } else if (paragraphs.length > 0) {
    results.push({ status: 'pass', msg: 'Paragraph lengths look scannable.' });
  }
  return results;
}
function checkReadTime(body, readTime) {
  body = body || '';
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const estimatedMin = Math.max(1, Math.round(words / 200));
  const statedMin = parseInt((readTime || '').match(/\d+/), 10);
  if (!readTime) return { status: 'warn', msg: `No read time set — based on word count, this is roughly a ${estimatedMin} min read.` };
  if (!isNaN(statedMin) && Math.abs(statedMin - estimatedMin) > 2) {
    return { status: 'warn', msg: `Read time says ${statedMin} min, but word count suggests closer to ${estimatedMin} min.` };
  }
  return { status: 'pass', msg: `Read time looks about right (${readTime}).` };
}
function checkTitleExcerptOverlap(title, excerpt) {
  if (!title || !excerpt) return null;
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const excerptLower = excerpt.toLowerCase();
  const overlap = titleWords.some(w => excerptLower.includes(w));
  return overlap
    ? { status: 'pass', msg: 'Excerpt reinforces the title topic.' }
    : { status: 'warn', msg: "Excerpt doesn't share any key words with the title — worth checking they're clearly about the same thing." };
}

const DOT = { pass: '#2A8A5C', warn: '#B4880A', fail: '#C43A3A' };
function renderCheck(check, key) {
  if (!check) return null;
  return h('div', { key: key, style: { display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '13px', lineHeight: '1.5', fontFamily: 'system-ui, sans-serif' } },
    h('span', { style: { color: DOT[check.status], flexShrink: 0, marginTop: '2px' } }, '●'),
    h('span', {}, check.msg)
  );
}

const CAT_LABELS = {
  musings: '✍ Musings', learnings: '💡 Learnings', movies: '🎬 Movies',
  books: '📚 Books', photos: '📷 Photos', travel: '✈ Travel', mba: '🎓 MBA',
};

const PostPreview = createClass({
  render: function () {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title'], '');
    const excerpt = entry.getIn(['data', 'excerpt'], '');
    const body = entry.getIn(['data', 'body'], '');
    const readTime = entry.getIn(['data', 'readTime'], '');
    const category = entry.getIn(['data', 'category'], '');
    const date = entry.getIn(['data', 'date'], '');
    const coverImage = entry.getIn(['data', 'coverImage'], '');

    const bodyChecks = checkBody(body);
    const allChecks = [
      checkTitle(title), checkExcerpt(excerpt), ...bodyChecks,
      checkReadTime(body, readTime), checkTitleExcerptOverlap(title, excerpt),
    ].filter(Boolean);
    const failCount = allChecks.filter(c => c.status === 'fail').length;
    const warnCount = allChecks.filter(c => c.status === 'warn').length;

    // ── Real visual preview, styled by your actual site CSS ──
    const realPreview = h('div', { className: 'post-wrap' },
      h('div', { className: `cat-tag cat-${category}` }, CAT_LABELS[category] || category || 'Uncategorized'),
      h('h1', {}, title || 'Untitled post'),
      h('div', { className: 'post-meta' },
        h('span', {}, date ? new Date(date).toDateString() : 'No date set'),
        h('span', {}, readTime || '')
      ),
      coverImage ? h('img', { className: 'post-cover', src: this.props.getAsset(coverImage).toString() }) : null,
      h('div', { className: 'post-content' }, this.props.widgetFor('body'))
    );

    // ── Checklist ──
    const checklist = h('div', { style: { fontFamily: 'system-ui, sans-serif', padding: '20px', borderTop: '1px solid #ddd', marginTop: '2rem' } },
      h('div', { style: { fontSize: '15px', fontWeight: 700, marginBottom: '4px' } }, 'Writing checklist'),
      h('div', { style: { fontSize: '12px', color: '#888', marginBottom: '16px' } },
        failCount > 0 ? `${failCount} thing${failCount > 1 ? 's' : ''} missing`
          : warnCount > 0 ? `${warnCount} worth a look` : 'Looking good'),
      ...allChecks.map((c, i) => renderCheck(c, i))
    );

    return h('div', {}, realPreview, checklist);
  }
});

CMS.registerPreviewTemplate('posts', PostPreview);
