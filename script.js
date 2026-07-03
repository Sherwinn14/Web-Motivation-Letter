/**
 * script.js - Interactive functions for the Motivation Letter Website
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. MOTIVATION LETTER TAB SYSTEM
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.getAttribute('data-tab');

            // Deactivate all buttons & contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate current button & content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Scroll content wrapper slightly into view on mobile
            if (window.innerWidth < 992) {
                const contentWrapper = document.querySelector('.letter-content-wrapper');
                contentWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // ==========================================
    // 2. THEME TOGGLE (DARK / LIGHT MODE)
    // ==========================================
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        document.body.removeAttribute('data-theme');
        themeIcon.className = 'fa-solid fa-moon';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        
        if (currentTheme === 'light') {
            document.body.removeAttribute('data-theme');
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            themeIcon.className = 'fa-solid fa-sun';
            localStorage.setItem('theme', 'light');
        }
    });

    // ==========================================
    // 3. NAVIGATION LINK SCROLLSPY
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const handleScrollSpy = () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Adjust threshold offset for header height
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScrollSpy);

    // ==========================================
    // 4. CONTACT FORM SUBMISSION (FORMSUBMIT.CO)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitIframe = document.getElementById('contact-submit-iframe');
    
    let isIframeSubmitActive = false;
    let activeSubmitterName = '';

    // Handle iframe load for fallback form submission
    if (submitIframe) {
        submitIframe.addEventListener('load', () => {
            if (isIframeSubmitActive) {
                isIframeSubmitActive = false;
                
                const name = activeSubmitterName || 'Pengunjung';
                formStatus.className = 'form-status success';
                formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Terima kasih, <strong>${name}</strong>! Pesan Anda berhasil terkirim.`;
                
                // Reset button & form
                const submitBtn = contactForm.querySelector('.btn-submit');
                const submitBtnText = submitBtn.querySelector('span');
                submitBtn.disabled = false;
                submitBtnText.textContent = 'Kirim Pesan';
                contactForm.reset();

                // Clear message after 6 seconds
                setTimeout(() => {
                    formStatus.style.opacity = '0';
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.style.opacity = '1';
                    }, 400);
                }, 6000);
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const submitBtnText = submitBtn.querySelector('span');
            const originalText = submitBtnText.textContent;
            
            // Set sending state
            submitBtn.disabled = true;
            submitBtnText.textContent = 'Mengirim...';
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            const name = document.getElementById('name-input').value;
            const email = document.getElementById('email-input').value;
            const subject = document.getElementById('subject-input').value;
            const message = document.getElementById('message-input').value;

            // Prepare FormSubmit payload
            const payload = {
                name: name,
                email: email,
                subject: subject,
                message: message,
                _subject: `Pesan Baru dari Website Motivation Letter: ${subject}`,
                _captcha: "false",
                _template: "box"
            };

            // Send actual POST request via AJAX to FormSubmit
            fetch("https://formsubmit.co/ajax/algasherwin@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(data => {
                // Show success status
                formStatus.className = 'form-status success';
                formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Terima kasih, <strong>${name}</strong>! Pesan Anda berhasil dikirim langsung ke email Alga.`;
                
                // Reset button & form
                submitBtn.disabled = false;
                submitBtnText.textContent = originalText;
                contactForm.reset();

                // Clear message after 6 seconds
                setTimeout(() => {
                    formStatus.style.opacity = '0';
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.style.opacity = '1';
                    }, 400);
                }, 6000);
            })
            .catch(error => {
                console.warn("AJAX submit failed (CORS or network error). Falling back to iframe submit...", error);
                
                // Set status for fallback
                isIframeSubmitActive = true;
                activeSubmitterName = name;
                
                // Submit form programmatically to target the iframe
                contactForm.submit();
            });
        });
    }

    // ==========================================
    // 5. MOTIVATION LETTER PDF DOWNLOAD
    // ==========================================
    const downloadCvBtn = document.getElementById('btn-download-cv');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const element = document.getElementById('printable-letter');
            
            // Change button state to indicate downloading
            const submitBtnText = downloadCvBtn.querySelector('span');
            const originalText = submitBtnText.textContent;
            submitBtnText.textContent = 'Membuat PDF...';
            downloadCvBtn.disabled = true;

            const opt = {
                margin:       15,
                filename:     'Motivation_Letter_Alga_Sherwin_Wicaksana.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2.5, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Run html2pdf to generate and save PDF
            html2pdf().from(element).set(opt).save().then(() => {
                submitBtnText.textContent = originalText;
                downloadCvBtn.disabled = false;
            }).catch(err => {
                console.error("PDF generation error: ", err);
                alert("Gagal mengunduh berkas PDF. Silakan coba lagi.");
                submitBtnText.textContent = originalText;
                downloadCvBtn.disabled = false;
            });
        });
    }

    // ==========================================
    // 6. ANIMATE SKILL BARS ON SCROLL
    // ==========================================
    const skillSection = document.getElementById('profile-section');
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    // Set width to 0% initially, we will trigger width animation on scroll
    skillBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.setAttribute('data-target-width', targetWidth);
        bar.style.width = '0%';
    });

    const animateSkills = () => {
        const sectionPos = skillSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight / 1.2;

        if (sectionPos < screenPos) {
            skillBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-target-width');
                bar.style.width = targetWidth;
            });
            // Remove event listener once animated
            window.removeEventListener('scroll', animateSkills);
        }
    };

    window.addEventListener('scroll', animateSkills);
    // Trigger once in case it's already in view on load
    setTimeout(animateSkills, 500);
});
