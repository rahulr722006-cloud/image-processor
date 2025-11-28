// Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const selectFilesBtn = document.getElementById('select-files-btn');
const processBtn = document.getElementById('process-btn');
const clearBtn = document.getElementById('clear-btn');
const statusLine = document.getElementById('status-line');
const fileGrid = document.getElementById('file-grid');
const downloadZipBtn = document.getElementById('download-zip-btn');

const outputFormat = document.getElementById('output-format');
const qualityEl = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');
const maxWidthEl = document.getElementById('max-width');
const preserveAspect = document.getElementById('preserve-aspect');

let images = []; // {id, file, url, blob, dom}

// helpers
const uid = () => crypto.randomUUID?.() || Date.now().toString(36);
const formatToMime = (fmt, original) => {
  if (fmt === 'keep') return original;
  if (fmt === 'webp') return 'image/webp';
  if (fmt === 'jpeg') return 'image/jpeg';
  if (fmt === 'png') return 'image/png';
  return original;
};

// UI wiring
selectFilesBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', e => handleFiles(e.target.files));
dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.style.transform='translateY(-6px)'; });
dropArea.addEventListener('dragleave', e => { e.preventDefault(); dropArea.style.transform='none'; });
dropArea.addEventListener('drop', e => { e.preventDefault(); dropArea.style.transform='none'; handleFiles(e.dataTransfer.files); });

qualityEl.addEventListener('input', (e)=> qualityValue.textContent = Number(e.target.value).toFixed(2));
processBtn.addEventListener('click', processAll);
clearBtn.addEventListener('click', clearAll);
downloadZipBtn.addEventListener('click', downloadAllZip);

window.addEventListener('paste', ev=>{
  const items = ev.clipboardData?.items;
  if (!items) return;
  const files = [];
  for (const it of items) if (it.type?.startsWith('image/')) { const f = it.getAsFile(); if (f) files.push(f); }
  if (files.length) handleFiles(files);
});

// handle files
function handleFiles(fileList){
  const arr = Array.from(fileList).filter(f=>f.type && f.type.startsWith('image/'));
  if (!arr.length) return;
  arr.forEach(f=>{
    const id = uid();
    const url = URL.createObjectURL(f);
    const item = {id, file:f, url, blob:null, dom:null};
    images.push(item);
    renderCard(item);
  });
  updateStatus();
}

function renderCard(item){
  const card = document.createElement('div'); card.className='file-card'; card.id='card-'+item.id;
  const img = document.createElement('img'); img.className='thumb'; img.src = item.url;
  const meta = document.createElement('div'); meta.className='file-meta';
  meta.innerHTML = `<b>${item.file.name}</b><div class="small">Original: ${(item.file.size/1024).toFixed(1)} KB</div>
    <div class="progress"><i style="width:0%"></i></div>`;
  const actions = document.createElement('div'); actions.className='file-actions';
  const dl = document.createElement('button'); dl.className='btn small'; dl.textContent='Download'; dl.disabled=true;
  const rm = document.createElement('button'); rm.className='btn small ghost'; rm.textContent='Remove';
  actions.appendChild(dl); actions.appendChild(rm);

  card.appendChild(img); card.appendChild(meta); card.appendChild(actions);
  fileGrid.appendChild(card);

  item.dom = {card, img, meta, dl, rm};
  rm.addEventListener('click', ()=>{
    try{ URL.revokeObjectURL(item.url); if (item.blob) URL.revokeObjectURL(item.blob.url); }catch(e){}
    images = images.filter(x=>x.id !== item.id);
    card.remove();
    updateStatus();
  });
  dl.addEventListener('click', ()=>{
    if (!item.blob) return;
    const a = document.createElement('a'); a.href = item.blob.url; a.download = item.blob.name;
    document.body.appendChild(a); a.click(); a.remove();
  });
}

function updateStatus(){
  statusLine.textContent = `Ready — ${images.length} file(s)`;
  processBtn.disabled = images.length === 0;
  downloadZipBtn.disabled = true;
}

// compression
function compressViaCanvas(file, options){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = ()=>{
      try {
        let w = img.naturalWidth, h = img.naturalHeight;
        if (options.maxWidth > 0 && w > options.maxWidth){
          if (options.preserveAspect){
            const ratio = options.maxWidth / w;
            w = Math.round(options.maxWidth);
            h = Math.round(h * ratio);
          } else { w = options.maxWidth; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const isLossy = (options.mime === 'image/webp' || options.mime === 'image/jpeg');
        const q = isLossy ? options.quality : undefined;
        canvas.toBlob((blob)=>{
          if (!blob) return reject(new Error('toBlob failed'));
          const ext = (options.mime.split('/')[1] || file.name.split('.').pop()).split('+')[0];
          const base = file.name.replace(/\.[^/.]+$/, '');
          const outName = `${base}_opt.${ext}`;
          const url = URL.createObjectURL(blob);
          resolve({blob, url, name: outName, size: blob.size, mime: blob.type});
        }, options.mime, q);
      } catch(e){ reject(e); }
    };
    img.onerror = ()=> reject(new Error('image load error'));
    img.src = URL.createObjectURL(file);
  });
}

async function processAll(){
  if (!images.length) return;
  processBtn.disabled = true; clearBtn.disabled = true;
  statusLine.textContent = 'Processing...';
  const fmt = outputFormat.value;
  const maxW = parseInt(maxWidthEl.value || '0');
  const q = parseFloat(qualityEl.value || '0.8');
  const preserve = preserveAspect.checked;

  for (let i=0;i<images.length;i++){
    const item = images[i];
    const progressFill = item.dom.meta.querySelector('.progress > i');
    item.dom.meta.querySelector('.small').textContent = 'Processing...';
    try {
      const mime = formatToMime(fmt, item.file.type);
      progressFill.style.width = '10%';
      const res = await compressViaCanvas(item.file, {mime, quality:q, maxWidth: maxW, preserveAspect: preserve});
      item.blob = {url: res.url, name: res.name, size: res.size, mime: res.mime};
      item.dom.dl.disabled = false;
      item.dom.meta.querySelector('.small').innerHTML = `Original: ${(item.file.size/1024).toFixed(1)} KB → ${(res.size/1024).toFixed(1)} KB`;
      progressFill.style.width = '100%';
    } catch(err){
      console.error(err);
      item.dom.meta.querySelector('.small').textContent = 'Error';
      progressFill.style.width = '0%';
    }
    await new Promise(r=>setTimeout(r,120));
  }

  // enable zip if at least one blob
  downloadZipBtn.disabled = images.filter(i=>i.blob).length === 0;
  processBtn.disabled = false; clearBtn.disabled = false;
  statusLine.textContent = `Done — ${images.length} processed`;
}

// ZIP download
async function downloadAllZip(){
  const valid = images.filter(i=>i.blob);
  if (!valid.length) return;
  downloadZipBtn.disabled = true;
  statusLine.textContent = 'Building ZIP...';
  const zip = new JSZip();
  // fetch each blob url into blob
  await Promise.all(valid.map(async item=>{
    const b = await fetch(item.blob.url).then(r=>r.blob());
    zip.file(item.blob.name, b);
  }));
  const content = await zip.generateAsync({type:'blob'});
  const a = document.createElement('a');
  const url = URL.createObjectURL(content);
  a.href = url; a.download = 'compressly_images.zip';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  statusLine.textContent = 'ZIP downloaded';
  downloadZipBtn.disabled = false;
}

function clearAll(){
  images.forEach(it=>{ try{ URL.revokeObjectURL(it.url); if (it.blob) URL.revokeObjectURL(it.blob.url);}catch(e){} });
  images = []; fileGrid.innerHTML = ''; updateStatus();
}

// update footer year
document.getElementById('year').textContent = new Date().getFullYear();
