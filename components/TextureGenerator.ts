
import * as THREE from 'three';

export const createWoodTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background Base
    ctx.fillStyle = '#8B5A2B'; 
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw Planks
    const numPlanks = 8; // 8 planks vertically in the texture
    const plankHeight = 1024 / numPlanks;
    
    for (let i = 0; i < numPlanks; i++) {
        const y = i * plankHeight;
        
        // Randomize base plank color slightly for natural look
        const hue = 30 + Math.random() * 5;
        const sat = 45 + Math.random() * 10;
        const light = 30 + Math.random() * 15;
        
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(0, y, 1024, plankHeight);

        // Wood grain lines
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#3E2723';
        const numGrains = 40;
        for(let j=0; j<numGrains; j++) {
             const gy = y + Math.random() * plankHeight;
             const thickness = 1 + Math.random() * 3;
             const width = 100 + Math.random() * 500;
             const startX = Math.random() * 1024;
             ctx.fillRect(startX, gy, width, thickness);
        }
        
        // Plank separator (Dark gap)
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#1a0f00';
        ctx.fillRect(0, y, 1024, 4);
        
        // Nails
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#111';
        for(let k=0; k<10; k++) {
            const nailX = k * 120 + 40;
            // Top nail
            ctx.beginPath();
            ctx.arc(nailX, y + 15, 3, 0, Math.PI*2);
            ctx.fill();
            // Bottom nail
            ctx.beginPath();
            ctx.arc(nailX, y + plankHeight - 15, 3, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Repeat to match the aspect ratio of the floor (10x20)
  texture.repeat.set(3, 6); 
  return texture;
};

export const createWallTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.fillStyle = '#dcdcdc'; // Slightly dimmer white
        ctx.fillRect(0,0,512,512);
        
        ctx.fillStyle = '#b0b0b0';
        for(let i=0; i<3000; i++) {
             const x = Math.random() * 512;
             const y = Math.random() * 512;
            ctx.fillRect(x, y, 2, 2);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
}

export const createTvStaticTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'black';
      ctx.globalAlpha = Math.random();
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

export const createNewsTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background - News Blue
    const grad = ctx.createLinearGradient(0,0,0,256);
    grad.addColorStop(0, '#000088');
    grad.addColorStop(1, '#000033');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Header box
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(0, 0, 512, 60);
    
    // Breaking News Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('חדשות מיקי', 256, 45);

    // Nevo warning
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('נבו מסתובב', 256, 120);
    ctx.fillText('בבתים שלכם!', 256, 160);

    // Ticker at bottom
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 220, 512, 36);
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText('עדכונים שוטפים... תנעלו את הדלתות... ', 256, 245);
  }
  const texture = new THREE.CanvasTexture(canvas);
  // Important for glitches:
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export const createFabricTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base Red/Burgundy
    ctx.fillStyle = '#551111'; 
    ctx.fillRect(0, 0, 512, 512);

    // Weave pattern
    ctx.fillStyle = '#440a0a';
    ctx.globalAlpha = 0.5;
    for(let i=0; i<512; i+=4) {
        ctx.fillRect(i, 0, 2, 512); // Vertical lines
        ctx.fillRect(0, i, 512, 2); // Horizontal lines
    }

    // Noise for fuzzy feel
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<10000; i++) {
        ctx.fillRect(Math.random()*512, Math.random()*512, 1, 1);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const createFridgeNoteTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Post-it Yellow background
    ctx.fillStyle = '#fff59d'; 
    ctx.fillRect(0, 0, 256, 256);

    // Shadow/Fold effect
    ctx.fillStyle = '#f9a825';
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(220, 256);
    ctx.lineTo(256, 220);
    ctx.fill();

    // Text - "I'm on my way to you"
    ctx.fillStyle = '#d50000'; // Blood red text for scary effect
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Rotate slightly for handwritten feel
    ctx.translate(128, 128);
    ctx.rotate(-0.1);
    ctx.fillText('אני בדרך', 0, -20);
    ctx.fillText('אלייך', 0, 30);
    
    // Some scribbles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, 60);
    ctx.lineTo(50, 65);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

export const createBedTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // White/Grey Messy Sheets
      ctx.fillStyle = '#dddddd'; 
      ctx.fillRect(0, 0, 512, 512);
  
      ctx.fillStyle = '#bbbbbb';
      ctx.globalAlpha = 0.3;
      // Draw folds/wrinkles
      for(let i=0; i<30; i++) {
          ctx.beginPath();
          const startX = Math.random() * 512;
          const startY = Math.random() * 512;
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
              startX + Math.random()*100 - 50, startY + Math.random()*100 - 50,
              startX + Math.random()*100 - 50, startY + Math.random()*100 - 50,
              startX + Math.random()*200 - 100, startY + Math.random()*200 - 100
          );
          ctx.lineWidth = 2 + Math.random() * 5;
          ctx.stroke();
      }
    }
    return new THREE.CanvasTexture(canvas);
}

export const createRugTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base - Persian Red
    ctx.fillStyle = '#7b1113'; 
    ctx.fillRect(0, 0, 512, 512);

    // Border
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 20;
    ctx.strokeRect(20, 20, 472, 472);
    
    ctx.strokeStyle = '#1a237e'; // Dark Blue
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 50, 412, 412);

    // Center Medallion
    ctx.fillStyle = '#1a237e';
    ctx.beginPath();
    ctx.ellipse(256, 256, 100, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(256, 256, 80, 130, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Noise/Fuzz for realism
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<5000; i++) {
        ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

export const createBedroomRugTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base - Light Blue / Cyan
    ctx.fillStyle = '#81D4FA'; // Light Blue 200
    ctx.fillRect(0, 0, 512, 512);

    // Border
    ctx.strokeStyle = '#0288D1'; // Light Blue 700
    ctx.lineWidth = 15;
    ctx.strokeRect(10, 10, 492, 492);
    
    // Inner pattern - simple circles
    ctx.fillStyle = '#4FC3F7'; // Light Blue 300
    for(let i=0; i<5; i++) {
        for(let j=0; j<5; j++) {
            ctx.beginPath();
            ctx.arc(50 + i*100, 50 + j*100, 20, 0, Math.PI*2);
            ctx.fill();
        }
    }

    // Fluffy Noise
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#E1F5FE'; // Very light blue
    for(let i=0; i<8000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 3, 3);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

export const createTileTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Grout (Gray background)
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 128; // 4x4 tiles
    const gap = 4;

    for(let x=0; x<4; x++) {
        for(let y=0; y<4; y++) {
            // Checkered pattern: White and Pale Cyan
            const isWhite = (x + y) % 2 === 0;
            ctx.fillStyle = isWhite ? '#ffffff' : '#e0f7fa';
            
            ctx.fillRect(
                x * tileSize + gap, 
                y * tileSize + gap, 
                tileSize - gap*2, 
                tileSize - gap*2
            );
            
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(x * tileSize + gap, y * tileSize + gap, tileSize - gap*2, 5);
        }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export const createNevoFaceTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Background (Dark)
        ctx.fillStyle = '#050505';
        ctx.fillRect(0,0,512,512);

        // Face Shape (Skin tone)
        ctx.fillStyle = '#d2a679';
        ctx.beginPath();
        ctx.ellipse(256, 260, 160, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair (Short dark hair)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(256, 160, 170, 120, 0, Math.PI, 0); // Top curve
        ctx.fill();
        // Side burns/hair texture
        ctx.beginPath();
        ctx.moveTo(100, 160);
        ctx.lineTo(86, 300);
        ctx.lineTo(120, 250);
        ctx.lineTo(120, 160);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(412, 160);
        ctx.lineTo(426, 300);
        ctx.lineTo(392, 250);
        ctx.lineTo(392, 160);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#d2a679';
        ctx.beginPath();
        ctx.ellipse(80, 260, 25, 40, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(432, 260, 25, 40, 0, 0, Math.PI*2);
        ctx.fill();

        // Eyes (Dark, looking at camera)
        // Whites
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(190, 240, 35, 20, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(322, 240, 35, 20, 0, 0, Math.PI*2);
        ctx.fill();
        // Pupils (Big and creepy)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(190, 240, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(322, 240, 12, 0, Math.PI*2);
        ctx.fill();

        // Eyebrows
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(150, 210);
        ctx.quadraticCurveTo(190, 200, 230, 210);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(282, 210);
        ctx.quadraticCurveTo(322, 200, 362, 210);
        ctx.stroke();

        // Nose
        ctx.fillStyle = '#c69c6d'; // Shadowy nose
        ctx.beginPath();
        ctx.moveTo(256, 240);
        ctx.lineTo(240, 310);
        ctx.lineTo(272, 310);
        ctx.fill();

        // Mouth (Big Smile with teeth)
        ctx.fillStyle = '#660000'; // Dark inside
        ctx.beginPath();
        ctx.moveTo(180, 350);
        ctx.quadraticCurveTo(256, 420, 332, 350); // Lower lip curve
        ctx.quadraticCurveTo(256, 360, 180, 350); // Upper lip curve
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.rect(200, 355, 20, 20);
        ctx.rect(225, 360, 20, 20);
        ctx.rect(250, 362, 20, 20); // Front tooth
        ctx.rect(275, 360, 20, 20);
        ctx.rect(300, 355, 20, 20);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

export const createBloodTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Transparent BG
        ctx.clearRect(0, 0, 512, 512);
        
        // Dark Blood Red
        const bloodGradient = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
        bloodGradient.addColorStop(0, '#500000');
        bloodGradient.addColorStop(0.6, '#300000');
        bloodGradient.addColorStop(1, 'rgba(40,0,0,0)');
        
        ctx.fillStyle = bloodGradient;
        
        // Main pool
        ctx.beginPath();
        for(let i=0; i<20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const r = 150 + Math.random() * 100;
            const x = 256 + Math.cos(angle) * r;
            const y = 256 + Math.sin(angle) * r;
            if(i===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.fill();

        // Splatters
        for(let i=0; i<30; i++) {
            const r = 20 + Math.random() * 30;
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fill();
        }
    }
    return new THREE.CanvasTexture(canvas);
};

export const createGoogleScreenTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 256);

        // Header
        ctx.fillStyle = '#f1f3f4';
        ctx.fillRect(0, 0, 512, 40);

        // Logo (Colors)
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        const text = "Google";
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
        let x = 180;
        for (let i = 0; i < text.length; i++) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillText(text[i], x, 100);
            x += 35;
        }

        // Search Bar
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#dfe1e5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(100, 130, 312, 40, 20);
        ctx.stroke();
        ctx.fill();

        // Search Text
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("איך להתחמק מנבו...", 120, 155);
        
        // Cursor
        ctx.fillStyle = 'black';
        ctx.fillRect(260, 140, 2, 20);

        // Buttons
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(150, 190, 100, 30);
        ctx.fillRect(270, 190, 100, 30);
        ctx.fillStyle = '#5f6368';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("חיפוש ב-Google", 200, 210);
        ctx.fillText("יותר מזל משכל", 320, 210);
    }
    return new THREE.CanvasTexture(canvas);
};
