document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '14c3712d6216c3c8aa9ab15c46089065';
    const BASE_URL = 'https://gnews.io/api/v4/top-headlines';
    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    // Sections Configuration (GNews API)
    const sections = [
        {
            id: 'politics',
            url: `${BASE_URL}?apikey=${API_KEY}&category=nation&country=bd&lang=bn&max=10`,
            containerId: 'politics-grid',
            loaderId: 'politics-loader'
        },
        {
            id: 'bd',
            url: `${BASE_URL}?apikey=${API_KEY}&category=general&country=bd&lang=bn&max=10`,
            containerId: 'bd-grid',
            loaderId: 'bd-loader'
        },
        {
            id: 'world',
            url: `${BASE_URL}?apikey=${API_KEY}&category=world&lang=bn&max=10`,
            containerId: 'international-grid',
            loaderId: 'international-loader'
        },
        {
            id: 'top',
            url: `${BASE_URL}?apikey=${API_KEY}&category=general&lang=bn&max=10`,
            containerId: 'top-grid',
            loaderId: 'top-loader'
        },
        {
            id: 'sports',
            url: `${BASE_URL}?apikey=${API_KEY}&category=sports&lang=bn&max=10`,
            containerId: 'sports-grid',
            loaderId: 'sports-loader'
        }
    ];

    // Format Date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Render Articles for a specific section
    const renderSection = (articles, containerId, loaderId) => {
        const container = document.getElementById(containerId);
        const loader = document.getElementById(loaderId);
        
        // Hide loader
        if (loader) loader.classList.add('hidden');
        
        // Filter valid articles, exclude ABP news
        const validArticles = articles.filter(article => {
            if (!article.title || !article.url) return false;
            
            // Exclude ABP News
            const sourceName = (article.source && article.source.name) ? article.source.name.toLowerCase() : '';
            if (sourceName.includes('abp') || sourceName.includes('apb')) {
                return false;
            }
            
            return true;
        });
        
        if (validArticles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary)">No articles found for this section.</p>';
        } else {
            let html = '';
            validArticles.forEach(article => {
                const imageUrl = article.image || DEFAULT_IMAGE;
                const sourceName = (article.source && article.source.name) ? article.source.name : 'News Source';
                const pubDate = formatDate(article.publishedAt);
                const description = article.description || '';

                html += `
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-card">
                        <div class="card-img-wrapper">
                            <img src="${imageUrl}" alt="" class="card-img" onerror="this.src='${DEFAULT_IMAGE}'">
                        </div>
                        <div class="card-content">
                            <div class="card-meta">
                                <span class="source">${sourceName}</span>
                                <span>${pubDate}</span>
                            </div>
                            <h3 class="card-title">${article.title}</h3>
                            <p class="card-desc">${description}</p>
                        </div>
                    </a>
                `;
            });
            container.innerHTML = html;
        }
        
        container.classList.remove('hidden');
    };

    // Fetch Data for a single section
    const fetchSectionData = async (section) => {
        try {
            const response = await fetch(section.url);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            if (data.articles) {
                renderSection(data.articles, section.containerId, section.loaderId);
            } else {
                throw new Error('Invalid Data');
            }
        } catch (error) {
            console.error(`Error fetching ${section.id}:`, error);
            const container = document.getElementById(section.containerId);
            const loader = document.getElementById(section.loaderId);
            if (loader) loader.classList.add('hidden');
            container.innerHTML = `<p style="color: var(--danger-color)">Failed to load news. Please try again later.</p>`;
            container.classList.remove('hidden');
        }
    };

    // Fetch all sections with a delay between each to respect API rate limits
    const fetchAllSections = async () => {
        for (const section of sections) {
            await fetchSectionData(section);
            // Wait 2000ms between requests to avoid HTTP 429 Too Many Requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    };

    // Initialize
    fetchAllSections();

    // Auto-update news every 15 minutes (900,000 ms)
    setInterval(fetchAllSections, 15 * 60 * 1000);
});
