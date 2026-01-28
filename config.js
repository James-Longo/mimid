const Config = {
    keys: {
        xc: '',
        ebird: ''
    },
    proxyUrl: localStorage.getItem('mimid_proxy_url') || '',
    status: 'Checking...',

    async init() {
        // 1. Load from localStorage
        this.keys.xc = localStorage.getItem('mimid_xc_key') || '';
        this.keys.ebird = localStorage.getItem('mimid_ebird_key') || '';

        if (this.proxyUrl) {
            this.status = "Using Secure Proxy";
        } else if (this.keys.xc || this.keys.ebird) {
            this.status = "Loaded from Browser Storage";
        }

        // 2. Try to load from config.json (Overrides localStorage if present and valid)
        try {
            const response = await fetch('config.json');
            if (response.ok) {
                const data = await response.json();

                // If config.json defines a proxy-url, use it!
                if (data['proxy-url']) {
                    this.proxyUrl = data['proxy-url'];
                    this.status = "Using Secure Proxy (System)";
                    return this.keys;
                }

                const xcKey = data['xc-key'] || data.key;
                const ebKey = data['eBird-key'];

                const isPlaceholder = (val) => !val ||
                    val.includes("PASTE_YOUR") ||
                    val.startsWith("${{") || // Common in faulty CI injection
                    val.trim() === "";

                if (!isPlaceholder(xcKey)) {
                    this.keys.xc = xcKey;
                    this.status = "Active (System Secret)";
                }
                if (!isPlaceholder(ebKey)) {
                    this.keys.ebird = ebKey;
                    this.status = "Active (System Secret)";
                }
            }
        } catch (e) {
            console.log("No config.json found or failed to parse.");
        }

        return this.keys;
    },

    setXCKey(key) {
        this.keys.xc = key.trim();
        localStorage.setItem('mimid_xc_key', this.keys.xc);
    },

    setEBirdKey(key) {
        this.keys.ebird = key.trim();
        localStorage.setItem('mimid_ebird_key', this.keys.ebird);
    },

    setProxyUrl(url) {
        this.proxyUrl = url.trim();
        localStorage.setItem('mimid_proxy_url', this.proxyUrl);
    }
};
