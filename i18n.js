'use strict';
// The site works offline; the preference is optional when storage is restricted.
let currentLanguage = 'en';
try { if (localStorage.getItem('henry-portfolio-language') === 'zh') currentLanguage = 'zh'; } catch (_) {}
function t(zh,en){return currentLanguage==='zh'?zh:en;}
function activeContent(){return currentLanguage==='en'&&typeof CONTENT_EN!=='undefined'?CONTENT_EN:CONTENT;}
function updateStaticLanguage(){
 document.documentElement.lang=t('zh-CN','en');
 document.querySelector('.skip-link').textContent=t('跳到主要内容','Skip to content');
 document.querySelector('.brand').setAttribute('aria-label',t('张惟楚 Henry Zhang，返回首页','Henry Zhang, back to home'));
 document.getElementById('brand-name').innerHTML=t('张惟楚<small>HENRY ZHANG / PORTFOLIO</small>','Henry Zhang<small>张惟楚 / PORTFOLIO</small>');
 const nav=document.querySelector('.primary-navigation');nav.setAttribute('aria-label',t('主要导航','Main navigation'));
 const names={drawings:t('绘画','Drawing'),models:t('建模练习','3D Studies'),portfolio:t('作品集','Portfolio'),collaboration:t('合作','Collaboration')};
 nav.querySelectorAll('[data-nav]').forEach((link,index)=>{link.innerHTML='<span>'+String(index+1).padStart(2,'0')+'</span>'+names[link.dataset.nav];});
 document.querySelector('.language-switch').setAttribute('aria-label',t('网站语言','Website language'));
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===currentLanguage)));
 document.getElementById('reading-navigation').setAttribute('aria-label',t('板块翻页','Section navigation'));
 document.getElementById('footer-motto').textContent=t('观察 / 实践 / 持续生长','Observe / Practice / Keep growing');
 document.getElementById('back-top').textContent=t('回到顶部 ↑','Back to top ↑');
 document.getElementById('image-dialog').setAttribute('aria-label',t('图片大图浏览','Image viewer'));
 document.getElementById('viewer-close').setAttribute('aria-label',t('关闭大图','Close image'));
 document.getElementById('viewer-close').innerHTML=t('关闭','Close')+' <span aria-hidden="true">×</span>';
 document.getElementById('viewer-zoom').textContent=t('原尺寸','Actual size');
 document.getElementById('viewer-prev').setAttribute('aria-label',t('上一张图片','Previous image'));
 document.getElementById('viewer-next').setAttribute('aria-label',t('下一张图片','Next image'));
 document.querySelector('.viewer-help').innerHTML=t('← → 切换图片 <span>ESC 关闭</span>','← → Browse images <span>ESC Close</span>');
 const description=t('张惟楚 Henry Zhang，四川大学环境设计本科教育背景。3D 游戏环境、CG 场景、独立游戏开发与概念设计作品档案。','Henry Zhang’s portfolio: 3D game environments, concept art, modeling and game development. Environmental Design graduate, Sichuan University.');
 document.querySelector('meta[name="description"]').content=description;
 document.querySelector('meta[property="og:title"]').content=t('张惟楚 Henry Zhang · 创作档案','Henry Zhang · Art & Game Portfolio');
 document.querySelector('meta[property="og:description"]').content=t('从纸面观察到三维表达，记录绘画、建模与世界构建的创作过程。','An archive of drawing, 3D modeling and worldbuilding, from visual ideas to playable experiences.');
}
function setLanguage(language){
 if(!['en','zh'].includes(language)||language===currentLanguage)return;
 const scrollY=window.scrollY;
 currentLanguage=language;
 try{localStorage.setItem('henry-portfolio-language',language);}catch(_){}
 updateStaticLanguage();
 if(typeof render==='function')render(true,true);
 window.scrollTo({top:scrollY,behavior:'instant'});
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
updateStaticLanguage();
