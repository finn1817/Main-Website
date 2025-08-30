// Enhanced templates collection with comprehensive examples
const TEMPLATES = [
	{
		id: 'modern-landing',
		title: 'Modern Landing Page',
		category: 'landing',
		description: 'Clean, modern landing page with hero section, features, and call-to-action',
		features: ['Responsive Design', 'CSS Grid', 'Smooth Scrolling', 'Modern Typography'],
		responsive: true,
		styling: 'Embedded CSS with CSS Grid and Flexbox',
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
            <p>&copy; 2024 Brand. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`
	},
	{
		id: 'portfolio-showcase',
		title: 'Portfolio Showcase',
		category: 'portfolio',
		description: 'Professional portfolio template with project gallery and contact form',
		features: ['CSS Grid Gallery', 'Smooth Animations', 'Contact Form', 'About Section'],
		responsive: true,
		styling: 'Modern CSS with animations and grid layout',
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Showcase</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #2c3e50; color: white; padding: 2rem 0; text-align: center; }
        .profile-img { width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 1rem; background: #34495e; }
        .about { padding: 4rem 0; background: #ecf0f1; }
        .about-content { display: grid; grid-template-columns: 1fr 2fr; gap: 3rem; align-items: center; }
        .portfolio { padding: 4rem 0; }
        .portfolio h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .project { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .project:hover { transform: translateY(-5px); }
        .project-img { height: 200px; background: linear-gradient(45deg, #3498db, #9b59b6); }
        .project-content { padding: 1.5rem; }
        .project h3 { margin-bottom: 0.5rem; }
        .project-tags { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .tag { background: #3498db; color: white; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem; }
        .contact { padding: 4rem 0; background: #2c3e50; color: white; }
        .contact-form { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; }
        .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: none; border-radius: 5px; }
        .btn { background: #e74c3c; color: white; padding: 0.75rem 2rem; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #c0392b; }
        @media (max-width: 768px) {
            .about-content { grid-template-columns: 1fr; text-align: center; }
            .projects-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="profile-img"></div>
            <h1>John Doe</h1>
            <p>Full Stack Developer & Designer</p>
        </div>
    </header>
    
    <section class="about">
        <div class="container">
            <div class="about-content">
                <div>
                    <h2>About Me</h2>
                    <p>I'm a passionate developer with 5+ years of experience creating digital solutions that make a difference. I love working with modern technologies and turning ideas into reality.</p>
                </div>
                <div>
                    <h3>Skills</h3>
                    <ul>
                        <li>JavaScript, React, Node.js</li>
                        <li>Python, Django, Flask</li>
                        <li>HTML5, CSS3, SASS</li>
                        <li>MongoDB, PostgreSQL</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
    
    <section class="portfolio">
        <div class="container">
            <h2>My Projects</h2>
            <div class="projects-grid">
                <div class="project">
                    <div class="project-img"></div>
                    <div class="project-content">
                        <h3>E-commerce Platform</h3>
                        <p>Full-featured online store with payment integration and admin dashboard.</p>
                        <div class="project-tags">
                            <span class="tag">React</span>
                            <span class="tag">Node.js</span>
                            <span class="tag">MongoDB</span>
                        </div>
                    </div>
                </div>
                <div class="project">
                    <div class="project-img"></div>
                    <div class="project-content">
                        <h3>Task Management App</h3>
                        <p>Collaborative task management tool with real-time updates and team features.</p>
                        <div class="project-tags">
                            <span class="tag">Vue.js</span>
                            <span class="tag">Firebase</span>
                            <span class="tag">PWA</span>
                        </div>
                    </div>
                </div>
                <div class="project">
                    <div class="project-img"></div>
                    <div class="project-content">
                        <h3>Weather Dashboard</h3>
                        <p>Beautiful weather application with forecasts and location-based services.</p>
                        <div class="project-tags">
                            <span class="tag">JavaScript</span>
                            <span class="tag">API</span>
                            <span class="tag">CSS3</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section class="contact">
        <div class="container">
            <h2 style="text-align: center; margin-bottom: 2rem;">Get In Touch</h2>
            <form class="contact-form">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn">Send Message</button>
            </form>
        </div>
    </section>
</body>
</html>`
	},
	{
		id: 'business-card',
		title: 'Business Landing',
		category: 'business',
		description: 'Professional business landing page with services and testimonials',
		features: ['Service Cards', 'Testimonials', 'Contact Info', 'Professional Design'],
		responsive: true,
		styling: 'Corporate styling with professional color scheme',
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #1a365d; color: white; padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; }
        nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .hero { background: linear-gradient(rgba(26, 54, 93, 0.8), rgba(26, 54, 93, 0.8)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23f0f0f0" width="1200" height="600"/></svg>'); color: white; padding: 120px 0 80px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .btn { display: inline-block; background: #e53e3e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; transition: all 0.3s; }
        .btn:hover { background: #c53030; transform: translateY(-2px); }
        .services { padding: 80px 0; }
        .services h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .service { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; border-top: 4px solid #1a365d; }
        .service-icon { font-size: 3rem; margin-bottom: 1rem; color: #1a365d; }
        .testimonials { padding: 80px 0; background: #f7fafc; }
        .testimonials h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; }
        .testimonial { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .testimonial-text { font-style: italic; margin-bottom: 1rem; }
        .testimonial-author { font-weight: bold; color: #1a365d; }
        .contact-info { padding: 80px 0; background: #1a365d; color: white; text-align: center; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .contact-item { padding: 1rem; }
        .contact-icon { font-size: 2rem; margin-bottom: 1rem; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .services-grid { grid-template-columns: 1fr; }
            .contact-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">BusinessPro</div>
            <div>
                <a href="#services" style="color: white; text-decoration: none; margin-right: 2rem;">Services</a>
                <a href="#contact" style="color: white; text-decoration: none;">Contact</a>
            </div>
        </nav>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>Professional Business Solutions</h1>
            <p>We help businesses grow with innovative strategies and cutting-edge technology solutions.</p>
            <a href="#services" class="btn">Our Services</a>
        </div>
    </section>
    
    <section class="services" id="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service">
                    <div class="service-icon">💼</div>
                    <h3>Business Consulting</h3>
                    <p>Strategic planning and business optimization to help your company reach its full potential.</p>
                </div>
                <div class="service">
                    <div class="service-icon">🚀</div>
                    <h3>Digital Marketing</h3>
                    <p>Comprehensive digital marketing strategies to boost your online presence and drive growth.</p>
                </div>
                <div class="service">
                    <div class="service-icon">⚙️</div>
                    <h3>Technology Solutions</h3>
                    <p>Custom software development and IT infrastructure to streamline your operations.</p>
                </div>
            </div>
        </div>
    </section>
    
    <section class="testimonials">
        <div class="container">
            <h2>What Our Clients Say</h2>
            <div class="testimonial">
                <div class="testimonial-text">"BusinessPro transformed our operations and increased our efficiency by 40%. Highly recommended!"</div>
                <div class="testimonial-author">- Sarah Johnson, CEO of TechStart</div>
            </div>
            <div class="testimonial">
                <div class="testimonial-text">"Their digital marketing expertise helped us triple our online sales in just 6 months."</div>
                <div class="testimonial-author">- Mike Chen, Marketing Director</div>
            </div>
        </div>
    </section>
    
    <section class="contact-info" id="contact">
        <div class="container">
            <h2>Get In Touch</h2>
            <div class="contact-grid">
                <div class="contact-item">
                    <div class="contact-icon">📧</div>
                    <h3>Email</h3>
                    <p>contact@businesspro.com</p>
                </div>
                <div class="contact-item">
                    <div class="contact-icon">📞</div>
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                </div>
                <div class="contact-item">
                    <div class="contact-icon">📍</div>
                    <h3>Office</h3>
                    <p>123 Business Ave, Suite 100<br>City, State 12345</p>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
	},
	{
		id: 'blog-template',
		title: 'Blog Template',
		category: 'blog',
		description: 'Clean blog layout with article list and reading experience optimized design',
		features: ['Article Layout', 'Reading Time', 'Tags System', 'Responsive Typography'],
		responsive: true,
		styling: 'Typography-focused design with optimal reading experience',
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Blog</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; line-height: 1.7; color: #333; background: #fafafa; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        header { background: white; padding: 2rem 0; border-bottom: 1px solid #e2e8f0; }
        .blog-title { text-align: center; font-size: 2.5rem; color: #2d3748; margin-bottom: 0.5rem; }
        .blog-subtitle { text-align: center; color: #718096; }
        .article { background: white; margin: 2rem 0; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .article-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; color: #718096; font-size: 0.9rem; }
        .article-title { font-size: 1.8rem; margin-bottom: 1rem; color: #2d3748; }
        .article-title a { color: inherit; text-decoration: none; }
        .article-title a:hover { color: #3182ce; }
        .article-excerpt { margin-bottom: 1rem; color: #4a5568; }
        .article-tags { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .tag { background: #e2e8f0; color: #4a5568; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; text-decoration: none; }
        .tag:hover { background: #cbd5e0; }
        .read-more { color: #3182ce; text-decoration: none; font-weight: bold; }
        .read-more:hover { text-decoration: underline; }
        .sidebar { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 2rem; }
        .sidebar h3 { margin-bottom: 1rem; color: #2d3748; }
        .sidebar ul { list-style: none; }
        .sidebar li { margin-bottom: 0.5rem; }
        .sidebar a { color: #4a5568; text-decoration: none; }
        .sidebar a:hover { color: #3182ce; }
        .main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        @media (max-width: 768px) {
            .main-content { grid-template-columns: 1fr; }
            .article-meta { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1 class="blog-title">Tech Insights</h1>
            <p class="blog-subtitle">Exploring the latest in technology and development</p>
        </div>
    </header>
    
    <main class="container">
        <div class="main-content">
            <div class="articles">
                <article class="article">
                    <div class="article-meta">
                        <span>By John Doe • March 15, 2024</span>
                        <span>5 min read</span>
                    </div>
                    <h2 class="article-title">
                        <a href="#">The Future of Web Development: Trends to Watch in 2024</a>
                    </h2>
                    <p class="article-excerpt">
                        As we move into 2024, the web development landscape continues to evolve at a rapid pace. From new frameworks to emerging technologies, developers need to stay ahead of the curve to remain competitive...
                    </p>
                    <div class="article-tags">
                        <a href="#" class="tag">Web Development</a>
                        <a href="#" class="tag">JavaScript</a>
                        <a href="#" class="tag">Trends</a>
                    </div>
                    <a href="#" class="read-more">Read full article →</a>
                </article>
                
                <article class="article">
                    <div class="article-meta">
                        <span>By Jane Smith • March 12, 2024</span>
                        <span>8 min read</span>
                    </div>
                    <h2 class="article-title">
                        <a href="#">Building Scalable APIs with Node.js and Express</a>
                    </h2>
                    <p class="article-excerpt">
                        Creating robust, scalable APIs is crucial for modern web applications. In this comprehensive guide, we'll explore best practices for building APIs that can handle growth and maintain performance...
                    </p>
                    <div class="article-tags">
                        <a href="#" class="tag">Node.js</a>
                        <a href="#" class="tag">API</a>
                        <a href="#" class="tag">Backend</a>
                    </div>
                    <a href="#" class="read-more">Read full article →</a>
                </article>
                
                <article class="article">
                    <div class="article-meta">
                        <span>By Alex Johnson • March 10, 2024</span>
                        <span>6 min read</span>
                    </div>
                    <h2 class="article-title">
                        <a href="#">CSS Grid vs Flexbox: When to Use Which</a>
                    </h2>
                    <p class="article-excerpt">
                        Both CSS Grid and Flexbox are powerful layout tools, but knowing when to use each one can significantly improve your development workflow and the quality of your layouts...
                    </p>
                    <div class="article-tags">
                        <a href="#" class="tag">CSS</a>
                        <a href="#" class="tag">Layout</a>
                        <a href="#" class="tag">Design</a>
                    </div>
                    <a href="#" class="read-more">Read full article →</a>
                </article>
            </div>
            
            <aside class="sidebar">
                <div>
                    <h3>Popular Tags</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        <a href="#" class="tag">JavaScript</a>
                        <a href="#" class="tag">React</a>
                        <a href="#" class="tag">CSS</a>
                        <a href="#" class="tag">Node.js</a>
                        <a href="#" class="tag">Python</a>
                        <a href="#" class="tag">Design</a>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3>Recent Posts</h3>
                    <ul>
                        <li><a href="#">Getting Started with React Hooks</a></li>
                        <li><a href="#">Modern CSS Techniques</a></li>
                        <li><a href="#">Database Design Best Practices</a></li>
                        <li><a href="#">Introduction to TypeScript</a></li>
                    </ul>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3>Newsletter</h3>
                    <p style="margin-bottom: 1rem; font-size: 0.9rem;">Subscribe to get the latest posts delivered to your inbox.</p>
                    <input type="email" placeholder="Your email" style="width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 0.5rem;">
                    <button style="width: 100%; padding: 0.5rem; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;">Subscribe</button>
                </div>
            </aside>
        </div>
    </main>
</body>
</html>`
	},
	{
		id: 'ecommerce-product',
		title: 'E-commerce Product Page',
		category: 'ecommerce',
		description: 'Product showcase page with image gallery, details, and purchase options',
		features: ['Product Gallery', 'Add to Cart', 'Product Details', 'Reviews Section'],
		responsive: true,
		styling: 'E-commerce focused with product showcase optimization',
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Page - TechStore</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #2d3748; color: white; padding: 1rem 0; }
        nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .cart-icon { background: #e53e3e; padding: 0.5rem 1rem; border-radius: 5px; text-decoration: none; color: white; }
        .product-container { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding: 3rem 0; }
        .product-images { display: flex; flex-direction: column; gap: 1rem; }
        .main-image { width: 100%; height: 400px; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #999; }
        .thumbnail-images { display: flex; gap: 0.5rem; }
        .thumbnail { width: 80px; height: 80px; background: #f0f0f0; border-radius: 4px; cursor: pointer; border: 2px solid transparent; }
        .thumbnail.active { border-color: #3182ce; }
        .product-info h1 { font-size: 2rem; margin-bottom: 1rem; }
        .price { font-size: 1.8rem; color: #e53e3e; font-weight: bold; margin-bottom: 1rem; }
        .original-price { text-decoration: line-through; color: #999; font-size: 1.2rem; margin-right: 1rem; }
        .rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .stars { color: #ffd700; }
        .product-description { margin-bottom: 2rem; line-height: 1.7; }
        .product-options { margin-bottom: 2rem; }
        .option-group { margin-bottom: 1rem; }
        .option-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        .option-buttons { display: flex; gap: 0.5rem; }
        .option-btn { padding: 0.5rem 1rem; border: 2px solid #e2e8f0; background: white; cursor: pointer; border-radius: 4px; }
        .option-btn.selected { border-color: #3182ce; background: #ebf8ff; }
        .quantity-selector { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .quantity-btn { width: 40px; height: 40px; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
        .quantity-input { width: 60px; text-align: center; border: 1px solid #e2e8f0; padding: 0.5rem; }
        .action-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .btn { padding: 1rem 2rem; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; text-decoration: none; display: inline-block; text-align: center; }
        .btn-primary { background: #3182ce; color: white; }
        .btn-secondary { background: #e2e8f0; color: #4a5568; }
        .features { background: #f7fafc; padding: 2rem; border-radius: 8px; }
        .features h3 { margin-bottom: 1rem; }
        .features ul { list-style: none; }
        .features li { padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; }
        .features li:before { content: "✓"; color: #48bb78; margin-right: 0.5rem; }
        @media (max-width: 768px) {
            .product-container { grid-template-columns: 1fr; gap: 2rem; }
            .action-buttons { flex-direction: column; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">TechStore</div>
            <a href="#" class="cart-icon">🛒 Cart (0)</a>
        </nav>
    </header>
    
    <main class="container">
        <div class="product-container">
            <div class="product-images">
                <div class="main-image">📱</div>
                <div class="thumbnail-images">
                    <div class="thumbnail active"></div>
                    <div class="thumbnail"></div>
                    <div class="thumbnail"></div>
                    <div class="thumbnail"></div>
                </div>
            </div>
            
            <div class="product-info">
                <h1>Premium Smartphone Pro</h1>
                <div class="price">
                    <span class="original-price">$899.99</span>
                    $749.99
                </div>
                <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span>4.8 (124 reviews)</span>
                </div>
                
                <div class="product-description">
                    <p>Experience the future with our latest smartphone featuring cutting-edge technology, stunning display, and professional-grade camera system. Perfect for work, entertainment, and everything in between.</p>
                </div>
                
                <div class="product-options">
                    <div class="option-group">
                        <label>Color:</label>
                        <div class="option-buttons">
                            <button class="option-btn selected">Midnight Black</button>
                            <button class="option-btn">Silver</button>
                            <button class="option-btn">Gold</button>
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <label>Storage:</label>
                        <div class="option-buttons">
                            <button class="option-btn">128GB</button>
                            <button class="option-btn selected">256GB</button>
                            <button class="option-btn">512GB</button>
                        </div>
                    </div>
                </div>
                
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <button class="quantity-btn">-</button>
                    <input type="number" value="1" min="1" class="quantity-input">
                    <button class="quantity-btn">+</button>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary">Add to Cart</button>
                    <button class="btn btn-secondary">Add to Wishlist</button>
                </div>
                
                <div class="features">
                    <h3>Key Features</h3>
                    <ul>
                        <li>6.7" Super Retina XDR Display</li>
                        <li>Professional Camera System</li>
                        <li>A16 Bionic Chip</li>
                        <li>All-Day Battery Life</li>
                        <li>5G Connectivity</li>
                        <li>Face ID Security</li>
                        <li>Water Resistant (IP68)</li>
                    </ul>
                </div>
            </div>
        </div>
    </main>
</body>
</html>`
	},
	{
		id: 'contact-form',
		title: 'Contact Form Page',
		category: 'forms',
		description: 'Professional contact form with validation and multiple contact methods',
		features: ['Form Validation', 'Multiple Contact Methods', 'Map Integration', 'Responsive Design'],
		responsive: true,
		styling: 'Form-focused design with validation styling',
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #343a40; color: white; padding: 2rem 0; text-align: center; }
        .contact-container { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding: 3rem 0; }
        .contact-form { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .contact-info { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 5px; font-size: 1rem; transition: border-color 0.3s; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #007bff; }
        .form-group.error input, .form-group.error textarea { border-color: #dc3545; }
        .error-message { color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; }
        .success-message { color: #28a745; font-size: 0.875rem; margin-top: 0.25rem; }
        .btn { background: #007bff; color: white; padding: 0.75rem 2rem; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: background 0.3s; }
        .btn:hover { background: #0056b3; }
        .btn:disabled { background: #6c757d; cursor: not-allowed; }
        .contact-item { display: flex; align-items: center; margin-bottom: 2rem; }
        .contact-icon { width: 50px; height: 50px; background: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 1.2rem; }
        .contact-details h3 { margin-bottom: 0.5rem; }
        .contact-details p { color: #6c757d; }
        .map-placeholder { width: 100%; height: 200px; background: linear-gradient(45deg, #e9ecef, #dee2e6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; margin-top: 2rem; }
        .social-links { display: flex; gap: 1rem; margin-top: 2rem; }
        .social-link { width: 40px; height: 40px; background: #6c757d; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: background 0.3s; }
        .social-link:hover { background: #007bff; }
        @media (max-width: 768px) {
            .contact-container { grid-template-columns: 1fr; gap: 2rem; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
    </header>
    
    <main class="container">
        <div class="contact-container">
            <div class="contact-form">
                <h2>Send us a Message</h2>
                <form id="contactForm">
                    <div class="form-group">
                        <label for="name">Full Name *</label>
                        <input type="text" id="name" name="name" required>
                        <div class="error-message" id="nameError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                        <div class="error-message" id="emailError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone">
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Subject *</label>
                        <select id="subject" name="subject" required>
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="sales">Sales Question</option>
                            <option value="partnership">Partnership</option>
                            <option value="other">Other</option>
                        </select>
                        <div class="error-message" id="subjectError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Message *</label>
                        <textarea id="message" name="message" rows="5" required placeholder="Please provide details about your inquiry..."></textarea>
                        <div class="error-message" id="messageError"></div>
                    </div>
                    
                    <button type="submit" class="btn" id="submitBtn">Send Message</button>
                    <div class="success-message" id="successMessage" style="display: none;">Thank you! Your message has been sent successfully.</div>
                </form>
            </div>
            
            <div class="contact-info">
                <h2>Get in Touch</h2>
                
                <div class="contact-item">
                    <div class="contact-icon">📧</div>
                    <div class="contact-details">
                        <h3>Email</h3>
                        <p>contact@company.com</p>
                        <p>support@company.com</p>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">📞</div>
                    <div class="contact-details">
                        <h3>Phone</h3>
                        <p>+1 (555) 123-4567</p>
                        <p>Mon-Fri 9AM-6PM EST</p>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">📍</div>
                    <div class="contact-details">
                        <h3>Office</h3>
                        <p>123 Business Street</p>
                        <p>Suite 100, City, State 12345</p>
                    </div>
                </div>
                
                <div class="map-placeholder">
                    🗺️ Interactive Map
                </div>
                
                <div class="social-links">
                    <a href="#" class="social-link">📘</a>
                    <a href="#" class="social-link">🐦</a>
                    <a href="#" class="social-link">💼</a>
                    <a href="#" class="social-link">📷</a>
                </div>
            </div>
        </div>
    </main>
    
    <script>
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
            
            let isValid = true;
            
            // Validate name
            const name = document.getElementById('name').value.trim();
            if (!name) {
                showError('name', 'Name is required');
                isValid = false;
            }
            
            // Validate email
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                showError('email', 'Email is required');
                isValid = false;
            } else if (!emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate subject
            const subject = document.getElementById('subject').value;
            if (!subject) {
                showError('subject', 'Please select a subject');
                isValid = false;
            }
            
            // Validate message
            const message = document.getElementById('message').value.trim();
            if (!message) {
                showError('message', 'Message is required');
                isValid = false;
            } else if (message.length < 10) {
                showError('message', 'Message must be at least 10 characters long');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = document.getElementById('submitBtn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                setTimeout(() => {
                    document.getElementById('successMessage').style.display = 'block';
                    document.getElementById('contactForm').reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }, 2000);
            }
        });
        
        function showError(fieldId, message) {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(fieldId + 'Error');
            field.parentElement.classList.add('error');
            errorElement.textContent = message;
        }
    </script>
</body>
</html>`
	}
];

// Global variables
let filteredTemplates = [...TEMPLATES];
let currentTemplate = null;

document.addEventListener('DOMContentLoaded', () => {
	initTheme();
	createParticles();
	renderTemplates();
	setupEventListeners();
	updateStats();
});

function setupEventListeners() {
	// Theme toggle
	document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
	
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
		if (e.ctrlKey && e.key === 'k') {
			e.preventDefault();
			document.getElementById('searchInput').focus();
		}
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
		
		previewBtn.addEventListener('click', () => openModal(template));
		copyBtn.addEventListener('click', () => copyToClipboard(template.html, copyBtn));
		downloadBtn.addEventListener('click', () => downloadTemplate(template));
		
		// Make entire card clickable for preview
		card.addEventListener('click', (e) => {
			if (!e.target.closest('button')) {
				openModal(template);
			}
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
	updateStats();
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
	updateStats();
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
	document.getElementById('templateStyling').textContent = template.styling;
	
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
		} else {
			// Show global notification
			showNotification('Code copied to clipboard!', 'success');
		}
	} catch (err) {
		console.error('Failed to copy: ', err);
		showNotification('Failed to copy code', 'error');
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
	
	showNotification('Template downloaded successfully!', 'success');
}

function openInNewTab(html) {
	const newWindow = window.open();
	newWindow.document.write(html);
	newWindow.document.close();
}

function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
		color: white;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		z-index: 10000;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		animation: slideInRight 0.3s ease;
	`;
	notification.textContent = message;
	
	document.body.appendChild(notification);
	
	setTimeout(() => {
		notification.style.animation = 'slideOutRight 0.3s ease';
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}

function updateStats() {
	document.getElementById('templateCount').textContent = filteredTemplates.length;
	
	const categories = [...new Set(TEMPLATES.map(t => t.category))];
	document.getElementById('categoryCount').textContent = categories.length;
}

// Theme handling using shared key 'site-theme'
function initTheme() {
	const saved = localStorage.getItem('site-theme');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	
	if (saved === 'dark' || (!saved && prefersDark)) {
		document.body.classList.add('dark');
		document.getElementById('theme-toggle').textContent = '☀️';
	} else {
		document.body.classList.remove('dark');
		document.getElementById('theme-toggle').textContent = '🌙';
	}
}

function toggleTheme() {
	const isDark = document.body.classList.toggle('dark');
	localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
	document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
}

// Listen for changes from other tabs
window.addEventListener('storage', (e) => {
	if (e.key === 'site-theme') {
		initTheme();
	}
});

// Simple particle generator reused across projects
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

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
	@keyframes slideInRight {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
	@keyframes slideOutRight {
		from { transform: translateX(0); opacity: 1; }
		to { transform: translateX(100%); opacity: 0; }
	}
`;
document.head.appendChild(style);