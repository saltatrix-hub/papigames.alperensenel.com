class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create() {
    this.state = this.registry.get('player') || AstrayaSave.load();
    if (!this.state) {
      this.scene.start('Title');
      return;
    }
    if (this.state.hp == null) this.state.hp = AstrayaSave.stats(this.state).maxHp;
    if (this.state.resource == null) this.state.resource = AstrayaSave.stats(this.state).maxRes;

    this.mapW = 1280;
    this.mapH = 768;
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);

    this.projectiles = this.physics.add.group();
    this.mobs = this.physics.add.group();
    this.npcs = this.add.group();
    this.floats = [];

    this.buildRegion(this.state.region || 'dawnwatch');
    this.spawnPlayer();
    this.bindInput();

    this.physics.add.overlap(this.projectiles, this.mobs, (proj, mob) => {
      if (!proj.active || !mob.active) return;
      this.damageMob(mob, proj.getData('dmg') || 10, proj.getData('crit'));
      if (!proj.getData('pierce')) proj.destroy();
    });

    this.scene.launch('HUD');
    this.events.on('shutdown', () => {
      if (this.scene.isActive('HUD')) this.scene.stop('HUD');
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.regenTick()
    });

    this.announce(`${ASTRAYA.REGIONS[this.regionId].name}`);
  }

  buildRegion(regionId) {
    this.regionId = regionId;
    this.region = ASTRAYA.REGIONS[regionId];
    this.state.region = regionId;

    const sheetByRegion = {
      dawnwatch: 'tiles_grass',
      verdant: 'tiles_grass',
      moonfen: 'tiles_stone'
    };
    const sheet = sheetByRegion[regionId] || 'tiles_grass';
    const pathFrame = 10;
    const waterFrame = 20;
    const groundFrames = [0, 1, 2, 3, 8, 9];

    // Soft map concept / blockout underlay for region identity
    const mapKey = `map_${regionId}`;
    if (this.textures.exists(mapKey)) {
      this.add.image(this.mapW / 2, this.mapH / 2, mapKey).setDisplaySize(this.mapW, this.mapH).setAlpha(0.18).setDepth(0);
    }

    for (let y = 0; y < this.mapH; y += 48) {
      for (let x = 0; x < this.mapW; x += 48) {
        let frame = Phaser.Utils.Array.GetRandom(groundFrames);
        if (Math.hypot(x - 200, y - 180) < 120 && regionId === 'dawnwatch') frame = pathFrame;
        if (y > 500 && y < 580 && x > 300 && x < 900) frame = pathFrame;
        if (regionId === 'moonfen' && ((x + y) % 240 < 48)) frame = waterFrame;
        if (regionId === 'verdant' && x > 900 && y > 500) frame = waterFrame;
        this.add.image(x + 24, y + 24, sheet, frame).setDepth(1);
      }
    }

    // decor
    const decorCount = regionId === 'verdant' ? 28 : 16;
    for (let i = 0; i < decorCount; i++) {
      const x = Phaser.Math.Between(40, this.mapW - 40);
      const y = Phaser.Math.Between(40, this.mapH - 40);
      if (Phaser.Math.Distance.Between(x, y, this.region.spawn.x, this.region.spawn.y) < 100) continue;
      this.add.image(x, y, regionId === 'dawnwatch' && i < 4 ? 'house' : regionId === 'dawnwatch' && i < 6 ? 'ruin' : 'tree').setDepth(y);
    }

    // safe hub glow
    this.add.circle(this.region.spawn.x, this.region.spawn.y, 70, 0xfbbf24, 0.08).setDepth(1);

    // portals
    this.portals = [];
    this.region.portals.forEach((p) => {
      const img = this.add.image(p.x, p.y, 'portal').setDepth(p.y);
      this.tweens.add({ targets: img, scaleX: 1.08, scaleY: 1.08, duration: 900, yoyo: true, repeat: -1 });
      const label = this.add
        .text(p.x, p.y - 44, `${p.label}\nLv.${p.requireLevel}+`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '12px',
          color: '#e9d5ff',
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(999);
      this.portals.push({ ...p, img, label });
    });

    // NPCs
    this.region.npcs.forEach((n) => {
      const body = this.physics.add.image(n.x, n.y, 'npc_base');
      body.setImmovable(true);
      body.setData('npc', n);
      body.setTint(n.color);
      body.setDepth(n.y);
      this.add.image(n.x, n.y + 14, 'shadow').setDepth(n.y - 1);
      this.add
        .text(n.x, n.y - 28, n.name, {
          fontFamily: 'Source Sans 3, sans-serif',
          fontSize: '12px',
          color: '#f8fafc',
          backgroundColor: '#00000088',
          padding: { x: 4, y: 2 }
        })
        .setOrigin(0.5)
        .setDepth(999);
      if (n.questGiver) {
        const mark = this.add.image(n.x, n.y - 44, 'marker_quest').setDepth(999);
        this.tweens.add({ targets: mark, y: n.y - 50, duration: 700, yoyo: true, repeat: -1 });
      }
      this.npcs.add(body);
    });

    // monsters
    this.region.monsters.forEach((def) => {
      for (let i = 0; i < def.count; i++) {
        this.spawnMob(def);
      }
    });

    // boss arena marker + spawn if quest ready or always present
    if (this.region.boss) {
      const b = this.region.boss;
      this.add.circle(b.x, b.y, 80, 0x7c3aed, 0.12).setDepth(1);
      this.add
        .text(b.x, b.y - 70, `BOSS · ${b.name}`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          color: '#fca5a5'
        })
        .setOrigin(0.5)
        .setDepth(999);
      this.spawnBoss(b);
    }
  }

  spawnMob(def, x, y) {
    const px = x ?? Phaser.Math.Between(80, this.mapW - 80);
    const py = y ?? Phaser.Math.Between(80, this.mapH - 80);
    if (Phaser.Math.Distance.Between(px, py, this.region.spawn.x, this.region.spawn.y) < 140) {
      return this.spawnMob(def);
    }
    const mob = this.physics.add.image(px, py, `mob_${def.id}`);
    mob.setCollideWorldBounds(true);
    mob.setDepth(py);
    mob.setData('def', def);
    mob.setData('hp', def.hp);
    mob.setData('maxHp', def.hp);
    mob.setData('id', def.id);
    mob.setData('home', { x: px, y: py });
    mob.setData('atkCd', 0);
    if (def.elite) mob.setScale(1.15);
    this.mobs.add(mob);
    return mob;
  }

  spawnBoss(b) {
    const existing = this.mobs.getChildren().find((m) => m.getData('id') === b.id);
    if (existing) return;
    const mob = this.physics.add.image(b.x, b.y, `mob_${b.id}`);
    mob.setCollideWorldBounds(true);
    mob.setDepth(b.y);
    mob.setData('def', { ...b, boss: true });
    mob.setData('hp', b.hp);
    mob.setData('maxHp', b.hp);
    mob.setData('id', b.id);
    mob.setData('home', { x: b.x, y: b.y });
    mob.setData('atkCd', 0);
    mob.setData('boss', true);
    this.mobs.add(mob);
  }

  spawnPlayer() {
    const stats = AstrayaSave.stats(this.state);
    const x = this.state.x ?? this.region.spawn.x;
    const y = this.state.y ?? this.region.spawn.y;
    this.player = this.physics.add.image(x, y, `player_${this.state.className}`);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(y);
    this.playerShadow = this.add.image(x, y + 16, 'shadow').setDepth(1);
    this.facing = new Phaser.Math.Vector2(1, 0);
    this.attackCd = 0;
    this.invuln = 0;
    this.stealthUntil = 0;
    this.bulwarkUntil = 0;
    this.bastionUntil = 0;
    this.hotUntil = 0;
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.setZoom(1);
  }

  bindInput() {
    this.cursors = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      interact: 'E',
      inventory: 'I',
      heal: 'H',
      skill1: 'ONE',
      skill2: 'TWO',
      skill3: 'THREE',
      skill4: 'FOUR',
      map: 'M'
    });
    this.input.keyboard.addCapture('W,A,S,D,E,I,H,ONE,TWO,THREE,FOUR');

    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) return;
      if (pointer.y > this.scale.height - 90) return;
      this.basicAttack(pointer.worldX, pointer.worldY);
    });
  }

  regenTick() {
    const stats = AstrayaSave.stats(this.state);
    this.state.resource = Math.min(stats.maxRes, this.state.resource + Math.ceil(stats.maxRes * 0.04));
    if (this.hotUntil > this.time.now) {
      this.state.hp = Math.min(stats.maxHp, this.state.hp + Math.ceil(stats.maxHp * 0.04));
    }
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  update(_, dt) {
    if (!this.player || !this.player.active) return;
    const stats = AstrayaSave.stats(this.state);
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown) vx -= 1;
    if (this.cursors.right.isDown) vx += 1;
    if (this.cursors.up.isDown) vy -= 1;
    if (this.cursors.down.isDown) vy += 1;
    const len = Math.hypot(vx, vy) || 1;
    const speed = stats.spd * (this.stealthUntil > this.time.now ? 1.15 : 1);
    this.player.setVelocity((vx / len) * speed, (vy / len) * speed);
    if (vx || vy) this.facing.set(vx / len, vy / len);
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y + 16);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.interact)) this.tryInteract();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.inventory)) this.game.events.emit('astraya-toggle-inv');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.heal)) this.usePotion();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.map)) this.toggleRegionMap();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.skill1)) this.castSkill(0);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.skill2)) this.castSkill(1);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.skill3)) this.castSkill(2);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.skill4)) this.castSkill(3);

    this.attackCd = Math.max(0, this.attackCd - dt);
    this.invuln = Math.max(0, this.invuln - dt);

    this.updateMobs(dt);
    this.checkPortals();

    this.state.x = this.player.x;
    this.state.y = this.player.y;

    if (this.stealthUntil > this.time.now) this.player.setAlpha(0.45);
    else this.player.setAlpha(1);
  }

  updateMobs(dt) {
    const now = this.time.now;
    this.mobs.getChildren().forEach((mob) => {
      if (!mob.active) return;
      const def = mob.getData('def');
      const home = mob.getData('home');
      const dist = Phaser.Math.Distance.Between(mob.x, mob.y, this.player.x, this.player.y);
      const aggro = def.boss ? 280 : 160;
      if (this.stealthUntil > now) {
        mob.setVelocity(0, 0);
        return;
      }
      if (dist < aggro) {
        this.physics.moveToObject(mob, this.player, def.boss ? 70 : 55 + def.level);
        if (dist < (def.ranged ? 140 : 42)) {
          let cd = mob.getData('atkCd') || 0;
          cd -= dt;
          if (cd <= 0) {
            this.hurtPlayer(def.atk);
            mob.setData('atkCd', def.boss ? 900 : 1100);
            if (def.ranged) this.spawnEnemyShot(mob, def.atk * 0.7);
          } else mob.setData('atkCd', cd);
        }
      } else if (Phaser.Math.Distance.Between(mob.x, mob.y, home.x, home.y) > 8) {
        this.physics.moveTo(mob, home.x, home.y, 30);
      } else mob.setVelocity(0, 0);
      mob.setDepth(mob.y);
    });
  }

  spawnEnemyShot(mob, dmg) {
    const bolt = this.physics.add.image(mob.x, mob.y, 'bolt').setTint(0xf87171);
    this.physics.moveToObject(bolt, this.player, 220);
    this.time.delayedCall(900, () => bolt.destroy());
    this.physics.add.overlap(bolt, this.player, () => {
      if (!bolt.active) return;
      this.hurtPlayer(dmg);
      bolt.destroy();
    });
  }

  basicAttack(tx, ty) {
    if (this.attackCd > 0) return;
    const stats = AstrayaSave.stats(this.state);
    const cls = ASTRAYA.CLASSES[this.state.className];
    const isRanged = ['Ranger', 'Mage', 'Priest'].includes(this.state.className);
    this.attackCd = isRanged ? 280 : 380;
    this.facing.set(tx - this.player.x, ty - this.player.y).normalize();

    const crit = Math.random() < 0.12 + this.state.level * 0.005;
    let dmg = Math.floor(stats.atk * (crit ? 1.75 : 1) * Phaser.Math.FloatBetween(0.9, 1.1));

    if (isRanged) {
      const tex = this.state.className === 'Ranger' ? 'arrow' : 'bolt';
      const proj = this.projectiles.create(this.player.x, this.player.y, tex);
      proj.setData('dmg', dmg);
      proj.setData('crit', crit);
      this.physics.moveTo(proj, tx, ty, 380);
      this.time.delayedCall(800, () => proj.destroy());
    } else {
      const slash = this.add.image(this.player.x + this.facing.x * 28, this.player.y + this.facing.y * 28, 'slash');
      slash.setRotation(Math.atan2(this.facing.y, this.facing.x));
      slash.setAlpha(0.9);
      this.tweens.add({ targets: slash, alpha: 0, scale: 1.4, duration: 180, onComplete: () => slash.destroy() });
      this.mobs.getChildren().forEach((mob) => {
        if (!mob.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y);
        if (d < 58) this.damageMob(mob, dmg, crit);
      });
    }
    this.state.resource = Math.min(AstrayaSave.stats(this.state).maxRes, this.state.resource + 2);
  }

  castSkill(index) {
    const cls = ASTRAYA.CLASSES[this.state.className];
    const skill = cls.skills[index];
    if (!skill || this.state.level < skill.level) {
      this.announce(`Requires Lv.${skill ? skill.level : '?'}`);
      return;
    }
    const cdKey = skill.id;
    const readyAt = this.state.skillCd[cdKey] || 0;
    if (this.time.now < readyAt) {
      this.announce(`${skill.name} cooling down`);
      return;
    }
    if (this.state.resource < skill.cost) {
      this.announce(`Not enough ${cls.resource}`);
      return;
    }
    this.state.resource -= skill.cost;
    this.state.skillCd[cdKey] = this.time.now + skill.cd * 1000;
    const stats = AstrayaSave.stats(this.state);
    const dmg = Math.floor(stats.atk * (skill.power || 1));

    switch (skill.kind) {
      case 'dash':
        this.player.x += this.facing.x * 90;
        this.player.y += this.facing.y * 90;
        this.aoeDamage(this.player.x, this.player.y, 70, dmg, true);
        break;
      case 'buff':
        this.bulwarkUntil = this.time.now + 8000;
        this.announce('Bulwark Stance!');
        break;
      case 'cone':
      case 'strike':
        this.aoeDamage(this.player.x + this.facing.x * 40, this.player.y + this.facing.y * 40, skill.range || 70, dmg, skill.id === 'backstab');
        this.flashSlash();
        break;
      case 'aoe':
        this.aoeDamage(this.player.x, this.player.y, skill.range || 90, dmg);
        this.pulse(this.player.x, this.player.y, cls.color);
        break;
      case 'ult':
        this.bastionUntil = this.time.now + 5000;
        this.announce('Last Bastion!');
        break;
      case 'stealth':
        this.stealthUntil = this.time.now + 4000;
        this.announce('Vanished');
        break;
      case 'blink': {
        const target = this.nearestMob(skill.range);
        if (target) {
          this.player.setPosition(target.x - this.facing.x * 30, target.y - this.facing.y * 30);
          this.damageMob(target, dmg, true);
        }
        break;
      }
      case 'roll':
        this.player.x += this.facing.x * 80;
        this.player.y += this.facing.y * 80;
        this.invuln = 250;
        break;
      case 'projectile':
      case 'line': {
        const proj = this.projectiles.create(this.player.x, this.player.y, this.state.className === 'Ranger' ? 'arrow' : 'bolt');
        proj.setData('dmg', dmg);
        proj.setData('pierce', skill.kind === 'line');
        const ptr = this.input.activePointer;
        this.physics.moveTo(proj, ptr.worldX, ptr.worldY, 420);
        this.time.delayedCall(900, () => proj.destroy());
        break;
      }
      case 'ground': {
        const ptr = this.input.activePointer;
        this.pulse(ptr.worldX, ptr.worldY, cls.color);
        this.aoeDamage(ptr.worldX, ptr.worldY, 90, dmg);
        break;
      }
      case 'heal': {
        const heal = Math.floor(stats.maxHp * 0.28);
        this.state.hp = Math.min(stats.maxHp, this.state.hp + heal);
        this.floatText(this.player.x, this.player.y - 30, `+${heal}`, '#4ade80');
        this.add.image(this.player.x, this.player.y - 40, 'heal_cross').setDepth(999);
        break;
      }
      case 'hot':
        this.hotUntil = this.time.now + 8000;
        this.announce('Sanctuary Field');
        this.pulse(this.player.x, this.player.y, 0x4ade80);
        break;
      default:
        this.aoeDamage(this.player.x, this.player.y, 70, dmg);
    }
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  flashSlash() {
    const slash = this.add.image(this.player.x + this.facing.x * 30, this.player.y + this.facing.y * 30, 'slash');
    slash.setRotation(Math.atan2(this.facing.y, this.facing.x));
    this.tweens.add({ targets: slash, alpha: 0, duration: 200, onComplete: () => slash.destroy() });
  }

  pulse(x, y, color) {
    const c = this.add.circle(x, y, 20, color, 0.35).setDepth(50);
    this.tweens.add({ targets: c, radius: 90, alpha: 0, duration: 350, onComplete: () => c.destroy() });
  }

  aoeDamage(x, y, radius, dmg, crit) {
    this.mobs.getChildren().forEach((mob) => {
      if (!mob.active) return;
      if (Phaser.Math.Distance.Between(x, y, mob.x, mob.y) <= radius) {
        this.damageMob(mob, dmg, crit);
      }
    });
  }

  nearestMob(range) {
    let best = null;
    let bestD = range;
    this.mobs.getChildren().forEach((m) => {
      if (!m.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, m.x, m.y);
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    });
    return best;
  }

  damageMob(mob, dmg, crit) {
    const def = mob.getData('def');
    let hp = mob.getData('hp') - dmg;
    mob.setData('hp', hp);
    this.floatText(mob.x, mob.y - 20, `${crit ? 'CRIT ' : ''}${dmg}`, crit ? '#fbbf24' : '#f8fafc');
    mob.setTintFill(0xffffff);
    this.time.delayedCall(80, () => mob.clearTint());
    this.drawMobHp(mob);
    if (hp <= 0) this.killMob(mob);
  }

  drawMobHp(mob) {
    if (mob.hpBar) mob.hpBar.destroy();
    const hp = mob.getData('hp');
    const max = mob.getData('maxHp');
    const g = this.add.graphics().setDepth(1000);
    g.fillStyle(0x000000, 0.5);
    g.fillRect(mob.x - 18, mob.y - 28, 36, 5);
    g.fillStyle(0xef4444, 1);
    g.fillRect(mob.x - 18, mob.y - 28, 36 * Math.max(0, hp / max), 5);
    mob.hpBar = g;
    this.time.delayedCall(800, () => {
      if (mob.hpBar === g) {
        g.destroy();
        mob.hpBar = null;
      }
    });
  }

  killMob(mob) {
    const def = mob.getData('def');
    const id = mob.getData('id');
    if (mob.hpBar) mob.hpBar.destroy();
    const xp = def.xp || 30;
    const gold = Phaser.Math.Between(def.gold[0], def.gold[1]);
    const leveled = AstrayaSave.addXp(this.state, xp);
    this.state.gold += gold;
    this.state.kills[id] = (this.state.kills[id] || 0) + 1;
    this.floatText(mob.x, mob.y - 36, `+${xp} XP`, '#a5b4fc');
    this.announce(`${def.name} defeated · +${gold}g`);
    this.progressQuestKill(id);
    mob.destroy();
    if (leveled) {
      const stats = AstrayaSave.stats(this.state);
      this.state.hp = stats.maxHp;
      this.state.resource = stats.maxRes;
      this.announce(`LEVEL UP! → ${this.state.level}`);
      this.pulse(this.player.x, this.player.y, 0xfacc15);
    }
    // respawn non-boss
    if (!def.boss) {
      this.time.delayedCall(8000, () => {
        if (this.regionId === this.state.region) this.spawnMob(def);
      });
    } else {
      this.time.delayedCall(45000, () => {
        if (this.regionId === this.state.region) this.spawnBoss(def);
      });
    }
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  hurtPlayer(raw) {
    if (this.invuln > 0 || this.stealthUntil > this.time.now) return;
    const stats = AstrayaSave.stats(this.state);
    let dmg = Math.max(1, Math.floor(raw * (100 / (100 + stats.def))));
    if (this.bulwarkUntil > this.time.now) dmg = Math.floor(dmg * 0.8);
    if (this.bastionUntil > this.time.now && this.state.hp - dmg <= 0) {
      this.state.hp = 1;
      this.announce('Bastion holds!');
      return;
    }
    this.state.hp -= dmg;
    this.invuln = 350;
    this.floatText(this.player.x, this.player.y - 24, `-${dmg}`, '#f87171');
    this.cameras.main.shake(80, 0.004);
    if (this.state.hp <= 0) this.onDeath();
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  onDeath() {
    this.announce('You fall… returning to Dawnwatch.');
    this.state.hp = Math.ceil(AstrayaSave.stats(this.state).maxHp * 0.5);
    this.state.gold = Math.max(0, this.state.gold - 10);
    this.state.region = 'dawnwatch';
    this.state.x = ASTRAYA.REGIONS.dawnwatch.spawn.x;
    this.state.y = ASTRAYA.REGIONS.dawnwatch.spawn.y;
    this.persist();
    this.scene.restart();
  }

  usePotion() {
    const pot = this.state.inventory.find((i) => i.id === 'potion_hp' && i.qty > 0);
    if (!pot) {
      this.announce('No Health Potions');
      return;
    }
    pot.qty -= 1;
    const stats = AstrayaSave.stats(this.state);
    const heal = Math.floor(stats.maxHp * 0.4);
    this.state.hp = Math.min(stats.maxHp, this.state.hp + heal);
    this.floatText(this.player.x, this.player.y - 30, `+${heal}`, '#4ade80');
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  tryInteract() {
    // portals first
    for (const p of this.portals) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) < 55) {
        if (this.state.level < p.requireLevel) {
          this.announce(`Need Lv.${p.requireLevel}`);
          return;
        }
        this.travelTo(p.to);
        return;
      }
    }
    // NPCs
    const npcSprite = this.npcs.getChildren().find((n) => Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y) < 56);
    if (npcSprite) {
      this.talkNpc(npcSprite.getData('npc'));
      return;
    }
    this.announce('Nothing to interact with');
  }

  talkNpc(npc) {
    const quest = AstrayaSave.currentQuest(this.state);
    let lines = [`${npc.name} (${npc.role})`];

    if (npc.role === 'Healer') {
      const stats = AstrayaSave.stats(this.state);
      this.state.hp = stats.maxHp;
      this.state.resource = stats.maxRes;
      lines.push('The light restores you. HP and resource filled.');
    } else if (npc.role === 'Merchant') {
      const pot = this.state.inventory.find((i) => i.id === 'potion_hp');
      if (this.state.gold >= 15) {
        this.state.gold -= 15;
        if (pot) pot.qty += 1;
        else this.state.inventory.push({ id: 'potion_hp', name: 'Health Potion', qty: 1, type: 'consumable' });
        lines.push('Bought a Health Potion for 15g.');
      } else lines.push('Health Potions cost 15g. Come back richer.');
    } else if (npc.role === 'Blacksmith') {
      lines.push('Bring me rare ores from Verdant Trail. For now, your steel holds.');
    } else {
      lines.push('The seals tremble. Aid Dawnwatch, and the continent may yet hold.');
    }

    if (quest && quest.objective.kind === 'talk' && quest.objective.target === npc.id) {
      this.state.questProgress += 1;
      if (this.state.questProgress >= quest.objective.count) this.completeQuest(quest);
      lines.push(`Quest updated: ${quest.title}`);
    } else if (quest && quest.region === this.regionId) {
      lines.push(`Current quest: ${quest.title}`);
      lines.push(quest.desc);
    }

    this.game.events.emit('astraya-dialog', lines.join('\n'));
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  progressQuestKill(mobId) {
    const quest = AstrayaSave.currentQuest(this.state);
    if (!quest || quest.objective.kind !== 'kill') return;
    if (quest.objective.target !== mobId) return;
    this.state.questProgress += 1;
    this.announce(`Quest ${this.state.questProgress}/${quest.objective.count}`);
    if (this.state.questProgress >= quest.objective.count) this.completeQuest(quest);
  }

  completeQuest(quest) {
    this.state.completedQuests.push(quest.id);
    AstrayaSave.addXp(this.state, quest.rewards.xp);
    this.state.gold += quest.rewards.gold;
    this.announce(`Quest complete! +${quest.rewards.xp} XP · +${quest.rewards.gold}g`);
    if (quest.next) {
      this.state.questId = quest.next;
      this.state.questProgress = 0;
      const nq = ASTRAYA.QUESTS.find((q) => q.id === quest.next);
      if (nq) this.announce(`New quest: ${nq.title}`);
    } else {
      this.state.questId = null;
      this.announce('Prologue arc complete — seals hold… for now.');
    }
    this.persist();
    this.game.events.emit('astraya-hud');
  }

  travelTo(regionId) {
    const dest = ASTRAYA.REGIONS[regionId];
    this.state.region = regionId;
    this.state.x = dest.spawn.x;
    this.state.y = dest.spawn.y;
    this.persist();
    this.scene.restart();
  }

  checkPortals() {
    // soft hint only; travel on E
  }

  floatText(x, y, msg, color) {
    const t = this.add
      .text(x, y, msg, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '14px',
        color,
        stroke: '#000',
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(2000);
    this.tweens.add({
      targets: t,
      y: y - 28,
      alpha: 0,
      duration: 700,
      onComplete: () => t.destroy()
    });
  }

  announce(msg) {
    this.game.events.emit('astraya-toast', msg);
  }

  toggleRegionMap() {
    if (this.mapOverlay) {
      this.mapOverlay.forEach((o) => o.destroy());
      this.mapOverlay = null;
      return;
    }
    const key = `map_${this.regionId}`;
    const art = this.textures.exists(key) ? key : 'art_world';
    const dim = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72).setScrollFactor(0).setDepth(5000);
    const img = this.add.image(640, 340, art).setDisplaySize(900, 520).setScrollFactor(0).setDepth(5001);
    const title = this.add
      .text(640, 60, `${this.region.name} — Region Map (M to close)`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '22px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5002);
    this.mapOverlay = [dim, img, title];
  }

  persist() {
    AstrayaSave.save(this.state);
    this.registry.set('player', this.state);
  }
}
