const initAdmin = () => {
  // Elements
  const loginWrapper = document.getElementById('loginWrapper');
  const sidebarNode = document.getElementById('sidebarNode');
  const mainConsoleNode = document.getElementById('mainConsoleNode');
  
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  
  const menuBtnList = document.getElementById('menuBtnList');
  const menuBtnInquiry = document.getElementById('menuBtnInquiry');
  const menuBtnPassword = document.getElementById('menuBtnPassword');
  const panelList = document.getElementById('panelList');
  const panelInquiry = document.getElementById('panelInquiry');
  const panelPassword = document.getElementById('panelPassword');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  
  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('searchInput');
  const filterBenefit = document.getElementById('filterBenefit');
  const filterStatus = document.getElementById('filterStatus');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const pwdChangeForm = document.getElementById('pwdChangeForm');
  
  const kpiTotal = document.getElementById('kpiTotal');
  const kpiPending = document.getElementById('kpiPending');
  const kpiJoined = document.getElementById('kpiJoined');
  
  // Inquiry elements
  const inquiryTableBody = document.getElementById('inquiryTableBody');
  const inquirySearchInput = document.getElementById('inquirySearchInput');
  const filterInquiryStatus = document.getElementById('filterInquiryStatus');
  const clearAllInquiriesBtn = document.getElementById('clearAllInquiriesBtn');
  
  const kpiInquiryTotal = document.getElementById('kpiInquiryTotal');
  const kpiInquiryPending = document.getElementById('kpiInquiryPending');
  const kpiInquiryCompleted = document.getElementById('kpiInquiryCompleted');
  
  const liveTimeClock = document.getElementById('liveTimeClock');

  // Convex Integration Configuration
  const CONVEX_SITE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONVEX_SITE_URL) 
    || 'https://modest-gnat-340.convex.site';

  let activeConsultations = [];
  let activeInquiries = [];

  async function fetchConsultations() {
    try {
      const res = await fetch(`${CONVEX_SITE_URL}/getConsultations`);
      if (res.ok) {
        const data = await res.json();
        activeConsultations = data.map(item => ({
          id: item._id,
          userName: item.userName,
          userPhone: item.userPhone,
          interestBenefit: item.interestBenefit,
          consultTime: item.consultTime,
          status: item.status || '대기중',
          date: item.date
        }));
        localStorage.setItem('pampas_consultations', JSON.stringify(activeConsultations));
      }
    } catch (e) {
      console.error('Error fetching consultations from Convex, falling back to local:', e);
      activeConsultations = JSON.parse(localStorage.getItem('pampas_consultations') || '[]');
    }
  }

  async function fetchInquiries() {
    try {
      const res = await fetch(`${CONVEX_SITE_URL}/getInquiries`);
      if (res.ok) {
        const data = await res.json();
        activeInquiries = data.map(item => ({
          id: item._id,
          userName: item.userName,
          userPhone: item.userPhone,
          message: item.message,
          status: item.status || '대기중',
          date: item.date
        }));
        localStorage.setItem('pampas_inquiries', JSON.stringify(activeInquiries));
      }
    } catch (e) {
      console.error('Error fetching inquiries from Convex, falling back to local:', e);
      activeInquiries = JSON.parse(localStorage.getItem('pampas_inquiries') || '[]');
    }
  }

  // Initialize admin password if not set
  if (!localStorage.getItem('pampas_admin_password')) {
    localStorage.setItem('pampas_admin_password', 'admin1234');
  }

  // Live clock updates
  function updateClock() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    liveTimeClock.textContent = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Session Verification
  const isAdminSessionActive = sessionStorage.getItem('pampas_admin_logged_in') === 'true';
  if (isAdminSessionActive) {
    showDashboard();
  }

  // Form Handler: Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const storedPassword = localStorage.getItem('pampas_admin_password');

    if (username === 'admin' && password === storedPassword) {
      sessionStorage.setItem('pampas_admin_logged_in', 'true');
      showDashboard();
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  });

  // Event Handler: Logout
  const handleLogout = () => {
    sessionStorage.removeItem('pampas_admin_logged_in');
    hideDashboard();
  };
  logoutBtn.addEventListener('click', handleLogout);
  
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
  }

  async function showDashboard() {
    loginWrapper.style.opacity = '0';
    setTimeout(() => {
      loginWrapper.style.display = 'none';
    }, 300);
    
    sidebarNode.style.display = 'flex';
    mainConsoleNode.style.display = 'flex';
    await switchTab('list');
  }

  function hideDashboard() {
    loginWrapper.style.display = 'flex';
    setTimeout(() => {
      loginWrapper.style.opacity = '1';
    }, 10);
    
    sidebarNode.style.display = 'none';
    mainConsoleNode.style.display = 'none';
    loginForm.reset();
  }

  // Tabs handling
  async function switchTab(tab) {
    menuBtnList.classList.remove('active');
    menuBtnInquiry.classList.remove('active');
    menuBtnPassword.classList.remove('active');
    
    panelList.classList.remove('active');
    panelInquiry.classList.remove('active');
    panelPassword.classList.remove('active');
    
    if (tab === 'list') {
      menuBtnList.classList.add('active');
      panelList.classList.add('active');
      breadcrumbCurrent.textContent = '상담신청 내역 관리';
      await fetchConsultations();
      renderRequests();
    } else if (tab === 'inquiry') {
      menuBtnInquiry.classList.add('active');
      panelInquiry.classList.add('active');
      breadcrumbCurrent.textContent = '1:1 문의 내역 관리';
      await fetchInquiries();
      renderInquiries();
    } else {
      menuBtnPassword.classList.add('active');
      panelPassword.classList.add('active');
      breadcrumbCurrent.textContent = '관리자 비밀번호 설정';
      pwdChangeForm.reset();
    }
  }

  menuBtnList.addEventListener('click', () => switchTab('list'));
  menuBtnInquiry.addEventListener('click', () => switchTab('inquiry'));
  menuBtnPassword.addEventListener('click', () => switchTab('password'));

  // Render requests lists
  function renderRequests() {
    const list = activeConsultations;
    
    // Calculate and update KPIs
    kpiTotal.textContent = list.length;
    const pendingCount = list.filter(r => !r.status || r.status === '대기중' || r.status === 'pending').length;
    const joinedCount = list.filter(r => r.status === '가입완료').length;
    kpiPending.textContent = pendingCount;
    kpiJoined.textContent = joinedCount;

    // Apply filters
    const q = searchInput.value.toLowerCase().trim();
    const benefitVal = filterBenefit.value;
    const statusVal = filterStatus.value;

    const filtered = list.filter(item => {
      // Query Match (Name or Phone)
      const nameMatch = item.userName && item.userName.toLowerCase().includes(q);
      const phoneMatch = item.userPhone && item.userPhone.includes(q);
      const queryMatches = q === '' || nameMatch || phoneMatch;

      // Benefit Match
      let benefitMatches = true;
      if (benefitVal !== 'all') {
        benefitMatches = item.interestBenefit && item.interestBenefit.includes(benefitVal);
      }

      // Status Match
      let statusMatches = true;
      if (statusVal !== 'all') {
        let currentItemStatus = item.status || '대기중';
        if (currentItemStatus === 'pending') currentItemStatus = '대기중';
        if (currentItemStatus === 'completed') currentItemStatus = '가입완료';
        statusMatches = currentItemStatus === statusVal;
      }

      return queryMatches && benefitMatches && statusMatches;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <p class="empty-state-title">검색 및 조건에 일치하는 내역이 없습니다.</p>
              <p class="empty-state-desc">검색어나 선택한 필터 설정을 확인해보세요.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Status Colors Helper
    const getStatusColor = (status) => {
      switch(status) {
        case '상담진행중': return { bg: '#DBEAFE', fg: '#2563EB', border: '#BFDBFE' };
        case '가입완료': return { bg: '#D1FAE5', fg: '#059669', border: '#A7F3D0' };
        case '부재': return { bg: '#F3F4F6', fg: '#4B5563', border: '#E5E7EB' };
        case '예약콜': return { bg: '#F3E8FF', fg: '#7C3AED', border: '#E9D5FF' };
        case '접수취소': return { bg: '#FEE2E2', fg: '#DC2626', border: '#FECACA' };
        case '가입취소': return { bg: '#E2E8F0', fg: '#475569', border: '#CBD5E1' };
        case '대기중':
        case 'pending':
        default:
          return { bg: '#FEF3C7', fg: '#D97706', border: '#FDE68A' };
      }
    };

    // Render rows (reverse order - newest first)
    [...filtered].reverse().forEach(req => {
      const tr = document.createElement('tr');
      const reqTime = req.date ? req.date.split(',')[0] : 'N/A'; // Show short date
      
      let currentStatus = req.status || '대기중';
      if (currentStatus === 'pending') currentStatus = '대기중';
      if (currentStatus === 'completed') currentStatus = '가입완료';
      
      const colors = getStatusColor(currentStatus);

      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size:12.5px;">${escapeHtml(reqTime)}</td>
        <td style="font-weight: 600; color: var(--text-dark);">${escapeHtml(req.userName)}</td>
        <td>${escapeHtml(req.userPhone)}</td>
        <td><span style="color: var(--color-primary-light); font-weight: 500;">${escapeHtml(req.interestBenefit)}</span></td>
        <td>${escapeHtml(req.consultTime)}</td>
        <td>
          <select class="status-select" data-id="${req.id}" style="background-color: ${colors.bg}; color: ${colors.fg}; border: 1px solid ${colors.border};">
            <option value="대기중" ${currentStatus === '대기중' ? 'selected' : ''}>대기중</option>
            <option value="상담진행중" ${currentStatus === '상담진행중' ? 'selected' : ''}>상담진행중</option>
            <option value="가입완료" ${currentStatus === '가입완료' ? 'selected' : ''}>가입완료</option>
            <option value="부재" ${currentStatus === '부재' ? 'selected' : ''}>부재</option>
            <option value="예약콜" ${currentStatus === '예약콜' ? 'selected' : ''}>예약콜</option>
            <option value="접수취소" ${currentStatus === '접수취소' ? 'selected' : ''}>접수취소</option>
            <option value="가입취소" ${currentStatus === '가입취소' ? 'selected' : ''}>가입취소</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon-delete" data-id="${req.id}" title="내역 삭제">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Bind status select change listeners
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await updateRequestStatus(id, newStatus);
      });
    });

    // Bind delete events
    document.querySelectorAll('.btn-icon-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const btnEl = e.target.closest('.btn-icon-delete');
        const id = btnEl.getAttribute('data-id');
        if (confirm('이 상담 신청 내역을 삭제하시겠습니까?')) {
          await deleteRequest(id);
        }
      });
    });
  }

  // Update status
  async function updateRequestStatus(id, newStatus) {
    try {
      await fetch(`${CONVEX_SITE_URL}/updateConsultationStatus`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch (e) {
      console.error('Error updating status in Convex:', e);
    }
    await fetchConsultations();
    renderRequests();
  }

  async function deleteRequest(id) {
    try {
      await fetch(`${CONVEX_SITE_URL}/deleteConsultation`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error('Error deleting from Convex:', e);
    }
    await fetchConsultations();
    renderRequests();
  }

  // Event listener: Search and Filters
  searchInput.addEventListener('input', renderRequests);
  filterBenefit.addEventListener('change', renderRequests);
  filterStatus.addEventListener('change', renderRequests);

  // Event listener: Clear all entries
  clearAllBtn.addEventListener('click', async () => {
    if (confirm('정말로 전체 상담 신청 내역을 비우시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await fetch(`${CONVEX_SITE_URL}/clearAllConsultations`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Error clearing consultations in Convex:', e);
      }
      await fetchConsultations();
      renderRequests();
    }
  });

  // ==========================================
  // 1:1 Inquiries Handling
  // ==========================================
  function renderInquiries() {
    const list = activeInquiries;
    
    // Calculate and update KPIs
    kpiInquiryTotal.textContent = list.length;
    const pendingCount = list.filter(r => !r.status || r.status === '대기중').length;
    const completedCount = list.filter(r => r.status === '답변완료').length;
    kpiInquiryPending.textContent = pendingCount;
    kpiInquiryCompleted.textContent = completedCount;

    // Apply filters
    const q = inquirySearchInput.value.toLowerCase().trim();
    const statusVal = filterInquiryStatus.value;

    const filtered = list.filter(item => {
      // Query Match (Name or Phone)
      const nameMatch = item.userName && item.userName.toLowerCase().includes(q);
      const phoneMatch = item.userPhone && item.userPhone.includes(q);
      const queryMatches = q === '' || nameMatch || phoneMatch;

      // Status Match
      let statusMatches = true;
      if (statusVal !== 'all') {
        const currentItemStatus = item.status || '대기중';
        statusMatches = currentItemStatus === statusVal;
      }

      return queryMatches && statusMatches;
    });

    inquiryTableBody.innerHTML = '';

    if (filtered.length === 0) {
      inquiryTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <p class="empty-state-title">검색 및 조건에 일치하는 문의 내역이 없습니다.</p>
              <p class="empty-state-desc">검색어나 선택한 필터 설정을 확인해보세요.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Status Colors Helper for Inquiries
    const getInquiryStatusColor = (status) => {
      switch(status) {
        case '처리중': return { bg: '#DBEAFE', fg: '#2563EB', border: '#BFDBFE' };
        case '답변완료': return { bg: '#D1FAE5', fg: '#059669', border: '#A7F3D0' };
        case '접수취소': return { bg: '#FEE2E2', fg: '#DC2626', border: '#FECACA' };
        case '대기중':
        default:
          return { bg: '#FEF3C7', fg: '#D97706', border: '#FDE68A' };
      }
    };

    // Render rows (reverse order - newest first)
    [...filtered].reverse().forEach(req => {
      const tr = document.createElement('tr');
      const reqTime = req.date ? req.date.split(',')[0] : 'N/A';
      const currentStatus = req.status || '대기중';
      const colors = getInquiryStatusColor(currentStatus);

      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size:12.5px;">${escapeHtml(reqTime)}</td>
        <td style="font-weight: 600; color: var(--text-dark);">${escapeHtml(req.userName)}</td>
        <td>${escapeHtml(req.userPhone)}</td>
        <td style="text-align: left; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(req.message)}">
          ${escapeHtml(req.message)}
        </td>
        <td>
          <select class="inquiry-status-select" data-id="${req.id}" style="background-color: ${colors.bg}; color: ${colors.fg}; border: 1px solid ${colors.border}; padding: 6px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; outline: none; font-family: inherit; width: 110px;">
            <option value="대기중" ${currentStatus === '대기중' ? 'selected' : ''}>대기중</option>
            <option value="처리중" ${currentStatus === '처리중' ? 'selected' : ''}>처리중</option>
            <option value="답변완료" ${currentStatus === '답변완료' ? 'selected' : ''}>답변완료</option>
            <option value="접수취소" ${currentStatus === '접수취소' ? 'selected' : ''}>접수취소</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon-delete-inquiry" data-id="${req.id}" title="내역 삭제" style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 6px; display: inline-flex; align-items: center; justify-content: center; transition: background-color 0.2s;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      inquiryTableBody.appendChild(tr);
    });

    // Bind status select change listeners
    document.querySelectorAll('.inquiry-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await updateInquiryStatus(id, newStatus);
      });
    });

    // Bind delete events
    document.querySelectorAll('.btn-icon-delete-inquiry').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const btnEl = e.target.closest('.btn-icon-delete-inquiry');
        const id = btnEl.getAttribute('data-id');
        if (confirm('이 1:1 문의 내역을 삭제하시겠습니까?')) {
          await deleteInquiry(id);
        }
      });
    });
  }

  async function updateInquiryStatus(id, newStatus) {
    try {
      await fetch(`${CONVEX_SITE_URL}/updateInquiryStatus`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch (e) {
      console.error('Error updating status in Convex:', e);
    }
    await fetchInquiries();
    renderInquiries();
  }

  async function deleteInquiry(id) {
    try {
      await fetch(`${CONVEX_SITE_URL}/deleteInquiry`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error('Error deleting from Convex:', e);
    }
    await fetchInquiries();
    renderInquiries();
  }

  // Event listener: Inquiry Search and Filters
  inquirySearchInput.addEventListener('input', renderInquiries);
  filterInquiryStatus.addEventListener('change', renderInquiries);

  // Event listener: Clear all inquiries
  clearAllInquiriesBtn.addEventListener('click', async () => {
    if (confirm('정말로 전체 1:1 문의 내역을 비우시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await fetch(`${CONVEX_SITE_URL}/clearAllInquiries`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Error clearing inquiries in Convex:', e);
      }
      await fetchInquiries();
      renderInquiries();
    }
  });

  // Change Password Form
  pwdChangeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currPwd = document.getElementById('currPwd').value.trim();
    const newPwd = document.getElementById('newPwd').value.trim();
    const confirmPwd = document.getElementById('confirmPwd').value.trim();
    const storedPwd = localStorage.getItem('pampas_admin_password');

    if (currPwd !== storedPwd) {
      alert('현재 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPwd !== confirmPwd) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (newPwd.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    localStorage.setItem('pampas_admin_password', newPwd);
    alert('비밀번호가 성공적으로 변경되었습니다.');
    pwdChangeForm.reset();
    switchTab('list');
  });

  function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
