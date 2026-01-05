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
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Set appearance mode and default color theme
# Light mode will be the startup (matching website default)
ctk.set_appearance_mode("light")
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
        
        # Email config (base64 encoded to keep it hidden in code)
        # to change email if im ever gonna: base64.b64encode("your.email@example.com".encode()).decode()
        self.encoded_email = "ZGFubnlmaW5uOUBnbWFpbC5jb20="  # decodes to my gmail
        
        # create the header section with title and buttons
        self.create_header()
        
        # create the tabbed navigation system
        self.create_tabs()
        
        # create the footer
        self.create_footer()
        
        # show the About Me tab by default
        self.show_tab("about")
        
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
            text="☀️ Toggle Theme",
            command=self.toggle_theme,
            width=150
        )
        self.theme_button.pack(side="left", padx=5)
        
        # download resume button
        self.download_button = ctk.CTkButton(
            self.buttons_frame,
            text="📥 Download Resume",
            command=self.download_resume,
            width=150
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
            ("contact", "Contact"),
            ("programming", "Programming")
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
            self.theme_button.configure(text="🌙 Toggle Theme")
        else:
            ctk.set_appearance_mode("light")
            self.current_theme = "light"
            self.theme_button.configure(text="☀️ Toggle Theme")
            
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
            "I am a computer science student at Fredonia University with a big interest in coding. I have finished classes using C++, Python, C#, HTML, Bash, Assembly Language, and a few other languages. I enjoy harder projects that actually let me learn and grow as a programmer.",
            "My style is being straightforward with my code and commenting on everything that I do line by line. It has helped me and everyone that I work with UNDERSTAND what is happening. I like to see it work, not just have it work. In web projects, I usually keep things simple by writing all the code in one file so everything's easy to see and run when shared.",
            "I am fascinated by web development and design. I think they both go together. I have always tried my best to do projects that interest me and make me enjoy coding.",
            "From building web apps at SUNY Fredonia ITS to creating my own projects, I like working with systems that ACTUALLY make a change to users' lives and help people out."
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
        
        college_title = ctk.CTkLabel(
            college_section,
            text="🎓 Higher Education - College",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        college_title.pack(pady=10, anchor="w", padx=15)
        
        college_info = [
            "Bachelor of Science in Computer Science - SUNY Fredonia (Currently Attending)",
            "My main focusses are on web development & design, software development (python, c++, and lots of system based programming), personal/work projects (also including lots of system mods/tweaks, personal management scripts for docker/ files/ etc, and personal games!)",
            "Captain - of (eSports) Rocket League - For the SUNY Fredonia eSports Team"
        ]
        
        for info in college_info:
            info_label = ctk.CTkLabel(
                college_section,
                text=f"• {info}",
                font=ctk.CTkFont(size=13),
                wraplength=780,
                justify="left"
            )
            info_label.pack(pady=3, anchor="w", padx=25)
            
        # view courses button
        courses_btn = ctk.CTkButton(
            college_section,
            text="📚 View my Completed Computer Science Courses",
            command=self.show_courses_modal,
            width=350
        )
        courses_btn.pack(pady=15)
        
        # divider
        divider = ctk.CTkFrame(frame, height=2, fg_color=("gray70", "gray40"))
        divider.pack(fill="x", pady=15)
        
        # high school section
        hs_section = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
        hs_section.pack(fill="x", pady=10, padx=5)
        
        hs_title = ctk.CTkLabel(
            hs_section,
            text="🏫 High School Education",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        hs_title.pack(pady=10, anchor="w", padx=15)
        
        hs_info = [
            "High School Diploma - Bishop Timon St. Jude High School (Graduated)",
            "Active member of AV Club, managing audio/video equipment for school events",
            "Captain - (Varsity) Soccer"
        ]
        
        for info in hs_info:
            info_label = ctk.CTkLabel(
                hs_section,
                text=f"• {info}",
                font=ctk.CTkFont(size=13),
                wraplength=780,
                justify="left"
            )
            info_label.pack(pady=3, anchor="w", padx=25)
            
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
                    "CSIT 201 - Computer Security and Ethics",
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
                    "CSIT 471 - Information Systems Management"
                ]
            },
            {
                "category": "Math",
                "courses": [
                    "CSIT 241 - Discrete Mathematics",
                    "STAT 200 - Fundamentals of Statistics",
                    "STAT 250 - Statistics for Computer Science",
                    "MATH 120 - Calculus I",
                    "MATH 121 - Calculus II"
                ]
            },
            {
                "category": "Business",
                "courses": [
                    "PHED 189 - eSports (Business)",
                    "MUSB 301 - Music Copyrights",
                    "BUAD 323 - Organizational Behavior",
                    "BUAD 346 - Professional B2B Selling"
                ]
            },
            {
                "category": "Music",
                "courses": [
                    "MUS 101 - Music Theory I",
                    "MUS 115 - Music Appreciation",
                    "MUS 233 - Musics of the World",
                    "MUSB 301 - Music Copyrights"
                ]
            }
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
            text="IT Experience",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        title.pack(pady=(10, 20), anchor="w")
        
        # define all experience entries
        experiences = [
            {
                "title": "eSports Lounge Attendant -- SUNY Fredonia (Current)",
                "details": [
                    "Watch over 12 gaming PCs and 3 other consoles (Xbox, PS5, Nintendo Switch), making sure everything is taken care of and keeping track of user accountability.",
                    "Managed sign-in and out application, and enforced lounge rules to maintain a respectful and safe gaming lounge.",
                    "Provided in-person support and updates for the people in the lounge and the gaming PCs and consoles at all times."
                ]
            },
            {
                "title": "IT Staff -- SUNY Fredonia (Current)",
                "details": [
                    "Issue runner and technical support helper (Moving around and helping over the phone when needed).",
                    "Helped resolve lots of IT support tickets through our Jira ticket system.",
                    "Providing tech assistance and system maintenance / set up.",
                    "OS config / set up (windows & many linux versions + GRUB boot setup)",
                    "Drive repair / swapping (& re-imaging over network)",
                    "Helped with a full campus wide switch from google to microsoft & dealt with many complaints but found solutions whenever I could!",
                    "Remoting operations for storage management (schools systems notifys about the pc's with the lowest storage, my job has been to manage that storage and keep it usable!)"
                ]
            },
            {
                "title": "ITS Internship (Help Desk) -- Summer 2025",
                "details": [
                    "Provided in-person, remote, and over the phone technical help for staff and students. (Mainly included swapping drives, taking computers apart, and setting up new ones from the box) (Also included helping several people work through a google to microsoft complete transfer)",
                    "Helped take care of our ticket system. Included helping others with permission issues, hardware setup (fixing Computers, TVs, Phones, and even TouchPads), and did lots of extra work following others and assisting setting up new computers when the school was on break!",
                    "Helped number and track inventory around the entire college campus."
                ]
            },
            {
                "title": "ITS Internship (Programming) -- 2024--2025",
                "details": [
                    "Created a Windows-specific Python app to manage workers from three workplaces, separating and organizing saved data properly to a cloud database.",
                    "This app can automate schedule generation based on worker availability and the workplaces hours of operation.",
                    "Developed a time sync feature allowing my boss to find last minute shift coverage based on who is available, and to use this app from anywhere, including viewing all of his old schedules."
                ]
            },
            {
                "title": "AV Club -- Bishop Timon St. Jude",
                "details": [
                    "Worked with professional audio/video equipment for school events and livestreams (basketball games, football games, and pep rallies).",
                    "Handled live sound setup during shows / livestreams, helped with video recording, and closing edits on the schools sports games.",
                    "Worked with soundboards, wireless mics, and video cameras."
                ]
            }
        ]
        
        # create collapsible sections for each experience
        for exp in experiences:
            self.create_collapsible_section(frame, exp["title"], exp["details"])
            
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()
        
    def create_collapsible_section(self, parent, title, details):
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
                    "Lots of experience using C++, C#, Python, HTML, SQL, and Bash. Some background in Java, Kotlin, R, Perl, and even Assembly."
                ]
            },
            {
                "title": "Web Dev",
                "details": [
                    "Strong with HTML/JavaScript. I have personally built many web apps and websites, one used through a SUNY ITS workplace."
                ]
            },
            {
                "title": "Cybersecurity",
                "details": [
                    "Have experience Networking, configuring routers/switches, and troubleshooting issues."
                ]
            },
            {
                "title": "Operating Systems",
                "details": [
                    "Lots of experience using Windows (My main machine), but I am good with Linux (Ubuntu/Debian), macOS, and Android. Have used lots of Command-line needing system admin to get things done."
                ]
            },
            {
                "title": "Virtual Machines",
                "details": [
                    "Experienced setting up and configuring virtual machines, lots of experience using as well."
                ]
            },
            {
                "title": "Tools Used",
                "details": [
                    "Microsoft Office Products (Word, Excel, PowerPoint, Access, Outlook, Calendar)",
                    "Google Services (Docs, Sheets, Slides, Forms, Calendar)",
                    "Visual Studio / Visual Studios Code",
                    "GitHub (individual & group work) - Lots of use with VS Code",
                    "Unity (from game design courses)",
                    "WinSCP (for remote file transfer)",
                    "Terminal / PowerShell (automation, search, admin checks, downloads, file editing)"
                ]
            },
            {
                "title": "Projects",
                "details": [
                    "C++: file editors, automation tools, windows manipulation to work with some c# apps I made for personal use, remaking fun games, and for database-linked apps",
                    "Python: Biggest was a Schedule Maker for ITS (makes schedules based on worker availability and hours of operation), Simple scripting, pattern parsing, and some automation",
                    "Bash: I have used this for several install & uninstall scripts, and for system tweaks on Windows",
                    "Homebrew/Modding: installed custom firmware, WiiFlow/USB Loader on Wii, handled troubleshooting (Certain I can pick on new things - as this was messing with nintendo software, I had never done it before then and have done it lots since)"
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
            text="Fill out the form below and click Send. Your default email client will open with the message ready to send!",
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
        submit_btn = ctk.CTkButton(
            form_frame,
            text="Send",
            command=self.submit_contact_form,
            height=45,
            font=ctk.CTkFont(size=16)
        )
        submit_btn.pack(pady=20)
        
        # add spacing at bottom
        ctk.CTkLabel(frame, text="", height=20).pack()
        
    def submit_contact_form(self):
        """handle contact form submission via mailto"""
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
            # decode email address
            to_email = base64.b64decode(self.encoded_email).decode()
            
            # create email subject and body
            subject = f"Resume Contact from {name}"
            body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
            
            # URL encode the subject and body
            subject_encoded = urllib.parse.quote(subject)
            body_encoded = urllib.parse.quote(body)
            
            # create mailto URL
            mailto_url = f"mailto:{to_email}?subject={subject_encoded}&body={body_encoded}"
            
            # open default email client
            webbrowser.open(mailto_url)
            
            # show success message
            messagebox.showinfo(
                "Email Client Opened", 
                "Your default email client has been opened with the message ready to send!\n\nPlease send the email from your email client."
            )
            
            # clear the form
            self.name_entry.delete(0, "end")
            self.email_entry.delete(0, "end")
            self.message_entry.delete("1.0", "end")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open email client: {str(e)}\n\nPlease ensure you have a default email client configured.")
            
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
        
        # featured projects with GitHub links
        featured_projects = [
            {
                "title": "Fredonia Workplace Dashboard",
                "github": "https://github.com/finn1817/Fredonia-Workplace-Dashboard",
                "details": [
                    "A web app I built on my own for SUNY Fredonia ITS to automate and manage 3 workplaces, making scheduling and admin tasks much easier for both staff and students."
                ]
            },
            {
                "title": "NATracker",
                "github": "https://github.com/finn1817/NATracker",
                "details": [
                    "A group project for real-time file system tracking, designed for workplace use. We decided to make it as a python app!"
                ]
            },
            {
                "title": "Main Website",
                "github": "https://github.com/finn1817/Main-Website",
                "details": [
                    "My main portfolio website, combining all my individual sites into a single, modern, multi-page dashboard with light/dark mode feature."
                ]
            }
        ]
        
        for project in featured_projects:
            # project container
            project_container = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
            project_container.pack(fill="x", pady=5, padx=5)
            
            # header with title and GitHub link button
            header_frame = ctk.CTkFrame(project_container, fg_color="transparent")
            header_frame.pack(fill="x", padx=10, pady=10)
            
            project_title = ctk.CTkLabel(
                header_frame,
                text=project["title"],
                font=ctk.CTkFont(size=14, weight="bold"),
                anchor="w"
            )
            project_title.pack(side="left", expand=True, fill="x")
            
            github_btn = ctk.CTkButton(
                header_frame,
                text="[View on GitHub]",
                command=lambda url=project["github"]: webbrowser.open(url),
                width=130,
                height=28,
                fg_color="transparent",
                border_width=1,
                font=ctk.CTkFont(size=12)
            )
            github_btn.pack(side="right")
            
            # project details
            for detail in project["details"]:
                detail_label = ctk.CTkLabel(
                    project_container,
                    text=f"• {detail}",
                    font=ctk.CTkFont(size=12),
                    wraplength=780,
                    justify="left",
                    anchor="w"
                )
                detail_label.pack(anchor="w", padx=25, pady=(0, 10))
                
        # portfolio categories section
        categories_frame = ctk.CTkFrame(frame, fg_color=("gray85", "gray25"))
        categories_frame.pack(fill="x", pady=20, padx=5)
        
        cat_title = ctk.CTkLabel(
            categories_frame,
            text="📋 Portfolio Categories",
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
            
            # about me section
            story.append(Paragraph("ABOUT ME", heading_style))
            story.append(Paragraph("I am a computer science student at Fredonia University with a big interest in coding. I have finished classes using C++, Python, C#, HTML, Bash, Assembly Language, and a few other languages. I enjoy harder projects that actually let me learn and grow as a programmer.", body_style))
            story.append(Spacer(1, 0.15*inch))
            
            # education section
            story.append(Paragraph("EDUCATION", heading_style))
            story.append(Paragraph("• Bachelor of Science in Computer Science - SUNY Fredonia (Currently Attending)", body_style))
            story.append(Paragraph("• High School Diploma - Bishop Timon St. Jude High School (Graduated)", body_style))
            story.append(Spacer(1, 0.15*inch))
            
            # IT experience section
            story.append(Paragraph("IT EXPERIENCE", heading_style))
            
            story.append(Paragraph("eSports Lounge Attendant -- SUNY Fredonia (Current)", subheading_style))
            story.append(Paragraph("• Watched over 12 gaming PCs and 3 other consoles (Xbox, PS5, Nintendo Switch), making sure everything is taken care of and keeping track of user accountability.", body_style))
            story.append(Paragraph("• Managed sign-in and out application, and enforced lounge rules to maintain a respectful and safe gaming lounge.", body_style))
            story.append(Paragraph("• Provided in-person support and updates for gaming PCs and consoles at all times.", body_style))
            
            story.append(Paragraph("IT Staff -- SUNY Fredonia (Current)", subheading_style))
            story.append(Paragraph("• Jira system ticket runner and technical support specialist.", body_style))
            story.append(Paragraph("• Managing and resolving IT support tickets through Jira workflow system.", body_style))
            story.append(Paragraph("• Providing ongoing technical assistance and system maintenance.", body_style))
            
            story.append(Paragraph("ITS Internship (Help Desk) -- Summer 2025", subheading_style))
            story.append(Paragraph("• Provided in-person and remote technical assistance for staff, faculty, and students.", body_style))
            story.append(Paragraph("• Supported ticket-based system issues including software installs, permission troubleshooting, and hardware setup.", body_style))
            story.append(Paragraph("• Worked with the ITS team to streamline tech operations and reduce repetitive bottlenecks across departments.", body_style))
            
            story.append(Paragraph("ITS Internship (Programming) -- 2024-2025", subheading_style))
            story.append(Paragraph("• Created a Windows-specific Python app to manage workers from three workplace locations, separating and organizing saved data properly to the cloud.", body_style))
            story.append(Paragraph("• Automated schedule generation based on worker availability and workplace hours of operation.", body_style))
            story.append(Paragraph("• Developed a real-time feature allowing managers to find last-minute shift coverage based on availability.", body_style))
            
            story.append(Paragraph("AV Club -- Bishop Timon St. Jude", subheading_style))
            story.append(Paragraph("• Worked with professional audio/video equipment for school events and livestreams (basketball / football games).", body_style))
            story.append(Paragraph("• Handled live sound setup, video recording, and closing.", body_style))
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
