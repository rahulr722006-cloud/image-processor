/* ---------------------------------------------------- */
/* 1. Global Variables, Reset & Base Styles */
/* ---------------------------------------------------- */

:root {
    /* Colors */
    --color-bg-primary: #0A0A1F; /* Deep Dark Blue-Black */
    --color-bg-secondary: #1E1E3F; /* Feature Card Background */
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #C0C0D0;
    --color-border: #333355;

    /* Gradient (Cyan to Purple to Pink) */
    --gradient-neon: linear-gradient(90deg, #5EE6E8, #A36FFF, #FF0090);

    /* Layout */
    --max-width: 1200px;
    --padding-section: 80px 0;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--color-bg-primary);
    color: var(--color-text-secondary);
    line-height: 1.6;
}

a {
    color: var(--color-text-primary);
    text-decoration: none;
}

a:hover {
    color: var(--color-text-secondary);
}

.container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 20px;
}

.section-padding {
    padding: var(--padding-section);
}

/* Helper Class for Gradient Text */
.gradient-text {
    background: var(--gradient-neon);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

/* Helper Class for Gradient Icons */
.gradient-icon {
    font-size: 2em;
    background: var(--gradient-neon);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

/* ---------------------------------------------------- */
/* 2. Header & Navigation */
/* ---------------------------------------------------- */

.header {
    background-color: rgba(10, 10, 31, 0.95); /* Slightly transparent dark BG */
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 15px 0;
    border-bottom: 1px solid var(--color-border);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-group {
    display: flex;
    align-items: center;
    font-size: 1.5em;
    font-weight: 700;
    color: var(--color-text-primary);
}

.studio-logo {
    display: flex;
    align-items: center;
    font-size: 0.7em;
    margin-right: 15px;
    color: var(--color-text-secondary);
    font-weight: 400;
}

.infinity-icon {
    width: 20px; /* Adjust size */
    height: 20px;
    margin-right: 5px;
    /* In a real scenario, this PNG should have a transparent BG */
}

.product-name {
    font-size: 1.2em;
    margin-left: 10px;
}

.nav a {
    margin-left: 30px;
    padding: 5px 0;
    position: relative;
    font-size: 0.95em;
    font-weight: 600;
    transition: color 0.3s;
    color: var(--color-text-secondary);
}

.nav a:hover,
.nav a.active {
    color: var(--color-text-primary);
}

.nav a.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--gradient-neon);
}

/* ---------------------------------------------------- */
/* 3. Hero Section & CTAs */
/* ---------------------------------------------------- */

.hero-section {
    padding: 100px 0 60px;
    text-align: center;
    /* Optional: Subtle radial gradient in the center */
    background: radial-gradient(circle at center top, rgba(255, 0, 144, 0.1), transparent 50%), var(--color-bg-primary);
}

.hero-headline {
    font-size: 4em;
    font-weight: 900;
    color: var(--color-text-primary);
    margin-bottom: 20px;
    line-height: 1.1;
}

.hero-description {
    font-size: 1.2em;
    max-width: 800px;
    margin: 0 auto 40px;
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 60px;
}

.btn {
    padding: 14px 30px;
    font-size: 1em;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.3s;
}

.btn-primary {
    color: var(--color-text-primary);
}

.gradient-bg {
    background: var(--gradient-neon);
    box-shadow: 0 4px 15px rgba(163, 111, 255, 0.4);
}

.btn-secondary {
    background: transparent;
    color: var(--color-text-primary);
    position: relative;
    z-index: 1;
}

/* Gradient Border Effect */
.gradient-border {
    border: 3px solid transparent;
    background: linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box, var(--gradient-neon) border-box;
    box-shadow: 0 0 10px rgba(163, 111, 255, 0.3);
}

/* ---------------------------------------------------- */
/* 4. Security & Privacy Blocks */
/* ---------------------------------------------------- */

.security-blocks {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding-top: 40px;
}

.security-card {
    background-color: var(--color-bg-secondary);
    padding: 30px;
    border-radius: 12px;
    width: 280px;
    text-align: center;
    border: 1px solid var(--color-border);
}

.security-card .icon {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.security-card .card-title {
    color: var(--color-text-primary);
    margin-bottom: 5px;
}

.security-card .card-text {
    font-size: 0.9em;
}

/* ---------------------------------------------------- */
/* 5. Section Titles & Base Layouts */
/* ---------------------------------------------------- */

.section-title {
    font-size: 2.5em;
    font-weight: 900;
    color: var(--color-text-primary);
    text-align: center;
    margin-bottom: 10px;
}

.section-subtitle {
    text-align: center;
    font-size: 1.1em;
    margin-bottom: 50px;
}

/* ---------------------------------------------------- */
/* 6. Main Features Grid */
/* ---------------------------------------------------- */

.features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
}

.feature-card {
    background-color: var(--color-bg-secondary);
    padding: 30px;
    border-radius: 12px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    border: 1px solid var(--color-border);
    text-align: left;
}

.feature-icon {
    font-size: 1.5em;
    /* Flex shrinking to ensure the icon doesn't take too much space */
    flex-shrink: 0; 
    padding-top: 5px;
}

.feature-title {
    color: var(--color-text-primary);
    font-size: 1.25em;
    margin-bottom: 5px;
}

.feature-description {
    font-size: 0.9em;
}

/* ---------------------------------------------------- */
/* 7. Compress Area (Drop Zone) */
/* ---------------------------------------------------- */

.compress-area {
    text-align: center;
}

.drop-zone {
    max-width: 800px;
    margin: 40px auto 0;
    padding: 80px 40px;
    border: 2px dashed var(--color-border);
    border-radius: 16px;
    background-color: var(--color-bg-secondary);
    transition: background-color 0.3s;
}

.upload-icon {
    font-size: 4em;
    margin-bottom: 10px;
}

.drop-title {
    color: var(--color-text-primary);
    font-size: 1.5em;
    margin-bottom: 5px;
}

.drop-formats {
    font-size: 0.9em;
}

/* ---------------------------------------------------- */
/* 8. How It Works Section (Steps) */
/* ---------------------------------------------------- */

.steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    margin-top: 40px;
}

.step-card {
    background-color: var(--color-bg-secondary);
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    border: 1px solid var(--color-border);
}

.step-icon {
    font-size: 2em;
    font-weight: 700;
    margin-bottom: 15px;
    /* Use the gradient for the step number/icon */
}

.step-title {
    color: var(--color-text-primary);
    font-size: 1.2em;
    margin-bottom: 10px;
}

/* ---------------------------------------------------- */
/* 9. FAQ Section (Accordion) */
/* ---------------------------------------------------- */

.faq-accordion {
    max-width: 800px;
    margin: 40px auto 0;
}

.faq-item {
    margin-bottom: 15px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
}

.faq-question {
    width: 100%;
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
    text-align: left;
    padding: 20px;
    font-size: 1.1em;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s;
}

.faq-question:hover {
    background-color: #2a2a50;
}

.faq-icon {
    font-size: 1.2em;
    /* Rotates using JavaScript */
    transform: rotate(0deg); 
    transition: transform 0.3s;
}

.faq-answer {
    background-color: var(--color-bg-primary);
    padding: 0 20px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-out, padding 0.4s;
}

.faq-answer p {
    padding: 15px 0;
    margin: 0;
    border-top: 1px solid var(--color-border);
}

/* JavaScript active state */
.faq-question.active .faq-icon {
    transform: rotate(180deg);
}
.faq-question.active + .faq-answer {
    max-height: 200px; /* Needs to be large enough to contain content */
    padding: 0 20px 20px;
}


/* ---------------------------------------------------- */
/* 10. Footer */
/* ---------------------------------------------------- */

.footer {
    padding-top: 60px;
    background-color: var(--color-bg-secondary); /* Footer is slightly lighter/different BG */
    border-top: 1px solid var(--color-border);
}

.footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 40px;
    padding-bottom: 40px;
}

.footer-title {
    color: var(--color-text-primary);
    font-size: 1.1em;
    margin-bottom: 15px;
}

.footer-branding p {
    font-size: 0.9em;
    margin-bottom: 10px;
}

.footer-col ul {
    list-style: none;
    padding: 0;
}

.footer-col li a {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9em;
    color: var(--color-text-secondary);
    transition: color 0.3s;
}

.footer-col li a:hover {
    color: var(--color-text-primary);
}

.copyright {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid var(--color-border);
    background-color: #101030; /* Slight variation in bottom bar */
}

.copyright p {
    font-size: 0.8em;
    color: var(--color-text-secondary);
}