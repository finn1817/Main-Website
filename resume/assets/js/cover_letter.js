/**
 * Cover Letter Modal Management
 * I can handle displaying cover letters for different job applications here
 */

document.addEventListener('DOMContentLoaded', function() {
    const coverLettersBtn = document.getElementById('coverLettersBtn');
    const coverLettersModal = document.getElementById('coverLettersModal');
    const coverLettersClose = document.getElementById('coverLettersClose');
    const coverLetterContent = document.getElementById('coverLetterContent');
    
    // Bills cover letter
    const coverLetters = {
        bills: {
            title: "Buffalo Bills - Network Engineer Position",
            content: `
                <div style="line-height: 1.8; text-align: left;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-bottom: 5px;">
                            <span>Daniel Finn</span>
                            <span>Network Engineer</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; color: var(--subheading-color); font-weight: 500;">
                            <span>Buffalo Bills - Cover Letter</span>
                            <span>Feb 2026</span>
                        </div>
                    </div>
                    
                    <p style="margin-bottom: 20px;">
                        My name is Daniel Finn, and I am from Buffalo, NY. I worked in IT for the last few years, and my main motivation from my work so far has been in building new problem solving solutions. As a CS student with experience in app development, I went above and beyond building my last app "the Fredonia Workplace Dashboard". This is a web app that I built to allow my managers to manage all three locations from one website. This project included cloud db (CRUD) integration, automation for schedule generation, and it saves time. It is also in use for my superiors and several workers too, as they can also view their schedules here.
                    </p>
                    <p style="margin-bottom: 20px;">
                        I can't wait for the opportunity to build tools like this on an even bigger scale, and working for a company like the Buffalo Bills is one my life goals. I love Buffalo, and I love the Bills, and I am fully committed to bringing any tech skills and everything I have to the organization. I have hands-on networking experience, and have worked with several different systems. Past that, I can and have programmed in Python, C++, C#, HTML, CSS, JS, and several other languages, and I am confident when I need to learn new things.
                    </p>
                    <p style="margin-bottom: 20px;">
                        Right now, I drive an hour just to get to work. I don't mind the drive though as I really enjoy working in IT. I always show up with energy, and try to do everything I can to help out. Showing up on time and finishing tasks are two things I strive for, and I have been put in front of many tasks in the past, but have always been able to resolve the issue.
                    </p>
                    <p><strong>Go Bills!</strong></p>
                </div>
            `
        },
        generic: {
            title: "IT Positions",
            content: `
                <div style="line-height: 1.8; text-align: left;">
                    <p style="margin-bottom: 20px;"><strong>Dear Hiring Manager,</strong></p>
                    
                    <p style="margin-bottom: 20px;">
                        I am writing to express my interest in any IT position at your organization. As a Computer Science student at SUNY Fredonia with hands-on experience in IT, system administration, and programming, I am confident I can make a valuable member of any team.
                    </p>
                    
                    <p style="margin-bottom: 15px;"><strong>My Experience:</strong></p>
                    
                    <p style="margin-bottom: 20px;">
                        Currently serving as IT Staff at SUNY Fredonia, I provide technical support, maintain systems, repair hardware, manage network issues / resolutions, and handle some larger scale database projects. I've also completed internships in help desk operations and programming, giving me a huge grasp on IT operations.
                    </p>
                    
                    <p style="margin-bottom: 15px;"><strong>Technical Proficiency:</strong></p>
                    <ul style="margin-left: 20px; margin-bottom: 20px;">
                        <li>Operating Systems: Windows, Linux (multiple distributions), & macOS</li>
                        <li>Programming: Python, C++, Web (HTML, CSS, JS), C#, Bash, & SQL</li>
                        <li>Networking: Cisco equipment, set-up, routing, switching, troubleshooting</li>
                        <li>Hardware: System builds, repairs, diagnostics, drive imaging</li>
                        <li>Cloud Technology: Database management, containerization (Docker), Firebase proficiency</li>
                    </ul>
                    
                    <p style="margin-bottom: 20px;">
                        I am good at finding and fixing issues quickly and explaining what went wrong to the user. Whether it's resolving support tickets, setting up new systems, or developing automation tools, I always focus on efficiency on functionlity more than anything else.
                    </p>
                    
                    <p style="margin-bottom: 20px;">
                        I am very excited about the new stadium opportunity and would be happy to bring my skills and dedication to your organization!
                    </p>
                    
                    <p><strong>Sincerely,</strong><br>
                    <strong>Dan Finn</strong><br>
                    Computer Science Student, SUNY Fredonia<br>
                    Email: <a href="mailto:finn1817@fredonia.edu" style="color: var(--subheading-color);">finn1817@fredonia.edu</a></p>
                </div>
            `
        }
    };
    
    // Open modal and show selection menu
    if (coverLettersBtn) {
        coverLettersBtn.addEventListener('click', function() {
            if (coverLettersModal) {
                coverLettersModal.style.display = 'block';
                showCoverLetterMenu();
            }
        });
    }
    
    // Close modal
    if (coverLettersClose) {
        coverLettersClose.addEventListener('click', function() {
            coverLettersModal.style.display = 'none';
        });
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === coverLettersModal) {
            coverLettersModal.style.display = 'none';
        }
    });
    
    // Show cover letter selection menu
    function showCoverLetterMenu() {
        if (coverLetterContent) {
            coverLetterContent.innerHTML = `
                <h2>Select a Cover Letter</h2>
                <div class="cover-letter-selection">
                    <button class="cover-letter-btn bills" onclick="showCoverLetter('bills')">
                        Buffalo Bills - Network Engineer
                    </button>
                    <button class="cover-letter-btn generic" onclick="showCoverLetter('generic')">
                        IT Positions
                    </button>
                </div>
                <p style="text-align: center; margin-top: 30px; color: var(--text-color); opacity: 0.7; font-size: 14px;">
                    Click a button above to view the corresponding cover letter
                </p>
            `;
        }
    }
    
    // Show specific cover letter
    window.showCoverLetter = function(type) {
        const letter = coverLetters[type];
        if (letter && coverLetterContent) {
            coverLetterContent.innerHTML = `
                <button class="back-btn" onclick="showCoverLetterMenu()">
                    ← Back to Selection
                </button>
                <h2>${letter.title}</h2>
                <div style="background: var(--content-bg); padding: 20px; border-radius: 8px; border: 1px solid var(--collapsible-border);">
                    ${letter.content}
                </div>
            `;
        }
    };
    
    // Make showCoverLetterMenu available globally for the back button
    window.showCoverLetterMenu = showCoverLetterMenu;
});
