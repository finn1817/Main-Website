// Enhanced templates collection
const TEMPLATES = [
	{
		id: 'modern-landing',
		title: 'Modern Landing Page',
		category: 'landing',
		description: 'Clean, modern landing page with hero section, features, and call-to-action',
		features: ['Responsive Design', 'CSS Grid', 'Smooth Scrolling', 'Modern Typography'],
		responsive: true,
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; }
        nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; transition: opacity 0.3s; }
        .nav-links a:hover { opacity: 0.8; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 0 80px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .btn { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; transition: background 0.3s; }
        .btn:hover { background: #ff5252; }
        .features { padding: 80px 0; background: #f8f9fa; }
        .features h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .feature { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
        .feature-icon { font-size: 3rem; margin-bottom: 1rem; }
        .feature h3 { margin-bottom: 1rem; }
        footer { background: #333; color: white; text-align: center; padding: 2rem 0; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .nav-links { display: none; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">Brand</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <section class="hero" id="home">
        <div class="container">
            <h1>Welcome to the Future</h1>
            <p>Build amazing experiences with our modern, responsive design system that works everywhere.</p>
            <a href="#features" class="btn">Get Started</a>
        </div>
    </section>
    
    <section class="features" id="features">
        <div class="container">
            <h2>Why Choose Us?</h2>
            <div class="features-grid">
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Fast Performance</h3>
                    <p>Lightning-fast loading times and optimized performance for the best user experience.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h3>Mobile First</h3>
                    <p>Designed with mobile devices in mind, ensuring perfect functionality on all screen sizes.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure & Reliable</h3>
                    <p>Built with security best practices and reliable infrastructure you can trust.</p>
                </div>
            </div>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 [Your-Name]. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`
	},
	{
		id: 'simple-blog',
		title: 'Simple Blog Post',
		category: 'blog',
		description: 'Clean blog post layout with semantic HTML and readable typography',
		features: ['Semantic HTML', 'Reading Time', 'Author Info', 'Clean Typography'],
		responsive: true,
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Post</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; line-height: 1.7; color: #333; background: #fafafa; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        header { text-align: center; margin-bottom: 40px; }
        .blog-title { font-size: 2.5rem; margin-bottom: 20px; color: #2c3e50; }
        .meta { color: #7f8c8d; margin-bottom: 30px; }
        .content { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .content h1 { font-size: 2rem; margin-bottom: 20px; }
        .content p { margin-bottom: 20px; }
        .content h2 { font-size: 1.5rem; margin: 30px 0 15px; }
        .content ul { margin-left: 20px; margin-bottom: 20px; }
        .author { border-top: 1px solid #eee; padding-top: 30px; margin-top: 40px; display: flex; align-items: center; gap: 15px; }
        .author-avatar { width: 60px; height: 60px; border-radius: 50%; background: #3498db; }
        .author-info h3 { margin-bottom: 5px; }
        .author-info p { color: #7f8c8d; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1 class="blog-title">My Tech Blog</h1>
        </header>
        
        <article class="content">
            <h1>Getting Started with Modern Web Development</h1>
            <div class="meta">By Dan Finn • March 15, 2025 • 5 min read</div>
            
            <p>Web development has evolved significantly over the past few years. With new frameworks, tools, and best practices emerging constantly, it can be overwhelming for newcomers to know where to start.</p>
            
            <h2>Essential Technologies</h2>
            <p>Here are the core technologies every web developer should know:</p>
            
            <ul>
                <li><strong>HTML5:</strong> The foundation of web content</li>
                <li><strong>CSS3:</strong> Styling and layout</li>
                <li><strong>JavaScript:</strong> Interactive functionality</li>
                <li><strong>React/Vue/Angular:</strong> Modern frameworks</li>
            </ul>
            
            <h2>Best Practices</h2>
            <p>Following best practices ensures your code is maintainable, scalable, and performs well. Always write semantic HTML, use CSS methodologies like BEM, and keep your JavaScript modular.</p>
            
            <p>Remember that web development is a journey of continuous learning. Stay curious, build projects, and don't be afraid to experiment with new technologies.</p>
            
            <div class="author">
                <div class="author-avatar"></div>
                <div class="author-info">
                    <h3>John Doe</h3>
                    <p>Full-stack developer with 5+ years of experience building web applications.</p>
                </div>
            </div>
        </article>
    </div>
</body>
</html>`
	},
	{
		id: 'contact-form',
		title: 'Contact Form',
		category: 'forms',
		description: 'Professional contact form with validation and clean styling',
		features: ['Form Validation', 'Responsive Design', 'Clean Styling', 'Accessible'],
		responsive: true,
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 600px; margin: 50px auto; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        h1 { text-align: center; margin-bottom: 30px; color: #2c3e50; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; transition: border-color 0.3s; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #3498db; }
        textarea { resize: vertical; min-height: 120px; }
        .btn { background: #3498db; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background 0.3s; }
        .btn:hover { background: #2980b9; }
        .contact-info { margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; }
        .contact-item { display: flex; align-items: center; margin-bottom: 15px; }
        .contact-icon { width: 20px; margin-right: 15px; text-align: center; }
        @media (max-width: 768px) {
            .container { margin: 20px; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Contact Us</h1>
        
        <form>
            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="subject">Subject</label>
                <select id="subject" name="subject" required>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Support</option>
                    <option value="sales">Sales</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" placeholder="Your message here..." required></textarea>
            </div>
            
            <button type="submit" class="btn">Send Message</button>
        </form>
        
        <div class="contact-info">
            <h3>Other Ways to Reach Us</h3>
            <div class="contact-item">
                <span class="contact-icon">📧</span>
                <span>contact@company.com</span>
            </div>
            <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span>+1 (555) 123-4567</span>
            </div>
            <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span>123 Business St, City, State 12345</span>
            </div>
        </div>
    </div>
</body>
</html>`
	}
];

// Global variables
let filteredTemplates = [...TEMPLATES];
let currentTemplate = null;

document.addEventListener('DOMContentLoaded', () => {
	createParticles();
	renderTemplates();
	setupEventListeners();
});

function setupEventListeners() {
	// Search functionality
	document.getElementById('searchInput').addEventListener('input', handleSearch);
	document.getElementById('searchBtn').addEventListener('click', handleSearch);
	
	// Filter tabs
	document.querySelectorAll('.filter-tab').forEach(tab => {
		tab.addEventListener('click', () => handleFilter(tab.dataset.category));
	});
	
	// Modal functionality
	document.getElementById('modalOverlay').addEventListener('click', (e) => {
		if (e.target === e.currentTarget) closeModal();
	});
	document.getElementById('modalClose').addEventListener('click', closeModal);
	
	// Modal tabs
	document.querySelectorAll('.modal-tab').forEach(tab => {
		tab.addEventListener('click', () => switchModalTab(tab.dataset.tab));
	});
	
	// Modal actions
	document.getElementById('modalCopyBtn').addEventListener('click', () => copyToClipboard(currentTemplate.html));
	document.getElementById('modalDownloadBtn').addEventListener('click', () => downloadTemplate(currentTemplate));
	document.getElementById('modalPreviewNewTab').addEventListener('click', () => openInNewTab(currentTemplate.html));
	document.getElementById('copyCodeBtn').addEventListener('click', () => copyToClipboard(currentTemplate.html));
	
	// Keyboard shortcuts
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeModal();
	});
}

function renderTemplates() {
	const grid = document.getElementById('templatesGrid');
	const noResults = document.getElementById('noResults');
	
	grid.innerHTML = '';
	
	if (filteredTemplates.length === 0) {
		noResults.style.display = 'block';
		return;
	}
	
	noResults.style.display = 'none';
	
	filteredTemplates.forEach(template => {
		const card = document.createElement('div');
		card.className = 'template-card';
		card.innerHTML = `
			<div class="template-header">
				<h3>${template.title}</h3>
				<span class="template-category">${template.category}</span>
			</div>
			<p>${template.description}</p>
			<div class="template-features">
				${template.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
			</div>
			<div class="card-actions">
				<button class="btn btn-primary preview-btn">👀 Preview</button>
				<button class="btn btn-secondary copy-btn">📋 Copy</button>
				<button class="btn btn-outline download-btn">📥 Download</button>
			</div>
		`;
		
		// Add event listeners
		const previewBtn = card.querySelector('.preview-btn');
		const copyBtn = card.querySelector('.copy-btn');
		const downloadBtn = card.querySelector('.download-btn');
		
		previewBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			openModal(template);
		});
		
		copyBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			copyToClipboard(template.html, copyBtn);
		});
		
		downloadBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			downloadTemplate(template);
		});
		
		// Make entire card clickable for preview
		card.addEventListener('click', () => {
			openModal(template);
		});
		
		grid.appendChild(card);
	});
}

function handleSearch() {
	const searchTerm = document.getElementById('searchInput').value.toLowerCase();
	const activeCategory = document.querySelector('.filter-tab.active').dataset.category;
	
	filteredTemplates = TEMPLATES.filter(template => {
		const matchesSearch = searchTerm === '' || 
			template.title.toLowerCase().includes(searchTerm) ||
			template.description.toLowerCase().includes(searchTerm) ||
			template.features.some(feature => feature.toLowerCase().includes(searchTerm));
		
		const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
		
		return matchesSearch && matchesCategory;
	});
	
	renderTemplates();
}

function handleFilter(category) {
	// Update active tab
	document.querySelectorAll('.filter-tab').forEach(tab => {
		tab.classList.toggle('active', tab.dataset.category === category);
	});
	
	// Filter templates
	const searchTerm = document.getElementById('searchInput').value.toLowerCase();
	
	filteredTemplates = TEMPLATES.filter(template => {
		const matchesSearch = searchTerm === '' || 
			template.title.toLowerCase().includes(searchTerm) ||
			template.description.toLowerCase().includes(searchTerm) ||
			template.features.some(feature => feature.toLowerCase().includes(searchTerm));
		
		const matchesCategory = category === 'all' || template.category === category;
		
		return matchesSearch && matchesCategory;
	});
	
	renderTemplates();
}

function openModal(template) {
	currentTemplate = template;
	
	// Update modal content
	document.getElementById('modalTitle').textContent = template.title;
	document.getElementById('templateDescription').textContent = template.description;
	document.getElementById('templateFeatures').innerHTML = 
		template.features.map(feature => `<li>${feature}</li>`).join('');
	document.getElementById('templateResponsive').textContent = 
		template.responsive ? 'Yes, fully responsive design' : 'Desktop optimized';
	
	// Update code panel
	document.getElementById('codeContent').textContent = template.html;
	
	// Update preview
	const iframe = document.getElementById('previewFrame');
	iframe.srcdoc = template.html;
	
	// Show modal
	document.getElementById('modalOverlay').classList.add('active');
	document.body.style.overflow = 'hidden';
}

function closeModal() {
	document.getElementById('modalOverlay').classList.remove('active');
	document.body.style.overflow = '';
	currentTemplate = null;
}

function switchModalTab(tabName) {
	// Update tab buttons
	document.querySelectorAll('.modal-tab').forEach(tab => {
		tab.classList.toggle('active', tab.dataset.tab === tabName);
	});
	
	// Update tab panels
	document.querySelectorAll('.tab-panel').forEach(panel => {
		panel.classList.toggle('active', panel.id === tabName + 'Panel');
	});
}

async function copyToClipboard(text, button = null) {
	try {
		await navigator.clipboard.writeText(text);
		
		if (button) {
			const originalText = button.textContent;
			button.textContent = '✅ Copied!';
			button.style.background = '#28a745';
			setTimeout(() => {
				button.textContent = originalText;
				button.style.background = '';
			}, 2000);
		}
	} catch (err) {
		console.error('Failed to copy: ', err);
	}
}

function downloadTemplate(template) {
	const blob = new Blob([template.html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${template.id}.html`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function openInNewTab(html) {
	const newWindow = window.open();
	newWindow.document.write(html);
	newWindow.document.close();
}

// Particle system
function createParticles() {
	const container = document.getElementById('particlesContainer');
	
	function create() {
		const p = document.createElement('div');
		p.className = 'particle';
		const size = Math.random() * 8 + 3;
		p.style.width = p.style.height = size + 'px';
		p.style.left = Math.random() * 100 + '%';
		p.style.opacity = Math.random() * 0.2 + 0.02;
		p.style.animationDuration = (Math.random() * 12 + 8) + 's';
		container.appendChild(p);
		setTimeout(() => p.remove(), 20000);
	}
	
	setInterval(create, 700);
}