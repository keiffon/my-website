// Set year in footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// Eye-tracking implementation (clean, constrained, smoothed)
(function(){
	const svg = document.querySelector('.avatar-bg');
	if(!svg) return;

	// Elements
	const leftGroup = svg.querySelector('#eye-left');
	const rightGroup = svg.querySelector('#eye-right');
	const leftPupil = svg.querySelector('#eye-left .pupil');
	const rightPupil = svg.querySelector('#eye-right .pupil');

	const eyes = [
		{group:leftGroup, ball:leftGroup.querySelector('.eye-ball'), pupil:leftGroup.querySelector('.pupil'), highlight:leftGroup.querySelector('.highlight'), baseHighlight:{x:-6,y:-6}, cx:0, cy:0, maxX:8, maxY:6, x:0, y:0},
		{group:rightGroup, ball:rightGroup.querySelector('.eye-ball'), pupil:rightGroup.querySelector('.pupil'), highlight:rightGroup.querySelector('.highlight'), baseHighlight:{x:-6,y:-6}, cx:0, cy:0, maxX:8, maxY:6, x:0, y:0},
	];

	// Measure centers and allowable movement ranges (in screen pixels)
	function refresh(){
		for(const e of eyes){
			const gbb = e.group.getBoundingClientRect();
			e.cx = gbb.left + gbb.width/2;
			e.cy = gbb.top + gbb.height/2;
			// Measure pupil size (screen px) from the pupil element
			const pb = e.pupil.getBoundingClientRect();
			const pr = Math.max(pb.width, pb.height) / 2;
			const padding = 4; // keeps pupil from touching eye edge
			e.maxX = Math.max(2, (gbb.width/2) - pr - padding);
			e.maxY = Math.max(2, (gbb.height/2) - pr - padding);
		}
	}

	// Pointer state
	let pointer = {x: window.innerWidth/2, y: window.innerHeight/2};
	function updatePointer(e){
		if(e.touches && e.touches[0]){
			pointer.x = e.touches[0].clientX;
			pointer.y = e.touches[0].clientY;
		} else {
			pointer.x = e.clientX;
			pointer.y = e.clientY;
		}
	}

	window.addEventListener('mousemove', updatePointer, {passive:true});
	window.addEventListener('touchmove', updatePointer, {passive:true});
	window.addEventListener('resize', refresh);
	window.addEventListener('scroll', refresh, {passive:true});
	refresh();

	// easing
	function lerp(a,b,t){ return a + (b-a) * t; }

	// Main loop: compute a target inside each eye's ellipse and smoothly approach it
	function animate(){
		for(const e of eyes){
			// vector from eye center to pointer
			const dx = pointer.x - e.cx;
			const dy = pointer.y - e.cy;

			// scale down so movement is subtle (translation)
			const scale = 1/25;
			let tx = dx * scale;
			let ty = dy * scale;

			// constrain to ellipse: (tx/maxX)^2 + (ty/maxY)^2 <= 1
			const nx = tx / e.maxX;
			const ny = ty / e.maxY;
			const mag = nx*nx + ny*ny;
			if(mag > 1){
				const factor = 1 / Math.sqrt(mag);
				tx *= factor;
				ty *= factor;
			}

			// smooth approach (translation)
			e.x = lerp(e.x, tx, 0.12);
			e.y = lerp(e.y, ty, 0.12);

			// rotation: compute angle toward pointer and clamp for subtlety
			const angleRad = Math.atan2(dy, dx);
			const angleDeg = angleRad * 180 / Math.PI;
			const maxRotate = 8; // degrees
			// map angle to a limited rotation (-maxRotate..maxRotate) based on horizontal component
			// use normalized horizontal value to decide sign and magnitude
			const horiz = Math.max(-1, Math.min(1, dx / (window.innerWidth/2)));
			const rot = horiz * maxRotate;
			// smooth rotation by lerping between previous and target angle stored on e
			e.r = e.r === undefined ? 0 : e.r;
			e.r = lerp(e.r, rot, 0.08);

			// apply as SVG transform to the whole eye-ball so iris + pupil move and rotate together
			if(e.ball) e.ball.setAttribute('transform', `translate(${e.x},${e.y}) rotate(${e.r})`);

			// move the internal highlight (lens) slightly toward the cursor direction
			if(e.highlight){
				const dist = Math.hypot(dx, dy) || 1;
				const dirx = dx / dist;
				const diry = dy / dist;
				// small magnitude for highlight offset (in local eye coordinates)
				const hMag = 6; // pixels
				const hx = dirx * hMag;
				const hy = diry * hMag;
				const newCx = (e.baseHighlight?.x || -6) + hx;
				const newCy = (e.baseHighlight?.y || -6) + hy;
				e.highlight.setAttribute('cx', String(newCx));
				e.highlight.setAttribute('cy', String(newCy));
			}
		}
		requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
})();

