/* -------------------------------------------------------------
 * PAMPAS Premium Membership Website Script (v2 - AMEX Layout)
 * JavaScript for Interactive Components and Card Tilt Effect
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  // Helper to save consultation data to localStorage and Convex
  const saveConsultation = async (userName, userPhone, interestBenefit, consultTime) => {
    const payload = {
      userName,
      userPhone,
      interestBenefit,
      consultTime,
      date: new Date().toLocaleString()
    };
    
    try {
      const list = JSON.parse(localStorage.getItem('pampas_consultations') || '[]');
      list.push({ ...payload, id: Date.now() });
      localStorage.setItem('pampas_consultations', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving consultation locally:', e);
    }

    try {
      const CONVEX_SITE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONVEX_SITE_URL) 
        || 'https://modest-gnat-340.convex.site';
      await fetch(`${CONVEX_SITE_URL}/submitConsultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Error submitting consultation to Convex:', e);
    }
  };

  // Helper to save 1:1 inquiry data to localStorage and Convex
  const saveInquiry = async (userName, userPhone, message) => {
    const payload = {
      userName,
      userPhone,
      message,
      date: new Date().toLocaleString()
    };

    try {
      const list = JSON.parse(localStorage.getItem('pampas_inquiries') || '[]');
      list.push({ ...payload, id: Date.now(), status: '대기중' });
      localStorage.setItem('pampas_inquiries', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving 1:1 inquiry locally:', e);
    }

    try {
      const CONVEX_SITE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONVEX_SITE_URL) 
        || 'https://modest-gnat-340.convex.site';
      await fetch(`${CONVEX_SITE_URL}/submitInquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Error submitting 1:1 inquiry to Convex:', e);
    }
  };

  // Helper to escape HTML characters
  const escapeHtml = (text) => {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Custom alert modal display helper
  const customAlertModal = document.getElementById('customAlertModal');
  const customAlertTitle = document.getElementById('customAlertTitle');
  const customAlertContent = document.getElementById('customAlertContent');
  const closeCustomAlertBtn = document.getElementById('closeCustomAlertBtn');

  window.showCustomAlert = (title, detailsHtml) => {
    if (customAlertTitle && customAlertContent && customAlertModal) {
      customAlertTitle.textContent = title;
      customAlertContent.innerHTML = detailsHtml;
      customAlertModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  if (closeCustomAlertBtn && customAlertModal) {
    closeCustomAlertBtn.addEventListener('click', () => {
      customAlertModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // ==========================================
  // 0. Header Scroll Effect
  // ==========================================
  const header = document.getElementById('header');
  const handleScrollHeader = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollHeader);
  handleScrollHeader(); // Initialize once on load

  // ==========================================
  // 1. Mobile Menu Toggle
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    menuToggle.classList.toggle('open');
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });

  // Close mobile menu when nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.classList.remove('open');
    });
  });

  // ==========================================
  // 2. Premium 3D Card Tilt Effect
  // ==========================================
  const cardContainer = document.querySelector('.luxury-card-container');
  const tiltCard = document.getElementById('tiltCard');

  if (cardContainer && tiltCard) {
    cardContainer.addEventListener('mousemove', (e) => {
      const rect = cardContainer.getBoundingClientRect();
      
      // Calculate mouse position relative to card container center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Max rotation angles (degrees)
      const maxRotateX = 18;
      const maxRotateY = 18;
      
      // Calculate rotation based on percentage offset from center
      const rotateX = -(y / (rect.height / 2)) * maxRotateX;
      const rotateY = (x / (rect.width / 2)) * maxRotateY;
      
      // Apply transforms
      tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Reset card when mouse leaves
    cardContainer.addEventListener('mouseleave', () => {
      tiltCard.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
      tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
      
      // Remove temporary transition so it returns to instant tracking on next hover
      setTimeout(() => {
        tiltCard.style.transition = 'none';
      }, 500);
    });

    cardContainer.addEventListener('mouseenter', () => {
      tiltCard.style.transition = 'none'; // Instant response on enter
    });
  }

  // ==========================================
  // 3. Interactive Scenario Switcher
  // ==========================================
  const scenarioItems = document.querySelectorAll('.scenario-item');
  const bgLayers = document.querySelectorAll('.scenarios-bg-layer');

  scenarioItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const scenario = item.getAttribute('data-scenario');
      
      // Deactivate all items
      scenarioItems.forEach(i => i.classList.remove('active'));
      // Deactivate all background layers
      bgLayers.forEach(l => l.classList.remove('active'));
      
      // Activate current
      item.classList.add('active');
      const targetBg = document.getElementById(`bg-${scenario}`);
      if (targetBg) {
        targetBg.classList.add('active');
      }
    });
  });

  // ==========================================
  // 4. Consultation Form Submission & Validation
  // ==========================================
  const consultForm = document.getElementById('consultationForm');
  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const userName = document.getElementById('userName').value.trim();
      const userPhone = document.getElementById('userPhone').value.trim();
      const interestBenefit = document.getElementById('interestBenefit');
      const interestBenefitText = interestBenefit.options[interestBenefit.selectedIndex].text;
      const consultTime = document.getElementById('consultTime');
      const consultTimeText = consultTime.options[consultTime.selectedIndex].text;

      const phoneRegex = /^[0-9]{2,4}-[0-9]{3,4}-[0-9]{4}$|^[0-9]{9,11}$/;
      if (!phoneRegex.test(userPhone.replace(/\s/g, ''))) {
        alert('올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678 또는 숫자만 입력)');
        return;
      }

      // Save to localStorage
      saveConsultation(userName, userPhone, interestBenefitText, consultTimeText);

      const detailsHtml = `
        <div style="margin-bottom: 12px; font-weight: 600; color: #0F172A; font-size: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">상담 신청이 정상적으로 접수되었습니다.</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>신청자</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(userName)}님</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>연락처</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(userPhone)}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>관심 혜택</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(interestBenefitText)}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span>희망 시간</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(consultTimeText)}</span></div>
        <div style="color: #64748B; font-size: 12px; margin-top: 10px; text-align: center;">신속히 안내해 드리겠습니다. 감사합니다.</div>
      `;
      window.showCustomAlert('상담 접수 완료', detailsHtml);
      
      consultForm.reset();
    });
  }

  // ==========================================
  // 5. FAQ Accordion Handler
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item-v2');
  
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger-v2');
    const panel = item.querySelector('.faq-panel-v2');
    
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-panel-v2').style.maxHeight = null;
        }
      });
      
      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 6. Modal Popups (Consultation & 1:1 Inquiry)
  // ==========================================
  const consultModal = document.getElementById('consultModal');
  const inquiryModal = document.getElementById('inquiryModal');
  const serviceDetailModal = document.getElementById('serviceDetailModal');
  
  const openConsultBtns = document.querySelectorAll('.open-consult-modal');
  const openInquiryBtn = document.getElementById('open1to1Modal');
  
  const closeConsultBtn = document.getElementById('closeConsultModal');
  const closeInquiryBtn = document.getElementById('closeInquiryModal');

  // Open Consultation Modal
  openConsultBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (consultModal) {
        consultModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    });
  });

  // Open 1:1 Inquiry Modal
  if (openInquiryBtn && inquiryModal) {
    openInquiryBtn.addEventListener('click', () => {
      inquiryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Close Consultation Modal
  if (closeConsultBtn && consultModal) {
    closeConsultBtn.addEventListener('click', () => {
      consultModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close 1:1 Inquiry Modal
  if (closeInquiryBtn && inquiryModal) {
    closeInquiryBtn.addEventListener('click', () => {
      inquiryModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close modals on clicking overlay background
  [consultModal, inquiryModal, serviceDetailModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });

  // ==========================================
  // 6b. Service Details Modal Popup & Tabs
  // ==========================================
  const openServiceDetailBtn = document.getElementById('openServiceDetailModal');
  const closeServiceDetailBtn = document.getElementById('closeServiceDetailModal');
  const serviceTabBtns = document.querySelectorAll('.service-tab-btn');
  const serviceTabPanels = document.querySelectorAll('.service-tab-panel');

  // Open Service Detail Modal
  if (openServiceDetailBtn && serviceDetailModal) {
    openServiceDetailBtn.addEventListener('click', () => {
      serviceDetailModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Close Service Detail Modal
  if (closeServiceDetailBtn && serviceDetailModal) {
    closeServiceDetailBtn.addEventListener('click', () => {
      serviceDetailModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Tab switching inside Service Detail Modal
  serviceTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Deactivate all tab buttons and panels
      serviceTabBtns.forEach(b => b.classList.remove('active'));
      serviceTabPanels.forEach(p => p.classList.remove('active'));
      
      // Activate clicked tab button and corresponding panel
      btn.classList.add('active');
      const targetPanel = document.getElementById(`tab-panel-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Modal Service Consult Button - close this modal and let consult modal open
  const modalServiceConsultBtn = document.getElementById('modalServiceConsultBtn');
  if (modalServiceConsultBtn) {
    modalServiceConsultBtn.addEventListener('click', () => {
      if (serviceDetailModal) {
        serviceDetailModal.classList.remove('active');
      }
    });
  }

  // ==========================================
  // 7. Phone Input Auto-Hyphenation & Mobile Keyboard
  // ==========================================
  const phoneInputs = [
    document.getElementById('userPhone'),
    document.getElementById('modalUserPhone'),
    document.getElementById('inquiryPhone')
  ];

  phoneInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', (e) => {
        const target = e.target;
        let rawVal = target.value.replace(/[^0-9]/g, '');
        let formattedVal = '';

        if (rawVal.length < 4) {
          formattedVal = rawVal;
        } else if (rawVal.length < 7) {
          formattedVal = `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
        } else if (rawVal.length < 11) {
          formattedVal = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 6)}-${rawVal.slice(6)}`;
        } else {
          formattedVal = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7, 11)}`;
        }
        
        target.value = formattedVal;
      });
    }
  });

  // ==========================================
  // 8. Modal Forms Submit Handlers
  // ==========================================
  const modalConsultForm = document.getElementById('modalConsultForm');
  if (modalConsultForm) {
    modalConsultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = document.getElementById('modalUserName').value.trim();
      const userPhone = document.getElementById('modalUserPhone').value.trim();
      const interestBenefit = document.getElementById('modalInterestBenefit');
      const interestBenefitText = interestBenefit.options[interestBenefit.selectedIndex].text;
      const consultTime = document.getElementById('modalConsultTime');
      const consultTimeText = consultTime.options[consultTime.selectedIndex].text;

      if (userPhone.length < 12) {
        alert('올바른 연락처 번호를 입력해주세요.');
        return;
      }

      // Save to localStorage
      saveConsultation(userName, userPhone, interestBenefitText, consultTimeText);

      const detailsHtml = `
        <div style="margin-bottom: 12px; font-weight: 600; color: #0F172A; font-size: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">상담 신청이 정상적으로 접수되었습니다.</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>신청자</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(userName)}님</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>연락처</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(userPhone)}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>관심 혜택</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(interestBenefitText)}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span>희망 시간</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(consultTimeText)}</span></div>
        <div style="color: #64748B; font-size: 12px; margin-top: 10px; text-align: center;">신속히 안내해 드리겠습니다. 감사합니다.</div>
      `;
      window.showCustomAlert('상담 접수 완료', detailsHtml);
      
      consultModal.classList.remove('active');
      document.body.style.overflow = '';
      modalConsultForm.reset();
    });
  }

  const modalInquiryForm = document.getElementById('modalInquiryForm');
  if (modalInquiryForm) {
    modalInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = document.getElementById('inquiryName').value.trim();
      const userPhone = document.getElementById('inquiryPhone').value.trim();
      const message = document.getElementById('inquiryMessage').value.trim();

      if (userPhone.length < 12) {
        alert('올바른 연락처 번호를 입력해주세요.');
        return;
      }

      // Save 1:1 inquiry to localStorage
      saveInquiry(userName, userPhone, message);

      const detailsHtml = `
        <div style="margin-bottom: 12px; font-weight: 600; color: #0F172A; font-size: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">1:1 문의가 정상적으로 접수되었습니다.</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>문의자</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(userName)}님</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>연락처</span><span style="font-weight: 600; color: #0F172A;">${escapeHtml(userPhone)}</span></div>
        <div style="margin-bottom: 12px; text-align: left; margin-top: 10px;">
          <span style="display: block; margin-bottom: 6px; color: #64748B; font-size: 12px;">문의 내용</span>
          <div style="background: #F8FAFC; padding: 10px; border: 1px solid #E2E8F0; font-size: 12.5px; color: #334155; line-height: 1.5; max-height: 80px; overflow-y: auto;">
            ${escapeHtml(message.slice(0, 50))}${message.length > 50 ? '...' : ''}
          </div>
        </div>
        <div style="color: #64748B; font-size: 12px; margin-top: 10px; text-align: center;">빠른 시일 내에 답변드리겠습니다. 감사합니다.</div>
      `;
      window.showCustomAlert('1:1 문의 접수 완료', detailsHtml);
      
      inquiryModal.classList.remove('active');
      document.body.style.overflow = '';
      modalInquiryForm.reset();
    });
  }

  // ==========================================
  // 9. Slanted Alternative Benefits Hover Accordion
  // ==========================================
  const altPanels = document.querySelectorAll('.alt-panel');
  if (altPanels.length > 0) {
    altPanels.forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        altPanels.forEach(p => p.classList.remove('active'));
        panel.classList.add('active');
      });
    });
  }

  // ==========================================
  // 10. Scroll to Middle Plan Card on Mobile
  // ==========================================
  const scrollToMiddlePlan = () => {
    const plansGrid = document.querySelector('.plans-grid');
    if (plansGrid && window.innerWidth <= 768) {
      const cards = plansGrid.querySelectorAll('.plan-card');
      if (cards.length >= 2) {
        const middleCard = cards[1]; // Family Life card (Recommended)
        const offsetLeft = middleCard.offsetLeft || 0;
        const cardWidth = middleCard.offsetWidth || (plansGrid.offsetWidth * 0.82);
        const scrollPosition = offsetLeft - (plansGrid.offsetWidth - cardWidth) / 2;
        plansGrid.scrollTo({
          left: scrollPosition,
          behavior: 'auto'
        });
      }
    }
  };

  const plansGrid = document.querySelector('.plans-grid');
  const indicatorDots = document.querySelectorAll('.indicator-dot');

  if (plansGrid && indicatorDots.length > 0) {
    // Listen to scroll to update active dot reactively
    plansGrid.addEventListener('scroll', () => {
      const scrollLeft = plansGrid.scrollLeft;
      const gridWidth = plansGrid.offsetWidth;
      const cards = plansGrid.querySelectorAll('.plan-card');
      if (cards.length > 0) {
        let minDiff = Infinity;
        let activeIdx = 0;
        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const viewportCenter = scrollLeft + gridWidth / 2;
          const diff = Math.abs(cardCenter - viewportCenter);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = idx;
          }
        });
        
        indicatorDots.forEach((dot, idx) => {
          if (idx === activeIdx) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });

    // Make dots clickable for smooth navigation
    indicatorDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const cards = plansGrid.querySelectorAll('.plan-card');
        if (cards[idx]) {
          const scrollPosition = cards[idx].offsetLeft - (plansGrid.offsetWidth - cards[idx].offsetWidth) / 2;
          plansGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ==========================================
  // 11. Promotion Popup Modal with Slider
  // ==========================================
  const promoModal = document.getElementById('promoModal');
  const promoCarousel = document.getElementById('promoCarousel');
  const promoPrevBtn = document.getElementById('promoPrevBtn');
  const promoNextBtn = document.getElementById('promoNextBtn');
  const promoCloseBtn = document.getElementById('closePromoModalBtn');
  const promoTopCloseBtn = document.getElementById('promoTopCloseBtn');
  const dontShow7DaysCheckbox = document.getElementById('dontShow7DaysCheckbox');
  const promoDotsContainer = document.getElementById('promoDots');
  const promoDots = document.querySelectorAll('.promo-dot');
  const promoBadge = document.getElementById('promoBadge');
  const promoSlide1 = document.getElementById('promoSlide1');
  const promoSlide2 = document.getElementById('promoSlide2');

  let activeSlides = [0, 1]; // Indices of slides currently shown
  let currentPromoSlide = 0; // Relative index in activeSlides list (0 or 1)

  // Check if a specific slide is blocked
  const isSlideBlocked = (slideNum) => {
    const expiry = localStorage.getItem(`dontShowPromo${slideNum}Until`);
    if (expiry) {
      const now = new Date().getTime();
      return now < parseInt(expiry, 10);
    }
    return false;
  };

  // Initial check
  const initPromoModal = () => {
    if (!promoModal) return;

    const block1 = isSlideBlocked(1);
    const block2 = isSlideBlocked(2);

    if (block1 && block2) {
      activeSlides = [];
      return;
    }

    if (block1) {
      activeSlides = [1];
      if (promoSlide1) promoSlide1.classList.add('closed');
      currentPromoSlide = 0;
      adjustCarouselToSingleSlide(promoSlide2);
    } else if (block2) {
      activeSlides = [0];
      if (promoSlide2) promoSlide2.classList.add('closed');
      currentPromoSlide = 0;
      adjustCarouselToSingleSlide(promoSlide1);
    } else {
      activeSlides = [0, 1];
      currentPromoSlide = 0;
    }

    updatePromoIndicators();
  };

  const adjustCarouselToSingleSlide = (slideEl) => {
    if (promoCarousel) {
      promoCarousel.style.width = '100%';
      promoCarousel.style.transform = 'translateX(0)';
    }
    if (slideEl) {
      slideEl.style.width = '100%';
    }
    if (promoPrevBtn) promoPrevBtn.style.display = 'none';
    if (promoNextBtn) promoNextBtn.style.display = 'none';
    if (promoDotsContainer) promoDotsContainer.style.display = 'none';
    if (promoBadge) promoBadge.style.display = 'none';
  };

  const updatePromoIndicators = () => {
    if (activeSlides.length <= 1) {
      if (promoBadge) promoBadge.style.display = 'none';
      if (promoDotsContainer) promoDotsContainer.style.display = 'none';
      if (promoPrevBtn) promoPrevBtn.style.display = 'none';
      if (promoNextBtn) promoNextBtn.style.display = 'none';
      return;
    }

    if (promoBadge) {
      promoBadge.style.display = 'block';
      promoBadge.textContent = `${currentPromoSlide + 1} / ${activeSlides.length}`;
    }

    promoDots.forEach((dot, index) => {
      if (index === currentPromoSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  const showPromoModal = () => {
    if (promoModal && activeSlides.length > 0) {
      promoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCurrentSlideOnly = () => {
    if (activeSlides.length === 0) return;

    const currentSlideNum = activeSlides[currentPromoSlide] + 1; // 1 or 2

    // Save 7-day setting if checked
    if (dontShow7DaysCheckbox && dontShow7DaysCheckbox.checked) {
      const expiryDate = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(`dontShowPromo${currentSlideNum}Until`, expiryDate.toString());
    }

    // Uncheck for next slide
    if (dontShow7DaysCheckbox) dontShow7DaysCheckbox.checked = false;

    if (activeSlides.length === 2) {
      const slideToClose = activeSlides[currentPromoSlide];
      const slideToKeep = activeSlides[1 - currentPromoSlide];

      const closeEl = slideToClose === 0 ? promoSlide1 : promoSlide2;
      const keepEl = slideToKeep === 0 ? promoSlide1 : promoSlide2;

      if (closeEl) closeEl.classList.add('closed');

      activeSlides = [slideToKeep];
      currentPromoSlide = 0;

      adjustCarouselToSingleSlide(keepEl);
      updatePromoIndicators();
    } else {
      activeSlides = [];
      if (promoModal) promoModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  const updatePromoCarousel = () => {
    if (activeSlides.length > 1 && promoCarousel) {
      promoCarousel.style.transform = `translateX(-${currentPromoSlide * 50}%)`;
    }
    updatePromoIndicators();
  };

  const nextPromoSlide = () => {
    if (activeSlides.length > 1) {
      currentPromoSlide = (currentPromoSlide + 1) % activeSlides.length;
      updatePromoCarousel();
    }
  };

  const prevPromoSlide = () => {
    if (activeSlides.length > 1) {
      currentPromoSlide = (currentPromoSlide - 1 + activeSlides.length) % activeSlides.length;
      updatePromoCarousel();
    }
  };

  if (promoPrevBtn && promoNextBtn) {
    promoPrevBtn.addEventListener('click', prevPromoSlide);
    promoNextBtn.addEventListener('click', nextPromoSlide);
  }

  if (promoCloseBtn) {
    promoCloseBtn.addEventListener('click', closeCurrentSlideOnly);
  }

  if (promoTopCloseBtn) {
    promoTopCloseBtn.addEventListener('click', closeCurrentSlideOnly);
  }

  promoDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      if (activeSlides.length > 1) {
        const slideIndex = parseInt(e.target.getAttribute('data-slide'), 10);
        currentPromoSlide = slideIndex;
        updatePromoCarousel();
      }
    });
  });



  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const handleGesture = () => {
    if (activeSlides.length <= 1) return;
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 50;
    
    if (swipeDistance < -minSwipeDistance) {
      nextPromoSlide();
    } else if (swipeDistance > minSwipeDistance) {
      prevPromoSlide();
    }
  };

  const promoWrapper = document.querySelector('.promo-carousel-wrapper');
  if (promoWrapper) {
    promoWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    promoWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });
  }

  // ==========================================
  // 12. Legal Modals Handler
  // ==========================================
  const legalModal = document.getElementById('legalModal');
  const closeLegalModalBtn = document.getElementById('closeLegalModal');
  const legalLinks = document.querySelectorAll('.legal-link');
  const legalTabBtns = document.querySelectorAll('[data-legal]');
  const legalPanels = document.querySelectorAll('[id^="legal-panel-"]');

  const openLegalModal = (tabName) => {
    if (!legalModal) return;
    legalModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Switch tab active states
    legalTabBtns.forEach(btn => {
      if (btn.getAttribute('data-legal') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Switch panels active states
    legalPanels.forEach(panel => {
      if (panel.id === `legal-panel-${tabName}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  };

  const closeLegalModal = () => {
    if (legalModal) {
      legalModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Wire up footer links to open corresponding tabs
  legalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const text = link.textContent.trim();
      let tabName = 'terms';
      if (text === '개인정보처리방침') {
        tabName = 'privacy';
      } else if (text === '이메일무단수집거부') {
        tabName = 'email';
      }
      openLegalModal(tabName);
    });
  });

  if (closeLegalModalBtn) {
    closeLegalModalBtn.addEventListener('click', closeLegalModal);
  }

  // Tab switching inside Legal Modal
  legalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-legal');
      legalTabBtns.forEach(b => b.classList.remove('active'));
      legalPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`legal-panel-${tabName}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) {
        closeLegalModal();
      }
    });
  }

  initPromoModal();

  window.addEventListener('load', () => {
    setTimeout(scrollToMiddlePlan, 150);
    setTimeout(showPromoModal, 800);
  });

  window.addEventListener('resize', scrollToMiddlePlan);


});

