import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function KnowledgeGraph({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    containerRef.current.innerHTML = '';

    const width = containerRef.current.clientWidth;
    const height = 600;

    const nodes: any[] = [];
    const links: any[] = [];

    // Core node
    nodes.push({ id: 'Submission', group: 0, label: 'RFx Sub' });

    // Files
    data.files?.forEach((f: any) => {
        nodes.push({ id: f.id, group: 1, label: f.name });
        links.push({ source: 'Submission', target: f.id, value: 2 });
    });

    // Requirements
    data.requirements?.forEach((r: any) => {
        nodes.push({ id: r.id, group: 2, label: `REQ: ${r.text?.substring(0,20)}...` });
        links.push({ source: r.source && data.files?.find((f:any)=>f.name===r.source)?.id ? data.files.find((f:any)=>f.name===r.source).id : 'Submission', target: r.id, value: 1 });
    });

    // Risks
    data.risks?.forEach((r: any) => {
        nodes.push({ id: r.id, group: 3, label: `RSK: ${r.title?.substring(0,20)}...` });
        links.push({ source: 'Submission', target: r.id, value: 1 });
    });

    // Assumptions
    data.assumptions?.forEach((a: any) => {
        nodes.push({ id: a.id, group: 4, label: `ASM: ${a.description?.substring(0,20)}...` });
        links.push({ source: 'Submission', target: a.id, value: 1 });
    });

    if (nodes.length === 1) return; // Only core node

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    const link = svg.append("g")
        .attr("stroke", "var(--line)")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "var(--bg)")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 8)
        .attr("fill", d => color(d.group.toString()))
        .call(drag(simulation));

    node.append("title")
        .text(d => d.label);

    const labels = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.label)
        .attr("font-size", "10px")
        .attr("dx", 12)
        .attr("dy", 4)
        .attr("fill", "var(--ink)");

    simulation.on("tick", () => {
        link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

        node
            .attr("cx", (d: any) => d.x = Math.max(8, Math.min(width - 8, d.x)))
            .attr("cy", (d: any) => d.y = Math.max(8, Math.min(height - 8, d.y)));
            
        labels
            .attr("x", (d: any) => d.x)
            .attr("y", (d: any) => d.y);
    });

    function drag(simulation: any) {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended) as any;
    }

  }, [data]);

  return <div ref={containerRef} className="w-full bg-[var(--card-bg)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xl" />;
}
