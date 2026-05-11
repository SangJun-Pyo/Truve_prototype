// @ts-nocheck
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

        document.addEventListener("DOMContentLoaded", (event) => {
            
            gsap.set("#truve-reveal", { scale: 0.4, opacity: 0, rotation: -45 });
            gsap.set(".final-text", { y: 40, opacity: 0 });
            gsap.set("#final-buttons", { y: 20, opacity: 0, scale: 0.95 });

            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#hero-section",
                    start: "top top",
                    end: "+=17500", 
                    scrub: 1.2, 
                    pin: true,
                    anticipatePin: 1
                }
            });

            
            masterTl.to(".intro-text", { y: -50, opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
                    .to(".scroll-indicator", { opacity: 0, duration: 0.5 }, 0);

            masterTl.to("#orbit-ring", { rotation: 720, duration: 4, ease: "power1.inOut" }, 0)
                    .to(".coin-wrapper", { rotation: -720, duration: 4, ease: "power1.inOut" }, 0);
            
            masterTl.to("#pos-usdc", { x: 0, duration: 3.5, ease: "power2.inOut" }, 0.5)
                    .to("#pos-rlusd", { x: 0, duration: 3.5, ease: "power2.inOut" }, 0.5);

            const mergeTime = 4.0; 
            
            masterTl.to(".rail-outer", { scale: 1.5, opacity: 0, duration: 1.5, ease: "power2.out" }, mergeTime - 0.5)
                    .to(".rail-middle", { scale: 1.3, opacity: 0, duration: 1.5, ease: "power2.out" }, mergeTime - 0.3)
                    .to(".rail-inner", { scale: 0.8, opacity: 0, duration: 1 }, mergeTime);

            masterTl.to(".coin", { scale: 1.15, duration: 0.3, ease: "power1.out" }, mergeTime)
                    .to(".coin", { scale: 0, opacity: 0, duration: 0.4, ease: "back.in(1.5)" }, mergeTime + 0.3);

            masterTl.to("#merge-ring", { 
                width: 300, 
                height: 300, 
                opacity: 0, 
                borderWidth: 0, 
                duration: 1, 
                ease: "power3.out" 
            }, mergeTime + 0.3);
            
            masterTl.to("#merge-flash", { opacity: 1, duration: 0.2 }, mergeTime + 0.3)
                    .to("#merge-flash", { opacity: 0, duration: 0.5 }, mergeTime + 0.5);

            const revealTime = mergeTime + 0.6;

            masterTl.to("#truve-reveal", { 
                scale: 1, 
                opacity: 1, 
                rotation: 0, 
                duration: 1.2, 
                ease: "elastic.out(1, 0.6)" 
            }, revealTime);

            masterTl.to(".final-text", { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out" 
            }, revealTime + 0.3);

            masterTl.to("#final-buttons", { 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                duration: 0.8, 
                ease: "back.out(1.5)" 
            }, revealTime + 0.6);

            
            const sec2Start = 8.0;

            masterTl.to(".final-text", { y: -40, opacity: 0, duration: 1 }, sec2Start)
                    .to("#final-buttons", { opacity: 0, duration: 1, pointerEvents: "none" }, sec2Start)
                    .to("#orbit-ring", { opacity: 0, scale: 0.8, duration: 1 }, sec2Start)
                    .to(".rail", { opacity: 0, duration: 1 }, sec2Start);

            masterTl.to(["#water-bg-moving", "#water-fg-moving"], {
                y: "-150vh",
                duration: 4,
                ease: "power2.inOut"
            }, sec2Start + 1.0);

            masterTl.to("#truve-reveal .relative", { 
                y: 15, 
                rotation: -4, 
                duration: 1, 
                yoyo: true, 
                repeat: 1,
                ease: "sine.inOut"
            }, sec2Start + 2.5);

            masterTl.to("#refraction-overlay", { opacity: 1, duration: 1.5 }, sec2Start + 2.6);

            masterTl.to(".debris", {
                y: "-=300",
                rotation: "random(-60, 60)",
                duration: 8,
                ease: "none"
            }, sec2Start + 1.0);

            masterTl.to("#water-base-fixed", { opacity: 1, duration: 0.1 }, sec2Start + 5.0);

            const pureStart = sec2Start + 5.5;

            masterTl.to("#purification-field", { scale: 30, opacity: 1, duration: 3.5, ease: "power2.out" }, pureStart);
            masterTl.to("#purification-ring", { scale: 35, opacity: 0, duration: 3.5, ease: "power2.out" }, pureStart);

            masterTl.to("#truve-reveal .relative", {
                boxShadow: "0 0 60px rgba(249, 115, 22, 0.5), 0 0 100px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(255,255,255,0.8)",
                borderColor: "rgba(255,255,255,0.6)",
                duration: 2
            }, pureStart);

            masterTl.to("#refraction-overlay", { opacity: 0, duration: 2.5 }, pureStart);
            masterTl.to("#light-rays", { opacity: 1, duration: 3 }, pureStart + 0.5);
            masterTl.to("#water-clear", { opacity: 1, duration: 3 }, pureStart);
            masterTl.to("#water-murky-bg", { opacity: 0, duration: 3 }, pureStart); 

            masterTl.to(".debris.left", { x: "-70vw", opacity: 0, rotation: "-=120", duration: 3, ease: "power2.inOut" }, pureStart);
            masterTl.to(".debris.right", { x: "70vw", opacity: 0, rotation: "+=120", duration: 3, ease: "power2.inOut" }, pureStart);
            masterTl.to(".debris.center", { scale: 0, opacity: 0, filter: "blur(10px)", duration: 2, ease: "power2.in" }, pureStart);

            masterTl.to("#clean-particles", { opacity: 1, duration: 2.5 }, pureStart + 1.5);
            masterTl.to("#sec2-text", { y: 0, opacity: 1, duration: 2, ease: "power3.out" }, pureStart + 2.0);
            masterTl.to("#sec2-text", { y: -10, duration: 1.5, ease: "none" }, pureStart + 4.0);

            
            const riseStart = pureStart + 6.0; 

            
            masterTl.to("#sec2-text", { y: -40, opacity: 0, duration: 1.5, ease: "power2.in" }, riseStart);

            
            
            masterTl.to(["#water-base-fixed", "#clean-particles", "#light-rays", "#water-fg-moving"], {
                y: "100vh",
                duration: 5,
                ease: "power2.inOut"
            }, riseStart + 1.0);

            
            masterTl.to("#landscape-scene", {
                y: "0%",
                duration: 5,
                ease: "power2.inOut"
            }, riseStart + 1.0);

            
            masterTl.to("#water-surface-layer", {
                opacity: 1,
                duration: 0.5
            }, riseStart + 1.0);
            masterTl.to("#water-surface-layer", {
                y: "100vh",
                duration: 5,
                ease: "power2.inOut"
            }, riseStart + 1.0);

            
            masterTl.to("#truve-reveal .relative", {
                y: -60,
                scale: 0.9,
                duration: 2.5,
                ease: "power1.inOut"
            }, riseStart + 1.5);
            masterTl.to("#truve-reveal .relative", {
                y: 0,
                scale: 1,
                duration: 2.5,
                ease: "power2.out"
            }, riseStart + 4.0);

            
            masterTl.to("#truve-reveal .relative", {
                boxShadow: "0 20px 50px rgba(249, 115, 22, 0.4), inset 0 2px 10px rgba(255,255,255,0.4)",
                duration: 2
            }, riseStart + 3.0);

            
            const landStart = riseStart + 6.5; 

            
            masterTl.to("#sec3-text", { y: 0, opacity: 1, duration: 2, ease: "power3.out" }, landStart);
            masterTl.to("#sec3-text", { y: -10, duration: 2, ease: "none" }, landStart + 2.0);

            
            const healStart = landStart + 2.0;

            
            masterTl.to("#restoration-aura", { opacity: 1, duration: 2 }, healStart);
            masterTl.to("#restoration-aura", { opacity: 0.6, duration: 1, yoyo: true, repeat: 4 }, healStart + 2);

            
            masterTl.to("#landscape-alive", {
                clipPath: "circle(150% at 50% 55%)",
                duration: 10,
                ease: "power2.inOut"
            }, healStart);

            
            const trees = gsap.utils.toArray(".tree-obj");
            const bgTrees = gsap.utils.toArray(".tree-bg");
            const smallTrees = gsap.utils.toArray(".tree-small");
            const mediumTrees = gsap.utils.toArray(".tree-medium");
            const largeTrees = gsap.utils.toArray(".tree-large");
            
            
            bgTrees.forEach((tree, i) => {
                masterTl.to(tree, { scale: 1, opacity: 0.5, duration: 1.5 + Math.random(), ease: "back.out(1.3)" }, healStart + 0.3 + (i * 0.15));
            });
            
            
            smallTrees.forEach((tree, i) => {
                masterTl.to(tree, { scale: 1, opacity: 1, duration: 2 + Math.random(), ease: "back.out(1.2)" }, healStart + 0.8 + (i * 0.25));
            });
            
            
            mediumTrees.forEach((tree, i) => {
                masterTl.to(tree, { scale: 1, opacity: 1, duration: 2.5 + Math.random() * 0.5, ease: "back.out(1.1)" }, healStart + 1.5 + (i * 0.35));
            });
            
            
            largeTrees.forEach((tree, i) => {
                masterTl.to(tree, { scale: 1, opacity: 1, duration: 3 + Math.random() * 0.5, ease: "back.out(1.05)" }, healStart + 2.5 + (i * 0.5));
            });

            
            masterTl.to("#landscape-scene", {
                scale: 1.05,
                transformOrigin: "bottom center",
                duration: 10,
                ease: "power1.inOut"
            }, healStart);

            
            
            ScrollTrigger.create({
                start: "top -50",
                end: 99999,
                toggleClass: {className: 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm', targets: '#navbar'}
            });
        });
