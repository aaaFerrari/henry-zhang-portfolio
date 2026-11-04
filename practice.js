'use strict';
function practiceItem(kind,id){return (kind==='drawings'?activeContent().drawings:activeContent().models).find(item=>(item.id||item.archiveId)===id);}
function practiceImage(kind,item){const title=item.displayTitle||item.title;return kind==='drawings'?{src:item.src,alt:item.alt||title,caption:item.displayNumber+' / '+title,width:item.width,height:item.height}:{src:item.cover,alt:title,caption:item.displayNumber+' / '+title};}
function drawingType(item){const type=item.track||item.filter;return ['sketch','color','ink'].includes(type)?type:'sketch';}
function drawingPracticeGroups(){
  const list=activeContent().drawings||[];
  const stages=['early','middle','late'];
  return ['sketch','color','ink'].map(type=>{
    const sameType=list.filter(item=>drawingType(item)===type);
    const items=type==='ink'?sameType:stages.flatMap(stage=>sameType.filter(item=>item.stage===stage)).concat(sameType.filter(item=>!stages.includes(item.stage)));
    return {type,items};
  }).filter(group=>group.items.length);
}
function drawingsForTrack(){return drawingPracticeGroups().flatMap(group=>group.items);}
function drawingCard(item){const i=drawingsForTrack().indexOf(item);const title=item.displayTitle||item.title;return '<figure class="drawing-card" data-work-id="'+esc(item.id)+'"><button class="drawing-frame" type="button" data-image="'+i+'" aria-label="'+t('放大：','Enlarge: ')+esc(item.displayNumber+' / '+title)+'">'+image(item.src,item.alt||title,'loading="lazy" width="'+item.width+'" height="'+item.height+'"')+'</button><figcaption class="drawing-meta"><h3>'+esc(item.displayNumber+' / '+title)+'</h3></figcaption><p>'+esc(item.period)+' · '+esc(item.caption)+'</p></figure>';}
function drawingTypeName(type){return {sketch:t('素描','Sketching'),color:t('色彩','Colour Studies'),ink:t('国画','Chinese Ink Painting')}[type];}
function drawingTypeSections(){
  const stages=activeContent().practiceStages.drawings;
  return drawingPracticeGroups().map(group=>{
    const id='drawing-type-'+group.type;
    const header='<header class="drawing-type-heading"><h2 id="'+id+'">'+esc(drawingTypeName(group.type))+'</h2><p>'+group.items.length+' '+t('件作品','works')+'</p></header>';
    let body;
    if(group.type==='ink'){
      const range=activeContent().timelines?.drawings?.tracks?.ink?.range||group.items[0].period;
      body='<p class="drawing-ink-period"><time>'+esc(range)+'</time></p><div class="unified-drawing-grid">'+group.items.map(drawingCard).join('')+'</div>';
    }else{
      body=stages.map(stage=>{
        const items=group.items.filter(item=>item.stage===stage.id);
        if(!items.length)return '';
        const periodId=id+'-'+stage.id;
        return '<section class="drawing-period" aria-labelledby="'+periodId+'"><header class="drawing-period-heading"><h3 id="'+periodId+'">'+esc(stage.title)+'</h3><p>'+esc(stage.period)+'</p></header><div class="unified-drawing-grid">'+items.map(drawingCard).join('')+'</div></section>';
      }).join('');
      const unplaced=group.items.filter(item=>!stages.some(stage=>stage.id===item.stage));
      if(unplaced.length)body+='<div class="unified-drawing-grid drawing-unplaced">'+unplaced.map(drawingCard).join('')+'</div>';
    }
    return '<section class="drawing-type" aria-labelledby="'+id+'">'+header+body+'</section>';
  }).join('');
}
function practiceStages(kind){if(kind==='drawings')return drawingTypeSections();const data=activeContent();const list=data.models;return data.practiceStages[kind].map((stage,i)=>{const items=list.filter(x=>x.stage===stage.id);return '<section class="practice-stage" aria-labelledby="'+kind+'-'+stage.id+'"><header class="stage-heading"><div><p class="eyebrow">'+num(i+1)+' / '+esc(stage.period)+'</p><h2 id="'+kind+'-'+stage.id+'">'+esc(stage.title)+' · '+esc(stage.subtitle)+'</h2></div><p>'+esc(stage.description)+'</p></header><div class="unified-model-grid">'+modelCards(items)+'</div></section>';}).join('');}
function practiceDownload(kind){return '<a class="pdf-download button-primary" href="'+esc(activeContent().practicePdfs[kind])+'" download>'+t('下载'+(kind==='drawings'?'绘画':'建模练习')+' PDF · 3 页','Download '+(kind==='drawings'?'Drawing':'3D Studies')+' PDF · 3 pages')+' <span aria-hidden="true">↓</span></a>';}
function drawings(){currentImages=drawingsForTrack().map(item=>practiceImage('drawings',item));return '<div class="page-wrap">'+heading('01 / DRAWING',t('绘画 <span class="serif">/ Drawing</span>','<span class="serif">Drawing</span>'),t('素描、色彩与国画按类型集中展示；素描和色彩各自按早期、中期、晚期排列，国画保留原创作时期。','Sketching, colour studies and Chinese ink painting are grouped by medium. Sketching and colour studies each run from early to late; ink paintings are shown together from their original period.'))+'<div class="practice-intro"><p>'+t('27 件作品 · 2020—2022<br>点击作品可放大查看。','27 works · 2020–2022<br>Click an artwork to enlarge.')+'</p>'+practiceDownload('drawings')+'</div><nav class="drawing-group-nav" aria-label="'+t('绘画类型','Drawing media')+'">'+drawingPracticeGroups().map(group=>'<button type="button" data-drawing-anchor="'+group.type+'">'+esc(drawingTypeName(group.type))+'</button>').join('')+'</nav>'+practiceStages('drawings')+'</div>';}
function modelsV2(){return '<div class="page-wrap">'+heading('02 / MODELING',t('建模练习 <span class="serif">/ 3D</span>','3D <span class="serif">Studies</span>'),t('从单体形体与结构，到材质、灯光和完整场景，按早期、中期、晚期呈现三维练习。','From individual forms and structures to materials, lighting and complete environments: 3D studies arranged in three periods.'))+'<div class="practice-intro"><p>'+t('11 项练习 · 2025—2026<br>点击作品查看模型与制作过程。','11 studies · 2025–2026<br>Select a study to view the model and process.')+'</p>'+practiceDownload('models')+'</div>'+practiceStages('models')+'</div>';}
function openPractice(kind,id,opener){const items=kind==='drawings'?drawingsForTrack():activeContent().models;const index=items.findIndex(item=>(item.id||item.archiveId)===id);if(index<0)return;currentImages=items.map(item=>practiceImage(kind,item));viewerIndex=index;lastOpener=opener;updateViewer();dialog.showModal();document.getElementById('viewer-close').focus();}

// In-page medium navigation stays within the hash-routed drawing page.
document.addEventListener('click',event=>{const button=event.target.closest('[data-drawing-anchor]');if(!button)return;const section=document.getElementById('drawing-type-'+button.dataset.drawingAnchor);if(!section)return;section.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});const title=section.querySelector('h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}});
