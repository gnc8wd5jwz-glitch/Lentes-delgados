let f = 100;      
let do_val = 150; 
let ho = 60;      
let dragging = false;
let sliderF;
let scaleFactor = 1; 

function setup() {
  // Ajustamos el canvas al tamaño de la ventana
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('body'); 
  
  // Detectar si es celular para ajustar zoom inicial
  if (windowWidth < 600) {
    scaleFactor = 0.6; // Zoom alejado para que quepa todo
    do_val = 120; 
    ho = 50;
  }

  // Slider
  sliderF = createSlider(-200, 200, 100);
  sliderF.parent('controls'); 
  sliderF.style('width', '80%'); 
  // Evitar que el slider propague eventos de toque al canvas
  sliderF.touchStarted(() => { return false; });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  scaleFactor = windowWidth < 600 ? 0.6 : 1;
}

function draw() {
  background(245);
  
  // Leer valor del slider
  f = sliderF.value();
  if (abs(f) < 15) f = 15; // Evitar f=0 o muy pequeño
  
  // Actualizar textos HTML
  let tipo = f > 0 ? "Convergente (Convexa)" : "Divergente (Cóncava)";
  document.getElementById('focal-label').innerText = `Foco: ${f} mm | ${tipo}`;
  document.getElementById('txt-f').innerText = `f: ${f} mm`;
  document.getElementById('txt-do').innerText = `do: ${do_val.toFixed(0)} mm`;
  
  // --- TRANSFORMACIÓN ---
  push();
  translate(width / 2, height / 2);
  scale(scaleFactor); // Zoom adaptable
  
  // --- FÍSICA ---
  let di = (f * do_val) / (do_val - f);
  let m = -di / do_val;
  let hi = m * ho;
  
  document.getElementById('txt-di').innerText = `di: ${di.toFixed(0)} mm`;

  // --- INTERACCIÓN ---
  let inputX = (mouseX - width/2) / scaleFactor;
  let inputY = (mouseY - height/2) / scaleFactor;
  
  // Arrastrar objeto
  if (dragging) {
    do_val = constrain(-inputX, 20, (width/2)/scaleFactor - 20);
    ho = constrain(-inputY, -250, 250);
  }

  // --- DIBUJO ---
  drawGrid();
  drawOpticalAxis();
  
  // DIBUJAR LA LENTE (Aquí estaba el problema)
  drawLens(f); 
  
  drawFoci(f);
  
  // Objeto
  let isHovering = dist(inputX, inputY, -do_val, -ho) < 40;
  drawObject(-do_val, -ho, isHovering || dragging);
  
  // Imagen
  drawImage(di, -hi);
  
  // Rayos
  drawRays(do_val, ho, di, hi, f);
  
  pop();
}

// --- LOGICA MOUSE / TOUCH ---
function touchStarted() {
  let inputX = (mouseX - width/2) / scaleFactor;
  let inputY = (mouseY - height/2) / scaleFactor;
  if (dist(inputX, inputY, -do_val, -ho) < 50) {
    dragging = true;
    return false; 
  }
}
function touchEnded() { dragging = false; }
function mousePressed() { touchStarted(); }
function mouseReleased() { dragging = false; }

// --- FUNCIONES DE DIBUJO ---

function drawLens(f) {
  let hLente = 220; // Altura de la lente
  let wLente = 30;  // Ancho visual del cristal

  // 1. Dibujar forma de cristal (Estético)
  noStroke();
  fill(200, 230, 255, 150); // Azul muy claro transparente
  
  if (f > 0) {
    // CONVERGENTE: ()
    ellipse(0, 0, wLente, hLente * 2); 
  } else {
    // DIVERGENTE: )(
    beginShape();
    vertex(-wLente/2, -hLente);
    bezierVertex(0, -hLente/2, 0, hLente/2, -wLente/2, hLente);
    vertex(wLente/2, hLente);
    bezierVertex(0, hLente/2, 0, -hLente/2, wLente/2, -hLente);
    endShape(CLOSE);
  }

  // 2. Dibujar Símbolo Físico (Línea y Flechas) - ALTO CONTRASTE
  stroke(0); 
  strokeWeight(3);
  line(0, -hLente, 0, hLente); // Línea central vertical

  strokeWeight(4);
  let arrowSize = 15;
  
  if (f > 0) {
    // Convergente: Flechas normales apuntando afuera (↑ y ↓)
    // Punta Superior
    line(0, -hLente, -arrowSize, -hLente + arrowSize);
    line(0, -hLente, arrowSize, -hLente + arrowSize);
    // Punta Inferior
    line(0, hLente, -arrowSize, hLente - arrowSize);
    line(0, hLente, arrowSize, hLente - arrowSize);
  } else {
    // Divergente: Flechas invertidas / forma de V (∨ y ∧)
    // Punta Superior (V)
    line(0, -hLente, -arrowSize, -hLente - arrowSize);
    line(0, -hLente, arrowSize, -hLente - arrowSize);
    // Punta Inferior (V invertida)
    line(0, hLente, -arrowSize, hLente + arrowSize);
    line(0, hLente, arrowSize, hLente + arrowSize);
  }
}

function drawGrid() {
  stroke(220); strokeWeight(1);
  for (let x = -1000; x < 1000; x += 50) line(x, -1000, x, 1000);
  for (let y = -1000; y < 1000; y += 50) line(-1000, y, 1000, y);
}

function drawOpticalAxis() {
  stroke(50); strokeWeight(1);
  line(-1000, 0, 1000, 0); // Eje X infinito
}

function drawFoci(f) {
  fill(255, 140, 0); noStroke();
  circle(f, 0, 12); circle(-f, 0, 12);
  fill(0); textSize(16); noStroke();
  text("F", f-5, 25); text("F'", -f-10, 25);
}

function drawObject(x, y, active) {
  let col = active ? color(0, 120, 255) : color(0, 80, 180);
  stroke(col); fill(col); strokeWeight(4);
  line(x, 0, x, y);
  
  // Flecha objeto
  push(); translate(x, y);
  if(y < 0) triangle(0, -5, -6, 10, 6, 10); 
  else triangle(0, 5, -6, -10, 6, -10);
  pop();

  if (active) {
    noFill(); stroke(0, 120, 255, 100); strokeWeight(20);
    circle(x, y, 10);
  }
}

function drawImage(x, y) {
  let isVirtual = (x < 0 && f > 0) || (x < 0 && f < 0); 
  // Nota: Simplificación visual. Si está a la izquierda es virtual en lente simple
  if (f < 0) isVirtual = true; // Divergente siempre virtual para objetos reales

  let col = isVirtual ? color(220, 50, 50, 150) : color(200, 0, 0);
  stroke(col); fill(col); strokeWeight(3);
  
  if(isVirtual) drawingContext.setLineDash([10, 10]);
  line(x, 0, x, y);
  
  push(); translate(x, y);
  if (y < 0) triangle(0, -5, -5, 10, 5, 10);
  else triangle(0, 5, -5, -10, 5, -10);
  pop();
  drawingContext.setLineDash([]);
}

function drawRays(d, h, di, hi, f) {
  strokeWeight(2);
  let objX = -d; let objY = -h;
  let imgX = di; let imgY = -hi;
  
  // Rayo 1: Paralelo -> Foco
  stroke(50, 180, 50); // Verde
  line(objX, objY, 0, objY); // Hasta lente
  
  if (f > 0) {
    // Convergente: cruza por F real
    // Dibujamos linea larga pasando por (f, 0)
    let slope = (0 - objY) / (f - 0);
    line(0, objY, 1000, objY + 1000*slope);
    // Virtual hacia atrás
    if (di < 0) dashedLine(0, objY, imgX, imgY);
  } else {
    // Divergente: sale desde F virtual
    let slope = (objY - 0) / (0 - f); // desde F virtual a punto impacto
    line(0, objY, 600, objY + 600*slope); // sale hacia derecha
    dashedLine(0, objY, f, 0); // proyeccion atras a Foco
  }

  // Rayo 2: Centro Óptico
  stroke(150, 50, 150); // Morado
  // Linea recta que pasa por 0,0
  let slope2 = (0 - objY) / (0 - objX);
  // Dibujamos linea muy larga en ambas direcciones visuales (pero rayo va derecha)
  line(objX, objY, 1000, objY + (1000 - objX)*slope2);
  
  if (f < 0 || (f > 0 && di < 0)) {
     dashedLine(objX, objY, imgX, imgY); // Proyeccion virtual si es necesario
  }
}

function dashedLine(x1, y1, x2, y2) {
  drawingContext.setLineDash([8, 8]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
}
