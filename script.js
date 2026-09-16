/* ============================================================
   Mahmoud Eid — Portfolio
   script.js
   ------------------------------------------------------------
   Sections in this file:
     1. Globals & feature flags
     2. Header scroll state
     3. Scroll-reveal animations (sections + staggered grids)
     4. Scrollspy navigation
     5. Cursor glow (desktop only)
     6. Magnetic buttons
     7. Project card tilt + glare
     8. Stat counters
     9. Hero boot sequence (typewriter intro)
    10. Mascot (eye tracking, blinking, speech bubble)
    11. Lightbox (project image preview)
    12. i18n — translation dictionary + language switcher
    13. Contact form (WhatsApp handoff)
   ============================================================ */

(() => {
  'use strict';

  /* ============================================================
     1. Globals & feature flags
     ============================================================ */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ============================================================
     2. Header scroll state
     Adds a background/border to the fixed header once the page
     has scrolled past the hero area.
     ============================================================ */
  function initHeaderScrollState() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ============================================================
     3. Scroll-reveal animations
     ============================================================ */
  function initSectionReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  }

  function initStaggeredReveal() {
    const staggerEls = document.querySelectorAll('.bio-card, .stack-chip, .project-card, .tl-item, .wf-step');
    staggerEls.forEach((el) => el.classList.add('stagger-item'));

    const staggerIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = Array.prototype.filter.call(
          entry.target.parentElement.children,
          (child) => child.classList.contains('stagger-item')
        );
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = reduceMotion ? '0ms' : `${Math.max(idx, 0) * 70}ms`;
        entry.target.classList.add('in');
        staggerIO.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    staggerEls.forEach((el) => staggerIO.observe(el));
  }

  /* ============================================================
     4. Scrollspy navigation
     Highlights the nav link matching the section currently
     centered in the viewport.
     ============================================================ */
  function initScrollspy() {
    const spySections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    const spyIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((a) => {
          a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
        });
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });

    spySections.forEach((section) => spyIO.observe(section));
  }

  /* ============================================================
     5. Cursor glow
     A soft radial light that follows the pointer. Desktop /
     fine-pointer devices only, and skipped for reduced motion.
     ============================================================ */
  function initCursorGlow() {
    if (reduceMotion || !isFinePointer) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const easing = 0.15;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add('active');
    });

    (function followPointer() {
      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;
      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%,-50%)`;
      requestAnimationFrame(followPointer);
    })();

    document.querySelectorAll('a, button, .project-card, .stack-chip, .bio-card').forEach((el) => {
      el.addEventListener('mouseenter', () => glow.classList.add('hot'));
      el.addEventListener('mouseleave', () => glow.classList.remove('hot'));
    });
  }

  /* ============================================================
     6. Magnetic buttons
     Buttons drift slightly toward the cursor on hover.
     ============================================================ */
  function initMagneticButtons() {
    if (reduceMotion) return;

    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============================================================
     7. Project card tilt + glare
     3D tilt effect with a light glare following the cursor
     position on each project card.
     ============================================================ */
  function initProjectCardTilt() {
    document.querySelectorAll('.project-card').forEach((card) => {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);

      if (reduceMotion) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - py) * 8;
        const rotateY = (px - 0.5) * 10;

        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        glare.style.setProperty('--gx', `${px * 100}%`);
        glare.style.setProperty('--gy', `${py * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ============================================================
     8. Stat counters
     Animates a stat value (e.g. "23+") counting up from 0.
     ============================================================ */
  function animateCount(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(\+?)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2];

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  /* ============================================================
     9. Hero boot sequence
     Typewriter-style intro that reveals the hero content in
     sequence, mimicking a terminal boot.
     ============================================================ */
  function typeText(el, text, speed) {
    return new Promise((resolve) => {
      el.textContent = '';
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'typed-cursor';

      let i = 0;
      (function step() {
        el.textContent = text.slice(0, i);
        el.appendChild(cursorSpan);
        if (i <= text.length) {
          i++;
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  async function runHeroBootSequence() {
    const eyebrowEl = document.querySelector('.hero .eyebrow');
    const nameEl = document.querySelector('h1.name');
    const descEl = document.querySelector('.hero-desc');
    const btnRow = document.querySelector('.hero .btn-row');
    const statsRow = document.querySelector('.hero .stats-row');
    const statNums = document.querySelectorAll('.stat .num');
    const lamp = document.getElementById('deskLamp');

    if (reduceMotion) {
      eyebrowEl.classList.add('boot-in');
      nameEl.classList.add('boot-in');
      descEl.classList.add('boot-in');
      btnRow.classList.add('boot-in');
      statsRow.classList.add('boot-in');
      statNums.forEach(animateCount);
      if (lamp) lamp.classList.add('on');
      return;
    }

    if (lamp) lamp.classList.add('on');

    eyebrowEl.classList.add('boot-in');
    await typeText(eyebrowEl, eyebrowEl.textContent, 26);

    nameEl.classList.add('boot-in');
    await wait(520);

    descEl.classList.add('boot-in');
    await wait(220);

    btnRow.classList.add('boot-in');
    await wait(180);

    statsRow.classList.add('boot-in');
    statNums.forEach((el, i) => setTimeout(() => animateCount(el), i * 110));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /* ============================================================
     10. Mascot
     Small SVG companion: eyes track the cursor, blinks
     periodically, and cycles through speech-bubble messages.
     ============================================================ */
  function initMascot() {
    const mascot = document.getElementById('mascot');
    const eyeL = document.getElementById('mascotEyeL');
    const eyeR = document.getElementById('mascotEyeR');
    const bubble = document.getElementById('mascotBubble');
    const dots = document.getElementById('bubbleDots');
    const textEl = document.getElementById('bubbleText');

    if (!mascot || !eyeL || !eyeR) return;

    if (!reduceMotion && isFinePointer) {
      window.addEventListener('mousemove', (e) => {
        const rect = mascot.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.min(Math.hypot(dx, dy), 400);
        const angle = Math.atan2(dy, dx);
        const ex = Math.cos(angle) * Math.min((dist / 120) * 7.5, 7.5);
        const ey = Math.sin(angle) * Math.min((dist / 120) * 7.5, 7.5);
        eyeL.style.transform = `translate(${ex}px, ${ey}px)`;
        eyeR.style.transform = `translate(${ex}px, ${ey}px)`;
      });
    }

    if (!reduceMotion) {
      setInterval(() => {
        mascot.classList.add('blink');
        setTimeout(() => mascot.classList.remove('blink'), 140);
      }, 4200);
    }

    initMascotSpeechBubble(mascot, bubble, dots, textEl);
  }

  function initMascotSpeechBubble(mascot, bubble, dots, textEl) {
    const messages = {
      en: [
        'Hey there! \u{1F44B} Welcome to my portfolio.',
        'Ready to join the coding lab? \u{1F680}',
        "Honestly... do you think Mahmoud's smarter than me? \u{1F916}",
        "He's really giving me a run for my money \u{1F604}",
        'Psst \u2014 go check out the projects section!',
        "I'm just SVG shapes, but I like to think I have personality."
      ],
      ar: [
        'أهلاً! \u{1F44B} اتفضل شوف البورتفوليو.',
        'جاهز تنضم لمعمل الكودنج؟ \u{1F680}',
        'بصراحة... شايف إن محمود أذكى مني ولا لأ؟ \u{1F916}',
        'بيتنافس معايا بقوة والله \u{1F604}',
        'بص على قسم المشاريع لو لسه ما شفتوش!',
        'أنا مجرد أشكال SVG، بس حابب افتكر إن عندي شخصية.'
      ]
    };

    let msgIndex = 0;
    let bubbleBusy = false;
    let typingTimer = null;

    function cycleBubble() {
      if (reduceMotion || !bubble || bubbleBusy) return;
      bubbleBusy = true;

      const lang = document.getElementById('htmlRoot').getAttribute('lang') || 'en';
      const list = messages[lang] || messages.en;
      const msg = list[msgIndex % list.length];
      msgIndex++;

      bubble.classList.add('show');
      dots.classList.remove('hide');
      textEl.classList.remove('show');
      textEl.textContent = '';

      setTimeout(() => {
        dots.classList.add('hide');
        textEl.classList.add('show');
        let i = 0;
        typingTimer = setInterval(() => {
          textEl.textContent = msg.slice(0, i);
          i++;
          if (i > msg.length) {
            clearInterval(typingTimer);
            setTimeout(() => {
              bubble.classList.remove('show');
              bubbleBusy = false;
            }, 2800);
          }
        }, 30);
      }, 650);
    }

    if (bubble && dots && textEl) {
      setTimeout(cycleBubble, 2200);
      setInterval(cycleBubble, 9500);
      mascot.addEventListener('click', () => {
        if (!bubbleBusy) cycleBubble();
      });
    }
  }

  /* ============================================================
     11. Lightbox
     Fullscreen preview for project screenshots.
     ============================================================ */
  function openLightbox(imgEl) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    lbImg.src = imgEl.src;
    lbImg.alt = imgEl.alt;
    lb.classList.add('active');
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') closeLightbox();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // Exposed globally: called via inline onclick="openLightbox(this)" in the HTML markup.
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  /* ============================================================
     12. i18n — translations + language switcher
     ============================================================ */
  const translations = {
    en: {
      navHome: 'HOME', navAbout: 'ABOUT', navExperience: 'EXPERIENCES', navProjects: 'PROJECTS', navStack: 'STACK', navWorkflow: 'WORKFLOW', navConnect: 'CONNECT',
      eyebrow: 'INITIALIZING INTERFACE...',
      nameFirst: 'MAHMOUD', nameLast: 'EID',
      heroDesc: "I'm a <b>Frontend Web Developer</b> and <b>Flutter App Developer</b> building responsive websites and AI-integrated mobile experiences.",
      btnProjects: 'VIEW PROJECTS', btnContact: 'INITIATE CONTACT',
      statYears: 'YEARS FREELANCING', statProjects: 'TOTAL PROJECTS', statClientProjects: 'CLIENT PROJECTS', statCountries: 'COUNTRIES SERVED',
      bioDataTitle: 'BIO_DATA',
      bioP1: "I'm Mahmoud Eid Abdel Rahman, a Frontend and Flutter developer based in Tanta, Egypt, currently studying Computer & Control Engineering at the Faculty of Engineering, Tanta University (expected graduation 2027). I focus on the small details of an interface, and I enjoy watching an idea move from a design file to something that actually works.",
      bioP2: "I've been freelancing since October 2025, building websites and Flutter apps for individual clients, and I keep learning new tools to stay current with the industry.",
      cardFrontendTitle: 'FRONTEND DEVELOPER', cardFrontendDesc: 'Building responsive, optimized web interfaces.',
      cardFlutterTitle: 'FLUTTER DEVELOPER', cardFlutterDesc: 'Cross-platform mobile apps with Dart.',
      cardEduTitle: 'EDUCATION', cardEduDesc: 'B.Sc. Computer &amp; Control Engineering<br>Faculty of Engineering, Tanta University (2027)',
      cardCertTitle: 'CERTIFICATION', cardCertDesc: 'Web Designer Training — NTI &amp; ITIDA (2025)',
      workHistoryTitle: 'WORK_HISTORY.LOG',
      tlDate: 'Oct, 2025 - Present', tlRole: 'Frontend & Flutter Developer',
      tlDesc: 'Providing freelance web and Flutter app development services — building responsive websites and cross-platform mobile applications for individual clients.',
      activeOpsTitle: 'ACTIVE_OPERATIONS',
      viewProject: 'VIEW PROJECT',
      gymTag: 'GRADUATION PROJECT · FLUTTER', gymDesc: 'An AI-powered fitness ecosystem in one platform: workout tracking, nutrition, coaching & progress tracking, real-time communication, and AI-driven personalization.',
      tempoTag: 'WEB', tempoDesc: 'A modern landing site built with HTML, CSS and Bootstrap, fully responsive across every screen size.',
      islamiTag: 'MOBILE · FLUTTER', islamiDesc: 'An Islamic mobile app focused on a clean UI and a simple experience, built with reusable, scalable widget architecture.',
      marktiTag: 'MOBILE · E-COMMERCE', marktiDesc: 'An e-commerce Flutter app handling products and REST APIs, with scalable state management for data fetching.',
      arkanoidTag: 'GAME DEV', arkanoidDesc: 'An arcade game inspired by Breakout/Arkanoid — hands-on practice with graphics programming, movement, collisions, and game state logic.',
      restaurantTag: 'WEB', restaurantDesc: 'A restaurant website built as a hands-on frontend project, turning a design into a responsive web interface with careful attention to layout and UX.',
      bakeryTag: 'WEB', bakeryDesc: 'A bakery website built as a hands-on frontend project, turning a design into a responsive web interface with careful attention to layout and UX.',
      stackTitle: 'CURRENT_STACK', stackSub: 'SYSTEM CAPABILITIES OVERVIEW',
      workflowTitle: 'WORKFLOW.EXE', workflowSub: 'HOW I WORK, STEP BY STEP',
      wfStep1Title: 'Discover', wfStep1Desc: 'Understand the goal, the users, and the constraints before writing a single line of code.',
      wfStep2Title: 'Design', wfStep2Desc: 'Sketch the interface and structure, and agree on it before development starts.',
      wfStep3Title: 'Build', wfStep3Desc: 'Write clean, responsive code with regular check-ins and visible progress.',
      wfStep4Title: 'Deliver', wfStep4Desc: "Test across devices, polish the details, and hand over a project that's ready to ship.",
      wfOutputLabel: 'OUTPUT', wfStep1Output: 'Clear scope &amp; requirements', wfStep2Output: 'Wireframes &amp; visual direction', wfStep3Output: 'Working build, checked in regularly', wfStep4Output: 'Live, tested &amp; documented',
      transmitTitle: 'TRANSMIT_SIGNAL',
      contactDesc: 'Ready to start a new operation? Send your coordinates and I will respond shortly.',
      labelName: 'INPUT_NAME', labelEmail: 'INPUT_EMAIL', labelMsg: 'INPUT_MESSAGE',
      phName: 'John Doe', phEmail: 'john@domain.com', phMsg: 'Type your transmission...',
      formBtn: 'SEND VIA WHATSAPP',
      footerCredit: 'DESIGNED &amp; DEVELOPED BY MAHMOUD EID // VERSION 1.0.0 // © 2026'
    },
    ar: {
      navHome: 'الرئيسية', navAbout: 'نبذة', navExperience: 'الخبرة', navProjects: 'المشاريع', navStack: 'الأدوات', navWorkflow: 'طريقة العمل', navConnect: 'تواصل',
      eyebrow: 'جارى تشغيل الواجهة...',
      nameFirst: 'محمود', nameLast: 'عيد',
      heroDesc: 'مطوّر <b>Frontend Web</b> و <b>Flutter</b>، ببنى مواقع متجاوبة وتطبيقات موبايل بتستخدم تقنيات الذكاء الاصطناعي.',
      btnProjects: 'شوف شغلى', btnContact: 'تواصل معايا',
      statYears: 'سنين فريلانس', statProjects: 'إجمالى المشاريع', statClientProjects: 'مشاريع عملاء', statCountries: 'دول اتعاملت معاها',
      bioDataTitle: 'نبذة عني',
      bioP1: 'أنا محمود عيد عبدالرحمن، مطوّر Frontend وFlutter من طنطا، وبدرس هندسة حاسبات وتحكم فى كلية الهندسة جامعة طنطا (المتوقع أتخرج 2027). ببدأ الشغل من التفاصيل الصغيرة فى الواجهة، وبستمتع إنى أشوف الفكرة وهى بتتحول من تصميم لحاجة شغالة فعلاً.',
      bioP2: 'بشتغل فريلانس من شهر أكتوبر 2025، بعمل مواقع وتطبيقات Flutter لعملاء أفراد، وبفضل أتعلم أدوات جديدة كل شوية عشان الشغل يبقى مواكب للسوق.',
      cardFrontendTitle: 'مطوّر Frontend', cardFrontendDesc: 'بناء واجهات ويب متجاوبة وسريعة.',
      cardFlutterTitle: 'مطوّر Flutter', cardFlutterDesc: 'تطبيقات موبايل متكاملة بلغة Dart.',
      cardEduTitle: 'التعليم', cardEduDesc: 'بكالوريوس هندسة حاسبات وتحكم<br>كلية الهندسة، جامعة طنطا (2027)',
      cardCertTitle: 'شهادة', cardCertDesc: 'تدريب Web Designer — NTI و ITIDA (2025)',
      workHistoryTitle: 'سجل الخبرة',
      tlDate: 'أكتوبر 2025 - لحد دلوقتى', tlRole: 'مطوّر Frontend و Flutter',
      tlDesc: 'بقدم خدمات فريلانس لتطوير مواقع الويب وتطبيقات Flutter — بناء مواقع متجاوبة وتطبيقات موبايل لعملاء أفراد.',
      activeOpsTitle: 'مشاريع مختارة',
      viewProject: 'عرض المشروع',
      gymTag: 'مشروع تخرج · Flutter', gymDesc: 'نظام لياقة بدنية متكامل بيجمع تجربة الفيتنس فى منصة واحدة: متابعة تمارين، تغذية، كوتشينج، تواصل لحظى، ودمج تقنيات الذكاء الاصطناعى.',
      tempoTag: 'ويب', tempoDesc: 'موقع تعريفى بتصميم عصرى باستخدام HTML وCSS وBootstrap، بواجهة متجاوبة تشتغل بشكل مثالى على كل أحجام الشاشات.',
      islamiTag: 'موبايل · Flutter', islamiDesc: 'تطبيق إسلامى للموبايل بتصميم واجهة نظيف وتجربة استخدام بسيطة، مبنى بواجهات قابلة لإعادة الاستخدام.',
      marktiTag: 'موبايل · تجارة إلكترونية', marktiDesc: 'تطبيق تجارة إلكترونية بـ Flutter للتعامل مع المنتجات والـ REST APIs، بإدارة حالة قابلة للتوسع.',
      arkanoidTag: 'تطوير ألعاب', arkanoidDesc: 'لعبة أركيد مستوحاة من Breakout/Arkanoid — تجربة عملية فى البرمجة الرسومية والتعامل مع منطق اللعبة.',
      restaurantTag: 'ويب', restaurantDesc: 'موقع ويب لمطعم كتطبيق عملى على تطوير الواجهات، بتحويل تصميم لواجهة متجاوبة باهتمام بالتنسيق وتجربة المستخدم.',
      bakeryTag: 'ويب', bakeryDesc: 'موقع ويب لمخبز كتطبيق عملى على تطوير الواجهات، بتحويل تصميم لواجهة متجاوبة باهتمام بالتنسيق وتجربة المستخدم.',
      stackTitle: 'الأدوات', stackSub: 'نظرة عامة على القدرات',
      workflowTitle: 'طريقة شغلي', workflowSub: 'خطوة بخطوة',
      wfStep1Title: 'الفهم', wfStep1Desc: 'أفهم الهدف والمستخدمين والقيود قبل ما أكتب أي سطر كود.',
      wfStep2Title: 'التصميم', wfStep2Desc: 'أرسم شكل الواجهة والهيكل ونتفق عليه قبل ما يبدأ التطوير.',
      wfStep3Title: 'البناء', wfStep3Desc: 'أكتب كود نظيف ومتجاوب مع متابعة دورية وتقدم واضح.',
      wfStep4Title: 'التسليم', wfStep4Desc: 'اختبار على كل الأجهزة، وضبط التفاصيل، وتسليم مشروع جاهز فعلاً.',
      wfOutputLabel: 'الناتج', wfStep1Output: 'نطاق ومتطلبات واضحة', wfStep2Output: 'مخططات وتوجه بصري', wfStep3Output: 'نسخة شغالة بمتابعة دورية', wfStep4Output: 'شغال، متختبر، وموثّق',
      transmitTitle: 'تواصل معايا',
      contactDesc: 'جاهز تبدأ عملية جديدة؟ ابعتلى تفاصيلك وأنا هرد عليك فى أقرب وقت.',
      labelName: 'الاسم', labelEmail: 'الإيميل', labelMsg: 'رسالتك',
      phName: 'اسمك', phEmail: 'example@domain.com', phMsg: 'اكتب رسالتك...',
      formBtn: 'ابعت على واتساب',
      footerCredit: 'تصميم وتطوير محمود عيد // النسخة 1.0.0 // © 2026'
    }
  };

  function setLang(lang) {
    const htmlRoot = document.getElementById('htmlRoot');
    htmlRoot.setAttribute('lang', lang);
    htmlRoot.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('btnEn').classList.toggle('active', lang === 'en');
    document.getElementById('btnAr').classList.toggle('active', lang === 'ar');

    const dict = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });
  }

  // Exposed globally: called via inline onclick="setLang('en'|'ar')" in the HTML markup.
  window.setLang = setLang;

  /* ============================================================
     13. Contact form
     Packages the form fields into a WhatsApp deep link instead
     of submitting to a backend.
     ============================================================ */
  function initContactForm() {
    const waForm = document.getElementById('waForm');
    if (!waForm) return;

    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fName').value;
      const email = document.getElementById('fEmail').value;
      const msg = document.getElementById('fMsg').value;
      const text = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nMessage: ${msg}`);
      window.open(`https://api.whatsapp.com/send/?phone=201551640348&text=${text}`, '_blank');
    });
  }

  /* ============================================================
     Init
     Everything below runs once, on script load (this file is
     included at the end of <body>, so the DOM is already ready).
     ============================================================ */
  initHeaderScrollState();
  initSectionReveal();
  initStaggeredReveal();
  initScrollspy();
  initCursorGlow();
  initMagneticButtons();
  initProjectCardTilt();
  runHeroBootSequence();
  initMascot();
  initLightbox();
  initContactForm();
})();
