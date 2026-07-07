/**
 * API Time Machine (ATM) - Interactivity Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initTerminalMock();
    initD3Graph();
    initCompilerMock();
    initTelemetryTicker();
    initScrollAnimations();
});

// 1. Terminal Hex Dump Simulator
function initTerminalMock() {
    const terminalBody = document.getElementById('atmTerminalBody');
    if (!terminalBody) return;

    const hexChars = "0123456789ABCDEF";
    let offset = 0;

    function generateLine() {
        let hexPart = "";
        let asciiPart = "";
        
        for (let i = 0; i < 16; i++) {
            const byte = Math.floor(Math.random() * 256);
            const hex = byte.toString(16).padStart(2, '0').toUpperCase();
            
            // Randomly highlight suspicious bytes
            if (Math.random() > 0.95) {
                hexPart += `<span class="atm-hex" title="Suspicious MTU pattern detected">${hex}</span> `;
            } else {
                hexPart += hex + " ";
            }

            // Printable ASCII or dot
            if (byte >= 32 && byte <= 126) {
                asciiPart += String.fromCharCode(byte);
            } else {
                asciiPart += ".";
            }
        }

        const offsetStr = offset.toString(16).padStart(8, '0').toUpperCase();
        const line = document.createElement('div');
        line.className = 'atm-terminal-line';
        line.innerHTML = `<span class="atm-offset">${offsetStr}</span> <span style="margin-right:1rem;">${hexPart}</span> <span class="atm-ascii">${asciiPart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
        
        terminalBody.appendChild(line);
        offset += 16;

        // Keep only last 50 lines
        if (terminalBody.childElementCount > 50) {
            terminalBody.removeChild(terminalBody.firstChild);
        }
        
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Generate a burst of lines initially
    for(let i=0; i<20; i++) generateLine();

    // Stream lines continuously with variance
    function scheduleNextLine() {
        if (Math.random() > 0.3) {
            generateLine();
        }
        const delay = Math.random() > 0.9 ? 500 : (Math.random() < 0.2 ? 50 : 150);
        setTimeout(scheduleNextLine, delay);
    }
    scheduleNextLine();
}

// 2. D3.js Cyclic State Graph
function initD3Graph() {
    const container = document.getElementById('d3GraphContainer');
    if (!container || typeof d3 === 'undefined') return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select("#d3GraphContainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const zoomGroup = svg.append("g");
    
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            zoomGroup.attr("transform", event.transform);
        });
    svg.call(zoom);

    // Tooltip
    const tooltip = d3.select("#d3GraphContainer")
        .append("div")
        .attr("class", "d3-tooltip");

    const nodes = [
        { id: "INIT", group: 1, radius: 25 },
        { id: "AUTH_REQ", group: 2, radius: 20 },
        { id: "AUTH_ACK", group: 2, radius: 20 },
        { id: "DATA_TX", group: 3, radius: 30 },
        { id: "ERR_STATE", group: 4, radius: 15 },
        { id: "FIN", group: 1, radius: 25 }
    ];

    const links = [
        { source: "INIT", target: "AUTH_REQ", value: 5 },
        { source: "AUTH_REQ", target: "AUTH_ACK", value: 5 },
        { source: "AUTH_ACK", target: "DATA_TX", value: 10 },
        { source: "DATA_TX", target: "DATA_TX", value: 15 }, // cyclic
        { source: "DATA_TX", target: "ERR_STATE", value: 2 },
        { source: "DATA_TX", target: "FIN", value: 8 },
        { source: "ERR_STATE", target: "FIN", value: 2 },
        { source: "AUTH_REQ", target: "ERR_STATE", value: 1 }
    ];

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => d.radius + 10));

    // Defs for arrows
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#6366F1")
        .style("stroke","none");

    const link = zoomGroup.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#6366F1")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("marker-end", "url(#arrowhead)");

    const node = zoomGroup.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => d.radius)
        .attr("fill", d => d.id === 'ERR_STATE' ? '#FF4D4D' : '#080C14')
        .attr("stroke", d => d.id === 'ERR_STATE' ? '#FF4D4D' : '#00FFFF')
        .attr("stroke-width", 2)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).attr("stroke", "#ffffff").attr("fill", "#6366F1");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`State: ${d.id}<br/>Transitions: ${links.filter(l => l.source.id === d.id || l.target.id === d.id).length}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event, d) => {
            d3.select(event.currentTarget)
              .attr("stroke", d.id === 'ERR_STATE' ? '#FF4D4D' : '#00FFFF')
              .attr("fill", d.id === 'ERR_STATE' ? '#FF4D4D' : '#080C14');
            tooltip.transition().duration(500).style("opacity", 0);
        });

    const labels = zoomGroup.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("font-size", "10px")
        .attr("font-family", "var(--font-mono)")
        .attr("fill", "#e2e8f0")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("pointer-events", "none");

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)))
            .attr("cy", d => d.y = Math.max(d.radius, Math.min(height - d.radius, d.y)));
            
        labels
            .attr("x", d => d.x)
            .attr("y", d => d.y - d.radius - 10);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// 3. Compiler Mock Simulator
function initCompilerMock() {
    const btn = document.getElementById('triggerCompileBtn');
    const output = document.getElementById('compilerOutput');
    if (!btn || !output) return;

    btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.textContent = "Compiling...";
        output.innerHTML = "";
        
        const logs = [
            "> cargo build --target wasm32-unknown-unknown --release",
            "  <span class='atm-log-success'>Compiling</span> proxy-wasm v0.2.1",
            "  <span class='atm-log-success'>Compiling</span> legacy_parser v1.0.0",
            "  <span class='atm-log-warn'>Warning</span>: Unused variable `padding` in struct `AuthReq`",
            "  <span class='atm-log-success'>Finished</span> release [optimized] target(s) in 1.42s",
            "> wasm-strip target/wasm32-unknown-unknown/release/filter.wasm",
            "> Generating Envoy manifest...",
            "<span class='atm-log-success'>SUCCESS: WASM filter deployed to edge proxies.</span>"
        ];

        let i = 0;
        
        // Progress bar UI
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '100%';
        progressContainer.style.height = '4px';
        progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        progressContainer.style.marginTop = '12px';
        progressContainer.style.borderRadius = '2px';
        progressContainer.style.overflow = 'hidden';
        
        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = '#6366F1';
        progressBar.style.transition = 'width 0.3s ease-out';
        progressContainer.appendChild(progressBar);
        
        output.appendChild(progressContainer);

        function pushLog() {
            if (i < logs.length) {
                const div = document.createElement('div');
                div.innerHTML = logs[i];
                output.insertBefore(div, progressContainer);
                
                progressBar.style.width = `${((i + 1) / logs.length) * 100}%`;
                output.scrollTop = output.scrollHeight;
                i++;
                
                // Realistic randomized compile times (longer pauses occasionally)
                const delay = Math.random() > 0.8 ? (Math.random() * 800 + 600) : (Math.random() * 200 + 50);
                setTimeout(pushLog, delay);
            } else {
                btn.disabled = false;
                btn.textContent = "Run Compilation";
                setTimeout(() => { progressContainer.style.opacity = '0'; }, 1000);
            }
        }
        pushLog();
    });
}

// 4. Telemetry Dashboard Ticker
function initTelemetryTicker() {
    const ticker = document.getElementById('incidentTicker');
    if (!ticker) return;

    const incidents = [
        { type: "SSRF_BLOCK", desc: "Blocked internal loopback target 127.0.0.1", ip: "192.168.1.45" },
        { type: "PII_REDACT", desc: "Redacted 16-digit PAN from ISO 8583 response", ip: "10.0.4.2" },
        { type: "GDPR_PURGE", desc: "Executed metadata purge transaction #8892", ip: "internal" },
        { type: "BRUTE_FORCE", desc: "Rate limit triggered (21 req/min) on /auth", ip: "203.0.113.4" },
        { type: "ANOMALY", desc: "Unexpected payload length outside cluster variance", ip: "198.51.100.22" }
    ];

    function addIncident() {
        const inc = incidents[Math.floor(Math.random() * incidents.length)];
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        
        const div = document.createElement('div');
        div.className = 'atm-incident';
        div.innerHTML = `
            <span><strong>[${time}]</strong> <span style="color:#FF4D4D;">${inc.type}</span> - ${inc.desc}</span>
            <span style="color:#94a3b8;">${inc.ip}</span>
        `;
        
        ticker.insertBefore(div, ticker.firstChild);
        
        if (ticker.childElementCount > 10) {
            ticker.removeChild(ticker.lastChild);
        }
    }

    // Initial load
    for(let i=0; i<3; i++) addIncident();
    
    // Continuous updates
    setInterval(addIncident, 3500);
}

// 5. Scroll Animations (Intersection Observer)
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
        const type = el.getAttribute('data-animate');
        el.style.opacity = '0';
        el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        
        if (type === 'fade-up') el.style.transform = 'translateY(30px)';
        else if (type === 'scale-in') el.style.transform = 'scale(0.95)';
        
        observer.observe(el);
    });
}
