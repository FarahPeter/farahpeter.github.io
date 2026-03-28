# Project Context for Gemini AI

**To the AI Assistant:** Please read this document carefully before generating code, suggesting refactors, or explaining concepts within this project. Adhere strictly to the guidelines and context provided below.

## 1. Project Overview
* **Project Name:** farahpeter.github.io
* **Description:** A personal portfolio website to showcase my projects, resume, and blog posts.
* **Primary Goal:** To be highly performant, accessible, and maintain a clean, modern aesthetic.
* **Target Audience:** Recruiters, hiring managers, and fellow developers.

## 2. Tech Stack & Environment
* **Language:** HTML, CSS, JavaScript
* **Environment:** PyCharm IDE
* **Deployment:** Github Pages

## 3. Project Structure
* `index.html`: Main landing page and profile.
* `fun.html`: The "Interactive Hub" containing links to tools and simulators.
* `blog.html`: Research write-ups .
* `server.html`: server access pages.
* `/FUN`: Directory containing standalone interactive tools (e.g., `nmap.html`, `json.html`, `AQMgame.html`).
* `/Files`: Assets including images, favicons, and CV/Resume PDFs.
* `styles.css`: Global stylesheet using CSS variables for theming.
* `script.js`: Global JavaScript for theme toggling and navigation logic.

## 4. Coding Standards & Conventions
When generating code for this project, please follow these rules:
* **HTML:** Use semantic HTML5 elements. Ensure high accessibility scores.
* **CSS:** Use CSS variables (defined in `:root`) for colors and spacing. Follow the "reveal" animation pattern and glassmorphism style.
* **JavaScript:** Prefer Vanilla JS. Use modern ES6+ syntax. Ensure functions are well-commented.
* **Naming:** Use `kebab-case` for CSS classes and IDs, and `camelCase` for JavaScript variables/functions.

## 5. Frontend Rules
* Use custom CSS with the established variable system over external libraries.
* Ensure all interactive elements include proper ARIA attributes.
* Maintain the "Cybersecurity" aesthetic: JetBrains Mono font, dark mode by default, and glitch/typing effects where appropriate.

## 6. Testing Requirements
* Manual cross-browser testing for responsiveness (Mobile/Desktop).
* Validate HTML/CSS against W3C standards where possible.

## 7. Current Project Focus
* Expanding the "Interactive Hub" with new networking and security tools.

## 7. Additional notes
* If a section of code is commented, keep it commented unless explicitly asked to change it

---
**End of Context.** Please acknowledge these rules when assisting with this project.
