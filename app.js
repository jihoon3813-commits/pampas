/* -------------------------------------------------------------
 * PAMPAS Premium Membership Website Script (v2 - AMEX Layout)
 * JavaScript for Interactive Components and Card Tilt Effect
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  // Convex Endpoints (Primary Production & Dev Fallback)
  const CONVEX_SITE_URLS = [
    'https://unique-panda-155.convex.site',
    'https://modest-gnat-340.convex.site'
  ];

  const postToConvex = async (endpoint, body) => {
    let lastError = null;
    let lastData = null;
    for (const baseUrl of CONVEX_SITE_URLS) {
      try {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data && data.success) {
          if (endpoint === '/register') {
            for (const otherUrl of CONVEX_SITE_URLS) {
              if (otherUrl !== baseUrl) {
                fetch(`${otherUrl}/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body)
                }).catch(() => {});
              }
            }
          }
          return data;
        }
        lastData = data;
      } catch (err) {
        console.warn(`Fetch notice for ${baseUrl}${endpoint}:`, err);
        lastError = err;
      }
    }
    if (lastData) return lastData;
    throw lastError || new Error('서버 연결 실패');
  };

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

    postToConvex('/submitConsultation', payload).catch(e => {
      console.warn('Convex consultation sync notice:', e);
    });
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

    postToConvex('/submitInquiry', payload).catch(e => {
      console.warn('Convex inquiry sync notice:', e);
    });
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
  // Phone Number Auto-Hyphenation Utility
  // (010 휴대폰, 02 서울, 지역번호, 1588/1661 등 대표번호 완벽 지원)
  // ==========================================
  const formatPhoneNumber = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/[^0-9]/g, '');

    // 15xx, 16xx, 18xx 등 8자리 공식/대표번호 (XXXX-XXXX)
    if (/^(15|16|18)[0-9]{2}/.test(num)) {
      if (num.length <= 4) return num;
      return `${num.slice(0, 4)}-${num.slice(4, 8)}`;
    }

    // 02 서울 지역번호 (9~10자리: 02-XXX-XXXX, 02-XXXX-XXXX)
    if (num.startsWith('02')) {
      if (num.length <= 2) return num;
      if (num.length <= 5) return `${num.slice(0, 2)}-${num.slice(2)}`;
      if (num.length <= 9) return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5, 9)}`;
      return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
    }

    // 050x 안심번호 (11~12자리: 050x-XXX-XXXX, 050x-XXXX-XXXX)
    if (num.startsWith('050')) {
      if (num.length <= 4) return num;
      if (num.length <= 7) return `${num.slice(0, 4)}-${num.slice(4)}`;
      if (num.length <= 11) return `${num.slice(0, 4)}-${num.slice(4, 7)}-${num.slice(7, 11)}`;
      return `${num.slice(0, 4)}-${num.slice(4, 8)}-${num.slice(8, 12)}`;
    }

    // 일반 3자리 국번 (010, 011, 031, 032, 033, 041, 042, 043, 051, 052, 053, 054, 055, 061, 062, 063, 064, 070 등)
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    if (num.length <= 10) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6, 10)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  const applyPhoneInputMask = (input) => {
    if (!input) return;
    input.setAttribute('type', 'tel');
    input.setAttribute('inputmode', 'numeric');
    input.removeAttribute('pattern');
    input.setAttribute('maxlength', '14');
    input.addEventListener('input', (e) => {
      e.target.value = formatPhoneNumber(e.target.value);
    });
  };

  // ==========================================
  // Member Authentication & State Management
  // ==========================================
  const AUTH_STORAGE_KEY = 'hdone_auth_user';
  const LOCAL_USERS_KEY = 'hdone_local_users';

  const getLocalUsers = () => {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalUser = (user) => {
    try {
      const users = getLocalUsers();
      users.push(user);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving local user:', e);
    }
  };

  const getAuthUser = () => {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };

  const setAuthUser = (user) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }
  };

  const clearAuthUser = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing user from localStorage:', e);
    }
  };

  const isLoggedIn = () => {
    return !!getAuthUser();
  };

  const updateAuthUI = () => {
    const user = getAuthUser();
    const isMember = !!user;

    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const headerUserBadge = document.getElementById('headerUserBadge');
    const headerUserName = document.getElementById('headerUserName');

    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileUserBadge = document.getElementById('mobileUserBadge');
    const mobileUserName = document.getElementById('mobileUserName');

    if (isMember) {
      document.body.classList.remove('is-guest');
      document.body.classList.add('is-member');

      if (headerLoginBtn) headerLoginBtn.style.display = 'none';
      if (headerUserBadge) headerUserBadge.style.display = 'flex';
      if (headerUserName) headerUserName.textContent = `${user.name}님`;

      if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
      if (mobileUserBadge) mobileUserBadge.style.display = 'flex';
      if (mobileUserName) mobileUserName.textContent = `${user.name}님 환영합니다`;
    } else {
      document.body.classList.add('is-guest');
      document.body.classList.remove('is-member');

      if (headerLoginBtn) headerLoginBtn.style.display = 'inline-block';
      if (headerUserBadge) headerUserBadge.style.display = 'none';

      if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
      if (mobileUserBadge) mobileUserBadge.style.display = 'none';
    }
  };

  // Auth Modal Elements & Controls
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModal');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const authPanelLogin = document.getElementById('authPanelLogin');
  const authPanelRegister = document.getElementById('authPanelRegister');
  const authModalTitle = document.getElementById('authModalTitle');
  const authModalDesc = document.getElementById('authModalDesc');
  const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');
  const switchToLoginBtn = document.getElementById('switchToLoginBtn');

  const switchAuthTab = (tab) => {
    if (tab === 'register') {
      if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
      if (tabLoginBtn) tabLoginBtn.classList.remove('active');
      if (authPanelRegister) authPanelRegister.classList.add('active');
      if (authPanelLogin) authPanelLogin.classList.remove('active');
      if (authModalTitle) authModalTitle.textContent = 'HDONE 신규 회원가입';
      if (authModalDesc) authModalDesc.textContent = '회원가입 후 HDONE의 모든 프리미엄 라이프 혜택을 이용해 보세요.';
    } else {
      if (tabLoginBtn) tabLoginBtn.classList.add('active');
      if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
      if (authPanelLogin) authPanelLogin.classList.add('active');
      if (authPanelRegister) authPanelRegister.classList.remove('active');
      if (authModalTitle) authModalTitle.textContent = 'HDONE 멤버십 로그인';
      if (authModalDesc) authModalDesc.textContent = '로그인 후 모든 라이프 혜택과 멤버십 서비스를 이용하실 수 있습니다.';
    }
  };

  const openAuthModal = (tab = 'login', noticeMessage = '') => {
    if (!authModal) return;
    switchAuthTab(tab);
    if (noticeMessage && authModalDesc) {
      authModalDesc.textContent = noticeMessage;
    }
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    if (!authModal) return;
    authModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
  }
  // 로그인 모달 외부 배경을 클릭해도 모달이 닫히지 않도록 처리
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        e.stopPropagation();
      }
    });
  }
  if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
  if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
  if (switchToRegisterBtn) switchToRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
  if (switchToLoginBtn) switchToLoginBtn.addEventListener('click', () => switchAuthTab('login'));

  // Header login/logout button events
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const headerLogoutBtn = document.getElementById('headerLogoutBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

  if (headerLoginBtn) headerLoginBtn.addEventListener('click', () => openAuthModal('login'));
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('open');
      if (menuToggle) menuToggle.classList.remove('open');
      openAuthModal('login');
    });
  }

  const handleLogout = () => {
    clearAuthUser();
    updateAuthUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showCustomAlert('로그아웃 완료', '<p>안전하게 로그아웃되었습니다.</p>');
  };

  if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('open');
      if (menuToggle) menuToggle.classList.remove('open');
      handleLogout();
    });
  }

  // Daum Postcode Address Search
  const btnSearchAddress = document.getElementById('btnSearchAddress');
  if (btnSearchAddress) {
    btnSearchAddress.addEventListener('click', () => {
      if (typeof daum === 'undefined' || !daum.Postcode) {
        showCustomAlert('주소 검색 안내', '<p>우편번호 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.</p>');
        return;
      }
      new daum.Postcode({
        oncomplete: function(data) {
          let fullAddr = data.address;
          let extraAddr = '';

          if (data.addressType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname;
            }
            if (data.buildingName !== '') {
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // "주소 검색은 괄호안에 주소 모두 보이게하고"
            if (extraAddr !== '') {
              fullAddr += ` (${extraAddr})`;
            }
          }

          const regZipcode = document.getElementById('regZipcode');
          const regAddress = document.getElementById('regAddress');
          const regDetailAddress = document.getElementById('regDetailAddress');

          if (regZipcode) regZipcode.value = data.zonecode;
          if (regAddress) regAddress.value = fullAddr;
          if (regDetailAddress) regDetailAddress.focus();
        }
      }).open();
    });
  }

  // Quick Fill Guest Login Button
  const quickGuestFillBtn = document.getElementById('quickGuestFillBtn');
  if (quickGuestFillBtn) {
    quickGuestFillBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      if (emailInput && passwordInput) {
        emailInput.value = 'guest';
        passwordInput.value = '1111';
        passwordInput.focus();
      }
    });
  }

  // Handle Login Form Submit
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const submitBtn = document.getElementById('submitLoginBtn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '로그인 중...';

      try {
        let data = null;
        try {
          data = await postToConvex('/login', { email, password });
        } catch (fetchErr) {
          console.warn('Convex login network issue, attempting local fallback:', fetchErr);
          const localUsers = getLocalUsers();
          const found = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (found && found.password === password) {
            data = { success: true, user: found };
          } else if (email.toLowerCase() === 'guest' && password === '1111') {
            data = {
              success: true,
              user: {
                id: 'guest_default',
                email: 'guest',
                name: '게스트',
                phone: '010-0000-0000',
                address: '서울특별시 강남구',
                detailAddress: 'HDONE 갤러리 게스트룸',
                role: 'user'
              }
            };
          } else if (found) {
            data = { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
          } else {
            throw fetchErr;
          }
        }

        // If server returned failure but it's the predefined guest account
        if ((!data || !data.success) && email.toLowerCase() === 'guest' && password === '1111') {
          data = {
            success: true,
            user: {
              id: 'guest_default',
              email: 'guest',
              name: '게스트',
              phone: '010-0000-0000',
              address: '서울특별시 강남구',
              detailAddress: 'HDONE 갤러리 게스트룸',
              role: 'user'
            }
          };
        }

        if (data && data.success && data.user) {
          setAuthUser(data.user);
          updateAuthUI();
          closeAuthModal();
          loginForm.reset();
          showCustomAlert('로그인 성공', `<p><strong>${escapeHtml(data.user.name)}</strong>님, 환영합니다!<br>HDONE의 모든 멤버십 혜택과 서비스를 자유롭게 이용하실 수 있습니다.</p>`);
        } else {
          showCustomAlert('로그인 실패', `<p>${escapeHtml(data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.')}</p>`);
        }
      } catch (err) {
        console.error('Login error:', err);
        showCustomAlert('통신 오류', '<p>로그인 서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Handle Register Form Submit
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const passwordConfirm = document.getElementById('regPasswordConfirm').value;
      const phone = document.getElementById('regPhone').value.trim();
      const zipcode = document.getElementById('regZipcode') ? document.getElementById('regZipcode').value.trim() : '';
      const address = document.getElementById('regAddress') ? document.getElementById('regAddress').value.trim() : '';
      const detailAddress = document.getElementById('regDetailAddress') ? document.getElementById('regDetailAddress').value.trim() : '';

      if (password.length < 6) {
        showCustomAlert('비밀번호 오류', '<p>비밀번호는 최소 6자 이상으로 설정해 주세요.</p>');
        return;
      }
      if (password !== passwordConfirm) {
        showCustomAlert('비밀번호 불일치', '<p>입력하신 비밀번호와 비밀번호 확인이 일치하지 않습니다.</p>');
        return;
      }

      const submitBtn = document.getElementById('submitRegisterBtn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '가입 진행 중...';

      try {
        let data = null;
        try {
          data = await postToConvex('/register', { email, password, name, phone, zipcode, address, detailAddress });
        } catch (fetchErr) {
          console.warn('Convex register network issue, attempting local fallback:', fetchErr);
          const localUsers = getLocalUsers();
          if (localUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            data = { success: false, message: '이미 가입된 이메일 주소입니다.' };
          } else {
            const newUser = {
              id: 'local_' + Date.now(),
              email,
              password,
              name,
              phone,
              zipcode,
              address,
              detailAddress,
              role: 'user'
            };
            saveLocalUser(newUser);
            data = { success: true, user: newUser };
          }
        }

        if (data && data.success && data.user) {
          setAuthUser(data.user);
          updateAuthUI();
          closeAuthModal();
          registerForm.reset();
          showCustomAlert('회원가입 완료', `<p><strong>${escapeHtml(data.user.name)}</strong>님의 회원가입이 성공적으로 완료되었습니다.<br>HDONE 프리미엄 멤버십에 오신 것을 진심으로 환영합니다!</p>`);
        } else {
          showCustomAlert('회원가입 실패', `<p>${escapeHtml(data?.message || '회원가입 처리 중 오류가 발생했습니다.')}</p>`);
        }
      } catch (err) {
        console.error('Register error:', err);
        showCustomAlert('통신 오류', '<p>회원가입 서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Initialize Auth state on startup
  updateAuthUI();

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
  // 1. Mobile Menu Toggle & Protected Menu Navigation
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.classList.toggle('open');
      menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });
  }

  // Close mobile menu and verify authentication before entering menus
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Benefits and Announcement sections are publicly viewable
      if (href === '#benefits' || href === '#announcement' || href === '#hero') {
        if (navMenu) navMenu.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('open');
        return;
      }

      if (!isLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        if (navMenu) navMenu.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('open');
        openAuthModal('login', '로그인 상태에서만 메뉴에 접속하실 수 있습니다. 먼저 로그인해 주세요.');
        return;
      }
      if (navMenu) navMenu.classList.remove('open');
      if (menuToggle) menuToggle.classList.remove('open');
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

      const cleanPhone = userPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 12) {
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
      if (!isLoggedIn()) {
        openAuthModal('login', '로그인 후 상담 신청 및 서비스 이용이 가능합니다. 먼저 로그인해 주세요.');
        return;
      }
      if (consultModal) {
        consultModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    });
  });

  // Open 1:1 Inquiry Modal
  if (openInquiryBtn && inquiryModal) {
    openInquiryBtn.addEventListener('click', () => {
      if (!isLoggedIn()) {
        openAuthModal('login', '로그인 후 1:1 문의가 가능합니다. 먼저 로그인해 주세요.');
        return;
      }
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
      if (!isLoggedIn()) {
        openAuthModal('login', '로그인 후 서비스 상세 내역을 확인하실 수 있습니다. 먼저 로그인해 주세요.');
        return;
      }
      serviceDetailModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Open Service Detail Modal with a specific tab
  const openTabInModal = (tabName) => {
    if (!isLoggedIn()) {
      openAuthModal('login', '로그인 후 서비스 상세 내역을 확인하실 수 있습니다. 먼저 로그인해 주세요.');
      return;
    }
    if (serviceDetailModal) {
      serviceDetailModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Find the tab button with the matching data-tab
      const targetBtn = Array.from(serviceTabBtns).find(btn => btn.getAttribute('data-tab') === tabName);
      if (targetBtn) {
        // Trigger tab switch
        targetBtn.click();
      }
    }
  };

  // Add click listeners to any elements with data-open-service-tab
  document.querySelectorAll('[data-open-service-tab]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = el.getAttribute('data-open-service-tab');
      openTabInModal(tabName);
    });
  });

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

  // Hero section action buttons click protection
  const heroActionBtns = document.querySelectorAll('#hero .hero-actions a');
  heroActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href === '#benefits' || href === '#announcement') {
        return; // Allow viewing public sections
      }
      if (!isLoggedIn()) {
        e.preventDefault();
        openAuthModal('login', '로그인 후 HDONE 멤버십 서비스를 이용하실 수 있습니다.');
      }
    });
  });

  // Member Lock Banner click handler
  const memberLockBanner = document.getElementById('memberLockBanner');
  if (memberLockBanner) {
    memberLockBanner.querySelectorAll('.open-auth-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.getAttribute('data-auth-mode') || 'login';
        openAuthModal(mode);
      });
    });
  }

  // Protected Content Wrapper click handler (intercepts any clicks from non-logged-in users)
  const protectedContentWrapper = document.getElementById('protectedContentWrapper');
  if (protectedContentWrapper) {
    protectedContentWrapper.addEventListener('click', (e) => {
      if (!isLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        openAuthModal('login', '로그인 후 전체 서비스와 상세 혜택을 이용하실 수 있습니다.');
      }
    });
  }

  // Floating Action Buttons Protection
  const floatingConsultBtn = document.querySelector('.floating-btn.btn-consult');
  if (floatingConsultBtn) {
    floatingConsultBtn.addEventListener('click', (e) => {
      if (!isLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        openAuthModal('login', '로그인 후 상담 신청이 가능합니다.');
      }
    });
  }
  const floatingMallBtn = document.querySelector('.floating-btn.btn-mall');
  if (floatingMallBtn) {
    floatingMallBtn.addEventListener('click', (e) => {
      if (!isLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        openAuthModal('login', '회원 전용 쇼핑몰은 로그인 후 이용 가능합니다.');
      }
    });
  }

  // ==========================================
  // 7. Phone Input Auto-Hyphenation & Mobile Keyboard
  // (010, 02 등 지역번호, 1588 등 공식대표번호 자동 하이픈)
  // ==========================================
  const phoneInputIds = ['userPhone', 'modalUserPhone', 'inquiryPhone', 'regPhone'];
  phoneInputIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      applyPhoneInputMask(input);
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

      const cleanPhone = userPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 12) {
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

      const cleanInquiryPhone = userPhone.replace(/[^0-9]/g, '');
      if (cleanInquiryPhone.length < 7 || cleanInquiryPhone.length > 12) {
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
  const promoBadge = document.getElementById('promoBadge');

  const allPromoSlideEls = document.querySelectorAll('.promo-slide');
  let activeSlideIndices = []; // Indices of visible slides
  let currentPromoSlide = 0;

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
    if (!promoModal || !promoCarousel) return;

    activeSlideIndices = [];
    allPromoSlideEls.forEach((slide, idx) => {
      const slideNum = idx + 1;
      if (isSlideBlocked(slideNum)) {
        slide.classList.add('closed');
      } else {
        slide.classList.remove('closed');
        activeSlideIndices.push(idx);
      }
    });

    if (activeSlideIndices.length === 0) {
      if (promoModal) promoModal.classList.remove('active');
      return;
    }

    currentPromoSlide = 0;
    updatePromoCarousel();
  };

  const updatePromoIndicators = () => {
    if (activeSlideIndices.length <= 1) {
      if (promoBadge) promoBadge.style.display = 'none';
      if (promoDotsContainer) promoDotsContainer.style.display = 'none';
      if (promoPrevBtn) promoPrevBtn.style.display = 'none';
      if (promoNextBtn) promoNextBtn.style.display = 'none';
      return;
    }

    if (promoBadge) {
      promoBadge.style.display = 'block';
      promoBadge.textContent = `${currentPromoSlide + 1} / ${activeSlideIndices.length}`;
    }
    if (promoDotsContainer) promoDotsContainer.style.display = 'flex';
    if (promoPrevBtn) promoPrevBtn.style.display = 'flex';
    if (promoNextBtn) promoNextBtn.style.display = 'flex';

    // Rebuild or sync dots
    if (promoDotsContainer) {
      promoDotsContainer.innerHTML = '';
      activeSlideIndices.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `promo-dot ${idx === currentPromoSlide ? 'active' : ''}`;
        dot.setAttribute('data-slide', idx);
        dot.addEventListener('click', () => {
          currentPromoSlide = idx;
          updatePromoCarousel();
        });
        promoDotsContainer.appendChild(dot);
      });
    }
  };

  const showPromoModal = () => {
    if (promoModal && activeSlideIndices.length > 0) {
      promoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const updatePromoCarousel = () => {
    if (!promoCarousel) return;
    const count = activeSlideIndices.length;
    if (count === 0) return;

    // Arrange visible slides in flex order
    activeSlideIndices.forEach((origIdx, activePos) => {
      const el = allPromoSlideEls[origIdx];
      if (el) el.style.order = activePos;
    });

    const activeIndex = activeSlideIndices[currentPromoSlide];
    // Translate based on active position
    promoCarousel.style.transform = `translateX(-${currentPromoSlide * 100}%)`;
    updatePromoIndicators();
  };

  const closeCurrentSlideOnly = () => {
    if (activeSlideIndices.length === 0) return;

    const origSlideIdx = activeSlideIndices[currentPromoSlide];
    const slideNum = origSlideIdx + 1;

    // Save 7-day setting if checked
    if (dontShow7DaysCheckbox && dontShow7DaysCheckbox.checked) {
      const expiryDate = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(`dontShowPromo${slideNum}Until`, expiryDate.toString());
    }

    if (dontShow7DaysCheckbox) dontShow7DaysCheckbox.checked = false;

    // Close this slide element
    const elToClose = allPromoSlideEls[origSlideIdx];
    if (elToClose) elToClose.classList.add('closed');

    // Remove from active list
    activeSlideIndices.splice(currentPromoSlide, 1);

    if (activeSlideIndices.length === 0) {
      if (promoModal) promoModal.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      if (currentPromoSlide >= activeSlideIndices.length) {
        currentPromoSlide = activeSlideIndices.length - 1;
      }
      updatePromoCarousel();
    }
  };

  const nextPromoSlide = () => {
    if (activeSlideIndices.length > 1) {
      currentPromoSlide = (currentPromoSlide + 1) % activeSlideIndices.length;
      updatePromoCarousel();
    }
  };

  const prevPromoSlide = () => {
    if (activeSlideIndices.length > 1) {
      currentPromoSlide = (currentPromoSlide - 1 + activeSlideIndices.length) % activeSlideIndices.length;
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

