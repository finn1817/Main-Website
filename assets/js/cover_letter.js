document.addEventListener('DOMContentLoaded', function() {
    // 1. Create the button functionality
    const btn = document.getElementById('billsCoverLetterBtn');
    
    if (btn) {
        btn.addEventListener('click', function() {
            // Check if modal already exists to prevent duplicates
            let modal = document.getElementById('coverLetterModal');
            
            if (!modal) {
                modal = buildCoverLetterModal();
                document.body.appendChild(modal);
            }
            
            // Show the modal
            modal.style.display = 'block';
        });
    }

    // Function to build the modal DOM elements
    function buildCoverLetterModal() {
        // Create main modal container
        const modal = document.createElement('div');
        modal.id = 'coverLetterModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
        `;

        // Create modal content wrapper
        const content = document.createElement('div');
        content.style.cssText = `
            background-color: var(--content-bg, #fff);
            color: var(--text-color, #333);
            margin: 5% auto;
            padding: 40px;
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
            font-family: 'Roboto', sans-serif;
            border: 1px solid var(--collapsible-border, #ccc);
        `;

        // Close button
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            color: var(--subheading-color, #003f7f);
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        `;
        closeBtn.onclick = () => modal.style.display = 'none';

        // Close when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Header Section (using Grid for the spacing in your text)
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = `
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--heading-border, #0056b3);
        `;

        headerDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-bottom: 5px;">
                <span>Daniel Finn</span>
                <span>Network Engineer</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--subheading-color, #003f7f); font-weight: 500;">
                <span>Buffalo Bills - Cover Letter</span>
                <span>Feb 2026</span>
            </div>
        `;

        // The Body Text (Exact Wording)
        const bodyText = document.createElement('div');
        bodyText.style.cssText = `
            line-height: 1.8;
            font-size: 16px;
            text-align: left;
        `;

        bodyText.innerHTML = `
            <p style="margin-bottom: 20px;">
                My name is Daniel Finn, and I am from Buffalo, NY. I worked in IT for the last few years, and my main motivation from my work so far has been in building new problem solving solutions. As a CS student with experience in app development, I went above and beyond building my last app “the Fredonia Workplace Dashboard”. This is a web app that I built to allow my managers to manage all three locations from one website. This project included cloud db (CRUD) integration, automation for schedule generation, and it saves time. It is also in use for my superiors and several workers too, as they can also view their schedules here.
            </p>
            <p style="margin-bottom: 20px;">
                I can’t wait for the opportunity to build tools like this on an even bigger scale, and working for a company like the Buffalo Bills is my life goal! I love Buffalo, and I love the Bills, and I am fully committed to bringing any tech skills I have to the organization. I have hands-on networking experience, and have worked with several different systems. Past that, I can and have programmed in Python, C++, C#, HTML, CSS, JS, and several other languages, and I am confident when I need to learn new things.
            </p>
            <p>
                Right now, I drive an hour just to get to work. I don’t mind the drive though as I really enjoy working in IT. I always show up with energy, and try to do everything I can to help out. Showing up on time and finishing tasks are two things I strive for, and I have been put in front of many tasks in the past, but have always been able to resolve the issue.
            </p>
        `;

        // Assemble
        content.appendChild(closeBtn);
        content.appendChild(headerDiv);
        content.appendChild(bodyText);
        modal.appendChild(content);

        return modal;
    }
});