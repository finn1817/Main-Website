
# **Hi, I'm Dan!** 👋
## **Welcome to my Main Website!**
🛠 **The way this is set up...**
- Starts as a repository reading from a single index script. The main index points out to every other folder containing an index.html which has a page of its own for each section.

## How everything works

* Everything besides the main dashboard is now broken up into its own folder, seperating everything and making it much easier to work on if needed. This keeps all layouts consitent, allows me to move from page to page while keeping my enhanced light / dark mode feature working across all pages, and lets me keep the entire project in one place, rather than split around 20+ different repositories!

* **Over 300+ deployments** and lots of updates have been made to improve functionality, mobile responsiveness, and user experience!

## **Project Structure**
```
Main-Website/
├── index.html                    # Main dashboard/landing page
├── 404.html                      # Custom error page
├── backup-index.html             # Backup version
├── maintenance.html              # Maintenance mode page
├── portal.html & portal-2.html   # Alternative entry points
├── progress.html                 # Project progress tracker
├── congrats.html                 # Success/celebration page
│
├── about-me/                     # About Me section
│   ├── index.html
│   ├── about-me.css
│   └── about-me.js
│
├── assets/                       # Global assets
│   ├── css/
│   │   ├── styles.css            # Main stylesheet
│   │   ├── universal-search.css  # Search feature styles
│   │   ├── breadcrumb.css        # Navigation breadcrumbs
│   │   └── loading-states.css    # Loading animations
│   ├── js/
│   │   ├── theme-manager.js      # Dark/light mode controller
│   │   ├── universal-search.js   # Site-wide search
│   │   ├── dynamic-status.js     # Status indicators
│   │   ├── section-previews.js   # Preview functionality
│   │   └── analytics-feedback.js # Analytics & feedback
│   └── images/
│       └── Screenshots/          # site screenshots
│
├── contact/                      # contact page
│   └── index.html
│
├── education/                    # education section
│   └── index.html
│
├── interests/                    # interests/hobbies section
│   └── index.html
│
├── projects/                     # 🎮 20+ Live Projects Portfolio
│   ├── index.html                # projects dashboard
│   │
│   ├── 2048/                     # 2048
│   ├── calculator/               # web calculator
│   ├── hangman/                  # Hangman
│   ├── word-search/              # word search
│   ├── pong/                     # Pong
│   │
│   ├── Lax-Timer/                # lacrosse shot clock timer - for tom
│   ├── Mobile-Lax-Timer/         # mobile-optimized version - for tom
│   ├── my-asteroids/             # asteroids game remake
│   ├── Square-Chase/             # square chase game
│   │
│   ├── Team-Manager/             # sports team management
│   ├── shared-calendar/          # group calendar
│   ├── resume-builder/           # smart resume generation tool - not that smart
│   ├── family-betting/           # family game
│   │   ├── dashboard.html
│   │   ├── blackjack.html
│   │   └── poker.html
│   │
│   ├── File-Transfer/            # file transfer utility
│   ├── password-manager/         # password manager
│   ├── finance-check/            # finance tracking
│   ├── text-editor/              # web-based text editor
│   ├── word-counter/             # word/character counter
│   ├── unit-converter/           # unit conversion tool
│   ├── git-account-info/         # git account checker - scraper
│   │
│   └── template/                 # templates folder
│       ├── index.html
│       ├── script.js
│       └── styles.css
│
├── resume/                       # FULL resume folder
│   ├── index.html                # resume site
│   ├── resume.txt                # plain text version
│   ├── assets/
│   │   └── images/               # resume images/
│   └── py/
│       ├── resume.py             # will be simple dashboard python app showcasing skills / resume built into this
│       ├── contact_submission.json
│       └── run.bat
│
└── tools/                        # 🛠️ Development Tools
    ├── tools_dashboard.py        # tools management dashboard
    ├── run.bat                   # runs py script
    │
    ├── asset_usage_scanner/      # scans for unused assets
    │   ├── asset_usage_scanner.py
    │   └── asset-usage.json
    │
    ├── link_checker/             # check for broken links
    │   ├── link_checker.py
    │   └── link-report.json
    │
    └── site_manager/             # maintenance tools
        └── site_manager.py
```
# **Website Features & Background**

## **🌐 Live Deployment**
- Hosted on GitHub Pages and connected to custom domain: **https://www.finnworks.dev**
- Multiple easter eggs (portal.html, portal-2.html) for programmer tunnel
- Custom 404 error page with navigation back to main site
- Maintenance mode page for updates and downtime

## **🎨 Design & User Experience**

- **Advanced Theme System**: Seamless light & dark mode with smooth transitions, persistent preferences across all pages, and theme-manager.js for global control
- **Universal Search**: Site-wide search functionality accessible from any page - quickly find projects, sections, or content
- **Breadcrumb Navigation**: Clear navigation paths showing your location within the site hierarchy
- **Mobile-First Design**: Fully responsive layouts optimized for all devices, with special attention to iOS/Safari compatibility and safe-area handling
- **Loading States**: Smooth loading animations and visual feedback for better user experience
- **Dynamic Status Indicators**: Real-time status updates for projects and features

## **📂 Portfolio Structure**

### **20+ Live Interactive Projects**
- **Games**: 2048, Hangman, Word Search, Pong, Asteroids, Square Chase
- **Sports Tools**: Lacrosse Timer (Desktop + Mobile versions), Team Manager
- **Business Apps**: Resume Builder, Shared Calendar, Finance Tracker, Team Management
- **Developer Utilities**: Git Account Info, File Transfer, Text Editor, Word Counter, Unit Converter, Password Manager
- **Custom Projects**: Family Betting Suite (Blackjack, Poker), and more!

### **Professional Resume Section**
- Interactive web-based resume with collapsible sections
- Client-side PDF generation with jsPDF
- Contact form integration
- Developer badge and branding
- Mobile-optimized with iOS safe-area support

### **Development Tools Suite**
- **Asset Usage Scanner**: Identifies unused images/files for cleanup
- **Link Checker**: Scans entire site for broken links and reports issues
- **Site Manager**: Centralized management dashboard for maintenance tasks
- **Tools Dashboard**: Python-based control panel for all development tools

## **⚙️ Technical Features**

- **Multi-Page Architecture**: Each section is a standalone page for better organization and performance
- **Consistent Styling**: Global CSS variables and shared stylesheets maintain visual consistency
- **JavaScript Modules**: Reusable JS components (theme-manager, search, analytics)
- **Analytics & Feedback**: Built-in tracking and user feedback systems
- **Section Previews**: Dynamic preview generation for project showcase
- **Template System**: Standardized project template for quick new project setup

## **📊 Project Stats**

- **300+ Deployments**: Continuous improvements and updates
- **20+ Live Projects**: All interactive and fully functional
- **100% Mobile Responsive**: Works flawlessly on all screen sizes
- **Cross-Browser Compatible**: Tested on Chrome, Firefox, Safari, Edge
- **Single Repository**: All projects organized in one cohesive structure
  
## **Screenshots**

![Screenshot](https://github.com/finn1817/Main-Website/blob/main/assets/images/Screenshots/darkMode.png?raw=true)

![Screenshot](https://github.com/finn1817/Main-Website/blob/main/assets/images/Screenshots/lightMode.png?raw=true)

👩‍💻 Let me know if you want anything like this!🤔
## **Badges & License**


* [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)            


## **Author**

* Dan Finn (Me) - [@finn1817](https://www.github.com/finn1817)
## 🔗 **Link to this site**
* [![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://finnworks.dev/Main-Website/) <br/>

## **💡 Use Cases**

**This project architecture is ideal for:**

- **👨‍💻 Developer Portfolios**: Showcase multiple projects in one cohesive, professional website
- **🎓 Student Projects**: Organize coursework, personal projects, and achievements
- **🏢 Business Dashboards**: Create a centralized hub linking to multiple tools/services
- **📱 App Collections**: Display a suite of web applications with consistent branding
- **🎨 Creative Portfolios**: Showcase design work, interactive demos, and case studies
- **🛠️ Tool Libraries**: Organize utility tools and resources in one accessible location
- **📊 Project Showcases**: Demonstrate capabilities with live, interactive examples

**Key Benefits:**
- Single repository for easy maintenance and version control
- Consistent branding and user experience across all projects
- Built-in development tools for site management
- Professional presentation with modern UI/UX
- Easy to extend with new projects using the template system
![Logo](https://github.com/finn1817/Main-Website/blob/main/assets/images/logo.png?raw=true)

