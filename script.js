document.addEventListener('DOMContentLoaded', () => {
    // Using the newly cloned BBC News API running locally
    const API_BASE_URL = 'http://localhost:3000/api';
    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    // Sections Configuration (BBC Bengali API)
    const sections = [
        {
            id: 'politics',
            url: `${API_BASE_URL}/categories/politics`,
            containerId: 'politics-grid',
            loaderId: 'politics-loader',
            sourceName: 'BBC Bangla - Politics'
        },
        {
            id: 'bd',
            url: `${API_BASE_URL}/categories/bangladesh`,
            containerId: 'bd-grid',
            loaderId: 'bd-loader',
            sourceName: 'BBC Bangla - Bangladesh'
        },
        {
            id: 'world',
            url: `${API_BASE_URL}/categories/world`,
            containerId: 'international-grid',
            loaderId: 'international-loader',
            sourceName: 'BBC Bangla - World'
        },
        {
            id: 'top',
            url: `${API_BASE_URL}/categories/main`,
            containerId: 'top-grid',
            loaderId: 'top-loader',
            sourceName: 'BBC Bangla - Breaking'
        },
        {
            id: 'sports',
            url: `${API_BASE_URL}/categories/sports`,
            containerId: 'sports-grid',
            loaderId: 'sports-loader',
            sourceName: 'BBC Bangla - Sports'
        }
    ];

    // Helper to get highest resolution image
    const getImageUrl = (article) => {
        if (!article.image || !article.image.srcset || article.image.srcset.length === 0) return DEFAULT_IMAGE;
        // The last item in srcset usually has the highest resolution (e.g. 800w)
        return article.image.srcset[article.image.srcset.length - 1].url;
    };

    // Render Articles for a specific section
    const renderSection = (articles, containerId, loaderId, defaultSourceName) => {
        const container = document.getElementById(containerId);
        const loader = document.getElementById(loaderId);
        
        // Hide loader
        if (loader) loader.classList.add('hidden');
        
        // Filter valid articles
        const validArticles = articles.filter(item => item.title && item.link).slice(0, 10);
        
        if (validArticles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary)">No articles found for this section.</p>';
        } else {
            let html = '';
            validArticles.forEach(article => {
                const imageUrl = getImageUrl(article);
                
                // Description handling
                let description = article.description || '';
                if (description.length > 150) description = description.substring(0, 150) + '...';

                const sourceName = defaultSourceName;
                const pubDate = article.time || article.timestamp || 'Recent';

                html += `
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-card">
                        <div class="card-img-wrapper">
                            <img src="${imageUrl}" alt="${article.image?.alt || ''}" class="card-img" onerror="this.src='${DEFAULT_IMAGE}'">
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
            
            if (data.success && data.articles) {
                renderSection(data.articles, section.containerId, section.loaderId, section.sourceName);
            } else {
                throw new Error('Invalid Data');
            }
        } catch (error) {
            console.error(`Error fetching ${section.id}:`, error);
            const container = document.getElementById(section.containerId);
            const loader = document.getElementById(section.loaderId);
            if (loader) loader.classList.add('hidden');
            container.innerHTML = `<p style="color: #ef4444; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">Failed to load news. Please try again later.</p>`;
            container.classList.remove('hidden');
        }
    };

    // Fetch all sections
    const fetchAllSections = async () => {
        for (const section of sections) {
            await fetchSectionData(section);
            // Wait 500ms between requests to avoid overloading local API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    // Initialize
    fetchAllSections();

    // Auto-update news every 30 minutes (1,800,000 ms)
    setInterval(fetchAllSections, 30 * 60 * 1000);
});
