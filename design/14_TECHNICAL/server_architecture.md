# SERVER ARCHITECTURE

# Server Modules
- AuthService
- CharacterService
- WorldService
- MapInstanceService
- CombatService (authoritative)
- SkillService
- QuestService
- LootService
- InventoryService
- CraftingService
- AuctionService
- GuildService
- ChatService
- MatchmakingService
- DungeonService
- RaidService
- CashShopService
- LiveOpsService

# Networking Rules
Movement client-predicted, server-reconciled. Damage, loot, quest completion, currency and item mutations are server authoritative.

