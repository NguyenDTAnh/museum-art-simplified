lucide.createIcons();

gsap.registerPlugin(ScrollTrigger);

const triggers = [];

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;
const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
const saveData = navigator.connection && navigator.connection.saveData;
const enhancedMotion = true;
if (enhancedMotion) document.documentElement.classList.add("gsap-active");

let lenis;
window.lenis = null;
if (enhancedMotion) {
    window.lenis = lenis = new Lenis({
        autoRaf: false,
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);

        window.addEventListener("resize", () => {
            if (window.lenis) window.lenis.resize();
        });
    }
    requestAnimationFrame(raf);
}

function splitWords(element) {
    if (!element || element.dataset.splitWordsDone === "1") {
        return [];
    }

    const originalText = element.textContent || "";
    const words = originalText.trim().split(/\s+/).filter(Boolean);
    const fragment = document.createDocumentFragment();
    const spans = [];

    words.forEach((word, index) => {
        const span = document.createElement("span");
        span.className = "split-word";
        span.textContent = word;
        fragment.appendChild(span);
        spans.push(span);

        if (index < words.length - 1) {
            fragment.appendChild(document.createTextNode(" "));
        }
    });

    element.textContent = "";
    element.appendChild(fragment);
    element.dataset.splitWordsDone = "1";

    return spans;
}

function initSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    const scrollWrapper = document.getElementById("splash-scroll-wrapper");

    if (!splashScreen || !scrollWrapper) {
        return;
    }

    // Khóa scroll khi preloader đang chạy
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    if (!enhancedMotion) {
        splashScreen.style.display = "none";
        document.body.style.overflow = "";
        if (window.lenis) {
            window.lenis.start();
            window.lenis.resize();
            ScrollTrigger.refresh();
        }
        gsap.from(".hero-title", {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power2.out",
        });
        gsap.from(".hero-description", {
            opacity: 0,
            y: 18,
            duration: 0.6,
            delay: 0.12,
            ease: "power2.out",
        });
        gsap.from(".hero-provider", {
            opacity: 0,
            y: 12,
            duration: 0.5,
            delay: 0.2,
            ease: "power2.out",
        });
        return;
    }

    let isComplete = false;
    const textParts = [
        "#splash-text-part1",
        "#splash-text-part2",
        "#splash-text-part3",
    ];
    const tl = gsap.timeline();

    textParts.forEach((selector, i) => {
        const el = document.querySelector(selector);
        if (!el) {
            return;
        }

        const chars = el.innerText
            .split("")
            .map(
                (char) =>
                    `<span class="inline-block translate-y-full font-heading">${char === " " ? "&nbsp;" : char}</span>`,
            )
            .join("");

        el.innerHTML = chars;

        tl.to(
            `${selector} span`,
            {
                y: 0,
                duration: 1,
                stagger: 0.02,
                ease: "power4.out",
            },
            i * 0.1,
        );
    });

    const sketch = (p) => {
        const shapes = [];
        let scrollLeftVal = 0;
        let autoMode = false;
        let autoFrames = 0;
        const scrollSpeed = window.innerWidth < 700 ? 5 : 12;

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.pixelDensity(1);
            p.noStroke();
            p.rectMode(p.CENTER);

            setTimeout(() => {
                if (!isComplete) {
                    autoMode = true;
                }
            }, 1000); // Start faster
        };

        p.draw = () => {
            p.clear();

            if (isComplete) {
                return;
            }

            if (autoMode) {
                autoFrames++;
                const rw = p.windowWidth < 700 ? 80 : 200;
                const rh = p.windowWidth < 700 ? 60 : 80;

                const autoY =
                    p.windowHeight / 2 +
                    p.sin(autoFrames * 0.05) * (p.windowHeight / 3);
                const autoX =
                    p.windowWidth / 2 -
                    p.cos(autoFrames * 0.02) * (p.windowWidth / 2);

                shapes.push(new ShapeRect(autoX, autoY, rw, rh));
                scrollLeftVal -= scrollSpeed;
                gsap.set(scrollWrapper, { x: scrollLeftVal });
            }

            p.fill(0);
            for (let i = shapes.length - 1; i >= 0; i -= 1) {
                shapes[i].move();
                shapes[i].display();
            }

            if (shapes.length > 250) {
                shapes.splice(0, shapes.length - 250);
            }

            const scrollRect = scrollWrapper.getBoundingClientRect();
            if (
                scrollRect.right < p.windowWidth &&
                scrollLeftVal < -50 &&
                !isComplete
            ) {
                isComplete = true;
                autoMode = false;

                gsap.timeline()
                    .to(splashScreen, {
                        yPercent: -100,
                        duration: 1.2,
                        ease: "power4.inOut",
                        onComplete: () => {
                            splashScreen.style.display = "none";
                            document.body.style.overflow = "";
                            if (window.lenis) {
                                window.lenis.start();
                                window.lenis.resize();
                                ScrollTrigger.refresh();
                            }
                        },
                    })
                    .from(
                        ".hero-title",
                        { opacity: 0, y: 50, duration: 1, ease: "power3.out" },
                        "-=0.5",
                    )
                    .from(
                        ".hero-description",
                        { opacity: 0, y: 30, duration: 1, ease: "power3.out" },
                        "-=0.7",
                    )
                    .from(
                        ".hero-provider",
                        { opacity: 0, duration: 1, ease: "power3.out" },
                        "-=0.5",
                    );
            }
        };

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        class ShapeRect {
            constructor(x, y, w, h) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
            }

            display() {
                p.rect(this.x, this.y, this.w, this.h);
            }

            move() {
                this.x -= scrollSpeed;
            }
        }
    };

    new p5(sketch, "splash-p5-container");
}

function initHeaderScroll() {
    const mainHeader = document.getElementById("main-header");
    if (!mainHeader) {
        return;
    }

    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            if (currentScroll > lastScroll) {
                mainHeader.classList.add("-translate-y-full");
            } else {
                mainHeader.classList.remove("-translate-y-full");
            }
        }
        lastScroll = currentScroll;
    });
}

function addTrigger(tweenOrTimeline) {
    if (tweenOrTimeline && tweenOrTimeline.scrollTrigger) {
        triggers.push(tweenOrTimeline.scrollTrigger);
    }
}

function initBaseEffects() {
    gsap.utils.toArray(".scaling-element").forEach((el, index) => {
        const tween = gsap.to(el, {
            scrollTrigger: {
                trigger: ".section-hero-wrapper",
                start: "top center",
                end: "bottom center",
                scrub: 1.2,
            },
            scale: 3 + index,
            opacity: 0,
            ease: "none",
        });
        addTrigger(tween);
    });

    gsap.utils.toArray(".parallax-wrapper").forEach((wrapper) => {
        const img = wrapper.querySelector(".parallax-img");
        if (!img) {
            return;
        }

        const tween = gsap.to(img, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: wrapper,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            },
        });
        addTrigger(tween);
    });

    gsap.utils.toArray(".header-anim").forEach((header) => {
        const line = header.parentElement
            ? header.parentElement.querySelector(".line-expand")
            : null;
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: header.parentElement || header,
                start: "top 85%",
            },
        });

        timeline.from(header, {
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
        });

        if (line) {
            timeline.from(
                line,
                {
                    width: 0,
                    duration: 1,
                    ease: "power3.out",
                },
                "-=0.8",
            );
        }

        addTrigger(timeline);
    });
}

function initThemeAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const headerTitle = document.querySelector(".theme-header-title");
    if (headerTitle) {
        gsap.set(headerTitle, {
            clipPath: "inset(100% 0 0 0)",
            opacity: 0,
            y: 40,
        });
        const reveal = gsap.to(headerTitle, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: headerTitle,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(reveal);

        const letterSpacing = gsap.fromTo(
            headerTitle,
            { letterSpacing: "0em" },
            {
                letterSpacing: "0.15em",
                ease: "none",
                scrollTrigger: {
                    trigger: ".theme-header-section",
                    start: "top 60%",
                    end: "top 20%",
                    scrub: 1,
                },
            },
        );
        addTrigger(letterSpacing);
    }

    const headerLine = document.querySelector(
        ".theme-header-section .line-expand",
    );
    if (headerLine) {
        const lineTween = gsap.fromTo(
            headerLine,
            { width: 0 },
            {
                width: "80px",
                ease: "none",
                scrollTrigger: {
                    trigger: headerLine,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1,
                },
            },
        );
        addTrigger(lineTween);
    }

    const numberEl = document.querySelector(".theme-number");
    if (numberEl) {
        const counter = { value: 0 };
        const counterTween = gsap.to(counter, {
            value: 2,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: numberEl,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
            onUpdate: () => {
                numberEl.textContent = `0${Math.round(counter.value)}.`;
            },
        });
        addTrigger(counterTween);
    }

    const themeTitle = document.querySelector(".theme-title");
    if (themeTitle) {
        const titleReveal = gsap.from(themeTitle, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: themeTitle,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleReveal);

        const titleColor = gsap.to(themeTitle, {
            color: "#b31b1b",
            duration: 0.6,
            scrollTrigger: {
                trigger: themeTitle,
                start: "top 70%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleColor);
    }

    const paragraphs = gsap.utils.toArray(".theme-paragraphs p");
    if (paragraphs.length > 0) {
        const textReveal = gsap.from(paragraphs, {
            opacity: 0,
            y: 30,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: paragraphs[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(textReveal);
    }

    const imageWrapper = document.querySelector(".theme-image-wrapper");
    if (imageWrapper) {
        const imageReveal = gsap.from(imageWrapper, {
            opacity: 0,
            scale: 0.85,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: imageWrapper,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(imageReveal);

        const imageParallax = gsap.fromTo(
            imageWrapper,
            { y: -30 },
            {
                y: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".theme-content-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
            },
        );
        addTrigger(imageParallax);
    }
}

function initFormatAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const leftText = document.querySelector(".format-left-text");
    if (leftText) {
        const leftTween = gsap.from(leftText, {
            opacity: 0,
            x: -60,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: leftText,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(leftTween);
    }

    const centerImage = document.querySelector(".format-center-image");
    if (centerImage) {
        const centerTween = gsap.fromTo(
            centerImage,
            {
                clipPath: "inset(20%)",
                opacity: 0,
            },
            {
                clipPath: "inset(0%)",
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: centerImage,
                    start: "top 90%",
                    end: "top 30%",
                    scrub: 1,
                },
            },
        );
        addTrigger(centerTween);
    }

    const rightText = document.querySelector(".format-right-text");
    if (rightText) {
        const rightTween = gsap.from(rightText, {
            opacity: 0,
            x: 60,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: rightText,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(rightTween);
    }

    const registerBtn = document.querySelector(".format-register-btn");
    if (registerBtn) {
        // Disabled animation to ensure button is visible
        gsap.set(registerBtn, { opacity: 1, scale: 1 });
    }

    const speakerHeaderTitle = document.querySelector(".speaker-header-title");
    if (speakerHeaderTitle) {
        gsap.set(speakerHeaderTitle, {
            clipPath: "inset(100% 0 0 0)",
            opacity: 0,
            y: 40,
        });
        const speakerTitleTween = gsap.to(speakerHeaderTitle, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: speakerHeaderTitle,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(speakerTitleTween);
    }

    const speakerHeaderLine = document.querySelector(
        ".speaker-header-section .line-expand",
    );
    if (speakerHeaderLine) {
        const speakerLineTween = gsap.fromTo(
            speakerHeaderLine,
            { width: 0 },
            {
                width: "80px",
                ease: "none",
                scrollTrigger: {
                    trigger: speakerHeaderLine,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1,
                },
            },
        );
        addTrigger(speakerLineTween);
    }
}

function initSpeakerAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const avatarContainer = document.querySelector(".speaker-avatar-reveal");
    if (avatarContainer) {
        const avatarTween = gsap.fromTo(
            avatarContainer,
            { clipPath: "circle(0% at 50% 50%)" },
            {
                clipPath: "circle(100% at 50% 50%)",
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: avatarContainer,
                    start: "top 80%",
                    end: "top 30%",
                    scrub: 1,
                },
            },
        );
        addTrigger(avatarTween);
    }

    const speakerName = document.querySelector(".speaker-name");
    if (speakerName) {
        const words = splitWords(speakerName);
        if (words.length > 0) {
            gsap.set(words, { opacity: 0, y: 20, display: "inline-block" });
            const nameTween = gsap.to(words, {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: speakerName,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });
            addTrigger(nameTween);
        }
    }

    const speakerTitle = document.querySelector(".speaker-title");
    if (speakerTitle) {
        const titleTween = gsap.from(speakerTitle, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: speakerTitle,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleTween);
    }

    const timelineItems = gsap.utils.toArray(".speaker-timeline-item");
    const timelineContainer = document.querySelector(".reveal-list");
    if (timelineItems.length > 0) {
        const timelineTween = gsap.from(timelineItems, {
            opacity: 0,
            x: -30,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: timelineContainer || timelineItems[0],
                start: "top 90%",
                toggleActions: "play none none none", // Không reverse để tránh mất dữ liệu khi cuộn ngược
            },
        });
        addTrigger(timelineTween);

        const years = gsap.utils.toArray(".speaker-year");
        years.forEach((year, i) => {
            const yearTween = gsap.fromTo(
                year,
                { color: "inherit" },
                {
                    color: "#b31b1b",
                    duration: 0.4,
                    ease: "power1.out",
                    scrollTrigger: {
                        trigger: timelineItems[i] || year,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                },
            );
            addTrigger(yearTween);
        });
    }
}

function initProjectsAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const projectsTitle = document.querySelector(".projects-title");
    if (projectsTitle) {
        gsap.set(projectsTitle, {
            clipPath: "inset(100% 0 0 0)",
            opacity: 0,
            y: 40,
        });
        const titleTween = gsap.to(projectsTitle, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: projectsTitle,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleTween);
    }

    const contextImage = document.querySelector(".projects-context-image");
    if (contextImage) {
        const imageReveal = gsap.from(contextImage, {
            opacity: 0,
            scale: 0.85,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: contextImage,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(imageReveal);

        const imageParallax = gsap.fromTo(
            contextImage,
            { y: 50 },
            {
                y: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: contextImage,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
            },
        );
        addTrigger(imageParallax);
    }

    const contextParagraphs = gsap.utils.toArray(".projects-context-text p");
    if (contextParagraphs.length > 0) {
        const paragraphsTween = gsap.from(contextParagraphs, {
            opacity: 0,
            y: 30,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: contextParagraphs[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(paragraphsTween);
    }
}

function initEventAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const headerTitle = document.querySelector(".events-header-title");
    if (headerTitle) {
        gsap.set(headerTitle, {
            clipPath: "inset(100% 0 0 0)",
            opacity: 0,
            y: 40,
        });
        const titleTween = gsap.to(headerTitle, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: headerTitle,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleTween);
    }

    const headerLine = document.querySelector(
        ".events-header-section .line-expand",
    );
    if (headerLine) {
        const lineTween = gsap.fromTo(
            headerLine,
            { width: 0 },
            {
                width: "80px",
                ease: "none",
                scrollTrigger: {
                    trigger: headerLine,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1,
                },
            },
        );
        addTrigger(lineTween);
    }

    const dateNode = document.querySelector(".event-date");
    if (dateNode) {
        const dateTween = gsap.from(dateNode, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: dateNode,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(dateTween);
    }

    const detailRows = gsap.utils.toArray(".event-detail-row");
    if (detailRows.length > 0) {
        const rowsTween = gsap.from(detailRows, {
            opacity: 0,
            y: 20,
            stagger: 0.06,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: detailRows[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(rowsTween);

        const labels = gsap.utils.toArray(".event-detail-label");
        labels.forEach((label, i) => {
            const labelTween = gsap.fromTo(
                label,
                { color: "inherit" },
                {
                    color: "#b31b1b",
                    duration: 0.4,
                    ease: "power1.out",
                    scrollTrigger: {
                        trigger: detailRows[i] || label,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                },
            );
            addTrigger(labelTween);
        });
    }
}

function initSeriesAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const title = document.querySelector(".series-title");
    if (title) {
        gsap.set(title, { clipPath: "inset(100% 0 0 0)", opacity: 0, y: 40 });
        const titleTween = gsap.to(title, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleTween);
    }

    const description = document.querySelector(".series-description");
    if (description) {
        const words = splitWords(description);
        if (words.length > 0) {
            gsap.set(words, { opacity: 0.2, display: "inline-block" });
            const wordsTween = gsap.to(words, {
                opacity: 1,
                stagger: 0.02,
                duration: 0.3,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: description,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1,
                },
            });
            addTrigger(wordsTween);
        }
    }
}

function initRegisterAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const headerTitle = document.querySelector(".register-header-title");
    if (headerTitle) {
        gsap.set(headerTitle, {
            clipPath: "inset(100% 0 0 0)",
            opacity: 0,
            y: 40,
        });
        const titleTween = gsap.to(headerTitle, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: headerTitle,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleTween);
    }

    const headerLine = document.querySelector(
        ".register-header-section .line-expand",
    );
    if (headerLine) {
        const lineTween = gsap.fromTo(
            headerLine,
            { width: 0 },
            {
                width: "80px",
                ease: "none",
                scrollTrigger: {
                    trigger: headerLine,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1,
                },
            },
        );
        addTrigger(lineTween);
    }

    const fieldGroups = gsap.utils.toArray(".form-field-group");
    if (fieldGroups.length > 0) {
        const fieldsTween = gsap.from(fieldGroups, {
            opacity: 0,
            y: 15,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: fieldGroups[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(fieldsTween);
    }

    const inputs = gsap.utils.toArray("#registration-form .input-field");
    inputs.forEach((input, index) => {
        const inputTween = gsap.fromTo(
            input,
            { borderColor: "transparent" },
            {
                borderColor: "#1A1A1A",
                duration: 0.4,
                delay: index * 0.06,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: fieldGroups[0] || input,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            },
        );
        addTrigger(inputTween);
    });

    const faqItems = gsap.utils.toArray(".form-faq-item");
    const faqContainer = document.querySelector(".faq-list");
    if (faqItems.length > 0) {
        const faqTween = gsap.from(faqItems, {
            opacity: 0,
            x: 20,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: faqContainer || faqItems[0],
                start: "top 90%",
                toggleActions: "play none none none",
            },
        });
        addTrigger(faqTween);
    }

    const faqTitle = document.querySelector(".faq-title");
    if (faqTitle) {
        const faqTitleTween = gsap.from(faqTitle, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: faqTitle,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(faqTitleTween);
    }
}

function initAboutAnimations() {
    if (!enhancedMotion) {
        return;
    }

    const title = document.querySelector(".about-header-title");
    if (title) {
        gsap.set(title, {
            clipPath: "inset(100% 0 0 0)",
            opacity: 0,
            y: 40,
            scale: 0.95,
        });
        const titleTween = gsap.to(title, {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(titleTween);
    }

    const line = document.querySelector(".about-header-section .line-expand");
    if (line) {
        const lineTween = gsap.fromTo(
            line,
            { width: 0 },
            {
                width: "80px",
                ease: "none",
                scrollTrigger: {
                    trigger: line,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1,
                },
            },
        );
        addTrigger(lineTween);
    }

    const paragraphs = gsap.utils.toArray(".about-text");
    if (paragraphs.length > 0) {
        const paragraphTween = gsap.from(paragraphs, {
            opacity: 0,
            y: 30,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: paragraphs[0],
                start: "top 90%",
                toggleActions: "play none none none",
            },
        });
        addTrigger(paragraphTween);
    }

    const links = gsap.utils.toArray(".about-contact-link");
    if (links.length > 0) {
        const linkTween = gsap.from(links, {
            opacity: 0,
            x: -15,
            stagger: 0.06,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: links[0],
                start: "top 90%",
                toggleActions: "play none none none",
            },
        });
        addTrigger(linkTween);
    }

    const partnerLabels = gsap.utils.toArray(".about-partner-label");
    if (partnerLabels.length > 0) {
        const partnerTween = gsap.from(partnerLabels, {
            opacity: 0,
            scale: 0.9,
            stagger: {
                each: 0.1,
                from: "center",
            },
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: partnerLabels[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
        addTrigger(partnerTween);
    }
}

const GOOGLE_FORM_ID =
    "1FAIpQLSelEKXbxQyEkCFM0C_A1wJV3Q32q4NW-JwBAFDEVWkZFXvDTQ";
const ENTRY_IDS = {
    fullName: "entry.1882665011",
    phone: "entry.1650127445",
    age: "entry.191697884",
    email: "entry.118357787",
    occupation: "entry.1439823306",
    company: "entry.749570851",
    domain: "entry.588232968",
    source: "entry.11667112",
};

function initSeriesSlider() {
    const seriesSlider = document.querySelector(".series-slider");
    const btnPrev = document.querySelector(".series-btn-prev");
    const btnNext = document.querySelector(".series-btn-next");

    if (!seriesSlider || !btnPrev || !btnNext) return;

    btnNext.addEventListener("click", () => {
        const itemWidth = seriesSlider.offsetWidth;
        seriesSlider.scrollBy({ left: itemWidth, behavior: "smooth" });
    });

    btnPrev.addEventListener("click", () => {
        const itemWidth = seriesSlider.offsetWidth;
        seriesSlider.scrollBy({ left: -itemWidth, behavior: "smooth" });
    });
}

function initFormAndPopup() {
    const form = document.getElementById("registration-form");
    const popup = document.getElementById("thank-you-popup");
    const submitBtn = document.getElementById("submit-btn");
    const submitText = submitBtn
        ? submitBtn.querySelector(".submit-text")
        : null;
    const closeBtns = [
        document.getElementById("close-popup"),
        document.getElementById("btn-done"),
    ];

    if (form && popup) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (submitBtn) {
                submitBtn.disabled = true;
            }
            if (submitText) {
                submitText.textContent = "PROCESSING...";
            }

            const formData = new FormData(form);
            const googleFormData = new FormData();

            googleFormData.append(ENTRY_IDS.fullName, formData.get("fullName"));
            googleFormData.append(ENTRY_IDS.phone, formData.get("phone"));
            googleFormData.append(ENTRY_IDS.age, formData.get("age") || "");
            googleFormData.append(ENTRY_IDS.email, formData.get("email"));
            googleFormData.append(
                ENTRY_IDS.occupation,
                formData.get("occupation") || "",
            );
            googleFormData.append(
                ENTRY_IDS.company,
                formData.get("company") || "",
            );
            googleFormData.append(ENTRY_IDS.domain, window.location.origin);
            googleFormData.append(ENTRY_IDS.source, "LANDING_PAGE");

            try {
                await fetch(
                    `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`,
                    {
                        method: "POST",
                        mode: "no-cors",
                        body: googleFormData,
                    },
                );

                popup.classList.add("active");
                form.reset();
            } catch (error) {
                console.error("Submit Google Form failed:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại sau.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                if (submitText) {
                    submitText.textContent = "SUBMIT REGISTER";
                }
            }
        });
    }

    closeBtns.forEach((btn) => {
        if (!btn || !popup) {
            return;
        }
        btn.addEventListener("click", () => {
            popup.classList.remove("active");
        });
    });
}

function initProjectsSlider() {
    const projectSlider = document.querySelector(".projects-slider");
    const btnPrev = document.querySelector(".slider-btn-prev");
    const btnNext = document.querySelector(".slider-btn-next");

    if (!projectSlider || !btnPrev || !btnNext) {
        return;
    }

    const sliderItems = projectSlider.querySelectorAll(":scope > div");

    const animateSlide = () => {
        gsap.fromTo(
            sliderItems,
            { scale: 0.95, opacity: 0.6 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.out",
                overwrite: "auto",
            },
        );
    };

    btnNext.addEventListener("click", () => {
        const itemWidth =
            projectSlider.offsetWidth / (window.innerWidth >= 768 ? 3 : 1);
        projectSlider.scrollBy({ left: itemWidth, behavior: "smooth" });
        animateSlide();
    });

    btnPrev.addEventListener("click", () => {
        const itemWidth =
            projectSlider.offsetWidth / (window.innerWidth >= 768 ? 3 : 1);
        projectSlider.scrollBy({ left: -itemWidth, behavior: "smooth" });
        animateSlide();
    });

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    projectSlider.style.cursor = "grab";

    projectSlider.addEventListener("mousedown", (e) => {
        isDown = true;
        projectSlider.style.cursor = "grabbing";
        startX = e.pageX - projectSlider.offsetLeft;
        scrollLeft = projectSlider.scrollLeft;
        projectSlider.style.scrollSnapType = "none";
    });

    projectSlider.addEventListener("mouseleave", () => {
        if (!isDown) {
            return;
        }
        isDown = false;
        projectSlider.style.cursor = "grab";
        projectSlider.style.scrollSnapType = "x mandatory";
    });

    projectSlider.addEventListener("mouseup", () => {
        if (!isDown) {
            return;
        }
        isDown = false;
        projectSlider.style.cursor = "grab";
        projectSlider.style.scrollSnapType = "x mandatory";
    });

    projectSlider.addEventListener("mousemove", (e) => {
        if (!isDown) {
            return;
        }
        e.preventDefault();
        const x = e.pageX - projectSlider.offsetLeft;
        const walk = (x - startX) * 1.5;
        projectSlider.scrollLeft = scrollLeft - walk;
    });

    if (sliderItems.length > 0) {
        const sliderReveal = gsap.from(sliderItems, {
            scrollTrigger: {
                trigger: projectSlider,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            y: 60,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
        });
        addTrigger(sliderReveal);
    }
}

function initSectionDepthTransitions() {
    if (!enhancedMotion) {
        return;
    }

    const sections = gsap.utils.toArray("#smooth-content > section");
    sections.forEach((section) => {
        const depthTween = gsap.fromTo(
            section,
            { y: 30, opacity: 0.95 },
            {
                y: 0,
                opacity: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 95%",
                    end: "top 60%",
                    scrub: 0.5,
                },
            },
        );
        addTrigger(depthTween);
    });
}

function initRefreshHooks() {
    const refresh = () => {
        ScrollTrigger.refresh();
    };

    if (document.readyState === "complete") {
        refresh();
    } else {
        window.addEventListener("load", refresh);
    }

    // Fail-safe: Hiển thị tất cả phần tử nếu sau 3s vẫn bị kẹt
    setTimeout(() => {
        document.body.style.overflow = "";
        if (window.lenis) {
            window.lenis.start();
            window.lenis.resize();
            ScrollTrigger.refresh();
        }
    }, 1000);
    setTimeout(() => {
        const selectors = [
            ".speaker-timeline-item",
            ".form-faq-item",
            ".reveal-section",
            ".speaker-name span",
            ".speaker-title",
            ".faq-title",
            ".about-text",
            ".about-contact-link",
        ];
        selectors.forEach((selector) => {
            // Bỏ clipPath: "inset(0%)" để không bị lỗi overflow:hidden ngầm làm mất các element absolute lồi ra ngoài (như nút Register Event)
            gsap.to(selector, {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                clearProps: "clipPath",
                duration: 0.5,
                overwrite: "auto",
            });
        });
        refresh();
    }, 3000);

    setTimeout(refresh, 500);
    setTimeout(refresh, 1500);
}

window.addEventListener("load", () => {
    initSplashScreen();
    initHeaderScroll();
    initBaseEffects();
    initThemeAnimations();
    initFormatAnimations();
    initSpeakerAnimations();
    initProjectsAnimations();
    initEventAnimations();
    initSeriesAnimations();
    initRegisterAnimations();
    initAboutAnimations();
    initSectionDepthTransitions();
    initFormAndPopup();
    initProjectsSlider();
    initSeriesSlider();
    initRefreshHooks();
});

window.addEventListener("unload", () => {
    triggers.forEach((trigger) => {
        if (trigger) {
            trigger.kill();
        }
    });
});
