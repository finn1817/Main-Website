document.addEventListener("DOMContentLoaded", function() {
    // dom elements
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    const generateResumeBtn = document.getElementById("generateResumeBtn");
    const clearFormBtn = document.getElementById("clearFormBtn");
    const previewContainer = document.getElementById("previewContainer");
    const resumeOutput = document.getElementById("resumeOutput");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const downloadDocxBtn = document.getElementById("downloadDocxBtn");
    const printResumeBtn = document.getElementById("printResumeBtn");
    const generateObjectiveBtn = document.getElementById("generateObjective");
    const enhanceExperienceBtn = document.getElementById("enhanceExperience");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const toast = document.getElementById("toast");
    const templateOptions = document.querySelectorAll(".template-option");
    const pageTransition = document.querySelector(".page-transition");
    
    let currentTemplate = "classic";

    // apply page transition effect
    function applyTransition(callback) {
        pageTransition.classList.add("active");
        setTimeout(function() {
            callback();
            setTimeout(function() {
                pageTransition.classList.remove("active");
            }, 500);
        }, 500);
    }

    // theme management - updated to sync with main site
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    } else {
        themeToggle.textContent = "🌙";
    }
    
    themeToggle.addEventListener("click", function() {
        applyTransition(function() {
            const isDark = body.classList.toggle("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            themeToggle.textContent = isDark ? "☀️" : "🌙";
        });
    });

    // apply transition when navigating away
    document.querySelectorAll("a").forEach(function(link) {
        if (!link.target) { // only apply to links that don't open in new tab
            link.addEventListener("click", function(e) {
                e.preventDefault();
                const href = this.getAttribute("href");
                
                applyTransition(function() {
                    window.location.href = href;
                });
            });
        }
    });

    // show loading overlay
    function showLoading() {
        loadingOverlay.classList.add("active");
    }
    
    // hide loading overlay
    function hideLoading() {
        loadingOverlay.classList.remove("active");
    }
    
    // show toast notification
    function showToast(message, type) {
        type = type || "success";
        toast.textContent = message;
        toast.className = "toast " + type;
        toast.classList.add("active");
        
        setTimeout(function() {
            toast.classList.remove("active");
        }, 3000);
    }

    // template selection
    templateOptions.forEach(function(option) {
        option.addEventListener("click", function() {
            templateOptions.forEach(function(opt) {
                opt.classList.remove("active");
            });
            this.classList.add("active");
            currentTemplate = this.getAttribute("data-template");
            
            if (previewContainer.classList.contains("active")) {
                generateResume();
            }
        });
    });

    // generate resume
    function generateResume() {
        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        
        // validate required fields
        if (!fullName || !email || !phone) {
            showToast("Please fill out all required fields in the Personal Information section.", "error");
            return;
        }
        
        const objective = document.getElementById("objective").value;
        const education = document.getElementById("education").value;
        const workExperience = document.getElementById("workExperience").value;
        const skills = document.getElementById("skills").value;
        const achievements = document.getElementById("achievements").value;
        const projects = document.getElementById("projects").value;
        const references = document.getElementById("references").value;
        
        // generate resume HTML based on template
        let resumeHTML = "";
        
        switch (currentTemplate) {
            case "modern":
                resumeHTML = generateModernTemplate(fullName, email, phone, objective, education, workExperience, skills, achievements, projects, references);
                break;
            case "professional":
                resumeHTML = generateProfessionalTemplate(fullName, email, phone, objective, education, workExperience, skills, achievements, projects, references);
                break;
            default: // classic
                resumeHTML = generateClassicTemplate(fullName, email, phone, objective, education, workExperience, skills, achievements, projects, references);
        }
        
        resumeOutput.innerHTML = resumeHTML;
        previewContainer.classList.add("active");
        
        // scroll to preview if on mobile
        if (window.innerWidth <= 768) {
            previewContainer.scrollIntoView({ behavior: "smooth" });
        }
    }
    
    // generate Classic Template
    function generateClassicTemplate(fullName, email, phone, objective, education, workExperience, skills, achievements, projects, references) {
        return "<div class=\"resume-header\">" +
            "<h1 class=\"resume-name\">" + fullName + "</h1>" +
            "<div class=\"resume-contact\">" +
                "<div class=\"resume-contact-item\">" +
                    "<i class=\"fas fa-envelope\"></i> " + email +
                "</div>" +
                "<div class=\"resume-contact-item\">" +
                    "<i class=\"fas fa-phone\"></i> " + phone +
                "</div>" +
            "</div>" +
        "</div>" +
        
        (objective ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">Professional Summary</h2>" +
            "<div class=\"resume-section-content\">" + objective + "</div>" +
        "</div>" : "") +
        
        (education ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">Education</h2>" +
            "<div class=\"resume-section-content\">" + education + "</div>" +
        "</div>" : "") +
        
        (workExperience ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">Work Experience</h2>" +
            "<div class=\"resume-section-content\">" + workExperience + "</div>" +
        "</div>" : "") +
        
        (skills ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">Skills</h2>" +
            "<div class=\"resume-section-content\">" + skills + "</div>" +
        "</div>" : "") +
        
        (achievements ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">Achievements & Awards</h2>" +
            "<div class=\"resume-section-content\">" + achievements + "</div>" +
        "</div>" : "") +
        
        (projects ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">Projects & Publications</h2>" +
            "<div class=\"resume-section-content\">" + projects + "</div>" +
        "</div>" : "") +
        
        (references ? 
        "<div class=\"resume-section\">" +
            "<h2 class=\"resume-section-title\">References</h2>" +
            "<div class=\"resume-section-content\">" + references + "</div>" +
        "</div>" : "");
    }
    
    // generate Modern Template
    function generateModernTemplate(fullName, email, phone, objective, education, workExperience, skills, achievements, projects, references) {
        return "<div class=\"resume-header\" style=\"background-color: #f0f7ff; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: none;\">" +
            "<h1 class=\"resume-name\" style=\"font-size: 2.5rem; margin-bottom: 10px;\">" + fullName + "</h1>" +
            "<div class=\"resume-contact\" style=\"justify-content: center; gap: 20px;\">" +
                "<div class=\"resume-contact-item\">" +
                    "<i class=\"fas fa-envelope\" style=\"background-color: #3498db; color: white; padding: 8px; border-radius: 50%; margin-right: 10px;\"></i> " + email +
                "</div>" +
                "<div class=\"resume-contact-item\">" +
                    "<i class=\"fas fa-phone\" style=\"background-color: #3498db; color: white; padding: 8px; border-radius: 50%; margin-right: 10px;\"></i> " + phone +
                "</div>" +
            "</div>" +
        "</div>" +
        
        (objective ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 30px;\">" +
            "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; border: none;\">Professional Summary</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + objective + "</div>" +
        "</div>" : "") +
        
        "<div style=\"display: flex; flex-wrap: wrap; gap: 20px;\">" +
            "<div style=\"flex: 3; min-width: 300px;\">" +
                (workExperience ? 
                "<div class=\"resume-section\" style=\"margin-bottom: 30px;\">" +
                    "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; border: none;\">Work Experience</h2>" +
                    "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + workExperience + "</div>" +
                "</div>" : "") +
                
                (education ? 
                "<div class=\"resume-section\" style=\"margin-bottom: 30px;\">" +
                    "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; border: none;\">Education</h2>" +
                    "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + education + "</div>" +
                "</div>" : "") +
                
                (projects ? 
                "<div class=\"resume-section\" style=\"margin-bottom: 30px;\">" +
                    "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; border: none;\">Projects & Publications</h2>" +
                    "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + projects + "</div>" +
                "</div>" : "") +
            "</div>" +
            
            "<div style=\"flex: 2; min-width: 200px;\">" +
                (skills ? 
                "<div class=\"resume-section\" style=\"margin-bottom: 30px; background-color: #f0f7ff; border-radius: 8px; padding: 20px;\">" +
                    "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; margin-top: -30px; border: none;\">Skills</h2>" +
                    "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + skills + "</div>" +
                "</div>" : "") +
                
                (achievements ? 
                "<div class=\"resume-section\" style=\"margin-bottom: 30px;\">" +
                    "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; border: none;\">Achievements & Awards</h2>" +
                    "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + achievements + "</div>" +
                "</div>" : "") +
                
                (references ? 
                "<div class=\"resume-section\" style=\"margin-bottom: 30px;\">" +
                    "<h2 class=\"resume-section-title\" style=\"background-color: #3498db; color: white; padding: 8px 15px; border-radius: 5px; border: none;\">References</h2>" +
                    "<div class=\"resume-section-content\" style=\"padding: 15px 10px;\">" + references + "</div>" +
                "</div>" : "") +
            "</div>" +
        "</div>";
    }
    
    // generate professional template
    function generateProfessionalTemplate(fullName, email, phone, objective, education, workExperience, skills, achievements, projects, references) {
        return "<div class=\"resume-header\" style=\"border-bottom: 3px solid #3498db; padding-bottom: 25px; margin-bottom: 30px; text-align: left;\">" +
            "<h1 class=\"resume-name\" style=\"font-size: 2.2rem; text-transform: uppercase; letter-spacing: 1px;\">" + fullName + "</h1>" +
            "<div class=\"resume-contact\" style=\"justify-content: flex-start; gap: 25px;\">" +
                "<div class=\"resume-contact-item\">" +
                    "<i class=\"fas fa-envelope\"></i> " + email +
                "</div>" +
                "<div class=\"resume-contact-item\">" +
                    "<i class=\"fas fa-phone\"></i> " + phone +
                "</div>" +
            "</div>" +
        "</div>" +
        
        (objective ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">PROFESSIONAL SUMMARY</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + objective + "</div>" +
        "</div>" : "") +
        
        (workExperience ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">WORK EXPERIENCE</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + workExperience + "</div>" +
        "</div>" : "") +
        
        (education ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">EDUCATION</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + education + "</div>" +
        "</div>" : "") +
        
        (skills ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">SKILLS & EXPERTISE</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + skills + "</div>" +
        "</div>" : "") +
        
        (achievements ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">ACHIEVEMENTS & AWARDS</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + achievements + "</div>" +
        "</div>" : "") +
        
        (projects ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">PROJECTS & PUBLICATIONS</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + projects + "</div>" +
        "</div>" : "") +
        
        (references ? 
        "<div class=\"resume-section\" style=\"margin-bottom: 25px;\">" +
            "<h2 class=\"resume-section-title\" style=\"color: #3498db; font-size: 1.4rem; border-bottom: 2px solid #3498db; padding-bottom: 8px;\">REFERENCES</h2>" +
            "<div class=\"resume-section-content\" style=\"padding: 15px 0;\">" + references + "</div>" +
        "</div>" : "");
    }

    // event listeners
    generateResumeBtn.addEventListener("click", generateResume);
    
    clearFormBtn.addEventListener("click", function() {
        if (confirm("Are you sure you want to clear all form fields?")) {
            document.querySelectorAll("input, textarea").forEach(function(input) {
                input.value = "";
            });
            previewContainer.classList.remove("active");
            showToast("Form has been cleared");
        }
    });
    
    // download as PDF
    downloadPdfBtn.addEventListener("click", function() {
        showLoading();
        
        // using jsPDF and html2canvas for PDF generation
        const jsPDF = window.jspdf.jsPDF;
        
        html2canvas(resumeOutput, {
            scale: 2,
            useCORS: true,
            logging: false
        }).then(function(canvas) {
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;
            
            pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(document.getElementById("fullName").value.replace(/\s+/g, "_") + "_Resume.pdf");
            
            hideLoading();
            showToast("PDF downloaded successfully");
        }).catch(function(error) {
            console.error("Error generating PDF:", error);
            hideLoading();
            showToast("Error generating PDF. Please try again.", "error");
        });
    });
    
    // download as DOCX
    downloadDocxBtn.addEventListener("click", function() {
        showLoading();
        
        try {
            const Document = docx.Document;
            const Packer = docx.Packer;
            const Paragraph = docx.Paragraph;
            const TextRun = docx.TextRun;
            const HeadingLevel = docx.HeadingLevel;
            
            // create a new document
            const doc = new Document();
            
            // add content based on form values
            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
            const objective = document.getElementById("objective").value;
            const education = document.getElementById("education").value;
            const workExperience = document.getElementById("workExperience").value;
            const skills = document.getElementById("skills").value;
            const achievements = document.getElementById("achievements").value;
            const projects = document.getElementById("projects").value;
            const references = document.getElementById("references").value;
            
            // create document sections
            const sections = [];
            
            // personal info
            sections.push(
                new Paragraph({
                    text: fullName,
                    heading: HeadingLevel.HEADING_1,
                    thematicBreak: true
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Email: ", bold: true }),
                        new TextRun(email),
                        new TextRun({ text: " | Phone: ", bold: true }),
                        new TextRun(phone)
                    ]
                }),
                new Paragraph({ text: "" })
            );
            
            // objective
            if (objective) {
                sections.push(
                    new Paragraph({
                        text: "PROFESSIONAL SUMMARY",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph(objective),
                    new Paragraph({ text: "" })
                );
            }
            
            // work experience
            if (workExperience) {
                sections.push(
                    new Paragraph({
                        text: "WORK EXPERIENCE",
                        heading: HeadingLevel.HEADING_2
                    })
                );
                workExperience.split("\n").forEach(function(line) {
                    sections.push(new Paragraph(line));
                });
                sections.push(new Paragraph({ text: "" }));
            }
            
            // education
            if (education) {
                sections.push(
                    new Paragraph({
                        text: "EDUCATION",
                        heading: HeadingLevel.HEADING_2
                    })
                );
                education.split("\n").forEach(function(line) {
                    sections.push(new Paragraph(line));
                });
                sections.push(new Paragraph({ text: "" }));
            }
            
            // skills
            if (skills) {
                sections.push(
                    new Paragraph({
                        text: "SKILLS",
                        heading: HeadingLevel.HEADING_2
                    })
                );
                skills.split("\n").forEach(function(line) {
                    sections.push(new Paragraph(line));
                });
                sections.push(new Paragraph({ text: "" }));
            }
            
            // achievements
            if (achievements) {
                sections.push(
                    new Paragraph({
                        text: "ACHIEVEMENTS & AWARDS",
                        heading: HeadingLevel.HEADING_2
                    })
                );
                achievements.split("\n").forEach(function(line) {
                    sections.push(new Paragraph(line));
                });
                sections.push(new Paragraph({ text: "" }));
            }
            
            // projects
            if (projects) {
                sections.push(
                    new Paragraph({
                        text: "PROJECTS & PUBLICATIONS",
                        heading: HeadingLevel.HEADING_2
                    })
                );
                projects.split("\n").forEach(function(line) {
                    sections.push(new Paragraph(line));
                });
                sections.push(new Paragraph({ text: "" }));
            }
            
            // references
            if (references) {
                sections.push(
                    new Paragraph({
                        text: "REFERENCES",
                        heading: HeadingLevel.HEADING_2
                    })
                );
                references.split("\n").forEach(function(line) {
                    sections.push(new Paragraph(line));
                });
                sections.push(new Paragraph({ text: "" }));
            }
            
            // add all sections to the document
            doc.addSection({
                children: sections
            });
            
            // generate and save the document
            Packer.toBlob(doc).then(function(blob) {
                saveAs(blob, fullName.replace(/\s+/g, "_") + "_Resume.docx");
                hideLoading();
                showToast("Word document downloaded successfully");
            });
        } catch (error) {
            console.error("Error generating Word document:", error);
            hideLoading();
            showToast("Error generating Word document. Please try again.", "error");
        }
    });
    
    // print the resume
    printResumeBtn.addEventListener("click", function() {
        window.print();
    });
    
    // AI-assisted objective generation
    generateObjectiveBtn.addEventListener("click", function() {
        const fullName = document.getElementById("fullName").value;
        const workExperience = document.getElementById("workExperience").value;
        const skills = document.getElementById("skills").value;
        const education = document.getElementById("education").value;
        
        if (!workExperience && !skills && !education) {
            showToast("Please fill in some details about your experience, skills, or education first.", "warning");
            return;
        }
        
        showLoading();
        
        // simulate AI generation (in a real app, this would call an API)
        setTimeout(function() {
            let generatedObjective = "Dedicated ";
            
            // extract profession from experience or education
            let profession = "";
            if (workExperience) {
                const lines = workExperience.split("\n");
                if (lines.length > 0) {
                    const firstLine = lines[0].toLowerCase();
                    if (firstLine.includes("developer")) profession = "Software Developer";
                    else if (firstLine.includes("engineer")) profession = "Engineer";
                    else if (firstLine.includes("designer")) profession = "Designer";
                    else if (firstLine.includes("manager")) profession = "Manager";
                    else if (firstLine.includes("analyst")) profession = "Analyst";
                    else profession = "Professional";
                } else {
                    profession = "Professional";
                }
            } else {
                profession = "Professional";
            }
            
            generatedObjective += profession + " with ";
            
            // add experience years if available
            if (workExperience) {
                generatedObjective += "proven experience in ";
                
                // extract key areas from work experience
                let keyAreas = [];
                if (workExperience.toLowerCase().includes("develop")) keyAreas.push("software development");
                if (workExperience.toLowerCase().includes("design")) keyAreas.push("design");
                if (workExperience.toLowerCase().includes("manage")) keyAreas.push("project management");
                if (workExperience.toLowerCase().includes("lead")) keyAreas.push("team leadership");
                if (workExperience.toLowerCase().includes("custom")) keyAreas.push("customer relations");
                
                if (keyAreas.length > 0) {
                    generatedObjective += keyAreas.slice(0, 2).join(" and ") + ". ";
                } else {
                    generatedObjective += "the field. ";
                }
            } else {
                generatedObjective += "a solid educational foundation. ";
            }
            
            // add skills if available
            if (skills) {
                generatedObjective += "Proficient in ";
                
                // extract key skills
                const skillLines = skills.split("\n");
                let keySkills = [];
                for (let i = 0; i < Math.min(skillLines.length, 2); i++) {
                    const line = skillLines[i];
                    if (line.includes(":")) {
                        keySkills.push(line.split(":")[0]);
                    } else {
                        keySkills.push(line);
                    }
                }
                
                if (keySkills.length > 0) {
                    generatedObjective += keySkills.join(" and ") + ". ";
                } else {
                    generatedObjective += "various technical skills. ";
                }
            }
            
            // add education if available
            if (education) {
                if (education.toLowerCase().includes("bachelor")) {
                    generatedObjective += "Holds a Bachelor's degree";
                } else if (education.toLowerCase().includes("master")) {
                    generatedObjective += "Holds a Master's degree";
                } else if (education.toLowerCase().includes("phd") || education.toLowerCase().includes("doctor")) {
                    generatedObjective += "Holds a Doctoral degree";
                } else {
                    generatedObjective += "Has a strong educational background";
                }
                
                if (education.toLowerCase().includes("computer science")) {
                    generatedObjective += " in Computer Science. ";
                } else if (education.toLowerCase().includes("engineering")) {
                    generatedObjective += " in Engineering. ";
                } else if (education.toLowerCase().includes("business")) {
                    generatedObjective += " in Business. ";
                } else {
                    generatedObjective += ". ";
                }
            }
            
            // add career goal
            generatedObjective += "Seeking to leverage my skills and experience to contribute to a dynamic team while continuing to grow professionally.";
            
            document.getElementById("objective").value = generatedObjective;
            hideLoading();
            showToast("Professional summary generated successfully");
        }, 1500);
    });
    
    // enhance work experience descriptions
    enhanceExperienceBtn.addEventListener("click", function() {
        const workExperience = document.getElementById("workExperience").value;
        
        if (!workExperience) {
            showToast("Please add some work experience first.", "warning");
            return;
        }
        
        showLoading();
        
        // simulate AI enhancement (in a real app, this would call an API) - doesnt here
        setTimeout(function() {
            const lines = workExperience.split("\n");
            let enhancedExperience = [];
            let currentPosition = "";
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line === "") {
                    enhancedExperience.push(line);
                    continue;
                }
                
                // detect if this is a position title line
                if (!line.startsWith("•") && !line.startsWith("-") && line.length < 100) {
                    currentPosition = line;
                    enhancedExperience.push(line);
                    continue;
                }
                
                // enhance bullet points
                if (line.startsWith("•") || line.startsWith("-")) {
                    let bulletPoint = line.substring(1).trim();
                    
                    // replace generic verbs with stronger action verbs
                    bulletPoint = bulletPoint.replace(/^worked on/i, "Spearheaded");
                    bulletPoint = bulletPoint.replace(/^helped/i, "Collaborated on");
                    bulletPoint = bulletPoint.replace(/^made/i, "Developed");
                    bulletPoint = bulletPoint.replace(/^did/i, "Executed");
                    bulletPoint = bulletPoint.replace(/^managed/i, "Orchestrated");
                    bulletPoint = bulletPoint.replace(/^used/i, "Leveraged");
                    
                    // add measurable results where possible
                    if (bulletPoint.toLowerCase().includes("develop") && !bulletPoint.includes("%")) {
                        bulletPoint += ", improving efficiency by approximately 25%";
                    }
                    if (bulletPoint.toLowerCase().includes("implement") && !bulletPoint.includes("%")) {
                        bulletPoint += ", resulting in a 30% reduction in processing time";
                    }
                    if (bulletPoint.toLowerCase().includes("design") && !bulletPoint.includes("%")) {
                        bulletPoint += ", enhancing user experience and engagement";
                    }
                    
                    enhancedExperience.push("• " + bulletPoint);
                } else {
                    enhancedExperience.push(line);
                }
            }
            
            document.getElementById("workExperience").value = enhancedExperience.join("\n");
            hideLoading();
            showToast("Work experience enhanced successfully");
        }, 1500);
    });
});