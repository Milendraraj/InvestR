// ─── Data ───────────────────────────────────────────────────────────────────

// ─── Data ───────────────────────────────────────────────────────────────────

const properties = [
    {
        id: 1,
        name: "Azure Heights Commercial",
        location: "Austin, TX",
        category: "commercial",
        roi: "12.5%",
        minInvest: "$500",
        minRaw: 500,
        funded: 85,
        totalValue: "$4.2M",
        investors: 312,
        yield: "8.2%",
        appreciation: "4.3%",
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
        description: "A premier Class A office complex in Austin's booming tech corridor. Fully leased with blue-chip tenants including two Fortune 500 companies.",
        dividends: "Monthly",
        term: "5 Years",
    },
    {
        id: 2,
        name: "Emerald Green Villas",
        location: "London, UK",
        category: "residential",
        roi: "9.2%",
        minInvest: "$1,200",
        minRaw: 1200,
        funded: 45,
        totalValue: "$8.7M",
        investors: 178,
        yield: "5.8%",
        appreciation: "3.4%",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
        description: "Luxury residential development in South Kensington, one of London's most sought-after postcodes. 24 high-end units with rooftop gardens.",
        dividends: "Quarterly",
        term: "7 Years",
    },
    {
        id: 3,
        name: "Nova Logistics Hub",
        location: "Dubai, UAE",
        category: "industrial",
        roi: "14.8%",
        minInvest: "$2,500",
        minRaw: 2500,
        funded: 92,
        totalValue: "$12.1M",
        investors: 534,
        yield: "10.1%",
        appreciation: "4.7%",
        image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
        description: "State-of-the-art logistics and warehousing facility in the heart of the Dubai industrial zone. Long-term lease with DHL and Amazon Logistics.",
        dividends: "Monthly",
        term: "10 Years",
    },
    {
        id: 4,
        name: "Pacific View Residences",
        location: "Singapore",
        category: "residential",
        roi: "10.4%",
        minInvest: "$800",
        minRaw: 800,
        funded: 62,
        totalValue: "$6.3M",
        investors: 241,
        yield: "7.1%",
        appreciation: "3.3%",
        image: "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=600&q=80",
        description: "Premium condominiums on Singapore's iconic waterfront. Stunning city-bay views, managed by The Ascott Group.",
        dividends: "Monthly",
        term: "5 Years",
    },
    {
        id: 5,
        name: "Riviera Business Park",
        location: "Paris, France",
        category: "commercial",
        roi: "11.2%",
        minInvest: "$1,500",
        minRaw: 1500,
        funded: 73,
        totalValue: "$9.5M",
        investors: 389,
        yield: "7.8%",
        appreciation: "3.4%",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80",
        description: "Mixed-use business park 20 minutes from Paris CBD. Anchor tenants include BNP Paribas and L'Oréal. 98% occupancy rate.",
        dividends: "Quarterly",
        term: "8 Years",
    },
    {
        id: 6,
        name: "GreenTech Industrial Yard",
        location: "Frankfurt, Germany",
        category: "industrial",
        roi: "13.7%",
        minInvest: "$3,000",
        minRaw: 3000,
        funded: 37,
        totalValue: "$15.2M",
        investors: 98,
        yield: "9.4%",
        appreciation: "4.3%",
        image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80",
        description: "Next-gen sustainable industrial campus with solar-powered operations near Frankfurt airport. Long-term leases with automotive and logistics giants.",
        dividends: "Monthly",
        term: "12 Years",
    }
];

const activities = [
    { icon: "💰", label: "Dividend Received", sub: "Azure Heights Commercial", amount: "+$124.00", type: "positive", time: "Today, 9:42 AM" },
    { icon: "📊", label: "Investment Made", sub: "Nova Logistics Hub", amount: "-$500.00", type: "negative", time: "Yesterday, 3:15 PM" },
    { icon: "💰", label: "Dividend Received", sub: "Emerald Green Villas", amount: "+$89.50", type: "positive", time: "Dec 12, 2024" },
    { icon: "🔄", label: "Shares Traded", sub: "Pacific View Residences", amount: "+$210.00", type: "positive", time: "Dec 10, 2024" },
];

const portfolioItems = [
    { icon: "🏢", name: "Azure Heights Commercial", loc: "Austin, TX", value: "$5,200", change: "+12.4%" },
    { icon: "🏡", name: "Emerald Green Villas", loc: "London, UK", value: "$3,800", change: "+8.9%" },
    { icon: "🏭", name: "Nova Logistics Hub", loc: "Dubai, UAE", value: "$7,500", change: "+15.1%" },
    { icon: "🌊", name: "Pacific View Residences", loc: "Singapore", value: "$2,100", change: "+10.2%" },
];

const transactions = [
    { icon: "💵", bg: "rgba(16,185,129,0.1)", label: "Dividend – Azure Heights", sub: "Dec 15, 2024", amount: "+$124.00", color: "#10b981" },
    { icon: "📥", bg: "rgba(239,68,68,0.1)", label: "Investment – Nova Hub", sub: "Dec 14, 2024", amount: "-$500.00", color: "#ef4444" },
    { icon: "💵", bg: "rgba(16,185,129,0.1)", label: "Dividend – Emerald Villas", sub: "Dec 12, 2024", amount: "+$89.50", color: "#10b981" },
    { icon: "📤", bg: "rgba(59,130,246,0.1)", label: "Sold Shares – Pacific View", sub: "Dec 10, 2024", amount: "+$210.00", color: "#3b82f6" },
    { icon: "📥", bg: "rgba(239,68,68,0.1)", label: "Investment – Riviera Park", sub: "Dec 5, 2024", amount: "-$1,500.00", color: "#ef4444" },
];

const perfBarsData = [
    { name: "Nova Logistics Hub", val: 92, pct: "14.8%" },
    { name: "Azure Heights", val: 80, pct: "12.5%" },
    { name: "Pacific View", val: 67, pct: "10.4%" },
    { name: "Riviera Park", val: 73, pct: "11.2%" },
];

// ─── State ───────────────────────────────────────────────────────────────────

let visibleCount = 3;
let currentFilter = "all";
let isLoggedIn = false;

// ─── Cursor ──────────────────────────────────────────────────────────────────

const cursor = document.getElementById("cursor");
const cursorFollower = document.getElementById("cursorFollower");
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener("mousemove", e => {
    cursorX = e.clientX; cursorY = e.clientY;
    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";
});

function updateFollower() {
    followerX += (cursorX - followerX) * 0.1;
    followerY += (cursorY - followerY) * 0.1;
    cursorFollower.style.left = followerX + "px";
    cursorFollower.style.top = followerY + "px";
    requestAnimationFrame(updateFollower);
}
updateFollower();

document.querySelectorAll("a, button, .card, .dash-nav-item, .filter-btn").forEach(el => {
    el.addEventListener("mouseenter", () => {
        cursor.classList.add("hovered");
        cursorFollower.classList.add("hovered");
    });
    el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hovered");
        cursorFollower.classList.remove("hovered");
    });
});

// ─── Navbar Scroll ───────────────────────────────────────────────────────────

window.addEventListener("scroll", () => {
    document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 40);
});

// ─── Hamburger ───────────────────────────────────────────────────────────────

document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("mobileMenu").classList.toggle("open");
});

// ─── Scroll Reveal ───────────────────────────────────────────────────────────

const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(".step-card, .section-header, .dash-container").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
});

// ─── Counter Animation ───────────────────────────────────────────────────────

function animateCounter(el, target, suffix = "") {
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Number.isInteger(target) ? Math.floor(current) : current.toFixed(1);
        if (current >= target) clearInterval(interval);
    }, 16);
}

const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll(".stat-val").forEach(el => {
                const target = parseFloat(el.dataset.target);
                animateCounter(el, target);
            });
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector(".hero-stats");
if (heroStats) statsObserver.observe(heroStats);

// ─── Toast ───────────────────────────────────────────────────────────────────

function showToast(message, type = "success") {
    const t = document.getElementById("toast");
    t.textContent = (type === "success" ? "✅ " : "❌ ") + message;
    t.className = `toast ${type} show`;
    setTimeout(() => t.className = "toast", 3500);
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function openModal(id) {
    document.getElementById(id).classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal(id) {
    document.getElementById(id).classList.remove("open");
    document.body.style.overflow = "";
}

document.querySelectorAll(".modal-close, .modal-overlay").forEach(el => {
    el.addEventListener("click", function(e) {
        if (e.target === this || this.classList.contains("modal-close")) {
            const id = this.dataset.close || this.closest(".modal-overlay").id;
            closeModal(id);
        }
    });
});

document.querySelectorAll(".modal").forEach(m => m.addEventListener("click", e => e.stopPropagation()));

document.getElementById("loginBtn").addEventListener("click", () => openModal("loginModal"));
document.getElementById("startBtn").addEventListener("click", () => openModal("signupModal"));
document.getElementById("exploreBtn").addEventListener("click", () => {
    document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("demoBtn").addEventListener("click", () => openModal("demoModal"));

document.getElementById("switchToSignup").addEventListener("click", e => {
    e.preventDefault(); closeModal("loginModal"); openModal("signupModal");
});
document.getElementById("switchToLogin").addEventListener("click", e => {
    e.preventDefault(); closeModal("signupModal"); openModal("loginModal");
});

// ─── Login ───────────────────────────────────────────────────────────────────

document.getElementById("loginSubmit").addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPassword").value;
    if (!email || !pass) { showToast("Please fill in all fields.", "error"); return; }
    if (!email.includes("@")) { showToast("Enter a valid email address.", "error"); return; }
    setTimeout(() => {
        isLoggedIn = true;
        closeModal("loginModal");
        document.getElementById("loginBtn").textContent = "My Account";
        showToast("Welcome back! Logged in successfully.");
    }, 600);
});

// ─── Signup ──────────────────────────────────────────────────────────────────

document.getElementById("signupSubmit").addEventListener("click", () => {
    setTimeout(() => {
        isLoggedIn = true;
        closeModal("signupModal");
        document.getElementById("loginBtn").textContent = "My Account";
        showToast("Account created! Welcome to InvestR 🎉");
    }, 600);
});

// ─── Properties ──────────────────────────────────────────────────────────────

function getFilteredProps() {
    return currentFilter === "all"
        ? properties
        : properties.filter(p => p.category === currentFilter);
}

function renderCards() {
    const grid = document.getElementById("propertyGrid");
    const data = getFilteredProps().slice(0, visibleCount);
    grid.innerHTML = "";

    data.forEach((prop, i) => {
        const card = document.createElement("div");
        card.className = "card reveal";
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
            <div class="card-image">
                <img src="${prop.image}" alt="${prop.name}" loading="lazy">
                <span class="card-badge">${prop.category.toUpperCase()}</span>
                <span class="card-roi">ROI ${prop.roi}</span>
            </div>
            <div class="card-body">
                <h3>${prop.name}</h3>
                <p class="card-loc">📍 ${prop.location}</p>
                <div class="card-meta">
                    <div class="meta-item">
                        <span class="meta-label">Min. Investment</span>
                        <span class="meta-val">${prop.minInvest}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Total Value</span>
                        <span class="meta-val">${prop.totalValue}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Investors</span>
                        <span class="meta-val">${prop.investors}</span>
                    </div>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%" data-width="${prop.funded}%"></div></div>
                <div class="progress-label"><span>${prop.funded}% Funded</span><span>${100 - prop.funded}% remaining</span></div>
                <div class="card-actions">
                    <button class="btn-main" onclick="openPropertyDetail(${prop.id})">View Details</button>
                    <button class="btn-icon" onclick="addToWishlist(event, '${prop.name}')" title="Save">♡</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
        observer.observe(card);
    });

    // Animate progress bars
    setTimeout(() => {
        document.querySelectorAll(".progress-fill").forEach(el => {
            el.style.width = el.dataset.width;
        });
    }, 100);

    // Load More
    document.getElementById("loadMoreBtn").style.display =
        getFilteredProps().length > visibleCount ? "inline-flex" : "none";
}

// ─── Filters ─────────────────────────────────────────────────────────────────

document.getElementById("filters").addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    currentFilter = e.target.dataset.filter;
    visibleCount = 3;
    renderCards();
});

document.getElementById("loadMoreBtn").addEventListener("click", () => {
    visibleCount += 3;
    renderCards();
    showToast("More properties loaded!");
});

function addToWishlist(e, name) {
    e.stopPropagation();
    e.target.textContent = "♥";
    e.target.style.color = "#ef4444";
    showToast(`${name} saved to wishlist!`);
}

// ─── Property Detail ─────────────────────────────────────────────────────────

function openPropertyDetail(id) {
    const prop = properties.find(p => p.id === id);
    if (!prop) return;
    document.getElementById("propertyModalContent").innerHTML = `
        <div class="prop-detail-hero">
            <img src="${prop.image}" alt="${prop.name}">
            <div class="prop-detail-hero-text">
                <span class="badge" style="margin-bottom:0.5rem">${prop.category.toUpperCase()} · ${prop.location}</span>
                <h2>${prop.name}</h2>
            </div>
        </div>
        <p style="color:var(--text-dim);font-size:0.9rem;margin-bottom:1.5rem;line-height:1.8">${prop.description}</p>
        <div class="prop-detail-grid">
            <div class="prop-stat"><span class="prop-stat-label">Target ROI</span><span class="prop-stat-val" style="color:var(--emerald)">${prop.roi}</span></div>
            <div class="prop-stat"><span class="prop-stat-label">Annual Yield</span><span class="prop-stat-val">${prop.yield}</span></div>
            <div class="prop-stat"><span class="prop-stat-label">Appreciation</span><span class="prop-stat-val">${prop.appreciation}</span></div>
            <div class="prop-stat"><span class="prop-stat-label">Total Value</span><span class="prop-stat-val">${prop.totalValue}</span></div>
            <div class="prop-stat"><span class="prop-stat-label">Dividends</span><span class="prop-stat-val">${prop.dividends}</span></div>
            <div class="prop-stat"><span class="prop-stat-label">Term</span><span class="prop-stat-val">${prop.term}</span></div>
        </div>
        <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-dim);margin-bottom:0.4rem">
                <span>${prop.funded}% Funded · ${prop.investors} investors</span>
                <span>${100 - prop.funded}% remaining</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%" data-width="${prop.funded}%"></div></div>
        </div>
        <div class="invest-box">
            <h4>Invest in ${prop.name}</h4>
            <div class="form-group">
                <label>Investment Amount (min. ${prop.minInvest})</label>
                <div class="invest-input-row">
                    <input type="number" id="investAmount" placeholder="${prop.minRaw}" min="${prop.minRaw}" value="${prop.minRaw}">
                    <button class="btn-main glow" onclick="handleInvest(${prop.id})">Invest Now</button>
                </div>
            </div>
        </div>
    `;
    openModal("propertyModal");
    setTimeout(() => {
        document.querySelectorAll("#propertyModalContent .progress-fill").forEach(el => {
            el.style.width = el.dataset.width;
        });
    }, 150);
}

function handleInvest(id) {
    const prop = properties.find(p => p.id === id);
    const amount = parseFloat(document.getElementById("investAmount").value);
    if (!amount || amount < prop.minRaw) {
        showToast(`Minimum investment is ${prop.minInvest}`, "error"); return;
    }
    if (!isLoggedIn) {
        closeModal("propertyModal");
        openModal("signupModal");
        showToast("Please create an account to invest.", "error");
        return;
    }
    closeModal("propertyModal");
    showToast(`$${amount.toLocaleString()} invested in ${prop.name}!`);
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

document.querySelectorAll(".dash-nav-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".dash-nav-item").forEach(i => i.classList.remove("active"));
        document.querySelectorAll(".dash-panel").forEach(p => p.classList.remove("active"));
        item.classList.add("active");
        document.getElementById(`panel-${item.dataset.panel}`).classList.add("active");
    });
});

function renderActivity() {
    const list = document.getElementById("activityList");
    list.innerHTML = activities.map(a => `
        <div class="activity-item">
            <span class="activity-icon">${a.icon}</span>
            <div class="activity-info">
                <strong>${a.label}</strong>
                <span>${a.sub} · ${a.time}</span>
            </div>
            <span class="activity-amount ${a.type}">${a.amount}</span>
        </div>
    `).join("");
}

function renderPortfolio() {
    const list = document.getElementById("portfolioList");
    list.innerHTML = portfolioItems.map(p => `
        <div class="portfolio-item">
            <div class="pi-icon">${p.icon}</div>
            <div class="pi-info">
                <strong>${p.name}</strong>
                <span>📍 ${p.loc}</span>
            </div>
            <div class="pi-right">
                <span class="pi-val">${p.value}</span>
                <span class="pi-chg">${p.change}</span>
            </div>
        </div>
    `).join("");
}

function renderTransactions() {
    const list = document.getElementById("txList");
    list.innerHTML = transactions.map(tx => `
        <div class="tx-item">
            <div class="tx-icon" style="background:${tx.bg}">${tx.icon}</div>
            <div class="tx-info">
                <strong>${tx.label}</strong>
                <span>${tx.sub}</span>
            </div>
            <span class="tx-amount" style="color:${tx.color}">${tx.amount}</span>
        </div>
    `).join("");
}

function renderPerfBars() {
    const container = document.getElementById("perfBars");
    container.innerHTML = perfBarsData.map(b => `
        <div class="perf-bar-item">
            <div class="perf-bar-header"><span>${b.name}</span><span>${b.pct}</span></div>
            <div class="perf-bar-track"><div class="perf-bar-fill" style="width:0%" data-width="${b.val}%"></div></div>
        </div>
    `).join("");
    setTimeout(() => {
        document.querySelectorAll(".perf-bar-fill").forEach(el => {
            el.style.width = el.dataset.width;
        });
    }, 300);
}

// ─── Lucide Icons ────────────────────────────────────────────────────────────

function initLucide() {
    if (window.lucide) lucide.createIcons();
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    renderCards();
    renderActivity();
    renderPortfolio();
    renderTransactions();
    renderPerfBars();
    initLucide();

    // Perf bars on scroll into view
    const perfObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll(".perf-bar-fill").forEach(el => {
                    el.style.width = el.dataset.width;
                });
                perfObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });
    const dash = document.getElementById("dashboard");
    if (dash) perfObserver.observe(dash);
});observe(dash);
});
