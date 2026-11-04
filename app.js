'use strict';
function projectPdfUrl(pdf){return location.protocol==='file:'?pdf.src:(pdf.releaseUrl||pdf.src);}
const main = document.getElementById('main');
const dialog = document.getElementById('image-dialog');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = n => String(n).padStart(2, '0');
const arrow = '<span aria-hidden="true">↗</span>';
let currentImages = [];
let viewerIndex = 0;
let currentFilter = 'all';
let lastOpener;
const image = (src,alt,opts='') => `<img src="${esc(src)}" alt="${esc(alt)}" decoding="async" ${opts}>`;
const heading = (label,title,description) => `<div class="page-heading"><p class="eyebrow">${label}</p><div class="page-heading-row"><h1>${title}</h1><p class="description">${description}</p></div></div>`;
function home(){return homeProfile();}
function portfolio() {
  const data=activeContent();
  return `<div class="page-wrap">${heading('03 / SELECTED PROJECTS',t('作品集 <span class="serif">/ Works</span>','Selected <span class="serif">Works</span>'),t('从游戏设计到世界观与空间表达，四个项目记录不同方向的创作探索。选择一个项目，了解它的故事和制作过程。','Four projects exploring game design, worldbuilding and spatial storytelling. Select a project to discover its story and creative process.'))}<div class="collection-meta"><strong>${t('全部作品','ALL WORKS')} / ${num(data.portfolio.length)} PROJECTS</strong><span>${t('概念 · 过程 · 最终呈现','Concept · Process · Final work')}</span></div><div class="portfolio-grid">${data.portfolio.map((p,i) => `<a class="project-card" href="#/portfolio/${esc(p.slug)}"><div class="card-image">${image(p.cover,p.heroAlt,`loading="eager"`)}<span class="card-num">${num(i+1)}</span><span class="card-open" aria-hidden="true">↗</span></div><div class="card-info"><div><h2>${esc(p.title)}</h2><p class="card-en">${esc(p.subtitle)}</p></div><span class="card-tag">${esc(p.category)}</span></div><p class="card-description">${esc(p.summary)}</p></a>`).join('')}</div></div>`;
}
function models(){return modelsV2();}
function modelCards(items=activeContent().models) {return items.map(m=>`<a class="model-card" href="#/models/${esc(m.slug)}"><div class="card-image">${image(m.cover,m.displayTitle||m.title,'loading="lazy"')}</div><div class="model-title"><h2>${esc(m.displayNumber+' / '+(m.displayTitle||m.title))}</h2><span>${t('查看作品','View study')} ↗</span></div><p>${esc(m.period)} · ${esc(m.subtitle)}</p></a>`).join('');}
function collaboration(){return cypherProject();}
function projectArtwork(im,lead=false){
 const options=(lead?'fetchpriority="high"':'loading="lazy"')+' width="'+(im.width||2000)+'" height="'+(im.height||1125)+'"';
 const [top,right,bottom,left]=im.displayCrop||[0,0,0,0];
 if(!(top||right||bottom||left))return image(im.src,im.alt||im.caption,options);
 const width=im.width-left-right,height=im.height-top-bottom;
 if(!(width>0&&height>0))return image(im.src,im.alt||im.caption,options);
 const style='width:'+(im.width/width*100)+'%;left:'+(-left/width*100)+'%;top:'+(-top/height*100)+'%;';
 return '<span class="portfolio-artwork-window" style="aspect-ratio:'+width+'/'+height+'">'+image(im.src,im.alt||im.caption,options+' class="portfolio-artwork-image" style="'+style+'"')+'</span>';
}
function artworkViewerClip(im){
 const [top,right,bottom,left]=im.displayCrop||[0,0,0,0];
 if(!(top||right||bottom||left)||!im.width||!im.height)return '';
 return 'inset('+(top/im.height*100)+'% '+(right/im.width*100)+'% '+(bottom/im.height*100)+'% '+(left/im.width*100)+'%)';
}
function projectHero(item){
 if(!item.heroDisplayCrop)return image(item.hero||item.cover,item.heroAlt||item.title,'class="detail-hero" fetchpriority="high"');
 const [width,height]=item.heroSize;
 return '<div class="detail-hero detail-hero-cropped">'+projectArtwork({src:item.hero||item.cover,alt:item.heroAlt||item.title,width,height,displayCrop:item.heroDisplayCrop},true)+'</div>';
}
function projectVideo(item){
 const video=item.video;
 return `<section class="project-video project-video-lead" aria-labelledby="project-video-title"><div class="gallery-heading"><div><p class="eyebrow">${t('项目视频','PROJECT FILM')}</p><h2 id="project-video-title">${esc(video.title)}</h2></div><button class="button-primary video-play-button" type="button" data-video-toggle aria-pressed="false"><span aria-hidden="true">▶</span> ${t('播放视频','Play video')}</button></div><video controls playsinline preload="metadata" poster="${esc(video.poster||item.hero||item.cover)}" aria-label="${esc(video.caption)}"><source src="${esc(video.src)}" type="video/mp4">${t('当前浏览器不支持视频播放，可下载后观看。','Your browser cannot play this video. Download it to watch.')}</video><div class="video-caption"><p>${esc(video.caption)}</p><a href="${esc(video.src)}" download>${t('下载视频','Download video')} <span aria-hidden="true">↓</span></a></div></section>`;
}
function detail(type,slug) {
  const isModel = type==='models';
  const list = isModel?activeContent().models:activeContent().portfolio;
  const item = list.find(p=>p.slug===slug);
  if (!item) return notFound();
  const index = list.indexOf(item);
  currentImages = item.images;
  const tags = isModel?[...(item.tags||[item.subtitle]),item.period||t('日期待补充','Date to be added')]:(item.tags||[item.subtitle,t('视觉设计','Visual design')]);
  const info = isModel?t('从结构到呈现','From structure to presentation'):t('项目介绍','Project introduction');
  return `<div class="page-wrap"><header class="detail-header${item.video?' has-project-film':''}"><div><p class="eyebrow">${isModel?'3D STUDY':'PROJECT'} ${num(index+1)} / ${num(list.length)}</p><h1>${esc(item.displayTitle||item.title)}</h1><p class="detail-en">${esc(item.subtitle)}</p>${!isModel&&item.externalUrl?`<div class="detail-title-actions"><a class="button-primary project-game-link" href="${esc(item.externalUrl)}" target="_blank" rel="noopener noreferrer">${t('查看游戏 · itch.io','View game · itch.io')} <span aria-hidden="true">↗</span></a></div>`:''}</div><div class="detail-summary"><p>${esc(item.summary)}</p><div class="tag-list">${tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div></div></header>${item.video?projectVideo(item):projectHero(item)}<section class="detail-info"><h2>${info}</h2><div><p>${esc(item.description||item.summary)}</p><ul><li>${isModel?t('练习图像','Study images'):t('展示图','Project pages')} / ${num(item.images.length)}</li><li>${esc(isModel?item.subtitle:item.category)}</li></ul>${item.facts?.length?`<div class="project-facts">${item.facts.map(f=>`<span>${esc(f)}</span>`).join('')}</div>`:''}${!isModel&&item.pdf?`<div class="project-actions">${item.pdf?`<a class="pdf-download" href="${esc(projectPdfUrl(item.pdf))}" download="${esc(item.pdf.filename)}">${t('下载完整 PDF','Download full PDF')} <span aria-hidden="true">↓</span></a>`:''}</div>`:''}${item.tools?.length?`<p class="project-tools">${t('创作工具','Tools')} / ${esc(item.tools.join(' · '))}</p>`:''}</div></section>${item.sections?.length?`<section class="project-outline" aria-label="${t('项目内容概览','Project overview')}">${item.sections.map((s,i)=>`<article><small>${num(i+1)}</small><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</section>`:''}<div class="gallery-heading"><h2>${isModel?t('作品与过程','Work & process'):t('完整项目展示','Full project')}</h2><p>${t('点击放大，选择「原尺寸」查看细节<br>支持键盘方向键切换','Click an image to enlarge; choose “Actual size” for details.<br>Use the arrow keys to browse.')}</p></div><div class="page-gallery ${isModel?'gallery-models':''}">${item.images.map((im,i)=>`<figure class="page-figure"><button type="button" class="image-button" data-image="${i}" aria-label="${t('放大：','Enlarge: ')}${esc(im.caption)}">${projectArtwork(im)}<span class="zoom-hint">${t('放大查看','Enlarge image')} ↗</span></button><figcaption><span>${num(i+1)} / ${esc(im.caption)}</span><span>${num(i+1)} — ${num(item.images.length)}</span></figcaption></figure>`).join('')}</div></div>`;
}
function notFound(){return `<div class="not-found"><p class="eyebrow">PAGE NOT FOUND</p><h1>${t('这一页暂未收录。','This page is not in the archive.')}</h1><p>${t('可以回到首页，继续浏览创作档案。','Return home to continue exploring the portfolio.')}</p><a class="button-primary" href="#/">${t('返回首页','Back to home')} ↗</a></div>`;}
function updateReadingNavigation(route,isDetail,slug){
 const map={
  home:{next:'#/drawings',nextLabel:t('01 绘画','01 Drawing')},
  drawings:{back:'#/',backLabel:t('返回自我介绍','Back to Introduction'),next:'#/models',nextLabel:t('02 建模练习','02 3D Studies')},
  models:{back:isDetail?'#/models':'#/drawings',backLabel:isDetail?t('返回建模练习','Back to 3D Studies'):t('返回绘画','Back to Drawing'),next:'#/portfolio',nextLabel:t('03 作品集','03 Portfolio')},
  portfolio:{back:isDetail?'#/portfolio':'#/models',backLabel:isDetail?t('返回作品集','Back to Portfolio'):t('返回建模练习','Back to 3D Studies'),next:'#/collaboration',nextLabel:t('04 合作','04 Collaboration')},
  collaboration:{back:'#/portfolio',backLabel:t('返回作品集','Back to Portfolio'),next:'#/',nextLabel:t('自我介绍','Introduction')}
 };
 let config={...(map[route]||{back:'#/',backLabel:t('返回自我介绍','Back to Introduction'),next:'#/drawings',nextLabel:t('01 绘画','01 Drawing')})};
 let action=t('下一板块','Next section');
 if(route==='portfolio'&&isDetail){
  const list=activeContent().portfolio,index=list.findIndex(item=>item.slug===slug);
  if(index>=0&&index<list.length-1){const next=list[index+1];config.next='#/portfolio/'+next.slug;config.nextLabel=t('项目 '+num(index+2),'Project '+num(index+2));action=t('下一个项目','Next project');}
  else if(index===list.length-1){config.next='#/portfolio';config.nextLabel=t('03 作品集','03 Portfolio');action=t('返回作品集','View all projects');}
 }
 const el=document.getElementById('reading-navigation');
 el.innerHTML=(config.back?'<a class="reading-back" href="'+esc(config.back)+'"><span aria-hidden="true">←</span> '+esc(config.backLabel)+'</a>':'<span class="reading-back-placeholder" aria-hidden="true"></span>')+'<a class="reading-next" href="'+esc(config.next)+'"><span>'+action+'</span> '+esc(config.nextLabel)+' <span aria-hidden="true">→</span></a>';
}
function render(initial=false,preserveScroll=false) {
  if(dialog.open) dialog.close();
  const parts = location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const route = parts[0]||'home';
  const valid = ['home','drawings','portfolio','models','collaboration'].includes(route);
  currentImages=[];
  main.innerHTML=!valid?notFound():parts.length>1?(['portfolio','models'].includes(route)?detail(route,parts[1]):notFound()):({home,drawings,portfolio,models,collaboration})[route]();
  updateReadingNavigation(route,parts.length>1,parts[1]);
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const title=main.querySelector('h1')?.textContent.replace(/\s+/g,' ').trim();
  document.title=(route==='home'?t('张惟楚 Henry Zhang · 创作档案','Henry Zhang · Art & Game Portfolio'):route==='collaboration'?'CYPHER · Henry Zhang':title+' · Henry Zhang');
  if(!preserveScroll)window.scrollTo({top:0,behavior:'instant'});
  if(!initial) main.focus({preventScroll:true});
}
function updateViewer() {
  dialog.classList.remove('is-zoomed');
  document.getElementById('viewer-zoom').setAttribute('aria-pressed','false');
  document.getElementById('viewer-zoom').textContent=t('原尺寸','Actual size');
  const im=currentImages[viewerIndex];
  const el=document.getElementById('viewer-image');
  el.src=im.src;el.alt=im.alt||im.caption;
  el.style.clipPath=artworkViewerClip(im);
  document.getElementById('viewer-caption').textContent=`${num(viewerIndex+1)} / ${num(currentImages.length)}　${im.caption}`;
  document.getElementById('viewer-prev').disabled=viewerIndex===0;
  document.getElementById('viewer-next').disabled=viewerIndex===currentImages.length-1;
}
function moveViewer(delta){if(viewerIndex+delta>=0&&viewerIndex+delta<currentImages.length){viewerIndex+=delta;updateViewer();}}
main.addEventListener('click',event=>{
  const videoToggle=event.target.closest('[data-video-toggle]');
  if(videoToggle){const video=videoToggle.closest('.project-video').querySelector('video');if(video.paused){video.play().then(()=>video.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'})).catch(()=>{});}else video.pause();return;}

  const practice=event.target.closest('[data-practice]');
  if(practice){openPractice(practice.dataset.practice,practice.dataset.practiceId,practice);return;}
  const opener=event.target.closest('[data-image]');
  if(opener){const routeNow=location.hash;if(routeNow.startsWith('#/drawings'))currentImages=drawingsForTrack().map(item=>practiceImage('drawings',item));lastOpener=opener;viewerIndex=Number(opener.dataset.image);updateViewer();dialog.showModal();document.getElementById('viewer-close').focus();}
});
for(const eventName of ['play','pause','ended'])main.addEventListener(eventName,event=>{
 const video=event.target;if(video.tagName!=='VIDEO')return;
 const button=video.closest('.project-video')?.querySelector('[data-video-toggle]');if(!button)return;
 const playing=!video.paused&&!video.ended;button.setAttribute('aria-pressed',String(playing));
 button.innerHTML='<span aria-hidden="true">'+(playing?'Ⅱ':'▶')+'</span> '+(playing?t('暂停视频','Pause video'):t('播放视频','Play video'));
},true);
document.getElementById('viewer-close').addEventListener('click',()=>dialog.close());
document.getElementById('viewer-prev').addEventListener('click',()=>moveViewer(-1));
document.getElementById('viewer-next').addEventListener('click',()=>moveViewer(1));
document.getElementById('viewer-zoom').addEventListener('click',()=>{const zoom=dialog.classList.toggle('is-zoomed');document.getElementById('viewer-zoom').setAttribute('aria-pressed',String(zoom));document.getElementById('viewer-zoom').textContent=zoom?t('适应屏幕','Fit to screen'):t('原尺寸','Actual size');});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();moveViewer(-1);}if(event.key==='ArrowRight'){event.preventDefault();moveViewer(1);}});
dialog.addEventListener('close',()=>{if(lastOpener?.isConnected)lastOpener.focus({preventScroll:true});});
document.getElementById('back-top').addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();});
document.getElementById('year').textContent=new Date().getFullYear();
window.addEventListener('hashchange',()=>render());
render(true);
