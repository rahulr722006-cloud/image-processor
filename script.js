// UI elements
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

let images = []; // {id, file, thumbnailUrl, blob, status, dom}

// helpers
const mimeFor = (fmt, originalType) => {
  if (fmt === 'keep') return originalType;
  if (fmt === 'webp') return 'image/webp';
  if (fmt === 'jpeg') return 'image/jpeg';
  if (fmt === 'png') return 'image/png';
  return originalType;
};

const uid = () => crypto.randomUUID?.() || Date.now().toString(36);

// drag & drop
selectFilesBtn.addEventListener('click', ()=>fileInput.click());
dropArea.addEventListener('dragover', e=>{ e.preventDefault(); dropArea.style.transform='translateY(-6px)'; });
dropArea.addEventListener('dragleave', e=>{ e.preventDefault(); dropArea.style.transform='none'; });
dropArea.addEventListener('drop', e=>{ e.preventDefault(); dropArea.style.transform='none'; handleFiles(e.dataTransfer.files); });
fileInput.addEventListener('change', e=> handleFiles(e.target.files));

// slider text
qualityEl.addEventListener('input', ()=> qualityValue.textContent = Number(qualityEl.value).toFixed(2));

// handle files
function handleFiles(fileList){
  const arr = Array.from(fileList).filter(f=>f.type && f.type.startsWith('image/'));
  if (!arr.length) return;
  arr.forEach(file=>{
    const id = uid();
    const thumbUrl = URL.createObjectURL(file);
    const item = {id, file, thumbnailUrl: thumbUrl, blob: null, status:'ready', dom: null};
    images.push(item);
    renderFileCard(item);
  });
  updateStatus();
}

function renderFileCard(item){
  const card = document.createElement('div'); card.className='file-card'; card.id = 'card-'+item.id;
  const img = document.createElement('img'); img.className='thumb'; img.src = item.thumbnailUrl;
  const meta = document.createElement('div'); meta.className='file-meta';
  meta.innerHTML = `<b>${item.file.name}</b><div class="small">Original: ${(item.file.size/1024).toFixed(1)} KB</div>
    <div class="progress"><i style="width:0%"></i></div>`;
  const actions = document.createElement('div'); actions.className='file-actions';
  const downloadBtn = document.createElement('button'); downloadBtn.className='btn small'; downloadBtn.textContent='Download'; downloadBtn.disabled=true;
  const removeBtn = document.createElement('button'); removeBtn.className='btn small ghost'; removeBtn.textContent='Remove';
  actions.appendChild(downloadBtn); actions.appendChild(removeBtn);
  card.appendChild(img); card.appendChild(meta); card.appendChild(actions);
  fileGrid.appendChild(card);

  // attach dom refs
  item.dom = {card, img, meta, downloadBtn, removeBtn};
  // handlers
  removeBtn.addEventListener('click', ()=> {
    URL.revokeObjectURL(item.thumbnailUrl);
    images = images.filter(x=>x.id !== item.id);
    card.remove();
    updateStatus();
  });
  downloadBtn.addEventListener('click', ()=> {
    if (!item.blob) return;
    const a = document.createElement('a');
    a.href = item.blob.url;
    a.download = item.blob.name;
    document.body.appendChild(a); a.click(); a.remove();
  });

  updateStatus();
}

function updateStatus(){
  statusLine.textContent = `Ready — ${images.length} file(s)`;
  processBtn.disabled = images.length === 0;
  downloadZipBtn.disabled = true;
}

// compress logic (canvas)
function compressImage(file, options){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.naturalWidth, h = img.naturalHeight;
        const maxW = options.maxWidth || 0;
        if (maxW > 0 && w > maxW) {
          if (options.preserveAspect) {
            const ratio = maxW / w;
            w = Math.round(maxW);
            h = Math.round(h * ratio);
          } else {
            w = maxW;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const isLossy = (options.mime === 'image/jpeg' || options.mime === 'image/webp');
        const q = isLossy ? options.quality : undefined;
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('toBlob failed'));
          const ext = options.mime.split('/')[1].split('+')[0] || 'jpg';
          const base = file.name.replace(/\.[^/.]+$/, '');
          const outName = `${base}_opt.${ext}`;
          const url = URL.createObjectURL(blob);
          resolve({blob, url, name:outName, size:blob.size, mime: blob.type});
        }, options.mime, q);
      } catch (err) { reject(err); }
    };
    img.onerror = ()=> reject(new Error('image load error'));
    // use object url to avoid base64 memory
    img.src = URL.createObjectURL(file);
  });
}

// process all images sequentially (keeps memory lower)
async function processAll(){
  if (!images.length) return;
  processBtn.disabled = true;
  clearBtn.disabled = true;
  statusLine.textContent = 'Processing...';
  const fmt = outputFormat.value;
  const maxW = parseInt(maxWidthEl.value || '0');
  const q = parseFloat(qualityEl.value || '0.8');
  const preserve = preserveAspect.checked;

  for (let i=0;i<images.length;i++){
    const item = images[i];
    const domProgress = item.dom.meta.querySelector('.progress > i');
    item.dom.meta.querySelector('.small').textContent = 'Processing...';
    try {
      const mime = mimeFor(fmt, item.file.type);
      // Update visual progress (fake progressive fill)
      domProgress.style.width = '10%';
      const result = await compressImage(item.file, {mime, quality:q, maxWidth:maxW, preserveAspect:preserve});
      item.blob = {url: result.url, name: result.name, size: result.size, mime: result.mime};
      item.dom.downloadBtn.disabled = false;
      const oldKB = (item.file.size/1024).toFixed(1);
      const newKB = (result.size/1024).toFixed(1);
      item.dom.meta.querySelector('.small').innerHTML = `Original: ${oldKB} KB → ${newKB} KB`;
      domProgress.style.width = '100%';
    } catch (err) {
      item.dom.meta.querySelector('.small').textContent = 'Error';
    }
    // small delay for UX animation
    await new Promise(r=>setTimeout(r,120));
  }

  // enable zip/download all
  downloadZipBtn.disabled = images.filter(x=>x.blob).length === 0;
  processBtn.disabled = false; clearBtn.disabled = false;
  statusLine.textContent = `Done — ${images.length} processed`;
}

// download zip
function downloadAllZip(){
  const zip = new JSZip();
  const valid = images.filter(i=>i.blob);
  if (!valid.length) return;
  downloadZipBtn.disabled = true;
  statusLine.textContent = 'Creating ZIP...';
  valid.forEach(item=>{
    zip.file(item.blob.name, item.blob.blob || item.blob); // item.blob.blob may not exist, but toBlob returned raw blob earlier; we store created blob only as URL + size + name so we need to fetch blob again
  });

  // But we stored only URLs + sizes; convert each URL back to blob by fetch
  Promise.all(valid.map(it => fetch(it.blob.url).then(r=>r.blob()).then(b=>({name:it.blob.name, blob:b}))))
    .then(files => {
      const z = new JSZip();
      files.forEach(f => z.file(f.name, f.blob));
      return z.generateAsync({type:'blob'});
    })
    .then(content => {
      const a = document.createElement('a');
      const url = URL.createObjectURL(content);
      a.href = url; a.download = 'compressed_images.zip';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      statusLine.textContent = 'ZIP ready';
      downloadZipBtn.disabled = false;
    })
    .catch(err => {
      console.error(err);
      statusLine.textContent = 'ZIP error';
      downloadZipBtn.disabled = false;
    });
}

// wire buttons
processBtn.addEventListener('click', processAll);
clearBtn.addEventListener('click', ()=>{
  images.forEach(it=>{ try{ URL.revokeObjectURL(it.thumbnailUrl); if (it.blob) URL.revokeObjectURL(it.blob.url); }catch(e){} });
  images = [];
  fileGrid.innerHTML = '';
  updateStatus();
});
downloadZipBtn.addEventListener('click', downloadAllZip);

// keyboard paste support
window.addEventListener('paste', (ev)=> {
  const items = ev.clipboardData?.items;
  if (!items) return;
  const imgs = [];
  for (const it of items) {
    if (it.type && it.type.startsWith('image/')) {
      const f = it.getAsFile();
      if (f) imgs.push(f);
    }
  }
  if (imgs.length) handleFiles(imgs);
});

// initial UI update
updateStatus();
