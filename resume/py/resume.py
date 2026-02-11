"""
Dan Finn - Resume Desktop Application
A Python GUI version of my resume website built with customtkinter.
This app recreates all the web functionality in a desktop format:
- Tabbed interface for different sections
- Dark/Light theme toggle
- Collapsible sections for experience entries
- Courses modal for education details
- PDF export functionality
- Contact form submission
- Modern styling and animations
"""

import customtkinter as ctk
from tkinter import messagebox, Canvas, Scrollbar
import webbrowser
from datetime import datetime
import json
import os
import base64
import urllib.parse
import urllib.request
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None

# appearance and color
ctk.set_appearance_mode("light") # default is light mode
ctk.set_default_color_theme("blue")

class ResumeApp(ctk.CTk):
    """Main application class for the Resume Desktop App"""
    
    def __init__(self):
        super().__init__()
        
        # configure the main window
        self.title("Dan Finn - Resume Application")
        self.geometry("900x700")
        self.minsize(800, 600)
        
        # theme tracking (starts with light mode)
        self.current_theme = "light"

        # paths
        self.app_dir = Path(__file__).resolve().parent
        self.resume_dir = self.app_dir.parent
        self.assets_images_dir = self.resume_dir / "assets" / "images"
        self.contact_state_path = self.app_dir / "contact_submission.json"

        # keep image references alive
        self._image_refs = []

        # contact form submission state (match website: only submit once)
        self.form_submitted = self._load_form_submitted()
        
        # Email config (base64 encoded to keep it hidden in code)
        # to change email if I ever need to: base64.b64encode("your.email@example.com".encode()).decode()
        self.encoded_email = "ZGFubnlmaW5uOUBnbWFpbC5jb20="  # decodes to my gmail
        
        # create the header section with title and buttons
        self.create_header()
        
        # create the tabbed navigation system
        self.create_tabs()
        
        # create the footer
        self.create_footer()
        
        # show the About Me tab by default
        self.show_tab("about")

    def _load_form_submitted(self):
        try:
            if self.contact_state_path.exists():
                data = json.loads(self.contact_state_path.read_text(encoding="utf-8") or "{}")
                return bool(data.get("submitted"))
        except Exception:
            return False
        return False

    def _set_form_submitted(self, submitted: bool):
        self.form_submitted = submitted
        try:
            self.contact_state_path.write_text(
                json.dumps({"submitted": bool(submitted)}, indent=2),
                encoding="utf-8",
            )
        except Exception:
            pass

    def _load_ctk_image(self, filename: str, size=(220, 96)):
        if Image is None:
            return None

        path = self.assets_images_dir / filename
        if not path.exists():
            return None

        try:
            pil_image = Image.open(path)
            ctk_image = ctk.CTkImage(light_image=pil_image, dark_image=pil_image, size=size)
            self._image_refs.append(ctk_image)
            return ctk_image
        except Exception:
            return None
        
    def create_header(self):
        """Create the header section with title, subtitle, and action buttons"""
        # header frame with proper spacing
        self.header_frame = ctk.CTkFrame(self, fg_color=("gray90", "gray20"), corner_radius=0)
        self.header_frame.pack(fill="x", padx=0, pady=0)
        
        # title section
        self.title_label = ctk.CTkLabel(
            self.header_frame, 
            text="Dan Finn - Resume Website",
            font=ctk.CTkFont(size=24, weight="bold")
        )
        self.title_label.pack(pady=(15, 5))
        
        # subtitle section
        self.subtitle_label = ctk.CTkLabel(
            self.header_frame,
            text="Computer Science Student at SUNY Fredonia",
            font=ctk.CTkFont(size=14)
        )
        self.subtitle_label.pack(pady=(0, 15))
        
        # buttons frame for theme toggle and download
        self.buttons_frame = ctk.CTkFrame(self.header_frame, fg_color="transparent")
        self.buttons_frame.pack(pady=(0, 15))
        
        # theme toggle button (starts with sun icon for light mode)
        self.theme_button = ctk.CTkButton(
            self.buttons_frame,
            text="☀️",
            command=self.toggle_theme,
            width=42
        )
        self.theme_button.pack(side="left", padx=5)
        
        # download resume button
        self.download_button = ctk.CTkButton(
            self.buttons_frame,
            text="Download Resume",
            command=self.download_resume,
            width=160
        )
        self.download_button.pack(side="left", padx=5)
        
    def create_tabs(self):
        """create the tabbed navigation system with all resume sections"""
        # tab navigation frame
        self.tab_nav_frame = ctk.CTkFrame(self, fg_color=("gray85", "gray25"), corner_radius=0)
        self.tab_nav_frame.pack(fill="x", padx=0, pady=0)
        
        # container for tab buttons
        self.tab_buttons_container = ctk.CTkFrame(self.tab_nav_frame, fg_color="transparent")
        self.tab_buttons_container.pack(pady=10)
        
        # define all tabs with their display names
        self.tabs = [
            ("about", "About Me"),
            ("education", "Education"),
            ("experience", "IT Experience"),
            ("skills", "Skills"),
            ("programming", "Programming"),
            ("contact", "Contact")
        ]
        
        # create navigation buttons for each tab
        self.tab_buttons = {}
        for tab_id, tab_name in self.tabs:
            btn = ctk.CTkButton(
                self.tab_buttons_container,
                text=tab_name,
                command=lambda t=tab_id: self.show_tab(t),
                width=120,
                height=32,
                fg_color="transparent",
                text_color=("gray10", "gray90"),
                hover_color=("gray70", "gray40")
            )
            btn.pack(side="left", padx=2)
            self.tab_buttons[tab_id] = btn
        
        # content container frame
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # create scrollable frame for tab content
        self.tab_content_frames = {}
        for tab_id, _ in self.tabs:
            frame = ctk.CTkScrollableFrame(self.content_frame, fg_color="transparent")
            self.tab_content_frames[tab_id] = frame
            
        # populate each tab with content
        self.create_about_tab()
        self.create_education_tab()
        self.create_experience_tab()
        self.create_skills_tab()
        self.create_contact_tab()
        self.create_programming_tab()
        
    def create_footer(self):
        """create the footer with copyright notice"""
        self.footer_frame = ctk.CTkFrame(self, fg_color=("gray90", "gray20"), corner_radius=0, height=40)
        self.footer_frame.pack(fill="x", side="bottom", padx=0, pady=0)
        
        footer_label = ctk.CTkLabel(
            self.footer_frame,
            text="© 2026 Dan Finn -- All rights reserved.",
            font=ctk.CTkFont(size=12)
        )
        footer_label.pack(pady=10)
        
    def show_tab(self, tab_id):
        """display the selected tab and update button states"""
        # hide all tab content frames
        for frame in self.tab_content_frames.values():
            frame.pack_forget()
        
        # show the selected tab content
        self.tab_content_frames[tab_id].pack(fill="both", expand=True)
        
        # update button appearance to show active tab
        for btn_id, btn in self.tab_buttons.items():
            if btn_id == tab_id:
                btn.configure(fg_color=("gray70", "gray40"))
            else:
                btn.configure(fg_color="transparent")
                
    def toggle_theme(self):
        """Toggle between light and dark themes"""
        if self.current_theme == "light":
            ctk.set_appearance_mode("dark")
            self.current_theme = "dark"
            self.theme_button.configure(text="🌙")
        else:
            ctk.set_appearance_mode("light")
            self.current_theme = "light"
            self.theme_button.configure(text="☀️")
            
    def create_about_tab(self):
        """create the About Me tab content"""
        frame = self.tab_content_frames["about"]
        
        # section title
        title = ctk.CTkLabel(
            frame,
            text="About Me",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # about content as bullet points
        about_points = [
            "I'm a computer science student at SUNY Fredonia from Buffalo NY that enjoys programming and fixing different tech. In my free time, I am either making websites & apps, or I am fixing something for somebody else!",
            "My programming style is very step by step. I learn easiest on my own by going right into projects and figuring things out as I go. I like the challenge of getting things done that others would not have thought were possible.",
            "I get motivated by the feeling of making something work that will actually be useful to someone, whether that be simple automation scripts / tools or a full app to make things easier for someone.",
            "I do have experience with docker / containers. I have successfully built my own cloud storage solution with a working on/off button built into a Python application. This allows me to access my 2TB storage from anywhere, while keeping all user data (sign-ins) properly secured and stored elsewhere.",
            "I also work a lot with networking. I do have a solid understanding of how everything works together. I have actively worked with several Cisco systems, packet scanning with Wireshark, and I have made multiple personal network tools that have been very useful. I have also worked using Python libraries built for actual network testing / packet behavior, which has helped me learn how everything really works.",
        ]
        
        for point in about_points:
            point_label = ctk.CTkLabel(
                frame,
                text=f"• {point}",
                font=ctk.CTkFont(size=13),
                wraplength=800,
                justify="left"
            )
            point_label.pack(pady=5, anchor="w", padx=10)

        # teams logos row (match website)
        logos_container = ctk.CTkFrame(frame, fg_color="transparent")
        logos_container.pack(pady=(20, 10), anchor="w", padx=10)

        for filename, alt_text in [
            ("bills-logo.png", "Buffalo Bills"),
            ("sabres-logo.png", "Buffalo Sabres"),
            ("bandits-logo.png", "Buffalo Bandits"),
        ]:
            logo_frame = ctk.CTkFrame(
                logos_container,
                fg_color=("white", "gray20"),
                border_width=1,
                border_color=("gray70", "gray35"),
                corner_radius=10,
            )
            logo_frame.pack(side="left", padx=8)

            img = self._load_ctk_image(filename, size=(130, 70))
            if img is not None:
                lbl = ctk.CTkLabel(logo_frame, text="", image=img)
                lbl.pack(padx=16, pady=12)
            else:
                lbl = ctk.CTkLabel(logo_frame, text=alt_text, font=ctk.CTkFont(size=12, weight="bold"))
                lbl.pack(padx=16, pady=24)
            
    def create_education_tab(self):
        """create the Education tab with college and high school sections"""
        frame = self.tab_content_frames["education"]
        
        # section title
        title = ctk.CTkLabel(
            frame,
            text="Education",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # college education section
        college_section = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
        college_section.pack(fill="x", pady=10, padx=5)

        college_row = ctk.CTkFrame(college_section, fg_color="transparent")
        college_row.pack(fill="x", padx=10, pady=10)

        college_text = ctk.CTkFrame(college_row, fg_color="transparent")
        college_text.pack(side="left", fill="both", expand=True, padx=(5, 10))

        college_logo = ctk.CTkFrame(college_row, fg_color="transparent")
        college_logo.pack(side="right", padx=(10, 5))

        college_title = ctk.CTkLabel(
            college_text,
            text="Higher Education - College",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        college_title.pack(pady=(0, 10), anchor="w")
        
        college_info = [
            "Bachelor of Science in Computer Science - SUNY Fredonia (Currently Attending)",
            "My main focusses are on web development & design, software development (python, c++, and lots of system based programming), personal/work projects (also including lots of system mods/tweaks, personal management scripts for docker/ files/ etc, and personal games!)",
            "Captain - of (eSports) Rocket League - For the SUNY Fredonia eSports Team"
        ]
        
        for info in college_info:
            info_label = ctk.CTkLabel(
                college_text,
                text=f"• {info}",
                font=ctk.CTkFont(size=13),
                wraplength=620,
                justify="left"
            )
            info_label.pack(pady=3, anchor="w", padx=10)
            
        # view courses button
        courses_btn = ctk.CTkButton(
            college_text,
            text="View my Completed Computer Science Courses",
            command=self.show_courses_modal,
            width=350
        )
        courses_btn.pack(pady=15, anchor="w")

        # right-side logo
        fred_img = self._load_ctk_image("fred-logo.png", size=(160, 160))
        fred_frame = ctk.CTkFrame(
            college_logo,
            fg_color=("white", "gray20"),
            border_width=1,
            border_color=("gray70", "gray35"),
            corner_radius=10,
        )
        fred_frame.pack()
        if fred_img is not None:
            ctk.CTkLabel(fred_frame, text="", image=fred_img).pack(padx=16, pady=16)
        else:
            ctk.CTkLabel(fred_frame, text="SUNY Fredonia", font=ctk.CTkFont(size=12, weight="bold")).pack(padx=16, pady=24)
        
        # divider
        divider = ctk.CTkFrame(frame, height=2, fg_color=("gray70", "gray40"))
        divider.pack(fill="x", pady=15)
        
        # high school section
        hs_section = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
        hs_section.pack(fill="x", pady=10, padx=5)

        hs_row = ctk.CTkFrame(hs_section, fg_color="transparent")
        hs_row.pack(fill="x", padx=10, pady=10)

        hs_text = ctk.CTkFrame(hs_row, fg_color="transparent")
        hs_text.pack(side="left", fill="both", expand=True, padx=(5, 10))

        hs_logo = ctk.CTkFrame(hs_row, fg_color="transparent")
        hs_logo.pack(side="right", padx=(10, 5))

        hs_title = ctk.CTkLabel(
            hs_text,
            text="High School Education",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        hs_title.pack(pady=(0, 10), anchor="w")
        
        hs_info = [
            "High School Diploma - Bishop Timon St. Jude High School (Graduated)",
            "Active member of AV Club, managing audio/video equipment for school events",
            "Captain - (Varsity) Soccer"
        ]
        
        for info in hs_info:
            info_label = ctk.CTkLabel(
                hs_text,
                text=f"• {info}",
                font=ctk.CTkFont(size=13),
                wraplength=620,
                justify="left"
            )
            info_label.pack(pady=3, anchor="w", padx=10)

        # right-side logo
        btsj_img = self._load_ctk_image("btsj-logo.png", size=(160, 160))
        btsj_frame = ctk.CTkFrame(
            hs_logo,
            fg_color=("white", "gray20"),
            border_width=1,
            border_color=("gray70", "gray35"),
            corner_radius=10,
        )
        btsj_frame.pack()
        if btsj_img is not None:
            ctk.CTkLabel(btsj_frame, text="", image=btsj_img).pack(padx=16, pady=16)
        else:
            ctk.CTkLabel(btsj_frame, text="Bishop Timon St. Jude", font=ctk.CTkFont(size=12, weight="bold")).pack(padx=16, pady=24)
            
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()
        
    def show_courses_modal(self):
        """display a modal window with completed courses organized by category"""
        # create a new top-level window for the courses modal
        modal = ctk.CTkToplevel(self)
        modal.title("Completed CSIT Courses")
        modal.geometry("700x600")
        modal.transient(self)
        modal.grab_set()
        
        # header
        header = ctk.CTkLabel(
            modal,
            text="Completed CSIT Courses",
            font=ctk.CTkFont(size=20, weight="bold")
        )
        header.pack(pady=20)
        
        # scrollable content frame
        scroll_frame = ctk.CTkScrollableFrame(modal, fg_color="transparent")
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # define course categories and their courses
        courses_data = [
            {
                "category": "Programming | App, Web, & Software Development | Cyber Security",
                "courses": [
                    "CSIT 107 - Web Programming",
                    "CSIT 121 - Computer Science I",
                    "CSIT 151 - Intro to Information Systems",
                    "CSIT 201 - Cyber Security and Ethics",
                    "CSIT 221 - Computer Science II",
                    "CSIT 231 - Systems Programming",
                    "CSIT 300 - (Programming) IT Service Center Internsip",
                    "CSIT 300 - (Help Desk) IT Service Center Internsip",
                    "CSIT 308 - Computer Game Design and Implementaion",
                    "CSIT 311 - Assembly Language/Computer Orginization",
                    "CSIT 321 - Paradigms of Programming Languages",
                    "CSIT 324 - Object Oriented Programming",
                    "CSIT 333 - Mobile Application Development",
                    "CSIT 341 - Data Structrures",
                    "CSIT 425 - Software Engineering",
                    "CSIT 431 - Into to Operating Systems",
                    "CSIT 455 - Relational/Object Databases",
                    "CSIT 471 - Information Systems Management",
                ],
            },
            {
                "category": "Math",
                "courses": [
                    "CSIT 241 - Discrete Mathematics",
                    "STAT 200 - Fundamentals of Statistics",
                    "STAT 250 - Statistics for Scientists",
                    "MATH 120 - Calculus I",
                    "MATH 121 - Calculus II",
                ],
            },
            {
                "category": "Business & Sports Management",
                "courses": [
                    "PHED 189 - eSports (Business)",
                    "BUAD 323 - Organizational Behavior",
                    "BUAD 346 - Professional B2B Selling",
                ],
            },
            {
                "category": "Sports Management",
                "courses": [
                    "SPMG 100 - Business Success",
                    "SPMG 230 - Sport in Diverse Societies",
                ],
            },
            {
                "category": "Music",
                "courses": [
                    "MUS 101 - Music Theory I",
                    "MUS 115 - Music Appreciation",
                    "ARTS 227 - Stage / Screen",
                    "MUS 233 - Musics of the World",
                    "MUSB 301 - Music Copyrights",
                ],
            },
        ]
        
        # display each category with its courses
        for category_data in courses_data:
            # category frame
            cat_frame = ctk.CTkFrame(scroll_frame, fg_color=("gray85", "gray25"))
            cat_frame.pack(fill="x", pady=10)
            
            # category title
            cat_title = ctk.CTkLabel(
                cat_frame,
                text=category_data["category"],
                font=ctk.CTkFont(size=14, weight="bold")
            )
            cat_title.pack(pady=10, padx=15, anchor="w")
            
            # courses in this category
            for course in category_data["courses"]:
                course_label = ctk.CTkLabel(
                    cat_frame,
                    text=course,
                    font=ctk.CTkFont(size=12),
                    anchor="w"
                )
                course_label.pack(pady=2, padx=25, anchor="w")
                
        # close button at bottom
        close_btn = ctk.CTkButton(
            modal,
            text="Close",
            command=modal.destroy,
            width=150
        )
        close_btn.pack(pady=15)
        
    def create_experience_tab(self):
        """create the IT Experience tab with collapsible sections"""
        frame = self.tab_content_frames["experience"]
        
        # section title
        title = ctk.CTkLabel(
            frame,
            text="IT Experience - Click to Expand!",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # define all experience entries
        experiences = [
            {
                "title": "IT Service Center Staff -- SUNY Fredonia (Current)",
                "details": [
                    "Helped resolve lots of IT support tickets through our Jira ticket system: Providing tech assistance and system maintenance / set up.",
                    "On site issues and tech support helper: I am always moving around and helping over the phone when needed.",
                    "System development / OS config: Set up and work with lots of windows & linux devices + have set up / used GRUB boot setup",
                    "Drive repair / swapping (& network imaging)",
                    "Helped with a full campus wide switch from google to microsoft & dealt with many complaints but found plenty of solutions and helped lots of students & faculty!",
                    "Remote operations (including storage management): Our schools systems notifys us of the pc's with the lowest storage, a small part of my job has been to manage that storage and keep the device usable!",
                ],
            },
            {
                "title": "eSports Lounge Attendant -- SUNY Fredonia (Current)",
                "details": [
                    "Watch over 12 gaming PCs and 3 other consoles (Xbox, PS5, Nintendo Switch), making sure everything is taken care of and keeping track of user accountability.",
                    "Managed sign-in and out application, and enforced lounge rules to maintain a respectful and safe gaming lounge.",
                    "Provided in-person support and updates for the people in the lounge and the gaming PCs and consoles at all times.",
                ],
            },
            {
                "title": "ITS Internship (Help Desk) -- SUNY Fredonia (Summer 2025)",
                "details": [
                    "Provided in-person, remote, and over the phone technical help for staff and students. (Mainly included swapping drives, taking computers apart, and setting up new ones from the box) (Also included helping several people work through a google to microsoft complete transfer)",
                    "Helped take care of our ticket system. Included helping others with permission issues, hardware setup (fixing Computers, TVs, Phones, and even TouchPads), and did lots of extra work following others and assisting setting up new computers when the school was on break!",
                    "Helped number and track inventory around the entire college campus.",
                ],
            },
            {
                "title": "ITS Internship (Programming) -- SUNY Fredonia (2024--2025)",
                "details": [
                    "Created a Windows-specific Python app to manage workers from three workplaces, separating and organizing saved data properly to a cloud database.",
                    "This app can automate schedule generation based on worker availability and the workplaces hours of operation.",
                    "Developed a time sync feature allowing my boss to find last minute shift coverage based on who is available, and to use this app from anywhere, including viewing all of his old schedules.",
                ],
            },
            {
                "title": "AV Club -- Bishop Timon St. Jude",
                "details": [
                    "Worked with professional audio/video equipment for school events and livestreams (basketball games, football games, and pep rallies).",
                    "Handled live sound setup during shows / livestreams, helped with video recording, and closing edits on the schools sports games.",
                    "Worked with soundboards, wireless mics, and video cameras.",
                ],
            },
        ]
        
        # create collapsible sections for each experience
        for exp in experiences:
            self.create_collapsible_section(frame, exp["title"], exp["details"])
            
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()
        
    def create_collapsible_section(self, parent, title, details, link_url=None, link_text="[View on GitHub]"):
        """create a collapsible section that expands/collapses when clicked"""
        # container frame for the collapsible section
        container = ctk.CTkFrame(parent, fg_color=("gray85", "gray25"))
        container.pack(fill="x", pady=5, padx=5)
        
        # header button that toggles collapse/expand
        header_btn = ctk.CTkButton(
            container,
            text=f"▶ {title}",
            command=lambda: self.toggle_collapsible(header_btn, content_frame),
            fg_color=("gray75", "gray35"),
            hover_color=("gray65", "gray45"),
            anchor="w",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        header_btn.pack(fill="x", padx=5, pady=5)
        
        # content frame that will be shown/hidden
        content_frame = ctk.CTkFrame(container, fg_color="transparent")
        # start collapsed

        if link_url:
            link_btn = ctk.CTkButton(
                content_frame,
                text=link_text,
                command=lambda url=link_url: webbrowser.open(url),
                width=140,
                height=28,
                fg_color="transparent",
                border_width=1,
                font=ctk.CTkFont(size=12),
            )
            link_btn.pack(anchor="w", padx=20, pady=(0, 10))
        
        # add details as bullet points
        for detail in details:
            detail_label = ctk.CTkLabel(
                content_frame,
                text=f"• {detail}",
                font=ctk.CTkFont(size=12),
                wraplength=780,
                justify="left",
                anchor="w"
            )
            detail_label.pack(pady=3, anchor="w", padx=20)
            
    def toggle_collapsible(self, button, content_frame):
        """toggle the visibility of a collapsible section"""
        # check if content is currently visible
        if content_frame.winfo_viewable():
            # hide content and change arrow to right-pointing
            content_frame.pack_forget()
            current_text = button.cget("text")
            button.configure(text=current_text.replace("▼", "▶"))
        else:
            # show content and change arrow to down-pointing
            content_frame.pack(fill="x", padx=10, pady=10)
            current_text = button.cget("text")
            button.configure(text=current_text.replace("▶", "▼"))
            
    def create_skills_tab(self):
        """create the Skills tab with various skill categories"""
        frame = self.tab_content_frames["skills"]
        
        # section title
        title = ctk.CTkLabel(
            frame,
            text="Skills",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # define all skill categories
        skills = [
            {
                "title": "Programming Languages",
                "details": [
                    "I do have lots of experience with C++, Python, C#, HTML, CSS, JS, SQL, and Bash. I have some background in Java, Kotlin, R, Perl, and even Assembly. I love building websites and desktop apps for myself and my friends, and I have made more than I can keep track of!"
                ]
            },
            {
                "title": "Web Dev",
                "details": [
                    "Strong with HTML/JavaScript. I have personally built many web apps and websites, one used by the SUNY Fredonia ITS workplace, customized & built for my boss to make his work easier."
                ]
            },
            {
                "title": "Cybersecurity",
                "details": [
                    "Network Administration: Have experience configuring both routers and switches, diagnosing network issues, and fixing network speeds when there are problems, I can manage my home set-up from anywhere!",
                    "Security / Management: Completed advanced courses including \"Computer Security and Ethics,\" which had a specific focus on Cisco systems and resolving security vulnerabilities. We also did work a lot with packet scannning using wireshark, and I am quick to learning new software.",
                    "Custom Tools: Made personal network scanning tools using Raspberry Pi for automated speed, ping, and even latency testing. At my house with 8 people, I have been able to monitor my network & fix any issues easily!",
                    "Hardware: I set up My home verizon Network, my grandma's home verizon network after a tech set her up with lots of issues, and have assisted in lots of other home network configurations.",
                ]
            },
            {
                "title": "Operating Systems",
                "details": [
                    "I have lots of experience using Windows & Linux (Ubuntu/Debian) as I have both a windows laptop, and a GRUB dual-boot setup home pc With windows & linux mint. I have worked a lot with macOS and many Android forms. I am very comfortable using command line, and when I do not know how to do something, I will research and find a solution as soon as I can."
                ]
            },
            {
                "title": "Virtual Machines",
                "details": [
                    "I am experienced setting up / configuring virtual machines, I have lots of experience managing & using them as well. VM's in general were a huge part of my networking ethics course as we did learn how to set up simple fully tracked workplace environments that are safe to use for workplace purposes. (local environments)"
                ]
            },
            {
                "title": "Tools Used",
                "details": [
                    "Microsoft Products (Word, Excel, PowerPoint, Access (database side only), Outlook, Calendar, Teams, Authentication, SharePoint) - I worked through a campus wide shift from google to microsoft & had to learn how the entire system worked. I have worked tons of tickets for microsoft related support around campus.",
                    "Google Services (FireBase, Docs, Sheets, Slides, Forms, Calendar, and lots more...)",
                    "Visual Studio / Android Studio - For personal & school projects (system / PC & Mobile / apps)",
                    "Visual Studio Code - My go to for most coding projects, I am very comfortable with extensions, and setting up environments all in app.",
                    "Docker - Have experience with containerization & managing environments for personal projects (Home cloud storage + website kill-switch).",
                    "GitHub (individual & group work) - Lots of use with VS Code, even when I am not using github pages, I do use this for source control so I never make a mistake I can't fix!",
                    "Wireshark – Used for network info / scanning, packet scanning, and troubleshooting for coursework and personal home projects.",
                    "Cisco Routers/Switches – Have hands on experience configuring, managing, and fixing Cisco networking equipment in an academic environment.",
                    "Unity (from game design courses) - Have had to replicate simple games & build my own Idea for a course... My finished personal game was a mini golf game that helped me learn a lot about actual mechanics and design.",
                    "WinSCP (for remote file transfer) - Used first for a class on Systems Programming, later found that this is an amazing way to manage my RasPi and double pc setup from anywhere! I am almost never working on the computer in front of me (I am very comfortable using a few virtual connection methods - If my grandma needs computer help, I can connect in and help her from anywhere around the world!)",
                    "Windows, Linux (Mint & Kali) and RasPi - Hands on experience with setup, troubleshooting, and maintenance for all of these operating systems!",
                    "Terminal / PowerShell (automation, search, running pythons scripts / admin needed scripts, downloads, file editing, and a lot more)",
                ]
            },
            {
                "title": "Projects",
                "details": [
                    "C++: Sound Editor (Personal Guitar Pedal App), replicating Files App (windows app with AI integrated), automation tools, windows manipulation to work with some c# apps I made for personal use (remaking fun games, and for database-linked apps)",
                    "Python: I have made countless python apps from simple file finding / editing scripts, pattern parsing, and some automation to building api scripts to work with a schools Database for creating work schedules. I have fun building these apps since you really can build them how you want, and whenever you need them. I have a folder full of python tools for TONS of different things (Windows (how I want it), Network (Testing), Games, and even for prgramming (I tried once to remake my own VS-code but nothing beats the real deal!))",
                    "Web: I have also made / worked on several websites, not only personal, but for work, and my own professional development. I have made an advanced workplace app to make my bosses job a lot easier than it was, along with a simple / fun / easy to use wedding photos website for my brothers wedding. Not only was that a learning experience for me, but it felt really cool to build something for my brother as he wanted it (included QR code so anyone at the wedding could post pictures!). This way he also got all of this for free!",
                    "Bash: I have used this for several of my python applications install & uninstall scripts, and for some system tweaks on Windows",
                    "Homebrew/Modding: installed custom firmware, WiiFlow/USB Loader on Wii to simply advance the machine (holding all games on system instead of needing all of disks we had to search through). This did involve troubleshooting (But proved to me that I can pick up on new things quickly - as this was Visually working with nintendo software, and I had never done something like this before then and have done it multiple times since.)",
                ]
            }
        ]
        
        # create collapsible sections for each skill category
        for skill in skills:
            self.create_collapsible_section(frame, skill["title"], skill["details"])
            
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()

    def create_contact_tab(self):
        """create the Contact tab"""
        frame = self.tab_content_frames["contact"]
        
        # section title
        title = ctk.CTkLabel(
            frame,
            text="Contact Me",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # instructions
        instructions = ctk.CTkLabel(
            frame,
            text="If you'd like to get in touch with me, fill out the form below and I'll reach out as soon as I can!",
            font=ctk.CTkFont(size=13),
            wraplength=800
        )
        instructions.pack(pady=10, anchor="w")
        
        # form container
        form_frame = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
        form_frame.pack(fill="x", pady=20, padx=20)
        
        # name field
        name_label = ctk.CTkLabel(form_frame, text="Name", font=ctk.CTkFont(size=13, weight="bold"))
        name_label.pack(pady=(15, 5), anchor="w", padx=15)
        
        self.name_entry = ctk.CTkEntry(form_frame, placeholder_text="Name", height=35)
        self.name_entry.pack(fill="x", padx=15, pady=5)
        
        # email field
        email_label = ctk.CTkLabel(form_frame, text="Email", font=ctk.CTkFont(size=13, weight="bold"))
        email_label.pack(pady=(10, 5), anchor="w", padx=15)
        
        self.email_entry = ctk.CTkEntry(form_frame, placeholder_text="Email", height=35)
        self.email_entry.pack(fill="x", padx=15, pady=5)
        
        # message field
        message_label = ctk.CTkLabel(form_frame, text="Message", font=ctk.CTkFont(size=13, weight="bold"))
        message_label.pack(pady=(10, 5), anchor="w", padx=15)
        
        self.message_entry = ctk.CTkTextbox(form_frame, height=150)
        self.message_entry.pack(fill="x", padx=15, pady=5)
        
        # submit button
        self.submit_btn = ctk.CTkButton(
            form_frame,
            text="Send",
            command=self.submit_contact_form,
            height=45,
            font=ctk.CTkFont(size=16)
        )
        self.submit_btn.pack(pady=20)

        if self.form_submitted:
            self.submit_btn.configure(state="disabled")
            messagebox.showinfo("Message already sent", "Message already sent. You can only submit once!")
        
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()
        
    def submit_contact_form(self):
        """handle contact form submission (match website submission endpoint)"""
        if self.form_submitted:
            messagebox.showinfo("Message already sent", "Message already sent. You can only submit once!")
            return

        # get form values
        name = self.name_entry.get().strip()
        email = self.email_entry.get().strip()
        message = self.message_entry.get("1.0", "end").strip()
        
        # validate fields
        if not name or not email or not message:
            messagebox.showwarning("Missing Information", "Please fill out all fields before submitting.")
            return
            
        # simple email validation
        if "@" not in email or "." not in email:
            messagebox.showwarning("Invalid Email", "Please enter a valid email address.")
            return
        
        try:
            url = "https://submit-form.com/w4rC8WMH3"
            payload = urllib.parse.urlencode({"name": name, "email": email, "message": message}).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=15) as resp:
                status = getattr(resp, "status", 200)
                if status < 200 or status >= 300:
                    raise RuntimeError(f"Unexpected response status: {status}")

            messagebox.showinfo("Message sent", "Message sent! Thank you.")
            self._set_form_submitted(True)
            if hasattr(self, "submit_btn"):
                self.submit_btn.configure(state="disabled")

            self.name_entry.delete(0, "end")
            self.email_entry.delete(0, "end")
            self.message_entry.delete("1.0", "end")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to send message: {str(e)}")
            
    def create_programming_tab(self):
        """create the programming projects tab with featured projects and categories"""
        frame = self.tab_content_frames["programming"]
        
        # section title
        title = ctk.CTkLabel(
            frame,
            text="Programming Projects",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # portfolio overview banner
        banner_frame = ctk.CTkFrame(frame, fg_color=("#0056b3", "#003d82"))
        banner_frame.pack(fill="x", pady=10)

        ctk.CTkLabel(
            banner_frame,
            text="Complete Projects Site",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color="white",
        ).pack(pady=(12, 4))

        ctk.CTkLabel(
            banner_frame,
            text="More than 15 Live Web Apps & Interactive Projects",
            font=ctk.CTkFont(size=13),
            text_color="white",
        ).pack(pady=(0, 10))

        ctk.CTkButton(
            banner_frame,
            text="View some of my projects live here!",
            command=lambda: webbrowser.open("https://finn1817.github.io/Main-Website/projects/"),
            fg_color=("#1f6feb", "#1f6feb"),
            hover_color=("#1a5fd0", "#1a5fd0"),
            height=38,
        ).pack(pady=(0, 14))

        ctk.CTkLabel(
            frame,
            text="My Top Projects",
            font=ctk.CTkFont(size=16, weight="bold"),
        ).pack(pady=(10, 10), anchor="w")

        top_projects = [
            {
                "title": "Fredonia Workplace Dashboard",
                "link": None,
                "details": [
                    "A web app I built on my own for SUNY Fredonia IT to automate and manage 3 workplaces, making scheduling and other admin tasks easier for both staff and students.",
                    "This all started when my boss at our IT department found out I knew how to code, and came to me with a real issue.",
                    "Building this was a lot of fun, but did take lots of updates. My entire plan was to build it exactly as my boss wanted, and after all of his suggestions along with some student workers feedback, I did complete a web app that is in use today!",
                    "For this site, Student-workers enter their availability, while my boss enters the workplaces hours of operation. The web app processes both in schedule generation, making it so all my boss needed to do is click one button to make schedules.",
                    "This helped save time, reduce errors, and combined all 3 of my bosses workplaces into one simple web app!",
                ],
            },
            {
                "title": "NATracker",
                "link": "https://github.com/finn1817/NATracker",
                "details": [
                    "A group project for real-time file system tracking, designed for workplace use. We built this app using Python!",
                    "I mainly worked on the install & uninstall scripts, but played a big part in building the GUI.",
                ],
            },
            {
                "title": "Main Website",
                "link": "https://github.com/finn1817/Main-Website",
                "details": [
                    "My main website [YOUR HERE NOW!], combining tons of my individual sites into a single, modern, multi-page syncronized dashboard with light/dark mode feature.",
                    "I started my main website when I just began programming, and it has expanded from one single inline \"index.html\" script to a well structured web development showcase project!",
                    "This project is completely public, but it does have LOTS of easter eggs, including pages that open with invisible buttons!",
                ],
            },
        ]

        for project in top_projects:
            title_text = project["title"]
            self.create_collapsible_section(
                frame,
                title_text,
                project["details"],
                link_url=project["link"],
            )
                
        # portfolio categories section
        categories_frame = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
        categories_frame.pack(fill="x", pady=20, padx=5)
        
        cat_title = ctk.CTkLabel(
            categories_frame,
            text="My Portfolio Websites Categories",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        cat_title.pack(pady=15, anchor="w", padx=15)
        
        # category items
        categories = [
            {
                "title": "🎮 Games & Interactive (5 projects)",
                "description": "2048, Hangman, Word Search, Square Chase, Calculator",
                "color": "#28a745"
            },
            {
                "title": "🏢 Business Tools (8 projects)",
                "description": "Team Manager, Calendar, Resume Builder, File Transfer",
                "color": "#007bff"
            },
            {
                "title": "🔧 Developer Utilities (5 projects)",
                "description": "Git Tools, Unit Converter, Text Editor, Word Counter",
                "color": "#6f42c1"
            }
        ]
        
        for cat in categories:
            cat_frame = ctk.CTkFrame(categories_frame, fg_color=("gray75", "gray35"), border_width=0)
            cat_frame.pack(fill="x", padx=15, pady=5)
            
            cat_name = ctk.CTkLabel(
                cat_frame,
                text=cat["title"],
                font=ctk.CTkFont(size=14, weight="bold"),
                text_color=cat["color"]
            )
            cat_name.pack(pady=8, anchor="w", padx=15)
            
            cat_desc = ctk.CTkLabel(
                cat_frame,
                text=cat["description"],
                font=ctk.CTkFont(size=12),
                anchor="w"
            )
            cat_desc.pack(pady=(0, 8), anchor="w", padx=15)
            
        # final link to projects page
        final_link = ctk.CTkButton(
            categories_frame,
            text="View All Projects with Live Demos →",
            command=lambda: webbrowser.open("https://finn1817.github.io/Main-Website/projects/"),
            fg_color="transparent",
            text_color=("blue", "lightblue"),
            hover_color=("gray80", "gray30"),
            font=ctk.CTkFont(size=14, weight="bold")
        )
        final_link.pack(pady=15)
        
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()
        
    def download_resume(self):
        """generate and download the resume as a PDF file"""
        try:
            # create PDF file
            filename = "Dan_Finn_Resume.pdf"
            doc = SimpleDocTemplate(filename, pagesize=letter,
                                  topMargin=0.5*inch, bottomMargin=0.5*inch,
                                  leftMargin=0.75*inch, rightMargin=0.75*inch)
            
            # container for PDF elements
            story = []
            styles = getSampleStyleSheet()
            
            # custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=20,
                textColor=colors.HexColor('#0056b3'),
                spaceAfter=6,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=colors.HexColor('#0056b3'),
                spaceAfter=20,
                alignment=TA_CENTER
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#0056b3'),
                spaceAfter=6,
                spaceBefore=12,
                fontName='Helvetica-Bold'
            )
            
            subheading_style = ParagraphStyle(
                'CustomSubheading',
                parent=styles['Heading3'],
                fontSize=12,
                spaceAfter=4,
                spaceBefore=8,
                fontName='Helvetica-Bold'
            )
            
            body_style = ParagraphStyle(
                'CustomBody',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=4,
                leftIndent=15
            )
            
            # header section
            story.append(Paragraph("Dan Finn", title_style))
            story.append(Paragraph("Computer Science Student at SUNY Fredonia", subtitle_style))
            story.append(Spacer(1, 0.2*inch))
            
            # about me section (match website PDF generator)
            story.append(Paragraph("ABOUT ME", heading_style))
            story.append(Paragraph("I'm a computer science student at SUNY Fredonia and my main focuses around between all around IT and programming. In my free time, I make a lot of websites, and PC apps, and I am good at getting things done quick while working as they should be. I try to always manage security in any site I build, as I have had lots of work with many different databases!", styles['Normal']))
            story.append(Spacer(1, 0.08*inch))
            story.append(Paragraph("My programming style is very step by step. I learn easiest by going right into projects and figuring things out as I go. This way, if I don't already know how to do something, I get the challenge of learning something new that some people may not have thought was possible. A lot of the work I have done (including school work) has been self taught, forcing me to adapt to new things quick.", styles['Normal']))
            story.append(Spacer(1, 0.08*inch))
            story.append(Paragraph("I get motivated by the feeling of making something work that will actually be useful to someone, whether that be simple automation or a full project to make things easier for someone. Today, it is possible to build almost anything if you have enough faith in yourself and are willing to learn something new.", styles['Normal']))
            story.append(Spacer(1, 0.08*inch))
            story.append(Paragraph("I really enjoy app / web app development. I have connected several websites to cloud databases while managing front-end and back-end of projects (Have done lots of full stack projects). I love remaking games that help me get foundations down, and I have recently gone back on several old projects just to update them to my current standard, which is a lot further than it was when I started.", styles['Normal']))
            story.append(Spacer(1, 0.08*inch))
            story.append(Paragraph("I also have experience with containerization. I successfully built my own cloud storage drive with a working on/off button built into a Python GUI I connected to it! This lets me properly access my cloud storage from anywhere, while keeping all user data (like sign-ins) properly seperated & secured / stored elsewhere.", styles['Normal']))
            story.append(Spacer(1, 0.15*inch))
            
            # education section
            story.append(Paragraph("EDUCATION", heading_style))
            story.append(Paragraph("• Bachelor of Science in Computer Science - SUNY Fredonia (Currently Attending)", body_style))
            story.append(Paragraph("• High School Diploma - Bishop Timon St. Jude High School (Graduated)", body_style))
            story.append(Spacer(1, 0.15*inch))
            
            # IT experience section (match website PDF generator)
            story.append(Paragraph("IT EXPERIENCE", heading_style))

            story.append(Paragraph("eSports Lounge Attendant -- SUNY Fredonia (Still cover shifts occasionally)", subheading_style))
            story.append(Paragraph("• Watch over 12 gaming PCs and 3 other consoles (Xbox, PS5, Nintendo Switch), making sure everything is taken care of and keeping track of user accountability.", body_style))
            story.append(Paragraph("• Managed sign-in and out application, and enforced lounge rules to maintain a respectful and safe gaming lounge.", body_style))
            story.append(Paragraph("• Provided in-person support and updates for the people in the lounge and the gaming PCs and consoles at all times.", body_style))
            story.append(Spacer(1, 0.08*inch))

            story.append(Paragraph("IT Staff -- SUNY Fredonia (Current)", subheading_style))
            story.append(Paragraph("• Issue runner and technical support helper (Moving around and helping over the phone when needed).", body_style))
            story.append(Paragraph("• Helped resolve lots of IT support tickets through our Jira ticket system.", body_style))
            story.append(Paragraph("• Providing tech assistance and system maintenance / set up.", body_style))
            story.append(Paragraph("• OS config / set up (windows & many linux versions + GRUB boot setup)", body_style))
            story.append(Paragraph("• Drive repair / swapping (& re-imaging over network)", body_style))
            story.append(Paragraph("• Helped with a full campus wide switch from google to microsoft & dealt with many complaints but found solutions whenever I could!", body_style))
            story.append(Paragraph("• Remoting operations for storage management (schools systems notifys about the pc's with the lowest storage, my job has been to manage that storage and keep it usable!)", body_style))
            story.append(Spacer(1, 0.08*inch))

            story.append(Paragraph("ITS Internship (Help Desk) -- SUNY Fredonia (Summer 2025)", subheading_style))
            story.append(Paragraph("• Provided in-person, remote, and over the phone technical help for staff and students. (Mainly included swapping drives, taking computers apart, and setting up new ones from the box)", body_style))
            story.append(Paragraph("• Helped take care of our ticket system. Included helping others with permission issues, hardware setup (fixing Computers, TVs, Phones, and even TouchPads), and did lots of extra work following others and assisting setting up new computers when the school was on break!", body_style))
            story.append(Paragraph("• Helped number and track inventory around the entire college campus.", body_style))
            story.append(Spacer(1, 0.08*inch))

            story.append(Paragraph("ITS Internship (Programming) -- SUNY Fredonia (2024--2025)", subheading_style))
            story.append(Paragraph("• Created a Windows-specific Python app to manage workers from three workplaces, separating and organizing saved data properly to a cloud database.", body_style))
            story.append(Paragraph("• This app can automate schedule generation based on worker availability and the workplaces hours of operation.", body_style))
            story.append(Paragraph("• Developed a time sync feature allowing my boss to find last minute shift coverage based on who is available, and to use this app from anywhere, including viewing all of his old schedules.", body_style))
            story.append(Spacer(1, 0.08*inch))

            story.append(Paragraph("AV Club -- Bishop Timon St. Jude", subheading_style))
            story.append(Paragraph("• Worked with professional audio/video equipment for school events and livestreams (basketball games, football games, and pep rallies).", body_style))
            story.append(Paragraph("• Handled live sound setup during shows / livestreams, helped with video recording, and closing edits on the schools sports games.", body_style))
            story.append(Paragraph("• Worked with soundboards, wireless mics, and video cameras.", body_style))
            story.append(Spacer(1, 0.15*inch))
            
            # skills section
            story.append(Paragraph("SKILLS", heading_style))
            story.append(Paragraph("Programming: C++, C#, Python, HTML, SQL, Bash. Some knowledge in Java, Kotlin, R, Perl, Assembly.", body_style))
            story.append(Paragraph("Web: Strong with HTML/JavaScript. Built many web apps.", body_style))
            story.append(Paragraph("Cybersecurity: Networking, routers/switches, troubleshooting.", body_style))
            story.append(Paragraph("OS: Windows, Linux (Ubuntu/Debian), macOS, Android. Command-line and system admin experience.", body_style))
            story.append(Paragraph("VMs: Experienced setting up and configuring virtual machines.", body_style))
            story.append(Spacer(1, 0.15*inch))
            
            # programming projects section
            story.append(Paragraph("PROGRAMMING PROJECTS", heading_style))
            story.append(Paragraph("Portfolio: 18+ Live Web Applications (view at: finn1817.github.io/Main-Website/projects/)", subheading_style))
            
            story.append(Paragraph("Fredonia Workplace Dashboard", subheading_style))
            story.append(Paragraph("A web app I built on my own for SUNY Fredonia ITS to automate and manage 3 workplaces, making scheduling and admin tasks much easier for both staff and students.", body_style))
            
            story.append(Paragraph("NATracker", subheading_style))
            story.append(Paragraph("A group project for real-time file system tracking, designed for workplace use. We decided to make it as a python app!", body_style))
            
            story.append(Paragraph("Main Website", subheading_style))
            story.append(Paragraph("My main portfolio website, combining all my individual sites into a single, modern, multi-page dashboard with light/dark mode feature.", body_style))
            
            story.append(Paragraph("Additional Projects Include:", subheading_style))
            story.append(Paragraph("• Games: 2048, Hangman, Word Search, Square Chase, Calculator", body_style))
            story.append(Paragraph("• Business Tools: Team Manager, Shared Calendar, Resume Builder, File Transfer", body_style))
            story.append(Paragraph("• Utilities: Git Account Info, Unit Converter, Text Editor, Word Counter", body_style))
            
            story.append(Paragraph("Tools Used:", subheading_style))
            story.append(Paragraph("• Microsoft Office Suite (Word, Excel, PowerPoint, Access)", body_style))
            story.append(Paragraph("• Visual Studio / VS Code", body_style))
            story.append(Paragraph("• GitHub (individual & group work)", body_style))
            story.append(Paragraph("• WinSCP (remote file transfer)", body_style))
            story.append(Paragraph("• Terminal / PowerShell (automation, search, admin tasks)", body_style))
            
            story.append(Paragraph("Projects:", subheading_style))
            story.append(Paragraph("• C++: file editors, automation tools, math programs, games, database-linked apps", body_style))
            story.append(Paragraph("• Python: scripting, pattern parsing, automation", body_style))
            story.append(Paragraph("• Bash: install/uninstall scripts, system tweaks on Windows", body_style))
            story.append(Paragraph("• Homebrew/Modding: installed custom firmware, WiiFlow/USB Loader on Wii, handled troubleshooting", body_style))
            
            # build a PDF
            doc.build(story)
            
            # show success message
            messagebox.showinfo("Success", f"Resume PDF downloaded successfully!\nSaved as: {filename}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate PDF: {str(e)}")


if __name__ == "__main__":
    # create and run the app
    app = ResumeApp()
    app.mainloop()
