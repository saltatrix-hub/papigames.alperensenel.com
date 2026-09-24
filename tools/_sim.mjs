import { GDD } from '../js/data/gdd.js';
import * as S from '../js/game/stats.js';
for (const L of [1,5,10,20,30,50,70,85,100]) {
  const g = S.refGear(L);
  const row = GDD.monsters.find(m=>m.level>=L) || GDD.monsters.at(-1);
  const n = S.monsterNumbers({...row, level:L}, 'Normal');
  const out = [];
  for (const c of ['Knight','Mage','Assassin']) {
    const d = S.derive(c, L, S.autoStats(c,L), {atk:g.atk, def:g.def*8, hp:g.def*12, pct:{}}, c==='Mage'?'Mana':'Valor');
    const hitOnMob = d.atk * S.CLASS_KIT[c].attack.coef * S.mitigation(L, n.def);
    const mobHit = n.atk * S.mitigation(L, d.def);
    out.push(`${c}: hp${d.maxHp} atk${d.atk} ttk${(n.maxHp/hitOnMob).toFixed(1)} die${(d.maxHp/mobHit).toFixed(0)}`);
  }
  console.log(`L${L} mob hp${n.maxHp} atk${n.atk} | ${out.join(' | ')} | xp/kill ${S.killXp(L,L,1)} next ${S.xpToNext(L)}`);
}
