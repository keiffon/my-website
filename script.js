// Set year in footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// 3D Eye tracking
(function(){
  const leftEye = document.getElementById('eye-left');
  const rightEye = document.getElementById('eye-right');
  
  if(!leftEye || !rightEye) return;
  
  const leftBall = leftEye.querySelector('.eye-ball');
  const rightBall = rightEye.querySelector('.eye-ball');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  
  // Track mouse/touch position
  function updateMouse(e){
    if(e.touches && e.touches[0]){
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  }
  
  window.addEventListener('mousemove', updateMouse, {passive:true});
  window.addEventListener('touchmove', updateMouse, {passive:true});
  
  function lerp(start, end, factor){
    return start + (end - start) * factor;
  }
  
  let currentLeft = {x:0, y:0, rotX:0, rotY:0};
  let currentRight = {x:0, y:0, rotX:0, rotY:0};
  
  function animate(){
    // Get eye positions
    const leftRect = leftEye.getBoundingClientRect();
    const rightRect = rightEye.getBoundingClientRect();
    
    const leftCenterX = leftRect.left + leftRect.width / 2;
    const leftCenterY = leftRect.top + leftRect.height / 2;
    const rightCenterX = rightRect.left + rightRect.width / 2;
    const rightCenterY = rightRect.top + rightRect.height / 2;
    
    // Calculate angles for each eye
    const leftDx = mouseX - leftCenterX;
    const leftDy = mouseY - leftCenterY;
    const rightDx = mouseX - rightCenterX;
    const rightDy = mouseY - rightCenterY;
    
    // Movement constraints (pixels)
    const maxMove = 25;
    
    // Target positions (constrained)
    const leftTargetX = Math.max(-maxMove, Math.min(maxMove, leftDx / 15));
    const leftTargetY = Math.max(-maxMove, Math.min(maxMove, leftDy / 15));
    const rightTargetX = Math.max(-maxMove, Math.min(maxMove, rightDx / 15));
    const rightTargetY = Math.max(-maxMove, Math.min(maxMove, rightDy / 15));
    
    // 3D rotation based on cursor (subtle)
    const leftRotX = -leftDy / 80;
    const leftRotY = leftDx / 80;
    const rightRotX = -rightDy / 80;
    const rightRotY = rightDx / 80;
    
    // Smooth interpolation
    currentLeft.x = lerp(currentLeft.x, leftTargetX, 0.12);
    currentLeft.y = lerp(currentLeft.y, leftTargetY, 0.12);
    currentLeft.rotX = lerp(currentLeft.rotX, leftRotX, 0.08);
    currentLeft.rotY = lerp(currentLeft.rotY, leftRotY, 0.08);
    
    currentRight.x = lerp(currentRight.x, rightTargetX, 0.12);
    currentRight.y = lerp(currentRight.y, rightTargetY, 0.12);
    currentRight.rotX = lerp(currentRight.rotX, rightRotX, 0.08);
    currentRight.rotY = lerp(currentRight.rotY, rightRotY, 0.08);
    
    // Apply transforms
    if(leftBall) leftBall.style.transform = `translate(${currentLeft.x}px, ${currentLeft.y}px)`;
    if(rightBall) rightBall.style.transform = `translate(${currentRight.x}px, ${currentRight.y}px)`;
    
    leftEye.style.transform = `rotateX(${currentLeft.rotX}deg) rotateY(${currentLeft.rotY}deg)`;
    rightEye.style.transform = `rotateX(${currentRight.rotX}deg) rotateY(${currentRight.rotY}deg)`;
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
})();
