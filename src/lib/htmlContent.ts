export const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Status | Landing Manager</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #09090b;
            --surface-color: #18181b;
            --border-color: #27272a;
            --text-primary: #f4f4f5;
            --text-secondary: #a1a1aa;
            --accent-color: #3b82f6;
            --success-color: #10b981;
            --glow-color: rgba(59, 130, 246, 0.15);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background-image: 
                radial-gradient(circle at 50% 0%, var(--glow-color) 0%, transparent 50%),
                linear-gradient(to bottom, transparent, var(--bg-color));
        }

        .ambient-light {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
            filter: blur(40px);
            z-index: 0;
            animation: breathe 8s ease-in-out infinite alternate;
        }

        @keyframes breathe {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }

        .container {
            width: 100%;
            max-width: 600px;
            padding: 2.5rem;
            position: relative;
            z-index: 10;
        }

        .card {
            background-color: rgba(24, 24, 27, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 3rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 24px 38px -10px rgba(0, 0, 0, 0.5);
            transform: translateY(20px);
            opacity: 0;
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
            to { transform: translateY(0); opacity: 1; }
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
        }

        .logo-area {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .logo-icon svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        .title {
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.02em;
        }

        .version-badge {
            font-family: 'Fira Code', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            background: var(--surface-color);
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            border: 1px solid var(--border-color);
        }

        .status-container {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: rgba(39, 39, 42, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }

        .status-indicator {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .dot {
            width: 12px;
            height: 12px;
            background-color: var(--success-color);
            border-radius: 50%;
            position: relative;
            z-index: 2;
        }

        .ping {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: var(--success-color);
            border-radius: 50%;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            z-index: 1;
        }

        @keyframes ping {
            75%, 100% { transform: scale(2.5); opacity: 0; }
        }

        .status-text h2 {
            font-size: 1.125rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }

        .status-text p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .links-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .link-card {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            padding: 1rem;
            border-radius: 8px;
            text-decoration: none;
            color: var(--text-primary);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .link-card:hover {
            border-color: rgba(59, 130, 246, 0.5);
            background: rgba(59, 130, 246, 0.05);
            transform: translateY(-2px);
        }

        .link-icon {
            color: var(--text-secondary);
            display: flex;
        }

        .link-card:hover .link-icon {
            color: var(--accent-color);
        }

        .link-text {
            font-size: 0.875rem;
            font-weight: 500;
        }

        .footer {
            margin-top: 2rem;
            text-align: center;
            font-family: 'Fira Code', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="ambient-light"></div>
    
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo-area">
                    <div class="logo-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 22h20L12 2zm0 3.8l6.1 12.2H5.9L12 5.8z"/>
                        </svg>
                    </div>
                    <div class="title">Landing Manager</div>
                </div>
                <div class="version-badge">v1.0.0</div>
            </div>

            <div class="status-container">
                <div class="status-indicator">
                    <div class="ping"></div>
                    <div class="dot"></div>
                </div>
                <div class="status-text">
                    <h2>API Systems Operational</h2>
                    <p>All core services and database connections are healthy.</p>
                </div>
            </div>

            <div class="links-grid">
                <a href="/api/docs" class="link-card">
                    <div class="link-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    </div>
                    <span class="link-text">Swagger Documentation</span>
                </a>
            </div>
            
            <div class="footer">
                <span id="timestamp"></span>
            </div>
        </div>
    </div>

    <script>
        function updateTime() {
            const now = new Date();
            document.getElementById('timestamp').textContent = now.toISOString();
        }
        updateTime();
        setInterval(updateTime, 1000);
    </script>
</body>
</html>
`;
