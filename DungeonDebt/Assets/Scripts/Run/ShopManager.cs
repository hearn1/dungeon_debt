using System.Collections.Generic;
using UnityEngine;

public class ShopManager : MonoBehaviour
{
    private const int NoEmptyFormationSlot = -1;

    [SerializeField] private RunManager _runManager;

    private readonly List<ShopOffer> _currentOffers = new List<ShopOffer>();

    public IReadOnlyList<ShopOffer> CurrentOffers
    {
        get { return _currentOffers; }
    }

    public void Initialize(RunManager runManager)
    {
        _runManager = runManager;
    }

    public void GenerateOffers()
    {
        FillAllOffers();
    }

    public bool Reroll()
    {
        RunState run = GetRunState();
        if (run == null || run.Gold < GameRules.RerollCost)
        {
            return false;
        }

        run.Gold -= GameRules.RerollCost;
        run.RerollCount += 1;
        FillAllOffers();
        return true;
    }

    public bool Hire(int offerIndex)
    {
        if (offerIndex < 0 || offerIndex >= _currentOffers.Count)
        {
            return false;
        }

        ShopOffer offer = _currentOffers[offerIndex];
        if (offer == null || offer.Purchased)
        {
            return false;
        }

        RunState run = GetRunState();
        if (run == null)
        {
            return false;
        }

        if (run.Gold < offer.HireCost)
        {
            return false;
        }

        HeroInstance existing = FindExistingPartyMember(run, offer.Hero);
        if (existing != null)
        {
            // Defensive: Silver-owned heroes are excluded from the offer pool, so this branch
            // should be unreachable. Guard anyway per the M9.1 plan.
            if (existing.Tier == HeroTier.Silver)
            {
                return false;
            }

            run.Gold -= offer.HireCost;
            existing.Tier = HeroTier.Silver;
            HeroEffects.ApplyTierStatSeed(existing);
            existing.CurrentHealth = HeroEffects.GetTierAdjustedMaxHealth(existing);
            offer.Purchased = true;
            return true;
        }

        if (run.Party.Count >= GameRules.MaxPartySize)
        {
            return false;
        }

        int formationSlot = FindFirstEmptyFormationSlot(run);
        if (formationSlot == NoEmptyFormationSlot)
        {
            return false;
        }

        run.Gold -= offer.HireCost;
        HeroInstance hired = new HeroInstance(offer.Hero, formationSlot);
        hired.Tier = offer.Tier;
        HeroEffects.ApplyTierStatSeed(hired);
        hired.CurrentHealth = HeroEffects.GetTierAdjustedMaxHealth(hired);
        run.Party.Add(hired);
        offer.Purchased = true;
        return true;
    }

    private static HeroInstance FindExistingPartyMember(RunState run, HeroDefinition hero)
    {
        if (run == null || hero == null)
        {
            return null;
        }

        for (int i = 0; i < run.Party.Count; i++)
        {
            HeroInstance member = run.Party[i];
            if (member != null && member.Definition != null && member.Definition.Id == hero.Id)
            {
                return member;
            }
        }

        return null;
    }

    public bool Fire(int partyIndex)
    {
        RunState run = GetRunState();
        if (run == null)
        {
            return false;
        }

        if (partyIndex < 0 || partyIndex >= run.Party.Count)
        {
            return false;
        }

        run.Party.RemoveAt(partyIndex);
        run.Gold += GameRules.FireRefund;

        for (int i = 0; i < run.Party.Count; i++)
        {
            run.Party[i].FormationSlot = i;
        }

        return true;
    }

    private void FillAllOffers()
    {
        _currentOffers.Clear();

        System.Random rng = _runManager != null ? _runManager.Random : null;
        if (rng == null)
        {
            return;
        }

        RunState run = GetRunState();
        HashSet<string> silverOwned = new HashSet<string>();
        HashSet<string> anyOwned = new HashSet<string>();
        if (run != null)
        {
            for (int i = 0; i < run.Party.Count; i++)
            {
                HeroInstance member = run.Party[i];
                if (member == null || member.Definition == null)
                {
                    continue;
                }

                anyOwned.Add(member.Definition.Id);
                if (member.Tier == HeroTier.Silver)
                {
                    silverOwned.Add(member.Definition.Id);
                }
            }
        }

        IReadOnlyList<HeroDefinition> allHeroes = DataRepository.AllHeroes;

        // Bronze pool: heroes whose Silver upgrade is not already owned. Bronze-owned
        // heroes stay in the pool so a duplicate hire can upgrade them to Silver.
        List<HeroDefinition> bronzePool = new List<HeroDefinition>();
        // Silver pool: only heroes the player does not own at all. A Silver offer for
        // a Bronze-owned hero would be paying extra for the same merge outcome, so
        // exclude them and let the Bronze duplicate path handle the upgrade.
        List<HeroDefinition> silverPool = new List<HeroDefinition>();
        for (int i = 0; i < allHeroes.Count; i++)
        {
            HeroDefinition hero = allHeroes[i];
            if (!silverOwned.Contains(hero.Id))
            {
                bronzePool.Add(hero);
            }
            if (!anyOwned.Contains(hero.Id))
            {
                silverPool.Add(hero);
            }
        }

        for (int i = 0; i < GameRules.ShopOfferCount; i++)
        {
            bool wantSilver = rng.NextDouble() < GameRules.SilverOfferChance;
            List<HeroDefinition> pool = wantSilver && silverPool.Count > 0 ? silverPool : bronzePool;
            HeroTier tier = (pool == silverPool) ? HeroTier.Silver : HeroTier.Bronze;

            if (pool.Count == 0)
            {
                _currentOffers.Add(null);
                continue;
            }

            int pick = rng.Next(0, pool.Count);
            HeroDefinition picked = pool[pick];
            pool.RemoveAt(pick);
            // Keep the other pool consistent so the same hero can't double-appear.
            if (tier == HeroTier.Silver)
            {
                RemoveById(bronzePool, picked.Id);
            }
            else
            {
                RemoveById(silverPool, picked.Id);
            }

            int hireCost = picked.BaseUpkeep + GameRules.HireCostBonus;
            if (tier == HeroTier.Silver || anyOwned.Contains(picked.Id))
            {
                hireCost += GameRules.SilverHireCostBonus;
            }

            _currentOffers.Add(new ShopOffer(picked, hireCost, tier));
        }
    }

    private static void RemoveById(List<HeroDefinition> pool, string heroId)
    {
        for (int i = 0; i < pool.Count; i++)
        {
            if (pool[i].Id == heroId)
            {
                pool.RemoveAt(i);
                return;
            }
        }
    }

    private RunState GetRunState()
    {
        if (_runManager == null)
        {
            return null;
        }

        return _runManager.CurrentRunState;
    }

    private static int FindFirstEmptyFormationSlot(RunState run)
    {
        if (run == null)
        {
            return NoEmptyFormationSlot;
        }

        for (int slot = 0; slot < GameRules.MaxPartySize; slot++)
        {
            bool occupied = false;
            for (int i = 0; i < run.Party.Count; i++)
            {
                if (run.Party[i].FormationSlot == slot)
                {
                    occupied = true;
                    break;
                }
            }

            if (!occupied)
            {
                return slot;
            }
        }

        return NoEmptyFormationSlot;
    }
}
