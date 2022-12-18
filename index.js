(()=>{"use strict";var t={850:(t,e,i)=>{i.r(e)},62:function(t,e,i){var s=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))((function(o,n){function r(t){try{h(s.next(t))}catch(t){n(t)}}function a(t){try{h(s.throw(t))}catch(t){n(t)}}function h(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(r,a)}h((s=s.apply(t,e||[])).next())}))},o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.MonsterAi=e.PlayerAI=void 0;const n=i(928),r=o(i(377)),a=i(607);class h{update(t){console.log("raw ai.",t)}}e.default=h,e.PlayerAI=class extends h{update(t){return s(this,void 0,void 0,(function*(){if(t.destructible&&t.destructible.isDead())return;let e=0,i=0;"ArrowLeft"===a.game.lastKey?e=-1:"ArrowRight"===a.game.lastKey?e=1:"ArrowUp"===a.game.lastKey?i=-1:"ArrowDown"===a.game.lastKey&&(i=1),yield this.handleActionKey(t,a.game.lastKey),0==e&&0==i||(yield this.moveOrAttack(t,new r.default(t.pos.x+e,t.pos.y+i)))&&t.fov&&(yield t.computeFov())}))}chooseFromInventory(t){var e,i;return s(this,void 0,void 0,(function*(){a.game.clear(new a.Color(0,0,0));let s="a";for(let o=0;o<(null===(e=(0,n.ensure)(t.container))||void 0===e?void 0:e.inventory.length);o++){const e=null===(i=t.container)||void 0===i?void 0:i.inventory[o];console.log(null==e?void 0:e.name),a.game.drawText(`${s}) ${null==e?void 0:e.name}`,2,2+o,"#FFFFFF"),s=String.fromCharCode(s.charCodeAt(0)+1)}const o=(yield a.game.getch()).charCodeAt(0)-97;if(o>=0&&o<(0,n.ensure)(t.container).inventory.length)return(0,n.ensure)(t.container).inventory[o]}))}handleActionKey(t,e){return s(this,void 0,void 0,(function*(){"g"===e?yield(()=>s(this,void 0,void 0,(function*(){var e,i,s;let o=!1;for(let s=0;s<a.game.actors.length;s++){const n=a.game.actors[s];if(n.pickable&&n.pos.x===t.pos.x&&n.pos.y===t.pos.y){if(n.pickable.pick(n,t)){null===(e=a.game.log)||void 0===e||e.addToLog(`Nostit esineen ${n.name}`,"#999"),o=!0;break}o||null===(i=a.game.log)||void 0===i||i.addToLog("Sinun laukkusi on täynnä.","#999")}}o||null===(s=a.game.log)||void 0===s||s.addToLog("Tässä ei ole mitään poimittavaa.","#999")})))():"i"===e?yield(()=>s(this,void 0,void 0,(function*(){var e;const i=yield this.chooseFromInventory(t);i&&(null===(e=a.game.log)||void 0===e||e.addToLog(`Käytit esineen ${i.name}`,"#999"),(0,n.ensure)(i.pickable).use(i,t))})))():">"==e&&(yield(()=>s(this,void 0,void 0,(function*(){var e,i,s;(null===(e=a.game.level)||void 0===e?void 0:e.stairs.x)===t.pos.x&&(null===(i=a.game.level)||void 0===i?void 0:i.stairs.y)===t.pos.y?a.game.nextLevel():null===(s=a.game.log)||void 0===s||s.addToLog("Tässä ei ole portaita.","#999")})))())}))}moveOrAttack(t,e){var i;return s(this,void 0,void 0,(function*(){const s=e;if(a.game.isWall(s))return!1;for(let i=0;i<a.game.actors.length;i++){const s=a.game.actors[i];if(s.attacker&&s.destructible&&!s.destructible.isDead()&&s.pos.x===e.x&&s.pos.y===e.y)return(0,n.ensure)(t.attacker).attack(t,s),!1}for(let t=0;t<a.game.actors.length;t++){const s=a.game.actors[t];(s.destructible&&s.destructible.isDead()||s.pickable)&&s.pos.x===e.x&&s.pos.y===e.y&&(null===(i=a.game.log)||void 0===i||i.addToLog(`Tässä on ${s.name}.`,"#999"))}return t.pos=e,!0}))}},e.MonsterAi=class extends h{update(t){t.destructible&&t.destructible.isDead()||this.moveOrAttack(t,(0,n.ensure)(a.game.player).pos)}moveOrAttack(t,e){let i=e.x-t.pos.x,s=e.y-t.pos.y;const o=i>0?1:-1,h=s>0?1:-1,l=(0,n.float2int)(Math.sqrt(i*i+s*s));if(l>=2){i=(0,n.float2int)(i/l),s=(0,n.float2int)(s/l);const e=new r.default(t.pos.x+i,t.pos.y+s),c=new r.default(t.pos.x+o,t.pos.y),d=new r.default(t.pos.x,t.pos.y+o);a.game.canWalk(e)?(t.pos.x+=i,t.pos.y+=s):a.game.canWalk(c)?t.pos.x+=o:a.game.canWalk(d)&&(t.pos.y+=h)}}}},354:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Attacker=void 0;const s=i(607);e.Attacker=class{constructor(t){this.power=t}attack(t,e){var i,o;e.destructible&&!e.destructible.isDead()&&(this.power-e.destructible.defense>0?null===(i=s.game.log)||void 0===i||i.addToLog(`${t.name} hyökkää. ${e.name} ottaa ${this.power} vahinkoa`,"#999"):null===(o=s.game.log)||void 0===o||o.addToLog(`${t.name} hyökkää, mutta ${e.name} väistää iskun.`,"#999"),e.destructible.TakeDamage(e,this.power))}}},693:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Container=void 0,e.Container=class{constructor(t){this.size=t,this.inventory=[]}add(t){return!(this.inventory.length>=this.size||(this.inventory.push(t),0))}remove(t){for(let e=0;e<this.inventory.length;e++)if(this.inventory[e]===t)return this.inventory.splice(e,1),!0;return!1}}},151:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.ItemDestructible=e.PlayerDestructible=e.MonsterDestructible=e.Destructible=void 0;const s=i(607);class o{constructor(t,e,i){this.maxHP=t,this.HP=t,this.defense=e,this.corpseName=i}isDead(){return this.HP<0}TakeDamage(t,e){return(e=this.defense)>0?(this.HP-=e,this.HP<=0&&this.Die(t)):e=0,e}Heal(t){return this.HP+=t,this.HP>=this.maxHP&&(t-=this.HP-this.maxHP,this.HP=this.maxHP),t}Die(t){t.ch="%",t.color="#800000",t.name=this.corpseName,t.blocks=!1,s.game.sendToBack(t)}}e.Destructible=o,e.MonsterDestructible=class extends o{constructor(t,e,i){super(t,e,i)}Die(t){var e;null===(e=s.game.log)||void 0===e||e.addToLog(`${t.name} kuoli`,"#999"),super.Die(t)}},e.PlayerDestructible=class extends o{constructor(t,e,i){super(t,e,i)}Die(t){var e;null===(e=s.game.log)||void 0===e||e.addToLog("Sinä kuolit","#900"),super.Die(t)}},e.ItemDestructible=class extends o{constructor(t,e,i){super(t,e,i)}Die(t){var e;null===(e=s.game.log)||void 0===e||e.addToLog(`${t.name} räjähti!`,"#999"),super.Die(t)}}},915:function(t,e,i){var s=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))((function(o,n){function r(t){try{h(s.next(t))}catch(t){n(t)}}function a(t){try{h(s.throw(t))}catch(t){n(t)}}function h(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(r,a)}h((s=s.apply(t,e||[])).next())}))},o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.FieldOfView=void 0;const n=i(928),r=o(i(377)),a=i(607);e.FieldOfView=class{constructor(t,e){this.width=t,this.height=e,this.tiles=new Array(this.width*this.height).fill(0)}setInFov(t,e){t.x>=0&&t.y>=0&&t.x<this.width&&t.y<this.height&&(this.tiles[t.x+t.y*this.width]=e)}isInFov(t){return t.x>=0||t.y>=0||t.x<this.width||t.y<this.height?this.tiles[t.x+t.y*this.width]:0}clearLos(){return s(this,void 0,void 0,(function*(){for(let t=0;t<this.width*this.height;t++)this.tiles[t]=0}))}calculate(t,e){return s(this,void 0,void 0,(function*(){for(let t=0;t<this.width*this.height;t++)2==this.tiles[t]&&(this.tiles[t]=1);for(let i=0;i<360;i++){let s=t.pos.x+.5,o=t.pos.y+.5;this.setInFov(new r.default((0,n.float2int)(s),(0,n.float2int)(o)),2);const h=Math.sin(i/180*3.1416),l=Math.cos(i/180*3.1416);for(let t=0;t<e;t++){s+=h,o+=l;const t=new r.default((0,n.float2int)(s),(0,n.float2int)(o));if(this.setInFov(new r.default((0,n.float2int)(s),(0,n.float2int)(o)),2),a.game.isWall(t))break}}}))}}},339:function(t,e,i){var s=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))((function(o,n){function r(t){try{h(s.next(t))}catch(t){n(t)}}function a(t){try{h(s.throw(t))}catch(t){n(t)}}function h(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(r,a)}h((s=s.apply(t,e||[])).next())}))},o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});const n=o(i(377)),r=i(607);e.default=class{constructor(t,e,i){this.name=t,this.ch=e,this.color=i,this.pos=new n.default(1,1),this.blocks=!0,this.fovOnly=!0,this.blockFov=!1}update(){return s(this,void 0,void 0,(function*(){this.ai&&(yield this.ai.update(this))}))}computeFov(){return s(this,void 0,void 0,(function*(){this.fov&&this.fov.calculate(this,10)}))}getDistance(t){const e=this.pos.x-t.x,i=this.pos.y-t.y;return Math.sqrt(e*e+i*i)}Render(){var t;const e=(null===(t=r.game.player)||void 0===t?void 0:t.fov)&&r.game.player.fov.isInFov(this.pos);(2===e||0!=e&&1==this.blockFov)&&r.game.drawChar(this.ch,this.pos.x,this.pos.y,this.color)}}},678:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.LightningBold=e.Healer=e.Pickable=void 0;const s=i(607);class o{pick(t,e){return!(!e.container||!e.container.add(t)||(s.game.removeActor(t),0))}use(t,e){return!!e.container&&(e.container.remove(t),!0)}}e.Pickable=o,e.Healer=class extends o{constructor(t){super(),this.amount=t}use(t,e){return!!(e.destructible&&e.destructible.Heal(this.amount)>0)&&super.use(t,e)}},e.LightningBold=class extends o{constructor(t,e){super(),this.range=t,this.damage=e}use(t,e){var i,o,n;const r=s.game.getClosestEnemy(e.pos,this.range);return r?(null===(o=s.game.log)||void 0===o||o.addToLog(`Salama iskee ja ${r.name} ottaa ${this.damage} verran vahinkoa`,"#999"),null===(n=r.destructible)||void 0===n||n.TakeDamage(r,this.damage),super.use(t,e)):(null===(i=s.game.log)||void 0===i||i.addToLog("Ei yhtään vihollista tarpeeksi lähellä.","#999"),!1)}}},607:function(t,e,i){var s=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))((function(o,n){function r(t){try{h(s.next(t))}catch(t){n(t)}}function a(t){try{h(s.throw(t))}catch(t){n(t)}}function h(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(r,a)}h((s=s.apply(t,e||[])).next())}))},o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.game=e.Game=e.Color=void 0,i(850);const n=o(i(339)),r=i(62),a=i(354),h=i(693),l=i(151),c=i(915),d=i(678),u=o(i(933)),f=i(928),v=i(5);class p{constructor(t,e,i){this.r=0,this.g=0,this.b=0,this.r=t,this.g=e,this.b=i}}e.Color=p;class g{constructor(){this.fontSize=12,this.masterSeed=0,this.depth=0,this.canvas=(0,f.ensure)(document.querySelector("#screen")),this.ctx=(0,f.ensure)(this.canvas.getContext("2d")),this.ctx.font=`${this.fontSize}px system-ui`,this.width=1024,this.height=512,this.lastKey="",this.actors=[],this.log=new v.Log(10)}clear(t){this.ctx.fillStyle=(0,f.rgbToHex)(t.r,t.g,t.b),this.ctx.fillRect(0,0,this.width,this.height)}putPixel(t,e,i){const s=this.ctx.getImageData(0,0,this.width,this.height),o=4*(e*s.width+t),n=s.data;n[o]=i.r,n[o+1]=i.g,n[o+2]=i.b,n[o+3]=255,this.ctx.putImageData(s,0,0)}renderVersion(){const t="Commit ID: 5e47ec9 | Version: v0.0.000001";this.drawText(`${t}`,80-t.length,this.ctx.canvas.height/this.fontSize-2,"#808080")}drawChar(t,e,i,s="#BBB"){e<0||i<0||(e+1)*this.fontSize>=this.width||(i+1)*this.fontSize>=this.height||(this.ctx.textAlign="center",this.ctx.fillStyle="#100A14",this.ctx.fillRect(e*this.fontSize-this.fontSize/2,i*this.fontSize,this.fontSize,this.fontSize),this.ctx.fillStyle=s,this.ctx.fillText(t,e*this.fontSize,i*this.fontSize+this.fontSize))}drawText(t,e,i,s="#909090"){for(let o=0;o<t.length;o++)this.drawChar(t.charAt(o),e+o,i,s)}waitingKeypress(){return new Promise((t=>{const i=o=>s(this,void 0,void 0,(function*(){o.key&&(e.game.lastKey=o.key),document.removeEventListener("keydown",i),t()}));document.addEventListener("keydown",i)}))}getch(){return s(this,void 0,void 0,(function*(){yield this.waitingKeypress();const t=this.lastKey;return this.lastKey="",t}))}render(){var t,e;this.clear(new p(3,3,5)),null===(t=this.level)||void 0===t||t.render();for(let t=0;t<this.actors.length;t++)this.actors[t].Render();null===(e=this.log)||void 0===e||e.render(),this.renderVersion()}getClosestEnemy(t,e){let i,s=1e4;for(let o=0;o<this.actors.length;o++){const n=this.actors[o],r=n.getDistance(t);r<s&&(r<=e||0===e)&&n!==this.player&&(s=r,i=n)}return i}removeActor(t){this.actors=this.actors.filter((e=>e!==t))}sendToBack(t){this.removeActor(t),this.actors.unshift(t)}isWall(t){return(0,f.ensure)(this.level).isWall(t.x,t.y)}canWalk(t){if(1==this.isWall(t))return!1;for(let e=0;e<this.actors.length;e++)if(this.actors[e].blocks&&this.actors[e].pos===t)return!1;return!0}gameLoop(){return s(this,void 0,void 0,(function*(){for((0,f.ensure)(this.player).computeFov(),this.render();;){this.lastKey=yield this.getch(),yield(0,f.ensure)(this.player).update();for(let t=0;t<this.actors.length;t++)this.actors[t]!=this.player&&(yield this.actors[t].update());this.render()}}))}addUnit(t,e,i,s,o){const r=new n.default(t,s,o);r.pos.x=e,r.pos.y=i,this.actors.push(r)}addItem(t,e,i){let s,o="#808080",n="?",r=!1;"Healing potion"===t?(o="#FF00FF",n="!",s=new d.Healer(10)):"Scroll of lightning bolt"===t?(o="#FFAA00",n="#",s=new d.LightningBold(10,15)):"Stairs"===t&&(o="#FFFFFF",n=">",r=!0),this.addUnit(t,e,i,n,o);const a=this.actors[this.actors.length-1];a.blockFov=r,s&&(a.pickable=s),this.sendToBack(a)}addAI(t,e,i){let s="#808080",o="?",n=10,d=2;const u="carcass of "+t;let v=1;if("Hero"===t)return s="#FFF",o="@",n=15,d=5,v=5,this.addUnit(t,e,i,o,s),this.player=this.actors[this.actors.length-1],this.player.destructible=new l.PlayerDestructible(n,d,u),this.player.attacker=new a.Attacker(v),(0,f.ensure)(this.player).ai=new r.PlayerAI,this.player.container=new h.Container(26),this.player.fov=new c.FieldOfView((0,f.ensure)(this.level).width,(0,f.ensure)(this.level).height),void(this.player.pos=(0,f.ensure)(this.level).startPosition);"Orc"===t&&(o="O",s="#00FF00",n=7,d=2,v=2),this.addUnit(t,e,i,o,s);const p=this.actors[this.actors.length-1];p.ai=new r.MonsterAi,p.attacker=new a.Attacker(v),p.destructible=new l.MonsterDestructible(n,d,u)}init(){this.level=new u.default(80,40)}nextLevel(){var t,e,i,o,n;return s(this,void 0,void 0,(function*(){null===(t=this.log)||void 0===t||t.addToLog("Menit yhden tason alemmas.","#999"),this.level=void 0;const s=this.player;this.actors=[],this.level=new u.default(80,40),this.depth++,null===(e=this.level)||void 0===e||e.generateMap(this.masterSeed,this.depth),this.actors.push(s),(0,f.ensure)(this.player).pos=(0,f.ensure)(this.level).startPosition,yield null===(o=null===(i=this.player)||void 0===i?void 0:i.fov)||void 0===o?void 0:o.clearLos(),this.addItem("Stairs",(0,f.ensure)(this.level).stairs.x,(0,f.ensure)(this.level).stairs.y),yield null===(n=this.player)||void 0===n?void 0:n.computeFov()}))}newGame(){var t;if(this.masterSeed=(0,f.float2int)(134217727*Math.random()),window.location.search){const t=new URLSearchParams(window.location.search);t.has("seed")&&(this.masterSeed=parseInt((0,f.ensure)(t.get("seed"))))}history.pushState({},"Dungeon of Slan",`/DungeonOfSlan/?seed=${this.masterSeed}`),null===(t=this.level)||void 0===t||t.generateMap(this.masterSeed,this.depth),this.addAI("Hero",4,12),this.addAI("Orc",14,12),this.addItem("Healing potion",6,6),this.addItem("Scroll of lightning bolt",10,6),this.addItem("Stairs",(0,f.ensure)(this.level).stairs.x,(0,f.ensure)(this.level).stairs.y)}load(){this.newGame()}run(){return s(this,void 0,void 0,(function*(){this.init(),this.load(),yield this.gameLoop()}))}}e.Game=g,e.game=new g,e.game.run()},634:function(t,e,i){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});const o=s(i(262)),n=i(928),r=s(i(451)),a=s(i(357)),h=new r.default;e.default=class{constructor(t,e,i,s,o=5){this.maxLevel=o,this.rootContainer=new a.default(t+1,e+1,i-2,s-2),this.rows=s,this.cols=i,this.corridos=[],this.tempRooms=[],this.tree=this.Devide(this.rootContainer,0),this.rooms=this.tree.GetLeafs(),this.CreateRooms(),this.ConnectRooms(this.tree,this.corridos)}RandomSplit(t){let e,i,s=!h.getInt(0,1);if(s=t.w>t.h&&t.w/t.h>=.05,s){const s=h.getInt(.3*t.w,.6*t.w);e=new a.default(t.x,t.y,s,t.h),i=new a.default(t.x+s,t.y,t.w-s,t.h)}else{const s=h.getInt(.3*t.h,.6*t.h);e=new a.default(t.x,t.y,t.w,s),i=new a.default(t.x,t.y+s,t.w,t.h-s)}return[e,i]}Devide(t,e){const i=new o.default(t);if(e<this.maxLevel&&t.w>=10&&t.h>=10){const s=this.RandomSplit(t);i.A=this.Devide(s[0],e+1),i.B=this.Devide(s[1],e+1)}return i}CreateRooms(){for(const t of this.rooms){const e=h.getInt(.8*t.w,.9*t.w),i=h.getInt(.8*t.h,.9*t.h),s=h.getInt(t.x,t.x+t.w-e),o=h.getInt(t.y,t.y+t.h-i),n=new a.default(s,o,e,i);this.tempRooms.push(n)}}IsThereRoom(t,e){for(const i of this.tempRooms)if(t>=i.x&&e>=i.y&&t<=i.w&&e<=i.h)return!0;return!1}ConnectRooms(t,e){if(!t.A||!t.B)return!1;const i=(0,n.float2int)(t.A.leaf.GetCenterX()),s=(0,n.float2int)(t.A.leaf.GetCenterY()),o=(0,n.float2int)(t.B.leaf.GetCenterX()),r=(0,n.float2int)(t.B.leaf.GetCenterY());e.push(new a.default(i-1,s-1,o-1,r-1)),this.ConnectRooms((0,n.ensure)(t.A),e),this.ConnectRooms((0,n.ensure)(t.B),e)}}},262:function(t,e,i){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});const o=s(i(357));class n extends o.default{constructor(t){super(t.x,t.y,t.w,t.h),this.A=void 0,this.B=void 0,this.leaf=t}GetLeafs(){return this.A&&this.B?[...this.A.GetLeafs(),...this.B.GetLeafs()]:[this.leaf]}}e.default=n},933:function(t,e,i){var s=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))((function(o,n){function r(t){try{h(s.next(t))}catch(t){n(t)}}function a(t){try{h(s.throw(t))}catch(t){n(t)}}function h(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(r,a)}h((s=s.apply(t,e||[])).next())}))},o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.random=void 0;const n=i(928),r=o(i(451)),a=o(i(357)),h=o(i(377)),l=i(607),c=o(i(634));var d;!function(t){t[t.unused=0]="unused",t[t.floor=1]="floor",t[t.wall=2]="wall"}(d||(d={}));class u{constructor(){this.x=0,this.y=0,this.distance=0,this.last=!1}}class f{constructor(){this.type=d.unused,this.collide=!1,this.color="#000000",this.character="?"}}e.random=new r.default,e.default=class{constructor(t,e){this.ROOM_MIN_SIZE=4,this.depth=0,this.levelSeed=0,this.width=t,this.height=e,this.dungeonName="Unknow dungeon",this.tiles=new Array(this.width*this.height).fill(!1),this.pathMap=new Array(this.width*this.height),this.nodeTemp=[],this.nodes=[],this.startPosition=new h.default(1,1),this.stairs=new h.default(1,1)}isWall(t,e){if(t>=0&&t<=this.width&&e>=0&&e<=this.height){const i=t+e*this.width;return this.tiles[i].collide}return!1}setWall(t,e){t=(0,n.float2int)(t),e=(0,n.float2int)(e),this.tiles[t+e*this.width].collide=!0,this.tiles[t+e*this.width].type=d.wall}setFloor(t,e){t=(0,n.float2int)(t),e=(0,n.float2int)(e),this.tiles[t+e*this.width].collide=!1,this.tiles[t+e*this.width].type=d.floor}dig(t,e,i,s){for(let o=e;o<e+s;o++)for(let e=t;e<t+i;e++)this.setFloor(e,o)}makeWalls(t,e,i,s){const o=s-e,n=i-t;this.dig(t,e,n,o);for(let s=0;s<=o;s++)this.setWall(t,e+s),this.setWall(i,e+s);for(let i=0;i<=n;i++)this.setWall(t+i,e),this.setWall(t+i,s)}fillUnusedTiles(){for(let t=0;t<this.height;t++)for(let e=0;e<this.width;e++){const i=e+t*this.width;this.tiles[i].type===d.unused&&this.setWall(e,t)}}makeDoorHole(t,e,i,s,o){0==o&&(this.setFloor(t-1,e+s/2),this.setFloor(t,e+s/2),this.setFloor(t+1,e+s/2)),1==o&&(this.setFloor(t+i-1,e+s/2),this.setFloor(t+i,e+s/2),this.setFloor(t+i+1,e+s/2)),2==o&&(this.setFloor(t+i/2,e-1),this.setFloor(t+i/2,e),this.setFloor(t+i/2,e+1)),3==o&&(this.setFloor(t+i/2,e+s-1),this.setFloor(t+i/2,e+s),this.setFloor(t+i/2,e+s+1))}createNaivePath(t,e,i,s){let o=t,n=e;for(;o<i?o++:o>i?o--:n<s?n++:n>s&&n--,o!=i||n!=s;)this.setFloor(o,n)}setPathStart(t,e){return s(this,void 0,void 0,(function*(){const i=this.convertXYtoID(t,e);i>=0&&i<this.width*this.height&&(this.pathMap[i]=1)}))}convertXYtoID(t,e){return t+e*this.width}createPath(t,e,i,s,o){this.nodes=[];for(let t=0;t<this.width*this.height;t++)this.pathMap[t]=this.tiles[t].collide?-1:0;this.setPathStart(t,e);let n=!1,r=0;for(let a=0;a<o;a++)for(let o=t-(a+1);o<t+a+1;o++)for(let t=e-(a+1);t<e+a+1;t++)o<0||t<0||o>=this.width-1||t>=this.height-1||this.pathMap[this.convertXYtoID(o,t)]===a&&(0===this.pathMap[this.convertXYtoID(o-1,t)]&&(this.pathMap[this.convertXYtoID(o-1,t)]=a+1),0===this.pathMap[this.convertXYtoID(o+1,t)]&&(this.pathMap[this.convertXYtoID(o+1,t)]=a+1),0===this.pathMap[this.convertXYtoID(o,t-1)]&&(this.pathMap[this.convertXYtoID(o,t-1)]=a+1),0===this.pathMap[this.convertXYtoID(o,t+1)]&&(this.pathMap[this.convertXYtoID(o,t+1)]=a+1),o===i&&t===s&&(n=!0),r++);if(0==n)return 1;let a=i,h=s;for(let t=0;t<r;t++){const t=this.convertXYtoID(a,h),e=a,i=h;if(this.pathMap[this.convertXYtoID(a-1,h)]===this.pathMap[t]-1&&a--,this.pathMap[this.convertXYtoID(a+1,h)]===this.pathMap[t]-1&&a++,this.pathMap[this.convertXYtoID(a,h-1)]===this.pathMap[t]-1&&h--,this.pathMap[this.convertXYtoID(a,h+1)]===this.pathMap[t]-1&&h++,e!==a||i!==h){const e=new u;e.x=a,e.y=h,e.distance=this.pathMap[t],this.nodes.push(e)}}return 0}generateMap(t,i){return s(this,void 0,void 0,(function*(){this.depth=i,this.levelSeed=t,this.nodeTemp=[],e.random.setSeed(this.levelSeed+25*i),this.generateName(),this.tiles=new Array(this.width*this.height).fill(!1);for(let t=0;t<this.width*this.height;t++)this.tiles[t]=new f;const s=new c.default(3,3,this.width-4,this.height-4,8);for(let t=0;t<s.rooms.length;t++){const i=s.tempRooms[t],o=new a.default(i.x,i.y,i.w,i.h);this.makeWalls(o.x,o.y,o.x+o.w,o.y+o.h),this.makeDoorHole(o.x,o.y,o.w,o.h,e.random.getInt(0,4))}const o=[];for(let t=0;t<s.corridos.length;t++){const e=s.corridos[t];this.nodes=[],this.createPath(e.x,e.y,e.w,e.h,128),0==this.nodes.length&&o.push(e);for(let t=0;t<this.nodes.length;t++)this.nodeTemp.push(this.nodes[t])}for(let t=0;t<this.nodeTemp.length;t++){const e=this.nodeTemp[t];this.setFloor(e.x,e.y)}for(let t=0;t<o.length;t++){const e=o[t];this.createNaivePath(e.x,e.y,e.w,e.h)}this.fillUnusedTiles();const r=e.random.getInt(0,s.rooms.length),h=s.rooms[r];for(this.startPosition.x=(0,n.float2int)(h.GetCenterX()),this.startPosition.y=(0,n.float2int)(h.GetCenterY());;){const t=e.random.getInt(0,s.rooms.length);if(t!=r){const e=s.rooms[t];this.stairs.x=(0,n.float2int)(e.GetCenterX()),this.stairs.y=(0,n.float2int)(e.GetCenterY());break}}}))}generateName(){const t=["Cave","Grotto","Cavern","Dungeon","Crypt","Church","Temple"];this.dungeonName="The "+t[e.random.getInt(0,t.length)]+" of "+["Fear","Death","Shadows","Darkness","Misery","Pain","Hatred","Madness","Nightmares","Despair"][e.random.getInt(0,t.length)]}render(){var t,e;for(let i=0;i<this.height;i++)for(let s=0;s<this.width;s++){const o=null===(e=null===(t=l.game.player)||void 0===t?void 0:t.fov)||void 0===e?void 0:e.isInFov(new h.default(s,i));2===o?1==this.tiles[s+i*this.width].collide?l.game.drawChar("#",s,i,"#999"):l.game.drawChar(".",s,i,"#999"):1===o&&(1==this.tiles[s+i*this.width].collide?l.game.drawChar("*",s,i,"#999"):l.game.drawChar(" ",s,i,"#999"))}}}},928:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.float2int=e.rgbToHex=e.ensure=void 0,e.ensure=(t,e="This value was promised to be there.")=>{if(null==t)throw new TypeError(e);return t},e.rgbToHex=(t,e,i)=>"#"+((1<<24)+(t<<16)+(e<<8)+i).toString(16).slice(1),e.float2int=t=>t>>0},5:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Log=e.LogText=void 0;const s=i(928),o=i(607);class n{constructor(t,e){this.text=t,this.color=e,this.amount=1}}e.LogText=n,e.Log=class{constructor(t){this.size=t,this.currentSize=this.size,this.texts=[],this.decayTimeMax=10,this.decayTime=this.decayTimeMax}updateDecay(){this.decayTime=this.decayTimeMax,this.currentSize++,this.currentSize>=this.size&&(this.currentSize=this.size)}addToLog(t,e){if(this.texts.length>0&&t===this.texts[this.texts.length-1].text)return this.texts[this.texts.length-1].amount++,void this.updateDecay();const i=new n(t,e);this.texts.push(i),this.updateDecay()}render(){let t=0;this.decayTime<0&&(this.currentSize--,this.currentSize<0&&(this.currentSize=0));for(let e=this.texts.length-this.currentSize;e<this.texts.length;e++)if(e>=0){const i=this.texts.length-t-1,n=1===this.texts[i].amount?this.texts[i].text:this.texts[i].text+` (${this.texts[i].amount})`;o.game.drawText(n,1,(0,s.ensure)(o.game.level).height-t,this.texts[e].color),t++}this.decayTime--}}},451:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0});const s=i(928);let o=0;e.default=class{constructor(){this.rnd=0}setSeed(t){o=t}calc(){o=(9301*o+49297)%233280,this.rnd=o/233280}getInt(t,e){return e=e||1,t=t||0,this.calc(),Math.floor(t+this.rnd*(e-t))}dice(t,e,i=0){let s=0;e++;for(let i=0;i<t;i++)s+=Number(this.getInt(1,e));return s+=+i,s<t&&(s=t),s}parseDice(t){const e=t.includes("+")?parseInt((0,s.ensure)(t.split("+").at(1))):0,[i,o]=t.split("d");return[parseInt(i),parseInt(o),e]}}},357:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.default=class{constructor(t,e,i,s){this.x=t,this.y=e,this.w=i,this.h=s}GetHalfDimensionX(){return this.w/2}GetHalfDimensionY(){return this.h/2}GetCenterX(){return this.x+this.GetHalfDimensionX()}GetCenterY(){return this.y+this.GetHalfDimensionY()}}},377:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.default=class{constructor(t,e){this.x=t,this.y=e}}}},e={};function i(s){var o=e[s];if(void 0!==o)return o.exports;var n=e[s]={exports:{}};return t[s].call(n.exports,n,n.exports,i),n.exports}i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i(607)})();