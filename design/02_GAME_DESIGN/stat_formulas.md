# STAT & COMBAT FORMULAS

## Primary Stats
- STR: physical attack and heavy weapon scaling.
- AGI: mobility, dodge, attack speed.
- DEX: accuracy, critical chance, ranged scaling.
- VIT: HP, physical mitigation.
- INT: magic attack, spell scaling.
- SPI: mana/Faith, healing, magic defense.

## Core Formula Set
- HP = BaseHP(class) + VIT*32 + Level*18 + GearHP
- Mana/Faith = BaseResource + INT*12 + SPI*18 + GearResource
- PhysicalATK = WeaponATK + STR*3.0 + DEX*1.2
- MagicATK = WeaponMATK + INT*3.4 + SPI*1.4
- PhysicalDEF = Armor + VIT*2.2 + STR*0.6
- MagicDEF = MDEF + SPI*2.5 + INT*0.7
- CritChance% = BaseCrit + DEX*0.08 + AGI*0.03
- Dodge% = BaseDodge + AGI*0.07
- FinalPhysicalDamage = RawDamage * 100/(100+TargetDEF) * PvPModifier * EncounterModifier
- FinalMagicDamage = RawMagic * 100/(100+TargetMDEF) * PvPModifier * EncounterModifier

Hard caps: Crit 65%, Dodge 35% PvE / 20% PvP, cooldown reduction 30%, move speed bonus 35% in combat.

