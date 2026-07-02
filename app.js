/* -------------------------------------------------------------
 * PAMPAS Premium Membership Website Script (v2 - AMEX Layout)
 * JavaScript for Interactive Components and Card Tilt Effect
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  // Helper to save consultation data to localStorage
  const saveConsultation = (userName, userPhone, interestBenefit, consultTime) => {
    try {
      const list = JSON.parse(localStorage.getItem('pampas_consultations') || '[]');
      list.push({
        id: Date.now(),
        userName,
        userPhone,
        interestBenefit,
        consultTime,
        date: new Date().toLocaleString()
      });
      localStorage.setItem('pampas_consultations', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving consultation:', e);
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

});
