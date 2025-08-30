// sample templates collection - simple HTML snippets for quick start
const TEMPLATES = [
	{
		id: 'simple-landing',
		title: 'Simple Landing',
		desc: 'Header, hero, and features section — starter landing layout.',
		html: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Simple Landing</title></head><body><header><h1>Simple Landing</h1></header><main><section><h2>Hero</h2><p>Short intro here.</p></section><section><h3>Features</h3><ul><li>Feature A</li><li>Feature B</li></ul></section></main></body></html>`
	},
	{
		id: 'blog-post',
		title: 'Blog Post',
		desc: 'Semantic blog post skeleton with author and reading-time meta.',
		html: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Blog Post</title></head><body><article><h1>Post Title</h1><p class="meta">By Author • 5 min read</p><section><p>Lead paragraph…</p></section></article></body></html>`
	}
];

document.addEventListener('DOMContentLoaded', () => {
	initTheme();
	createParticles();
	renderTemplates();
	document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});

function renderTemplates(){
	const grid = document.getElementById('templatesGrid');
	TEMPLATES.forEach(t => {
		const card = document.createElement('div'); card.className = 'template-card';
		card.innerHTML = `<h3>${t.title}</h3><p>${t.desc}</p><div class="card-actions"><button class="btn preview">Preview</button><button class="btn copy">Copy</button><button class="btn download">Download</button></div><pre class="preview-panel" style="display:none"></pre>`;
		grid.appendChild(card);

		const previewBtn = card.querySelector('.preview');
		const copyBtn = card.querySelector('.copy');
		const dlBtn = card.querySelector('.download');
		const panel = card.querySelector('.preview-panel');

		previewBtn.addEventListener('click', () => {
			panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
			panel.textContent = t.html;
		});

		copyBtn.addEventListener('click', async () => {
			try { await navigator.clipboard.writeText(t.html); copyBtn.textContent = 'Copied!'; setTimeout(()=>copyBtn.textContent='Copy',1200);} catch(e){copyBtn.textContent='Copy failed'}
		});

		dlBtn.addEventListener('click', () => {
			const blob = new Blob([t.html], {type:'text/html'});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a'); a.href = url; a.download = `${t.id}.html`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
		});
	});
}

// theme handling using shared key 'site-theme'
function initTheme(){
	const saved = localStorage.getItem('site-theme');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	if (saved === 'dark' || (!saved && prefersDark)) { document.body.classList.add('dark'); document.getElementById('theme-toggle').textContent='☀️'; }
	else { document.body.classList.remove('dark'); document.getElementById('theme-toggle').textContent='🌙'; }
}

function toggleTheme(){
	const isDark = document.body.classList.toggle('dark');
	localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
	document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
}

// listen for changes from other tabs
window.addEventListener('storage', (e)=>{ if (e.key==='site-theme'){ initTheme(); }});

// simple particle generator reused across projects
function createParticles(){
	const container = document.getElementById('particlesContainer');
	function create(){
		const p = document.createElement('div'); p.className='particle';
		const size = Math.random()*8+3; p.style.width = p.style.height = size+'px';
		p.style.left = Math.random()*100+'%'; p.style.opacity = Math.random()*0.2+0.02; p.style.animationDuration = (Math.random()*12+8)+'s';
		container.appendChild(p);
		setTimeout(()=>p.remove(), 20000);
	}
	setInterval(create, 700);
}

