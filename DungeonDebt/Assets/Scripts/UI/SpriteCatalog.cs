using System.Collections.Generic;
using UnityEngine;

// Presentation-only id->Sprite lookup for the combat view. Holds no run,
// combat, shop, or data state and never mutates game state — views query it
// by stable id only. Per IMPLEMENTATION_PLAN.md §15 (M10.3 Option A) this is
// a scene MonoBehaviour, not a ScriptableObject, so the locked "No
// ScriptableObjects" rule stays intact.
public class SpriteCatalog : MonoBehaviour
{
    [System.Serializable]
    private struct SpriteSlot
    {
        public string Id;
        public Sprite Sprite;
    }

    // Canonical ids from Assets/Art/SPRITE_CHECKLIST.md (locked roster). Used
    // to self-seed empty inspector lists so the slots appear ready to assign
    // when the component is added in the Editor; no PNGs are required for the
    // catalog to compile and run (missing art falls back to the card box).
    private static readonly string[] HeroIds =
    {
        "warrior", "knight", "golem", "wizard", "ninja", "ranger",
        "priest", "bard", "enchanter", "squire", "treasurer", "apprentice"
    };

    private static readonly string[] EnemyIds =
    {
        "slime", "training_dummy", "cave_bat", "goblin_thief", "tax_collector",
        "backline_bat", "debt_wraith", "treasure_leech", "dungeon_auditor",
        "greedy_tank", "greedy_carry", "carry_protector", "carry_carry",
        "frugal_guard", "frugal_archer", "frugal_healer",
        "imp", "soul_broker", "gloom_bat", "hoard_fiend", "brimstone_brute",
        "infernal_auditor"
    };

    private static readonly string[] EffectIds =
    {
        "melee_stab", "arrow", "fireball", "heal", "enchant"
    };

    [SerializeField] private List<SpriteSlot> _heroSprites = new List<SpriteSlot>();
    [SerializeField] private List<SpriteSlot> _enemySprites = new List<SpriteSlot>();
    [SerializeField] private List<SpriteSlot> _effectSprites = new List<SpriteSlot>();

    private Dictionary<string, Sprite> _heroLookup;
    private Dictionary<string, Sprite> _enemyLookup;
    private Dictionary<string, Sprite> _effectLookup;

    public Sprite GetHeroSprite(string id)
    {
        return Resolve(ref _heroLookup, _heroSprites, id);
    }

    public Sprite GetEnemySprite(string id)
    {
        return Resolve(ref _enemyLookup, _enemySprites, id);
    }

    public Sprite GetEffectSprite(string id)
    {
        return Resolve(ref _effectLookup, _effectSprites, id);
    }

    private void Awake()
    {
        SeedMissingIds();
        RebuildLookups();
    }

    private void OnValidate()
    {
        // Editor convenience: when the component is added or inspected, make
        // the expected id slots appear so the user can drop PNGs in. Existing
        // assignments are preserved; lookups are invalidated so a play after
        // an inspector edit rebuilds from the current slots.
        SeedMissingIds();
        _heroLookup = null;
        _enemyLookup = null;
        _effectLookup = null;
    }

    private void Reset()
    {
        SeedMissingIds();
    }

    private void RebuildLookups()
    {
        _heroLookup = BuildLookup(_heroSprites);
        _enemyLookup = BuildLookup(_enemySprites);
        _effectLookup = BuildLookup(_effectSprites);
    }

    private static Sprite Resolve(ref Dictionary<string, Sprite> lookup, List<SpriteSlot> slots, string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            return null;
        }

        if (lookup == null)
        {
            lookup = BuildLookup(slots);
        }

        Sprite sprite;
        if (lookup.TryGetValue(id, out sprite))
        {
            return sprite;
        }

        return null;
    }

    private static Dictionary<string, Sprite> BuildLookup(List<SpriteSlot> slots)
    {
        Dictionary<string, Sprite> lookup = new Dictionary<string, Sprite>();
        if (slots == null)
        {
            return lookup;
        }

        for (int i = 0; i < slots.Count; i++)
        {
            string id = slots[i].Id;
            if (string.IsNullOrEmpty(id) || lookup.ContainsKey(id))
            {
                continue;
            }
            lookup.Add(id, slots[i].Sprite);
        }

        return lookup;
    }

    private void SeedMissingIds()
    {
        SeedMissing(_heroSprites, HeroIds);
        SeedMissing(_enemySprites, EnemyIds);
        SeedMissing(_effectSprites, EffectIds);
    }

    private static void SeedMissing(List<SpriteSlot> slots, string[] ids)
    {
        if (slots == null)
        {
            return;
        }

        for (int i = 0; i < ids.Length; i++)
        {
            if (!ContainsId(slots, ids[i]))
            {
                slots.Add(new SpriteSlot { Id = ids[i], Sprite = null });
            }
        }
    }

    private static bool ContainsId(List<SpriteSlot> slots, string id)
    {
        for (int i = 0; i < slots.Count; i++)
        {
            if (slots[i].Id == id)
            {
                return true;
            }
        }
        return false;
    }
}
